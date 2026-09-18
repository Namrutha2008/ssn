import React, { useState, useEffect } from 'react';
import { fetchSolarData } from '../services/openMeteoService';

export default function Alerts({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All');

  // Hardcode coordinates for demonstration (e.g., Chennai, India)
  const LAT = 13.0827;
  const LON = 80.2707;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await fetchSolarData(LAT, LON);
        if (!isMounted) return;

        const generatedAlerts = calculateAlerts(data);
        setAlerts(generatedAlerts);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to fetch weather data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    // Auto-refresh every 5 minutes
    const intervalId = setInterval(loadData, 5 * 60 * 1000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const getRiskLevelName = (rate) => {
    if (rate >= 80) return 'Critical';
    if (rate >= 60) return 'High';
    if (rate >= 30) return 'Moderate';
    return 'Low';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return '#ef4444'; // Red
      case 'High': return '#f97316';     // Orange
      case 'Moderate': return '#eab308'; // Yellow
      case 'Low': return '#38ef7d';      // Green
      default: return '#94a3b8';
    }
  };

  const calculateAlerts = (data) => {
    const { current, hourly, solar } = data;
    const newAlerts = [];

    // 1. Low Solar Generation Risk
    const cloudCover = current.cloudCover ?? 0;
    let solarRisk = Math.min(100, Math.max(0, cloudCover * 1.1));
    if (solarRisk > 20) {
      newAlerts.push({
        id: 'solar',
        icon: '☀️',
        type: 'Low Solar Generation',
        riskRate: Math.round(solarRisk),
        level: getRiskLevelName(solarRisk),
        dataCausing: `Cloud Cover: ${cloudCover}%`,
        action: 'Prioritize battery power and reduce non-essential loads.',
      });
    }

    // 2. Extreme Temperature Risk
    const temp = current.temperature ?? 25;
    let tempRisk = 0;
    if (temp > 35) {
      tempRisk = Math.min(100, (temp - 35) * 10);
    } else if (temp < 5) {
      tempRisk = Math.min(100, (5 - temp) * 10);
    }
    if (tempRisk > 20) {
      newAlerts.push({
        id: 'temp',
        icon: '🌡️',
        type: 'Extreme Temperature',
        riskRate: Math.round(tempRisk),
        level: getRiskLevelName(tempRisk),
        dataCausing: `Current Temp: ${temp}°C`,
        action: temp > 35 ? 'Ensure cooling systems are active for inverter.' : 'Monitor battery performance in cold.',
      });
    }

    // 3. High Wind Risk
    const wind = current.windSpeed ?? 0;
    let windRisk = Math.min(100, (wind / 50) * 100);
    if (windRisk > 30) {
      newAlerts.push({
        id: 'wind',
        icon: '🌪️',
        type: 'High Wind Risk',
        riskRate: Math.round(windRisk),
        level: getRiskLevelName(windRisk),
        dataCausing: `Wind Speed: ${wind} km/h`,
        action: 'Stow tracking panels to flat position if applicable.',
      });
    }

    // 4. Severe Weather Risk
    const weatherCode = current.weatherCode ?? 0;
    let weatherRisk = 0;
    if ([95, 96, 99].includes(weatherCode)) weatherRisk = 95; // Thunderstorms
    else if ([65, 67, 75, 77, 81, 82, 86].includes(weatherCode)) weatherRisk = 75; // Heavy rain/snow
    else if ([63, 73, 80, 85].includes(weatherCode)) weatherRisk = 45; // Moderate
    
    if (weatherRisk > 0) {
      newAlerts.push({
        id: 'weather',
        icon: '🌧️',
        type: 'Severe Weather',
        riskRate: weatherRisk,
        level: getRiskLevelName(weatherRisk),
        dataCausing: `Conditions: ${data.weatherLabel}`,
        action: 'Prepare for potential grid instability. Keep battery fully charged.',
      });
    }

    // 5. Battery Risk (Simulated based on solar & time)
    const hour = new Date().getHours();
    let batteryRisk = 10;
    if (hour > 17 || hour < 6) { // Evening/Night
      if (cloudCover > 80) batteryRisk = 65; // Cloudy day + night = higher risk
      else batteryRisk = 30; // Normal night drainage
    }
    if (batteryRisk > 20) {
      newAlerts.push({
        id: 'battery',
        icon: '🔋',
        type: 'Battery Risk',
        riskRate: batteryRisk,
        level: getRiskLevelName(batteryRisk),
        dataCausing: `Time: ${hour}:00, Cloud: ${cloudCover}%`,
        action: 'Minimize high-draw appliances until morning.',
      });
    }

    // 6. High Energy Demand (Simulated based on typical peaks)
    let demandRisk = 15;
    if (hour >= 18 && hour <= 21) demandRisk = 85; // Evening peak
    else if (hour >= 7 && hour <= 9) demandRisk = 60; // Morning peak
    
    if (demandRisk > 30) {
      newAlerts.push({
        id: 'demand',
        icon: '⚡',
        type: 'High Energy Demand',
        riskRate: demandRisk,
        level: getRiskLevelName(demandRisk),
        dataCausing: `Peak Hours (${hour}:00)`,
        action: 'Discharge battery to avoid peak grid rates.',
      });
    }

    // Sort by risk rate descending
    return newAlerts.sort((a, b) => b.riskRate - a.riskRate);
  };

  const filteredAlerts = filter === 'All' 
    ? alerts 
    : alerts.filter(a => a.level === filter);

  const overallRisk = alerts.length > 0 
    ? Math.round(alerts.reduce((acc, curr) => acc + curr.riskRate, 0) / alerts.length) 
    : 0;

  const handleAcknowledge = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="alerts-page" style={{ paddingBottom: '40px' }}>
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <div className="header-left">
          <div className="header-icon-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            🔔
          </div>
          <div>
            <h1 className="page-title">System Alerts</h1>
            <p className="page-subtitle">Real-time risk monitoring and AI-generated notifications.</p>
          </div>
        </div>

        <div className="analysis-sub-nav">
          {['All', 'Critical', 'High', 'Moderate', 'Low'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`sub-nav-btn ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* OVERALL RISK CARD */}
      <div className="glass-card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>Overall System Risk</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: getRiskColor(getRiskLevelName(overallRisk)) }}>
              {overallRisk}%
            </span>
            <span style={{ 
              backgroundColor: `${getRiskColor(getRiskLevelName(overallRisk))}33`, 
              color: getRiskColor(getRiskLevelName(overallRisk)),
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '700'
            }}>
              {getRiskLevelName(overallRisk)}
            </span>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>Active Alerts: <strong style={{ color: '#fff' }}>{alerts.length}</strong></div>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
            Last Updated: {loading ? 'Fetching...' : (lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never')}
          </div>
        </div>
      </div>

      {loading && !lastUpdated ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <div className="loading-spinner" style={{ fontSize: '2rem', marginBottom: '16px' }}>🔄</div>
          <p>Analyzing real-time weather & grid conditions...</p>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center', borderColor: '#ef4444' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
          <h4 style={{ color: '#ef4444', marginBottom: '8px' }}>Connection Error</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{error}</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>✅</div>
          <h4 style={{ color: '#38ef7d', marginBottom: '8px' }}>All Clear</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No active alerts for the selected criteria. Your system is running optimally.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredAlerts.map(alert => (
            <div key={alert.id} className="glass-card" style={{ 
              borderLeft: `4px solid ${getRiskColor(alert.level)}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'stretch'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1 }}>
                <div style={{ 
                  width: '48px', height: '48px', 
                  borderRadius: '12px', 
                  backgroundColor: `${getRiskColor(alert.level)}15`,
                  display: 'grid', placeItems: 'center',
                  fontSize: '1.5rem'
                }}>
                  {alert.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <h4 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{alert.type}</h4>
                    <span style={{ 
                      backgroundColor: `${getRiskColor(alert.level)}20`, 
                      color: getRiskColor(alert.level),
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '700'
                    }}>
                      Risk Rate: {alert.riskRate}% — {alert.level}
                    </span>
                  </div>
                  
                  <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '8px' }}>
                    <strong>Detected:</strong> {alert.dataCausing}
                  </div>
                  
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.03)', 
                    padding: '10px 14px', 
                    borderRadius: '8px',
                    color: '#94a3b8',
                    fontSize: '0.8rem'
                  }}>
                    <strong style={{ color: '#f1f5f9' }}>Recommended Action:</strong> {alert.action}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', marginLeft: '16px' }}>
                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                  {lastUpdated ? lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                </div>
                <button 
                  onClick={() => handleAcknowledge(alert.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#e2e8f0',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-spinner {
          display: inline-block;
          animation: spin 2s linear infinite;
        }
      `}} />
    </div>
  );
}
