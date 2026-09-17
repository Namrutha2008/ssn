import React, { useState } from 'react'
import heroBannerImg from '../assets/hero_banner.jpg'

export default function WhatIfSimulator({ onNavigate }) {
  const [activeSubTab, setActiveSubTab] = useState('What If Simulator')
  const [activePreset, setActivePreset] = useState('Normal Day')
  const [cloudCover, setCloudCover] = useState(40)
  const [panelTilt, setPanelTilt] = useState(18)
  const [direction, setDirection] = useState('South')
  const [dustLevel, setDustLevel] = useState(20)

  const presets = [
    { id: 'Normal Day', label: 'Normal Day', cloud: 20, tilt: 18, dust: 10 },
    { id: 'Cloudy Day', label: 'Cloudy Day', cloud: 60, tilt: 18, dust: 15 },
    { id: 'Rainy Day', label: 'Rainy Day', cloud: 85, tilt: 18, dust: 5 },
    { id: 'Heatwave', label: 'Heatwave', cloud: 10, tilt: 25, dust: 35 },
    { id: 'High Dust', label: 'High Dust', cloud: 15, tilt: 18, dust: 55 },
    { id: 'Winter', label: 'Winter', cloud: 50, tilt: 35, dust: 15 },
  ]

  const handleSelectPreset = (p) => {
    setActivePreset(p.id)
    setCloudCover(p.cloud)
    setPanelTilt(p.tilt)
    setDustLevel(p.dust)
  }

  return (
    <div className="simulation-page-enhanced">
      {/* HEADER & SUB NAV TABS */}
      <header className="page-header">
        <div className="header-left">
          <div className="header-icon-badge yellow-glow">
            ☀️
          </div>
          <div>
            <h1 className="page-title">Simulation</h1>
            <p className="page-subtitle">
              What-if? See the impact before you act. Test different conditions and find the best setup for your solar system.
            </p>
          </div>
        </div>

        <div className="analysis-sub-nav">
          {['What If Simulator', 'Sun Path Simulation', 'Weather Impact', 'Seasonal Comparison'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`sub-nav-btn ${activeSubTab === tab ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN 4-COLUMN GRID SECTION */}
      <div className="simulation-4col-grid">

        {/* COL 1: ADJUST CONDITIONS & PRESETS */}
        <div className="glass-card col-adjust-card">
          <div className="card-header">
            <h4>Adjust Conditions</h4>
          </div>

          <div className="adjust-split-body">
            {/* Sliders */}
            <div className="sim-sliders-col">
              <div className="sim-slider-group">
                <div className="lbl-row">
                  <span>Cloud Cover</span>
                  <strong>{cloudCover}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cloudCover}
                  onChange={(e) => setCloudCover(Number(e.target.value))}
                  className="custom-range-input"
                />
              </div>

              <div className="sim-slider-group">
                <div className="lbl-row">
                  <span>Panel Tilt</span>
                  <strong>{panelTilt}°</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={panelTilt}
                  onChange={(e) => setPanelTilt(Number(e.target.value))}
                  className="custom-range-input"
                />
              </div>

              <div className="sim-slider-group">
                <div className="lbl-row">
                  <span>Panel Direction</span>
                </div>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="custom-select-input"
                >
                  <option value="South">South</option>
                  <option value="North">North</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </select>
              </div>

              <div className="sim-slider-group">
                <div className="lbl-row">
                  <span>Dust Level</span>
                  <strong>{dustLevel}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={dustLevel}
                  onChange={(e) => setDustLevel(Number(e.target.value))}
                  className="custom-range-input"
                />
              </div>
            </div>

            {/* Presets Column */}
            <div className="presets-side-col">
              <span className="preset-lbl">Preset Scenarios</span>
              <div className="preset-btns-list">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`preset-pill-btn ${activePreset === p.id ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(p)}
                  >
                    <span className="dot" />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COL 2: PREDICTED GENERATION & KEY FACTORS */}
        <div className="glass-card col-predicted-card">
          <div className="card-header">
            <h4>Predicted Generation</h4>
          </div>

          <div className="predicted-body">
            {/* Arrow flow */}
            <div className="gen-arrow-flow">
              <div className="curr-box">
                <span className="lbl">Current</span>
                <strong>18.2 <small>kWh/day</small></strong>
              </div>
              <span className="flow-arrow">→</span>
              <div className="opt-box">
                <span className="lbl">Optimized</span>
                <strong>21.4 <small>kWh/day</small></strong>
              </div>
            </div>

            <div className="gain-ring-factors-row">
              {/* Donut ring */}
              <div className="gain-ring-wrap">
                <svg viewBox="0 0 100 100" className="gain-ring-svg">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#38ef7d" strokeWidth="8" strokeDasharray="251" strokeDashoffset="60" strokeLinecap="round" />
                </svg>
                <div className="ring-center-text">
                  <strong className="text-green">+17.6%</strong>
                  <small>Potential Gain</small>
                </div>
              </div>

              {/* Key factors */}
              <div className="key-factors-col">
                <span className="kf-lbl">Key Factors</span>
                <div className="kf-item"><span className="green-plus">+</span> Cloud cover <strong className="green-val">8%</strong></div>
                <div className="kf-item"><span className="green-plus">+</span> Optimal tilt <strong className="green-val">15%</strong></div>
                <div className="kf-item"><span className="green-plus">+</span> Better direction <strong className="green-val">12%</strong></div>
                <div className="kf-item"><span className="green-plus">+</span> Less dust <strong className="green-val">6%</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* COL 3: LIVE PREVIEW & SUN PATH */}
        <div className="glass-card col-sunpath-card">
          <div className="card-header">
            <h4>Live Preview</h4>
          </div>

          <div className="sunpath-body">
            <div className="sunpath-graphic-wrap">
              <img src={heroBannerImg} alt="Sun Path Scene" className="sunpath-img" />
              <div className="sunpath-overlay" />

              {/* Arc Sun Trajectory Line */}
              <svg viewBox="0 0 300 160" className="sun-arc-svg">
                <path d="M 20 140 Q 150 10 280 140" fill="none" stroke="#ffb830" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="200" cy="45" r="8" fill="#ffb830" boxShadow="0 0 20px #ffb830" />
              </svg>

              {/* Sun Position Callout */}
              <div className="sun-pos-badge">
                <span className="title">Sun Position</span>
                <span className="stat">Altitude: 62°</span>
                <span className="stat">Azimuth: 138°</span>
              </div>
            </div>

            {/* Time Scrubber */}
            <div className="time-scrubber-track">
              <div className="scrubber-thumb" style={{ left: '60%' }} />
              <div className="scrubber-labels">
                <span>6 AM</span>
                <span>10 AM</span>
                <span>2 PM</span>
                <span>6 PM</span>
                <span>8 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* COL 4: SCENARIO RESULT & APPLY */}
        <div className="glass-card col-result-card">
          <div className="card-header">
            <h4>Scenario Result</h4>
          </div>

          <div className="result-body">
            <div className="result-main-banner">
              <span className="sun-icon">☀️</span>
              <div className="res-meta">
                <span className="lbl">Solar Generation</span>
                <div className="val-row">
                  <strong>21.4 <small>kWh/day</small></strong>
                  <span className="gain-text text-green">(+17.6%)</span>
                </div>
              </div>
              <span className="best-setup-badge">🟢 Best Setup</span>
            </div>

            <div className="recommended-settings-box">
              <span className="box-title">Recommended Settings</span>
              <div className="rec-setting-item">
                <span className="icon">📐</span> Tilt Angle <strong>18°</strong>
              </div>
              <div className="rec-setting-item">
                <span className="icon">🧭</span> Direction <strong>South</strong>
              </div>
              <div className="rec-setting-item">
                <span className="icon">🧹</span> Clean Panels <strong>Yes</strong>
              </div>
              <div className="rec-setting-item">
                <span className="icon">☁️</span> Cloud Cover <strong>20%</strong>
              </div>
            </div>

            <button type="button" className="btn-apply-dashboard" onClick={() => onNavigate('/')}>
              Apply to Dashboard →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
