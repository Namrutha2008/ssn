import React, { useState, useEffect } from 'react';
import '../App.css';

export default function Settings({ onNavigate }) {
  // Default settings state
  const defaultSettings = {
    profile: {
      name: 'Namrutha',
      email: 'namrutha@solarquest.ai',
      role: 'Operator'
    },
    energySystem: {
      solarCapacity: 15,
      batteryCapacity: 10,
      windCapacity: 2,
      maxLoad: 8,
      backupSource: 'Grid'
    },
    aiOptimization: {
      predictionHorizon: '24h',
      optimizationMode: 'Balanced',
      autoOptimization: true,
      updateInterval: 15
    },
    alerts: {
      lowBattery: true,
      highDemand: true,
      weatherWarning: true,
      lowSolar: false,
      systemFailure: true,
      dashboardNotify: true,
      emailNotify: false
    },
    apiData: {
      refreshInterval: 5
    },
    display: {
      theme: 'Dark',
      tempUnit: 'Celsius',
      energyUnit: 'kWh',
      timeFormat: '24h'
    },
    security: {
      twoFactorAuth: false
    }
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [activeTab, setActiveTab] = useState('Profile');
  const [showNotification, setShowNotification] = useState(false);
  const [apiStatus, setApiStatus] = useState('Connected');
  const [lastUpdate, setLastUpdate] = useState('Just now');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('solarQuestSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('solarQuestSettings', JSON.stringify(settings));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('solarQuestSettings');
  };

  const handleTestConnection = () => {
    setApiStatus('Testing...');
    setTimeout(() => {
      setApiStatus('Connected');
      setLastUpdate('Just now');
    }, 1500);
  };

  const tabs = ['Profile', 'Energy System', 'AI & Optimization', 'Alerts & Notifications', 'API & Data', 'Display', 'Security'];

  return (
    <div className="settings-page" style={{ paddingBottom: '40px' }}>
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <div className="header-left">
          <div className="header-icon-badge" style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' }}>
            ⚙️
          </div>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your SolarQuest system preferences and configurations.</p>
          </div>
        </div>

        <div className="settings-actions" style={{ display: 'flex', gap: '12px' }}>
          <button className="sub-nav-btn" onClick={handleReset}>Reset</button>
          <button className="btn-gold-lg" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </header>

      {showNotification && (
        <div className="settings-notification" style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#38ef7d',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>✓</span> Settings saved successfully!
        </div>
      )}

      <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px' }}>
        {/* Settings Sidebar */}
        <div className="glass-card settings-sidebar" style={{ height: 'fit-content', padding: '12px 0' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              className={`nav-button ${activeTab === tab ? 'active' : ''}`}
              style={{ margin: '0 12px', width: 'calc(100% - 24px)', marginBottom: '4px' }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="settings-content-area">
          {activeTab === 'Profile' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="card-header">
                <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>User Profile</h4>
              </div>
              <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar-circle" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>N</div>
                  <button className="sub-nav-btn" style={{ fontSize: '0.7rem' }}>Change Avatar</button>
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label style={labelStyle}>Full Name</label>
                    <input type="text" value={settings.profile.name} onChange={e => handleChange('profile', 'name', e.target.value)} style={inputStyle} />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" value={settings.profile.email} onChange={e => handleChange('profile', 'email', e.target.value)} style={inputStyle} />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Role</label>
                    <input type="text" value={settings.profile.role} disabled style={{...inputStyle, opacity: 0.7, cursor: 'not-allowed'}} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Energy System' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="card-header">
                <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>System Capacities & Limits</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div className="form-group">
                  <label style={labelStyle}>Solar Capacity (kW)</label>
                  <input type="number" value={settings.energySystem.solarCapacity} onChange={e => handleChange('energySystem', 'solarCapacity', Number(e.target.value))} style={inputStyle} />
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Battery Capacity (kWh)</label>
                  <input type="number" value={settings.energySystem.batteryCapacity} onChange={e => handleChange('energySystem', 'batteryCapacity', Number(e.target.value))} style={inputStyle} />
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Wind Capacity (kW)</label>
                  <input type="number" value={settings.energySystem.windCapacity} onChange={e => handleChange('energySystem', 'windCapacity', Number(e.target.value))} style={inputStyle} />
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Maximum Load Limit (kW)</label>
                  <input type="number" value={settings.energySystem.maxLoad} onChange={e => handleChange('energySystem', 'maxLoad', Number(e.target.value))} style={inputStyle} />
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Backup Source</label>
                  <select value={settings.energySystem.backupSource} onChange={e => handleChange('energySystem', 'backupSource', e.target.value)} style={inputStyle}>
                    <option value="Grid">Grid</option>
                    <option value="Diesel Generator">Diesel Generator</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AI & Optimization' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="card-header">
                <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>AI Prediction & Control</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '20px' }}>
                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Auto Optimization</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>Allow AI to automatically adjust settings for maximum efficiency.</div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={settings.aiOptimization.autoOptimization} onChange={e => handleChange('aiOptimization', 'autoOptimization', e.target.checked)} />
                    <span className="slider round"></span>
                  </label>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label style={labelStyle}>Prediction Horizon</label>
                    <select value={settings.aiOptimization.predictionHorizon} onChange={e => handleChange('aiOptimization', 'predictionHorizon', e.target.value)} style={inputStyle}>
                      <option value="6h">6 Hours</option>
                      <option value="12h">12 Hours</option>
                      <option value="24h">24 Hours</option>
                      <option value="48h">48 Hours</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Optimization Mode</label>
                    <select value={settings.aiOptimization.optimizationMode} onChange={e => handleChange('aiOptimization', 'optimizationMode', e.target.value)} style={inputStyle}>
                      <option value="Balanced">Balanced</option>
                      <option value="Renewable Priority">Renewable Priority</option>
                      <option value="Battery Protection">Battery Protection</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Prediction Update Interval (mins)</label>
                    <input type="number" value={settings.aiOptimization.updateInterval} onChange={e => handleChange('aiOptimization', 'updateInterval', Number(e.target.value))} style={inputStyle} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Alerts & Notifications' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="card-header">
                <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>Notification Preferences</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '20px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={settings.alerts.dashboardNotify} onChange={e => handleChange('alerts', 'dashboardNotify', e.target.checked)} style={{ accentColor: '#38bdf8' }} />
                    Dashboard Notifications
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={settings.alerts.emailNotify} onChange={e => handleChange('alerts', 'emailNotify', e.target.checked)} style={{ accentColor: '#38bdf8' }} />
                    Email Notifications
                  </label>
                </div>
                <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '0 0 16px 0' }} />
                
                {[
                  { key: 'lowBattery', label: 'Low Battery Alert', desc: 'Notify when battery drops below 20%' },
                  { key: 'highDemand', label: 'High Energy Demand Alert', desc: 'Notify during peak grid usage times' },
                  { key: 'weatherWarning', label: 'Weather Warning', desc: 'Alert for upcoming storms or heavy cloud cover' },
                  { key: 'lowSolar', label: 'Low Solar Generation Alert', desc: 'Notify when solar output is unexpectedly low' },
                  { key: 'systemFailure', label: 'System Failure Alert', desc: 'Critical alerts for inverter or grid disconnects' }
                ].map(alert => (
                  <div key={alert.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>{alert.label}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>{alert.desc}</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={settings.alerts[alert.key]} onChange={e => handleChange('alerts', alert.key, e.target.checked)} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'API & Data' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="card-header">
                <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>External Integrations</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Weather API Connection</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: apiStatus === 'Connected' ? '#10b981' : '#f59e0b' }}></span>
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Status: {apiStatus}</span>
                      <span style={{ color: '#64748b', fontSize: '0.7rem', marginLeft: '12px' }}>Last update: {lastUpdate}</span>
                    </div>
                  </div>
                  <button className="sub-nav-btn" onClick={handleTestConnection}>Test Connection</button>
                </div>
                
                <div className="form-group" style={{ width: '50%' }}>
                  <label style={labelStyle}>Data Refresh Interval (mins)</label>
                  <input type="number" value={settings.apiData.refreshInterval} onChange={e => handleChange('apiData', 'refreshInterval', Number(e.target.value))} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Display' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="card-header">
                <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>Appearance & Units</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div className="form-group">
                  <label style={labelStyle}>Theme</label>
                  <select value={settings.display.theme} onChange={e => handleChange('display', 'theme', e.target.value)} style={inputStyle}>
                    <option value="Dark">Dark</option>
                    <option value="Light">Light</option>
                    <option value="System">System Default</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Temperature Unit</label>
                  <select value={settings.display.tempUnit} onChange={e => handleChange('display', 'tempUnit', e.target.value)} style={inputStyle}>
                    <option value="Celsius">Celsius (°C)</option>
                    <option value="Fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Energy Unit</label>
                  <select value={settings.display.energyUnit} onChange={e => handleChange('display', 'energyUnit', e.target.value)} style={inputStyle}>
                    <option value="kWh">kWh</option>
                    <option value="Wh">Wh</option>
                    <option value="MWh">MWh</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Time Format</label>
                  <select value={settings.display.timeFormat} onChange={e => handleChange('display', 'timeFormat', e.target.value)} style={inputStyle}>
                    <option value="12h">12-hour (AM/PM)</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="card-header">
                <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>Security & Access</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Two-Factor Authentication</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>Add an extra layer of security to your account.</div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={settings.security.twoFactorAuth} onChange={e => handleChange('security', 'twoFactorAuth', e.target.checked)} />
                    <span className="slider round"></span>
                  </label>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Change Password</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>Update your account password.</div>
                  </div>
                  <button className="sub-nav-btn">Update Password</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Active Sessions</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>Manage devices currently logged into your account.</div>
                  </div>
                  <button className="sub-nav-btn">View Sessions</button>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button style={{ 
                    background: 'rgba(239, 68, 68, 0.15)', 
                    color: '#ef4444', 
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }} onMouseOver={e => e.target.style.background = 'rgba(239, 68, 68, 0.25)'} onMouseOut={e => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}>
                    Logout of All Devices
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* CSS for toggle switch added via style block for simplicity, usually in App.css */}
      <style dangerouslySetInnerHTML={{__html: `
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 2px;
          bottom: 2px;
          background-color: #94a3b8;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: rgba(14, 165, 233, 0.3);
          border-color: #0ea5e9;
        }
        input:checked + .slider:before {
          transform: translateX(20px);
          background-color: #38bdf8;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
        }
        .slider.round {
          border-radius: 24px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  color: '#94a3b8',
  marginBottom: '6px',
  fontWeight: 500
};

const inputStyle = {
  width: '100%',
  background: 'rgba(15, 25, 45, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: '#fff',
  padding: '10px 12px',
  borderRadius: '8px',
  fontSize: '0.85rem',
  outline: 'none',
  transition: 'border-color 0.2s ease'
};
