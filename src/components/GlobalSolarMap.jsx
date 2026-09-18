import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchSolarData } from '../services/openMeteoService';

const LOCATIONS = [
  { name: 'Chennai, India', lat: 13.0827, lon: 80.2707 },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Seville, Spain', lat: 37.3891, lon: -5.9845 },
  { name: 'Phoenix, USA', lat: 33.4484, lon: -112.0740 },
  { name: 'Tokyo, Japan', lat: 35.6895, lon: 139.6917 },
  { name: 'Cape Town, SA', lat: -33.9249, lon: 18.4241 },
  { name: 'Rio de Janeiro, BR', lat: -22.9068, lon: -43.1729 },
  { name: 'Berlin, Germany', lat: 52.5200, lon: 13.4050 }
];

const calculateLocationRisk = (data) => {
  const current = data.current || {};
  const cloudCover = current.cloudCover ?? 0;
  const temp = current.temperature ?? 25;
  const wind = current.windSpeed ?? 0;
  
  let riskRate = 0;
  let reason = 'Optimal conditions';
  
  let solarRisk = cloudCover * 1.1;
  let tempRisk = temp > 35 ? (temp - 35) * 8 : (temp < 5 ? (5 - temp) * 8 : 0);
  let windRisk = (wind / 50) * 100;
  
  if (solarRisk > riskRate) { riskRate = solarRisk; reason = `High Cloud Cover (${cloudCover}%)`; }
  if (tempRisk > riskRate) { riskRate = tempRisk; reason = `Extreme Temp (${temp}°C)`; }
  if (windRisk > riskRate) { riskRate = windRisk; reason = `High Wind (${wind}km/h)`; }
  
  riskRate = Math.min(100, Math.max(0, riskRate));
  
  let level = 'Low';
  let color = '#38ef7d'; // Green
  
  if (riskRate >= 80) { level = 'Critical'; color = '#ef4444'; }
  else if (riskRate >= 60) { level = 'High'; color = '#f97316'; }
  else if (riskRate >= 30) { level = 'Moderate'; color = '#eab308'; }
  
  return { riskRate: Math.round(riskRate), level, color, reason, current };
};

export default function GlobalSolarMap() {
  const [pointsData, setPointsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadMapData = async () => {
      try {
        const promises = LOCATIONS.map(async (loc) => {
          try {
            const data = await fetchSolarData(loc.lat, loc.lon);
            const riskInfo = calculateLocationRisk(data);
            return { ...loc, ...riskInfo };
          } catch (err) {
            // Fallback if one location fails
            return { ...loc, riskRate: 0, level: 'Low', color: '#38ef7d', reason: 'Data unavailable', current: {} };
          }
        });
        
        const results = await Promise.all(promises);
        if (isMounted) {
          setPointsData(results);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    };
    
    loadMapData();
    const interval = setInterval(loadMapData, 5 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="glass-card global-map-card">
      <div className="card-header">
        <div className="header-title">
          <span className="icon-glow">🌐</span>
          <h4>Global Solar Intelligence</h4>
        </div>
        {loading && <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Updating data...</span>}
      </div>

      <div className="global-map-body" style={{ position: 'relative' }}>
        <div className="svg-map-wrapper" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden' }}>
          <MapContainer 
            center={[20, 0]} 
            zoom={1.5} 
            minZoom={1}
            maxZoom={10}
            style={{ height: '100%', width: '100%', backgroundColor: '#060913' }}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            />
            {pointsData.map((pt, idx) => (
              <CircleMarker 
                key={idx}
                center={[pt.lat, pt.lon]}
                radius={8}
                pathOptions={{
                  color: pt.color,
                  fillColor: pt.color,
                  fillOpacity: 0.7,
                  weight: 2
                }}
              >
                <Popup className="custom-popup">
                  <div style={{ color: '#0f172a', minWidth: '150px' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', fontWeight: 'bold' }}>{pt.name}</h4>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '8px' }}>
                      Lat: {pt.lat.toFixed(4)}, Lon: {pt.lon.toFixed(4)}
                    </div>
                    <div style={{ fontSize: '0.8rem', marginBottom: '8px' }}>
                      <span style={{ 
                        backgroundColor: pt.color, 
                        color: pt.level === 'Moderate' || pt.level === 'Low' ? '#000' : '#fff',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}>
                        {pt.level} Risk ({pt.riskRate}%)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', margin: '4px 0' }}><strong>Temp:</strong> {pt.current.temperature ?? '--'}°C</div>
                    <div style={{ fontSize: '0.8rem', margin: '4px 0' }}><strong>Wind:</strong> {pt.current.windSpeed ?? '--'} km/h</div>
                    <div style={{ fontSize: '0.8rem', margin: '4px 0' }}><strong>Cloud:</strong> {pt.current.cloudCover ?? '--'}%</div>
                    <hr style={{ margin: '8px 0', borderColor: '#cbd5e1' }} />
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}><em>{pt.reason}</em></div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Legend Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(10, 20, 36, 0.85)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          gap: '12px',
          fontSize: '0.75rem',
          color: '#e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38ef7d' }}></span> Low
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></span> Moderate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f97316' }}></span> High
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> Critical
          </div>
        </div>

      </div>
    </div>
  );
}
