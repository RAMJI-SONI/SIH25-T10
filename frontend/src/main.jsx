import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Loader } from "@googlemaps/js-api-loader";
import {
  Activity, AlertTriangle, BrainCircuit, ChevronRight, CloudRain,
  Layers3, MapPin, Satellite, ShieldCheck, Thermometer, Waves,
  Mountain, Droplets, RefreshCw
} from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const hazards = {
  flood: {label:"Flood", icon:Waves},
  landslide: {label:"Landslide", icon:Mountain},
  drought: {label:"Drought", icon:Droplets},
  heat: {label:"Heat Island", icon:Thermometer},
};

function App() {
  const mapRef = useRef(null);
  const map = useRef(null);
  const layerRef = useRef(null);
  const [hazard, setHazard] = useState("flood");
  const [loading, setLoading] = useState(false);
  const [geeLoading, setGeeLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [lat, setLat] = useState(26.8467);
  const [lng, setLng] = useState(80.9462);

  useEffect(() => {
    if (!KEY) return;
    const loader = new Loader({apiKey: KEY, version: "weekly"});
    loader.load().then(() => {
      map.current = new window.google.maps.Map(mapRef.current, {
        center: {lat, lng},
        zoom: 10,
        mapTypeId: "satellite",
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
      });
      setMapReady(true);
    }).catch(console.error);
  }, []);

  async function analyze() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/analyze`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          hazard, lat:Number(lat), lng:Number(lng), radius_km:10,
          start_date:"2026-07-01", end_date:"2026-08-20"
        })
      });
      const data = await r.json();
      setResult(data);
      if (map.current) map.current.setCenter({lat:Number(lat), lng:Number(lng)});
    } finally { setLoading(false); }
  }

  async function loadSatelliteLayer() {
    setGeeLoading(true);
    try {
      const r = await fetch(`${API}/api/gee/layer`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          hazard, lat:Number(lat), lng:Number(lng), radius_km:10,
          start_date:"2026-07-01", end_date:"2026-08-20"
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Earth Engine layer failed");
      if (layerRef.current) layerRef.current.setMap(null);
      layerRef.current = new window.google.maps.ImageMapType({
        getTileUrl: (coord, zoom) =>
          data.tile_url.replace("{z}", zoom).replace("{x}", coord.x).replace("{y}", coord.y),
        tileSize: new window.google.maps.Size(256,256),
        opacity: 0.62,
        name: "EO-AI",
      });
      map.current.overlayMapTypes.insertAt(0, layerRef.current);
    } catch (e) {
      alert(e.message);
    } finally { setGeeLoading(false); }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brandMark"><Satellite size={22}/></div>
          <div><b>BhoomiRakshak</b><span>AI EARTH INTELLIGENCE</span></div>
        </div>
        <div className="status"><span className="dot"/> LIVE ANALYTICS</div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <div className="eyebrow">ENVIRONMENTAL MONITORING</div>
          <h1>Turn satellite data into <em>actionable insight.</em></h1>
          <p className="muted">Earth observation + AI/ML + geospatial intelligence for faster hazard assessment.</p>

          <section className="panel">
            <label>Hazard module</label>
            <div className="hazards">
              {Object.entries(hazards).map(([key,h]) => {
                const Icon=h.icon;
                return <button className={hazard===key?"hazard active":"hazard"} onClick={()=>setHazard(key)} key={key}>
                  <Icon size={18}/><span>{h.label}</span><ChevronRight size={15}/>
                </button>
              })}
            </div>
          </section>

          <section className="panel">
            <label>Target location</label>
            <div className="coords">
              <div><span>LAT</span><input value={lat} onChange={e=>setLat(e.target.value)}/></div>
              <div><span>LNG</span><input value={lng} onChange={e=>setLng(e.target.value)}/></div>
            </div>
            <button className="primary" onClick={analyze} disabled={loading}>
              {loading?<RefreshCw className="spin" size={17}/>:<BrainCircuit size={17}/>}
              {loading?"Running AI analysis":"Run AI analysis"}
            </button>
            <button className="secondary" onClick={loadSatelliteLayer} disabled={!mapReady || geeLoading}>
              <Layers3 size={17}/>{geeLoading?"Loading EO layer":"Add satellite analysis layer"}
            </button>
          </section>

          <div className="sourceBox">
            <Satellite size={17}/>
            <div><b>EO data pipeline</b><span>Sentinel-1 • Sentinel-2 • Google Earth Engine</span></div>
          </div>
        </aside>

        <section className="workspace">
          <div className="mapWrap">
            <div ref={mapRef} className="map"/>
            {!KEY && <div className="mapFallback"><MapPin size={30}/><b>Google Maps key not configured</b><span>Add VITE_GOOGLE_MAPS_API_KEY to .env</span></div>}
            <div className="mapBadge"><Satellite size={15}/> GOOGLE SATELLITE</div>
            <div className="legend">
              <b>AI RISK LAYER</b><span><i className="r red"/>High</span><span><i className="r amber"/>Moderate</span><span><i className="r green"/>Low</span>
            </div>
          </div>

          <div className="insightGrid">
            <div className="card score">
              <div className="cardHead"><span>AI RISK SCORE</span><Activity size={17}/></div>
              <div className="scoreRow">
                <strong>{result ? Math.round(result.risk_probability*100) : "--"}</strong><span>/100</span>
              </div>
              <div className="meter"><i style={{width:`${result?result.risk_probability*100:0}%`}}/></div>
              <b className={result?.severity==="HIGH"?"high":""}>{result?.severity || "RUN ANALYSIS"}</b>
            </div>

            <div className="card">
              <div className="cardHead"><span>MEANINGFUL INSIGHT</span><AlertTriangle size={17}/></div>
              <p className="insight">{result?.insight || "Select a hazard and run AI analysis to convert Earth-observation features into a decision-ready insight."}</p>
              {result && <small>Mode: {result.mode} • {result.timestamp}</small>}
            </div>

            <div className="card">
              <div className="cardHead"><span>MODEL FEATURES</span><BrainCircuit size={17}/></div>
              {result ? <div className="features">
                <span>NDVI <b>{result.features.ndvi.toFixed(2)}</b></span>
                <span>NDWI <b>{result.features.ndwi.toFixed(2)}</b></span>
                <span>Rainfall <b>{result.features.rainfall_mm} mm</b></span>
                <span>Temp <b>{result.features.temperature_c}°C</b></span>
              </div> : <p className="muted">Waiting for analysis…</p>}
            </div>
          </div>

          <div className="pipeline">
            <div><span>01</span><Satellite/><b>Satellite data</b><small>Sentinel imagery</small></div>
            <div><span>02</span><Activity/><b>Preprocessing</b><small>Indices & change</small></div>
            <div><span>03</span><BrainCircuit/><b>AI / ML</b><small>Risk prediction</small></div>
            <div><span>04</span><ShieldCheck/><b>Decision support</b><small>Actionable alert</small></div>
          </div>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
