import React, { useState } from 'react'
import heroBannerImg from '../assets/hero_banner.jpg'

export default function Optimizer({ onNavigate }) {
  const [activeSubTab, setActiveSubTab] = useState('Smart Recommendations')
  const [tilt, setTilt] = useState(18)
  const [direction, setDirection] = useState('South')
  const [cloud, setCloud] = useState(20)
  const [dust, setDust] = useState(10)

  const topRecs = [
    {
      num: 1,
      title: 'Adjust panel orientation',
      desc: 'Your panels are facing East. South direction is optimal for today\'s conditions.',
      gain: '+1.1 kWh/day',
    },
    {
      num: 2,
      title: 'Clean solar panels',
      desc: 'Dust accumulation detected (8-12% efficiency loss).',
      gain: '+0.9 kWh/day',
    },
    {
      num: 3,
      title: 'Reduce shading',
      desc: 'Tree shadow detected (early morning).',
      gain: '+0.6 kWh/day',
    },
    {
      num: 4,
      title: 'Optimize tilt angle',
      desc: 'Current 12° → Recommended 18°.',
      gain: '+0.4 kWh/day',
    },
  ]

  return (
    <div className="optimizer-page">
      {/* HEADER & SUB NAV TABS */}
      <header className="page-header">
        <div className="header-left">
          <div className="header-icon-badge yellow-glow">
            ☀️
          </div>
          <div>
            <h1 className="page-title">Optimizer</h1>
            <p className="page-subtitle">
              Get the most out of your sunlight. AI-powered recommendations to maximize your solar generation and reduce energy loss.
            </p>
          </div>
        </div>

        <div className="analysis-sub-nav">
          {['Smart Recommendations', 'Orientation & Tilt', 'Cleaning Schedule', 'Maintenance Alerts'].map((tab) => (
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

      {/* MAIN CONTENT GRID */}
      <div className="optimizer-main-grid">

        {/* COL 1: SOLARQUEST AI RECOMMENDATION BANNER */}
        <div className="glass-card ai-opt-banner-card">
          <div className="ai-opt-header">
            <span className="sun-icon-sm">☀️</span>
            <h5>SolarQuest AI Recommendation</h5>
          </div>

          <div className="ai-opt-body">
            <p className="opt-headline">Increase your daily generation by</p>
            <div className="opt-big-percent text-green">+15.9%</div>
            <span className="opt-potential-sub">Potential gain: <strong>+3.2 kWh/day</strong></span>
          </div>

          <button type="button" className="btn-gold-lg" onClick={() => onNavigate('/simulation')}>
            Apply All Suggestions →
          </button>
        </div>

        {/* COL 2: TOP RECOMMENDATIONS LIST */}
        <div className="glass-card top-recs-card">
          <div className="card-header">
            <h4>Top Recommendations</h4>
          </div>

          <div className="recs-list">
            {topRecs.map((r) => (
              <div key={r.num} className="rec-item-row">
                <div className="rec-num-circle">{r.num}</div>
                <div className="rec-info-col">
                  <h6>{r.title}</h6>
                  <p>{r.desc}</p>
                </div>
                <span className="rec-gain-pill">{r.gain}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COL 3: OPTIMIZATION SIMULATOR */}
        <div className="glass-card opt-simulator-card">
          <div className="card-header">
            <h4>Optimization Simulator</h4>
          </div>

          <div className="opt-sim-body">
            {/* Left Sliders Col */}
            <div className="sim-sliders-col">
              <div className="sim-slider-group">
                <div className="lbl-row">
                  <span>Panel Tilt Angle</span>
                  <strong>{tilt}°</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={tilt}
                  onChange={(e) => setTilt(Number(e.target.value))}
                  className="custom-range-input"
                />
                <div className="range-minmax"><span>0°</span><span>60°</span></div>
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
                  <span>Cloud Cover</span>
                  <strong>{cloud}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cloud}
                  onChange={(e) => setCloud(Number(e.target.value))}
                  className="custom-range-input"
                />
                <div className="range-minmax"><span>0%</span><span>100%</span></div>
              </div>

              <div className="sim-slider-group">
                <div className="lbl-row">
                  <span>Dust Level</span>
                  <strong>{dust}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={dust}
                  onChange={(e) => setDust(Number(e.target.value))}
                  className="custom-range-input"
                />
                <div className="range-minmax"><span>0%</span><span>100%</span></div>
              </div>
            </div>

            {/* Right Graphic & Real-Time Chart Col */}
            <div className="sim-visual-col">
              <div className="graphic-preview-wrap">
                <img src={heroBannerImg} alt="Optimization Preview" className="preview-img" />
                <div className="preview-overlay" />
                <div className="predicted-gen-callout">
                  <span className="lbl">Predicted Generation</span>
                  <div className="val-row">
                    <strong>21.4 kWh/day</strong>
                    <span className="gain-badge green">+17.6%</span>
                  </div>
                  <span className="curr-sub">Current: 18.2 kWh/day</span>
                </div>
              </div>

              {/* Curve Chart */}
              <div className="opt-chart-wrap">
                <div className="chart-legend-top">
                  <span className="dot blue">Current</span>
                  <span className="dot green">Optimized</span>
                </div>
                <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="opt-curve-svg">
                  <path d="M 0 110 Q 80 95 180 50 T 320 80 L 400 110" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                  <path d="M 0 110 Q 80 75 180 20 T 320 60 L 400 110" fill="none" stroke="#38ef7d" strokeWidth="3" />
                  <circle cx="180" cy="20" r="4" fill="#ffffff" stroke="#38ef7d" strokeWidth="2.5" />
                </svg>
                <div className="x-labels-row">
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

      </div>
    </div>
  )
}
