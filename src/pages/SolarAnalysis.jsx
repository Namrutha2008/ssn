import React, { useState } from 'react'
import './SolarAnalysis.css'

export default function SolarAnalysis({ onNavigate }) {
  const [activeTopTab, setActiveTopTab] = useState('Panel Health')
  const [activeEnergyTimeTab, setActiveEnergyTimeTab] = useState('Today')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  // Drag and drop / image upload handlers
  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      processImageFile(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0])
    }
  }

  const processImageFile = (file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target.result)
      setIsAnalyzing(true)
      setTimeout(() => {
        setIsAnalyzing(false)
      }, 2000)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="solar-analysis-container">
      {/* PAGE HEADER */}
      <header className="sa-header">
        <div className="sa-header-left">
          <div className="sa-title-group">
            <div className="sa-sun-badge">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" fill="#ffb830" stroke="#ffb830" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#ffb830" />
              </svg>
            </div>
            <div>
              <h1 className="sa-title">Solar Analysis</h1>
              <p className="sa-subtitle">
                Deep insights. Better decisions. Analyze your panel's performance, detect issues, and understand where your energy is being lost.
              </p>
            </div>
          </div>
        </div>

        {/* TOP TABS & STATUS BAR */}
        <div className="sa-header-right">
          <div className="sa-top-tabs">
            {['Performance Overview', 'Panel Health', 'Energy Loss Analysis', 'Historical Comparison'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`sa-tab-btn ${activeTopTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTopTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="sa-top-actions">
            <div className="sa-live-badge">
              <span className="sa-pulse-dot"></span>
              Live Data
            </div>
            <span className="sa-last-updated">Last updated: 10:42 AM</span>
            <button type="button" className="sa-icon-btn" title="Alerts">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="sa-notif-dot"></span>
            </button>
            <div className="sa-user-avatar" title="User Profile">
              <span>N</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT GRID */}
      <div className="sa-grid-layout">

        {/* ROW 1: Panel Health, Thermal Analysis, Energy Loss */}
        <div className="sa-row sa-row-top">

          {/* CARD 1: PANEL HEALTH DETECTOR */}
          <div className="sa-card sa-panel-health-card neon-border">
            <div className="sa-card-header">
              <div className="sa-card-title-wrap">
                <div className="sa-card-icon shield-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="sa-card-title">Panel Health Detector</h3>
                  <p className="sa-card-sub">AI powered analysis of your solar panel's condition.</p>
                </div>
              </div>
              <span className="sa-badge badge-complete">
                <span className="sa-mini-dot"></span> Scan Complete
              </span>
            </div>

            <div className="sa-health-content">
              {/* Solar Panel Scan Image View */}
              <div className="sa-panel-img-box">
                <div className="sa-panel-mock-img">
                  {/* Solar Array Visual Pattern */}
                  <svg className="sa-solar-svg" viewBox="0 0 400 240" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="50%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                      </linearGradient>
                      <linearGradient id="cellGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="240" fill="url(#panelGrad)" />
                    {/* Solar Grid Lines */}
                    {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
                      <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="240" stroke="rgba(56,189,248,0.25)" strokeWidth="1" />
                    ))}
                    {[40, 80, 120, 160, 200].map((y) => (
                      <line key={`h-${y}`} x1="0" y1={y} x2="400" y2={y} stroke="rgba(56,189,248,0.25)" strokeWidth="1" />
                    ))}
                    {/* Glowing Hotspot Target Area */}
                    <g className="sa-hotspot-target">
                      <rect x="202" y="82" width="76" height="76" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" rx="4" />
                      <circle cx="240" cy="120" r="16" fill="rgba(249, 115, 22, 0.5)" />
                      <circle cx="240" cy="120" r="8" fill="#ef4444" className="sa-ping-circle" />
                    </g>
                  </svg>
                </div>

                {/* Hotspot Alert Tag */}
                <div className="sa-hotspot-tag">
                  <span className="sa-alert-icon">⚠️</span>
                  <div>
                    <strong>Detected: 1 hotspot</strong>
                    <p>2% area affected</p>
                  </div>
                </div>
              </div>

              {/* Health Score & Issues List */}
              <div className="sa-health-metrics">
                <div className="sa-score-circle-box">
                  <div className="sa-gauge-wrap">
                    <svg viewBox="0 0 100 100" className="sa-gauge-svg">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeDasharray="263.8"
                        strokeDashoffset={263.8 * (1 - 78 / 100)}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        className="sa-ring-anim"
                      />
                    </svg>
                    <div className="sa-gauge-text">
                      <span className="sa-score-num">78<small>/100</small></span>
                    </div>
                  </div>
                  <div className="sa-score-status">
                    <span className="sa-label-sm">Health Score</span>
                    <span className="sa-badge badge-good">✓ Good</span>
                  </div>
                </div>

                <div className="sa-issues-list">
                  <h4 className="sa-section-label">Detected Issues</h4>
                  <div className="sa-issue-item">
                    <span className="sa-issue-icon warning-icon">⚠️</span>
                    <span className="sa-issue-name">Dust accumulation</span>
                    <span className="sa-pill pill-moderate">Moderate</span>
                  </div>
                  <div className="sa-issue-item">
                    <span className="sa-issue-icon warning-icon">⚠️</span>
                    <span className="sa-issue-name">Partial shading</span>
                    <span className="sa-pill pill-low">Low</span>
                  </div>
                  <div className="sa-issue-item">
                    <span className="sa-issue-icon warning-icon">⚠️</span>
                    <span className="sa-issue-name">Hotspot (minor)</span>
                    <span className="sa-pill pill-low">Low</span>
                  </div>
                  <div className="sa-issue-item">
                    <span className="sa-issue-icon success-icon">🟢</span>
                    <span className="sa-issue-name">No cracks detected</span>
                    <span className="sa-pill pill-good">Good</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="sa-btn-primary"
                  onClick={() => setSelectedReport('Health Report')}
                >
                  View Detailed Report →
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: THERMAL ANALYSIS */}
          <div className="sa-card sa-thermal-card neon-border">
            <div className="sa-card-header">
              <div className="sa-card-title-wrap">
                <div className="sa-card-icon thermo-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="sa-card-title">Thermal Analysis</h3>
                  <p className="sa-card-sub">Detect hotspots, overheating and temperature variations.</p>
                </div>
              </div>
            </div>

            <div className="sa-thermal-content">
              <div className="sa-heatmap-container">
                {/* Simulated Thermal Heatmap Canvas Graphic */}
                <div className="sa-heatmap-box">
                  <svg className="sa-thermal-svg" viewBox="0 0 320 180" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="thermalBg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="40%" stopColor="#4f46e5" />
                        <stop offset="70%" stopColor="#9333ea" />
                        <stop offset="100%" stopColor="#3b0764" />
                      </linearGradient>
                      <radialGradient id="hotspotGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="30%" stopColor="#ef4444" />
                        <stop offset="70%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect width="320" height="180" fill="url(#thermalBg)" />

                    {/* Grid Overlay */}
                    <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.8">
                      <line x1="0" y1="60" x2="320" y2="60" />
                      <line x1="0" y1="120" x2="320" y2="120" />
                      <line x1="106" y1="0" x2="106" y2="180" />
                      <line x1="213" y1="0" x2="213" y2="180" />
                    </g>

                    {/* Hotspot Overheat Zones */}
                    <ellipse cx="170" cy="85" rx="55" ry="40" fill="url(#hotspotGrad)" opacity="0.9" />
                    <ellipse cx="140" cy="110" rx="35" ry="25" fill="url(#hotspotGrad)" opacity="0.8" />
                  </svg>

                  {/* Temperature Color Scale Bar */}
                  <div className="sa-temp-scale">
                    <span className="sa-scale-max">62°C</span>
                    <div className="sa-scale-bar"></div>
                    <span className="sa-scale-min">25°C</span>
                  </div>
                </div>
              </div>

              {/* Thermal Temperature Stats Grid */}
              <div className="sa-thermal-stats-grid">
                <div className="sa-stat-box stat-hotspot">
                  <span className="sa-stat-label">Max Temperature</span>
                  <span className="sa-stat-val val-danger">62°C</span>
                  <span className="sa-stat-sub danger-sub">[Hotspot]</span>
                </div>
                <div className="sa-stat-box">
                  <span className="sa-stat-label">Avg. Temperature</span>
                  <span className="sa-stat-val">48°C</span>
                </div>
                <div className="sa-stat-box stat-diff">
                  <span className="sa-stat-label">Temp. Difference</span>
                  <span className="sa-stat-val val-cyan">+14°C</span>
                  <span className="sa-stat-sub cyan-sub">(above normal range)</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: ENERGY LOSS ANALYSIS */}
          <div className="sa-card sa-loss-card neon-border">
            <div className="sa-card-header">
              <div className="sa-card-title-wrap">
                <div className="sa-card-icon bolt-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="sa-card-title">Energy Loss Analysis</h3>
                  <p className="sa-card-sub">Understand where your energy goes.</p>
                </div>
              </div>
            </div>

            <div className="sa-loss-content">
              {/* Donut Chart & Legend */}
              <div className="sa-donut-wrap">
                <div className="sa-donut-chart">
                  <svg viewBox="0 0 160 160" className="sa-donut-svg">
                    {/* SVG Segment Arcs for Donut */}
                    {/* Total circumference = 2 * PI * 60 = 376.99 */}
                    {/* 26% Weather = 98 */}
                    {/* 37% Orientation = 139.4 */}
                    {/* 20% Dust & Dirt = 75.4 */}
                    {/* 17% Shading = 64.1 */}
                    <circle
                      cx="80" cy="80" r="60"
                      fill="none" stroke="#38bdf8" strokeWidth="22"
                      strokeDasharray="98 279" strokeDashoffset="0"
                    />
                    <circle
                      cx="80" cy="80" r="60"
                      fill="none" stroke="#f97316" strokeWidth="22"
                      strokeDasharray="139 238" strokeDashoffset="-98"
                    />
                    <circle
                      cx="80" cy="80" r="60"
                      fill="none" stroke="#eab308" strokeWidth="22"
                      strokeDasharray="75 302" strokeDashoffset="-237"
                    />
                    <circle
                      cx="80" cy="80" r="60"
                      fill="none" stroke="#a855f7" strokeWidth="22"
                      strokeDasharray="64 313" strokeDashoffset="-312"
                    />
                  </svg>
                  <div className="sa-donut-center">
                    <span className="sa-donut-lbl">Total Loss</span>
                    <strong className="sa-donut-val">3.0 kWh/day</strong>
                    <span className="sa-donut-pct">(14.2%)</span>
                  </div>
                </div>

                {/* Donut Legend Items */}
                <div className="sa-legend-list">
                  <div className="sa-legend-item">
                    <span className="sa-dot dot-cyan"></span>
                    <span className="sa-leg-name">Weather (clouds)</span>
                    <span className="sa-leg-val">0.8 kWh</span>
                    <span className="sa-leg-pct">26%</span>
                  </div>
                  <div className="sa-legend-item">
                    <span className="sa-dot dot-orange"></span>
                    <span className="sa-leg-name">Orientation</span>
                    <span className="sa-leg-val">1.1 kWh</span>
                    <span className="sa-leg-pct">37%</span>
                  </div>
                  <div className="sa-legend-item">
                    <span className="sa-dot dot-yellow"></span>
                    <span className="sa-leg-name">Dust & Dirt</span>
                    <span className="sa-leg-val">0.6 kWh</span>
                    <span className="sa-leg-pct">20%</span>
                  </div>
                  <div className="sa-legend-item">
                    <span className="sa-dot dot-purple"></span>
                    <span className="sa-leg-name">Shading</span>
                    <span className="sa-leg-val">0.5 kWh</span>
                    <span className="sa-leg-pct">17%</span>
                  </div>
                </div>
              </div>

              {/* Embedded AI Recommendation Box */}
              <div className="sa-ai-mini-box">
                <div className="sa-ai-mini-header">
                  <span className="sa-bulb-icon">💡</span>
                  <div>
                    <strong>AI Recommendation</strong>
                    <p>Adjust panel orientation to the optimal angle.</p>
                  </div>
                </div>
                <div className="sa-ai-mini-footer">
                  <span className="sa-gain-tag">Potential gain: <strong>+1.1 kWh/day (5.2%)</strong></span>
                  <button
                    type="button"
                    className="sa-btn-yellow-sm"
                    onClick={() => setSelectedReport('Suggestions')}
                  >
                    View Suggestions →
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 2: Panel Upload, Recent Analysis, Quick Stats */}
        <div className="sa-row sa-row-mid">

          {/* CARD 4: PANEL IMAGE UPLOAD */}
          <div className="sa-card sa-upload-card neon-border">
            <div className="sa-card-header">
              <div className="sa-card-title-wrap">
                <div className="sa-card-icon camera-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 className="sa-card-title">Panel Image Upload</h3>
                  <p className="sa-card-sub">Upload a photo of your solar panel for AI analysis.</p>
                </div>
              </div>
            </div>

            <div
              className={`sa-upload-dropzone ${uploadedImage ? 'has-image' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {isAnalyzing ? (
                <div className="sa-scanning-state">
                  <div className="sa-scan-line"></div>
                  <div className="sa-spinner"></div>
                  <p className="sa-scan-text">Analyzing solar panel health with AI...</p>
                </div>
              ) : uploadedImage ? (
                <div className="sa-uploaded-preview">
                  <img src={uploadedImage} alt="Uploaded Solar Panel" className="sa-preview-img" />
                  <div className="sa-upload-overlay">
                    <span className="sa-badge badge-good">✓ Scan Complete</span>
                    <button type="button" className="sa-btn-secondary-sm" onClick={() => setUploadedImage(null)}>
                      Re-upload
                    </button>
                  </div>
                </div>
              ) : (
                <label className="sa-dropzone-label">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="sa-file-input" />
                  <div className="sa-cloud-icon">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#38bdf8" strokeWidth="2">
                      <path d="M16 16l-4-4-4 4M12 12v9" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                  </div>
                  <p className="sa-upload-prompt">
                    <strong>Drag & drop image or click to upload</strong>
                  </p>
                  <span className="sa-upload-hint">(JPG, PNG - Max 5MB)</span>
                </label>
              )}
            </div>
          </div>

          {/* CARD 5: RECENT ANALYSIS */}
          <div className="sa-card sa-recent-card neon-border">
            <div className="sa-card-header">
              <h3 className="sa-card-title">Recent Analysis</h3>
            </div>

            <div className="sa-recent-grid">
              <div className="sa-thumb-item">
                <div className="sa-thumb-img-wrap thumb-1">
                  <div className="sa-thumb-overlay"></div>
                </div>
                <div className="sa-thumb-info">
                  <span className="sa-thumb-date">Aug 24, 2025</span>
                  <span className="sa-thumb-title">Panel scan</span>
                  <span className="sa-pill pill-good">🟢 Healthy</span>
                </div>
              </div>

              <div className="sa-thumb-item">
                <div className="sa-thumb-img-wrap thumb-2">
                  <div className="sa-thumb-overlay"></div>
                </div>
                <div className="sa-thumb-info">
                  <span className="sa-thumb-date">Aug 20, 2025</span>
                  <span className="sa-thumb-title">Thermal check</span>
                  <span className="sa-pill pill-moderate">⚠️ Issues found</span>
                </div>
              </div>

              <div className="sa-thumb-item">
                <div className="sa-thumb-img-wrap thumb-3">
                  <div className="sa-thumb-overlay"></div>
                </div>
                <div className="sa-thumb-info">
                  <span className="sa-thumb-date">Aug 15, 2025</span>
                  <span className="sa-thumb-title">Efficiency report</span>
                  <span className="sa-pill pill-good">🟢 Healthy</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 6: QUICK STATS */}
          <div className="sa-card sa-quickstats-card neon-border">
            <div className="sa-card-header">
              <div className="sa-card-title-wrap">
                <div className="sa-card-icon stats-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <h3 className="sa-card-title">Quick Stats</h3>
              </div>
            </div>

            <div className="sa-qs-grid">
              <div className="sa-qs-box">
                <div className="sa-qs-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38bdf8" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div>
                  <span className="sa-qs-lbl">Total Panels</span>
                  <strong className="sa-qs-val">8</strong>
                </div>
              </div>

              <div className="sa-qs-box">
                <div className="sa-qs-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                  </svg>
                </div>
                <div>
                  <span className="sa-qs-lbl">Avg. Efficiency</span>
                  <strong className="sa-qs-val">82%</strong>
                </div>
              </div>

              <div className="sa-qs-box">
                <div className="sa-qs-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                  </svg>
                </div>
                <div>
                  <span className="sa-qs-lbl">Current Temp</span>
                  <strong className="sa-qs-val">48°C</strong>
                </div>
              </div>

              <div className="sa-qs-box">
                <div className="sa-qs-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <span className="sa-qs-lbl">Last Scan</span>
                  <strong className="sa-qs-val">2h ago</strong>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 3: Live Energy Flow, Panel Health Insights, SolarQuest Score */}
        <div className="sa-row sa-row-bottom">

          {/* CARD 7: LIVE ENERGY FLOW */}
          <div className="sa-card sa-live-energy-card neon-border">
            <div className="sa-card-header">
              <div className="sa-card-title-wrap">
                <div className="sa-card-icon pulse-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="sa-card-title">Live Energy Flow</h3>
                  <p className="sa-card-sub">Real-time energy generation and consumption.</p>
                </div>
              </div>

              <div className="sa-time-tabs">
                {['Today', '7 Days', '30 Days'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`sa-time-btn ${activeEnergyTimeTab === t ? 'active' : ''}`}
                    onClick={() => setActiveEnergyTimeTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="sa-energy-flow-body">
              {/* Left Live Generation Dial */}
              <div className="sa-live-gen-dial">
                <div className="sa-dial-ring-wrap">
                  <svg viewBox="0 0 120 120" className="sa-dial-svg">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none" stroke="#10b981" strokeWidth="10"
                      strokeDasharray="314" strokeDashoffset="75"
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="sa-dial-center">
                    <div className="sa-dial-bolt">⚡</div>
                    <span className="sa-dial-lbl">Current Generation</span>
                    <strong className="sa-dial-val">18.6 kWh</strong>
                    <span className="sa-dial-sub">Today</span>
                  </div>
                </div>

                <div className="sa-trend-badge">
                  <span className="sa-trend-icon">vs. yesterday</span>
                  <span className="sa-trend-val">↑ +12%</span>
                </div>
              </div>

              {/* Right Energy Generation Curve Chart */}
              <div className="sa-energy-chart-container">
                <div className="sa-chart-y-axis">
                  <span>8 kWh</span>
                  <span>6</span>
                  <span>4</span>
                  <span>2</span>
                  <span>0</span>
                </div>

                <div className="sa-chart-svg-wrap">
                  <svg className="sa-energy-svg" viewBox="0 0 500 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <line x1="0" y1="55" x2="500" y2="55" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <line x1="0" y1="125" x2="500" y2="125" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                    {/* Area path */}
                    <path
                      d="M 0,150 Q 80,150 140,110 T 250,25 T 360,110 Q 420,150 500,150 L 500,160 L 0,160 Z"
                      fill="url(#energyGrad)"
                    />

                    {/* Animated Smooth Curved Energy Line */}
                    <path
                      d="M 0,150 Q 80,150 140,110 T 250,25 T 360,110 Q 420,150 500,150"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      className="sa-line-animated"
                    />

                    {/* Peak Point Tooltip Indicator */}
                    <circle cx="250" cy="25" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" className="sa-pulse-point" />
                  </svg>

                  {/* Peak Point Tooltip Box Overlay */}
                  <div className="sa-peak-tooltip" style={{ left: '50%', top: '10%' }}>
                    <span className="sa-tt-time">12 PM</span>
                    <span className="sa-tt-val">4.8 kWh</span>
                  </div>

                  {/* X Axis Time Labels */}
                  <div className="sa-chart-x-axis">
                    <span>6 AM</span>
                    <span>10 AM</span>
                    <span>2 PM</span>
                    <span>6 PM</span>
                    <span>8 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 8: SOLAR PANEL HEALTH INSIGHTS */}
          <div className="sa-card sa-insights-card neon-border">
            <div className="sa-card-header">
              <div className="sa-card-title-wrap">
                <div className="sa-card-icon heart-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <h3 className="sa-card-title">Solar Panel Health Insights</h3>
              </div>
            </div>

            <div className="sa-insights-list">
              <div className="sa-insight-row">
                <span className="sa-in-icon warning-icon">⚠️</span>
                <div>
                  <strong className="sa-in-title">1 panel needs cleaning</strong>
                  <p className="sa-in-sub">(estimated +6% efficiency)</p>
                </div>
              </div>

              <div className="sa-insight-row">
                <span className="sa-in-icon success-icon">🟢</span>
                <div>
                  <strong className="sa-in-title">No physical damage detected</strong>
                </div>
              </div>

              <div className="sa-insight-row">
                <span className="sa-in-icon alert-warn-icon">💡</span>
                <div>
                  <strong className="sa-in-title">Slight shading in the afternoon</strong>
                  <p className="sa-in-sub">(12 PM - 3 PM)</p>
                </div>
              </div>

              <div className="sa-insight-row">
                <span className="sa-in-icon success-icon">🟢</span>
                <div>
                  <strong className="sa-in-title">Overall system health is good!</strong>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 9: SOLARQUEST SCORE */}
          <div className="sa-card sa-score-card neon-border">
            <div className="sa-card-header">
              <div className="sa-card-title-wrap">
                <div className="sa-card-icon target-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <h3 className="sa-card-title">SolarQuest Score</h3>
              </div>
            </div>

            <div className="sa-sq-content">
              <div className="sa-sq-gauge-wrap">
                <div className="sa-sq-ring">
                  <svg viewBox="0 0 120 120" className="sa-sq-svg">
                    <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="48"
                      fill="none" stroke="url(#sqGrad)" strokeWidth="10"
                      strokeDasharray="301.6" strokeDashoffset={301.6 * (1 - 87 / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      className="sa-sq-ring-anim"
                    />
                    <defs>
                      <linearGradient id="sqGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#38bdf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="sa-sq-center">
                    <span className="sa-sq-num">87</span>
                    <span className="sa-sq-den">/100</span>
                  </div>
                </div>

                <div className="sa-sq-metrics">
                  <div className="sa-sq-metric-item">
                    <span className="sa-sq-check">✓</span>
                    <span className="sa-sq-lbl">Orientation</span>
                    <strong className="sa-sq-val">92</strong>
                  </div>
                  <div className="sa-sq-metric-item">
                    <span className="sa-sq-check">✓</span>
                    <span className="sa-sq-lbl">Cleanliness</span>
                    <strong className="sa-sq-val">84</strong>
                  </div>
                  <div className="sa-sq-metric-item">
                    <span className="sa-sq-check">✓</span>
                    <span className="sa-sq-lbl">Shading</span>
                    <strong className="sa-sq-val">85</strong>
                  </div>
                  <div className="sa-sq-metric-item">
                    <span className="sa-sq-check">✓</span>
                    <span className="sa-sq-lbl">Efficiency</span>
                    <strong className="sa-sq-val">81</strong>
                  </div>
                </div>
              </div>

              <div className="sa-sq-footer">
                <span className="sa-sq-status-badge">
                  <span className="sa-leaf-icon">🌱</span> Excellent <small>Keep it up!</small>
                </span>
                <span className="sa-sq-arrow">→</span>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 4: AI Recommendation Footer & Weather Impact */}
        <div className="sa-row sa-row-footer">

          {/* CARD 10: BOTTOM AI RECOMMENDATION */}
          <div className="sa-card sa-ai-recommendation-card neon-border">
            <div className="sa-card-header">
              <div className="sa-card-title-wrap">
                <div className="sa-card-icon ai-robot-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  </svg>
                </div>
                <div>
                  <h3 className="sa-card-title">AI Recommendation</h3>
                  <p className="sa-card-sub">Based on current data, weather, and panel conditions.</p>
                </div>
              </div>
            </div>

            <div className="sa-ai-footer-body">
              {/* Robot Avatar & Chat Box */}
              <div className="sa-robot-area">
                <div className="sa-robot-avatar">
                  <svg viewBox="0 0 64 64" width="48" height="48" className="sa-robot-svg">
                    <rect x="16" y="16" width="32" height="28" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="26" cy="28" r="4" fill="#38bdf8" className="sa-eye-pulse" />
                    <circle cx="38" cy="28" r="4" fill="#38bdf8" className="sa-eye-pulse" />
                    <line x1="26" y1="36" x2="38" y2="36" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                    <line x1="32" y1="8" x2="32" y2="16" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="32" cy="6" r="3" fill="#ef4444" />
                  </svg>
                </div>

                <div className="sa-chat-bubble">
                  <span className="sa-chat-hdr">💬 Here's what I suggest:</span>
                  <ul className="sa-suggest-list">
                    <li><span className="sa-chk">✓</span> Clean your panels <span className="sa-gain-val">(5-7% gain)</span></li>
                    <li><span className="sa-chk">✓</span> Adjust panel tilt to 18° <span className="sa-gain-val">(3-4% gain)</span></li>
                    <li><span className="sa-chk">✓</span> Check for nearby shading <span className="sa-gain-val">(1-2% gain)</span></li>
                  </ul>
                </div>
              </div>

              {/* Center Predicted Gain Stats */}
              <div className="sa-pred-gain-box">
                <span className="sa-pred-lbl">Predicted Gain</span>
                <strong className="sa-pred-val">↑ +15.9%</strong>
                <span className="sa-pred-sub">Potential extra generation</span>
                <strong className="sa-pred-extra">+2.8 kWh/day</strong>

                <button
                  type="button"
                  className="sa-btn-yellow"
                  onClick={() => setSelectedReport('Full AI Report')}
                >
                  View Full Report →
                </button>
              </div>

              {/* Right Side Visual Banner */}
              <div className="sa-ai-banner-visual">
                <div className="sa-banner-img-overlay">
                  <span className="sa-banner-text">Small changes. Big impact.</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 11: WEATHER IMPACT */}
          <div className="sa-card sa-weather-card neon-border">
            <div className="sa-card-header">
              <div className="sa-card-title-wrap">
                <div className="sa-card-icon weather-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="sa-card-title">Weather Impact</h3>
                  <span className="sa-location-tag">📍 Chennai</span>
                </div>
              </div>
            </div>

            <div className="sa-weather-body">
              <div className="sa-weather-main">
                <div className="sa-weather-sun-cloud">
                  <span className="sa-big-weather-icon">⛅</span>
                </div>
                <div>
                  <div className="sa-weather-temp">28°C</div>
                  <span className="sa-weather-feels">Feels like 31°C</span>
                  <span className="sa-weather-desc">Partly Cloudy</span>
                </div>
              </div>

              <div className="sa-weather-stats-row">
                <div className="sa-w-stat">
                  <span className="sa-w-icon">☁️</span>
                  <span className="sa-w-lbl">Cloud Cover</span>
                  <strong className="sa-w-val">12%</strong>
                </div>
                <div className="sa-w-stat">
                  <span className="sa-w-icon">💨</span>
                  <span className="sa-w-lbl">Wind Speed</span>
                  <strong className="sa-w-val">12 km/h</strong>
                </div>
                <div className="sa-w-stat">
                  <span className="sa-w-icon">💧</span>
                  <span className="sa-w-lbl">Humidity</span>
                  <strong className="sa-w-val">68%</strong>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* REPORT MODAL POPUP */}
      {selectedReport && (
        <div className="sa-modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="sa-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3>SolarQuest Analysis: {selectedReport}</h3>
              <button type="button" className="sa-close-btn" onClick={() => setSelectedReport(null)}>✕</button>
            </div>
            <div className="sa-modal-body">
              <p>Comprehensive breakdown and recommendations for <strong>{selectedReport}</strong> are active.</p>
              <div className="sa-modal-stats">
                <div className="sa-m-stat">
                  <span>Current Performance Score</span>
                  <strong>87 / 100</strong>
                </div>
                <div className="sa-m-stat">
                  <span>Estimated Annual Savings</span>
                  <strong>$420.50</strong>
                </div>
              </div>
              <p>AI Engine recommends performing panel surface cleaning every 14 days to maximize sunlight absorption by 6.2%.</p>
            </div>
            <div className="sa-modal-footer">
              <button type="button" className="sa-btn-primary" onClick={() => setSelectedReport(null)}>
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

