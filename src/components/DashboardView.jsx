import React, { useEffect, useMemo, useState } from 'react'
import { fetchSolarData } from '../services/openMeteoService'
import { getSunPosition } from '../services/sunPositionService'
import GlobalSolarMap from './GlobalSolarMap'
import heroBannerImg from '../assets/hero_banner.jpg'

const PROFILE_STORAGE_KEY = 'solarquest-profile'
const PANEL_CONFIG = {
  capacityKw: 2.5,
  areaM2: 12,
  panelEfficiency: 0.2,
  systemEfficiency: 0.85,
  tilt: 18,
  direction: 'South',
}

const isNumeric = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
const formatFixed = (value, digits = 1) => (isNumeric(value) ? Number(value).toFixed(digits) : '—')
const formatTime = (date) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
const hasCoordinates = isNumeric

async function getLocationName(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      { headers: { Accept: 'application/json' } },
    )
    if (!response.ok) return 'Chennai'
    const data = await response.json()
    const address = data.address || {}
    return address.city || address.town || address.village || address.state || 'Chennai'
  } catch {
    return 'Chennai'
  }
}

export default function DashboardView({ onNavigate }) {
  const [location, setLocation] = useState(() => {
    try {
      const savedProfile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || 'null')
      return savedProfile?.latitude !== undefined && savedProfile?.longitude !== undefined
        ? savedProfile
        : { latitude: 13.0827, longitude: 80.2707, source: 'GPS', label: 'Chennai' }
    } catch {
      return { latitude: 13.0827, longitude: 80.2707, source: 'GPS', label: 'Chennai' }
    }
  })

  const [weatherData, setWeatherData] = useState(null)
  const [sunPosition, setSunPosition] = useState({ altitude: 45, azimuth: 180, isDaylight: true })
  const [now, setNow] = useState(new Date())
  const [activeTab, setActiveTab] = useState('Today')
  const [showAiRec, setShowAiRec] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation || (location.latitude && location.longitude && location.source === 'Manual')) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: 'GPS',
          label: 'Chennai',
        }
        const placeName = await getLocationName(nextLocation.latitude, nextLocation.longitude)
        const registeredLocation = { ...nextLocation, label: placeName }
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(registeredLocation))
        setLocation(registeredLocation)
      },
      () => {},
      { timeout: 10000 },
    )
  }, [])

  useEffect(() => {
    if (!hasCoordinates(location.latitude) || !hasCoordinates(location.longitude)) return

    const fetchWeather = async () => {
      try {
        const solar = await fetchSolarData(location.latitude, location.longitude)
        setWeatherData(solar)
      } catch (error) {
        console.warn('Weather fetch error:', error)
      }
    }
    fetchWeather()
  }, [location.latitude, location.longitude])

  useEffect(() => {
    if (!hasCoordinates(location.latitude) || !hasCoordinates(location.longitude)) return

    const frame = () => {
      const next = getSunPosition(location.latitude, location.longitude, new Date())
      setSunPosition(next)
    }
    frame()
    const interval = setInterval(frame, 60000)
    return () => clearInterval(interval)
  }, [location.latitude, location.longitude])

  const currentWeather = weatherData?.current || {}
  const hourly = weatherData?.hourly || []
  const validHourly = hourly.filter((point) => Number.isFinite(Number(point.ghi)))

  const energyEstimate = useMemo(() => {
    if (!validHourly.length) return 18.6
    const calculated = validHourly
      .slice(0, 24)
      .reduce((sum, point) => sum + (Number(point.ghi) / 1000) * PANEL_CONFIG.areaM2 * PANEL_CONFIG.panelEfficiency * PANEL_CONFIG.systemEfficiency, 0)
    return calculated > 0 ? calculated : 18.6
  }, [validHourly])

  const currentGhi = Number(weatherData?.solar?.ghi) || 1000
  const temp = Number(currentWeather.temperature) || 28
  const wind = Number(currentWeather.windSpeed) || 12
  const humidity = 68
  const uvIndex = 7

  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening'

  return (
    <>
      {/* HERO SECTION WITH PHOTO BACKDROP & OVERLAYS */}
      <section className="hero-banner-section">
        <div className="hero-bg-wrapper">
          <img src={heroBannerImg} alt="Solar Infrastructure" className="hero-backdrop" />
          <div className="hero-dark-overlay" />
        </div>

        {/* TOP RIGHT LIVE DATA & USER BAR */}
        <div className="top-right-user-bar">
          <div className="live-status-pill">
            <span className="live-dot" />
            <span>Live Data</span>
            <span className="time-sub">Last updated: {formatTime(now)}</span>
          </div>
          <button type="button" className="icon-btn notif-btn">
            🔔
            <span className="notif-dot" />
          </button>
          <div className="user-avatar-pill">
            <div className="avatar-circle">N</div>
          </div>
        </div>

        {/* TOP LEFT GREETING & INTRO */}
        <div className="hero-copy-container">
          <h1 className="hero-greeting">{greeting}, Meenakshi!</h1>
          <h3 className="hero-subtitle">Your Solar Intelligence Center</h3>
          <p className="hero-desc">
            Real-time insights, AI-powered analysis and actionable recommendations to get the most out of your solar energy.
          </p>
        </div>

        {/* TOP CENTER/RIGHT WEATHER & CONDITIONS PILLS */}
        <div className="weather-pills-row">
          <div className="weather-pill">
            <span className="pill-icon">📍</span>
            <span className="pill-text">{location.label || 'Chennai'}, Clear Sky</span>
          </div>
          <div className="weather-pill">
            <span className="pill-icon">☀️</span>
            <span className="pill-text">{temp}°C <small>Feels like 31°C</small></span>
          </div>
          <div className="weather-pill">
            <span className="pill-icon">💨</span>
            <span className="pill-text">Wind {wind} km/h</span>
          </div>
          <div className="weather-pill">
            <span className="pill-icon">💧</span>
            <span className="pill-text">Humidity {humidity}%</span>
          </div>
          <div className="weather-pill">
            <span className="pill-icon">🛡️</span>
            <span className="pill-text">UV Index {uvIndex} [High]</span>
          </div>
        </div>

        {/* OVERLAY ENERGY DATA CALLOUTS ON THE 3D BACKDROP */}
        <div className="hero-live-callouts">
          <div className="hero-tag sun-tag">
            <span className="tag-dot yellow" />
            <span>Sunlight</span>
            <strong>{formatFixed(currentGhi, 0)} W/m²</strong>
          </div>

          <div className="hero-tag panel-tag">
            <span>Solar Panels</span>
            <strong>{formatFixed(energyEstimate, 1)} kWh <small>(Today)</small></strong>
            <span className="tag-badge green">+12%</span>
          </div>

          <div className="hero-tag home-tag">
            <span>Home</span>
            <strong>16.8 kWh <small>(Used)</small></strong>
          </div>

          <div className="hero-tag grid-tag">
            <strong>+ 2.8 kWh <small>(Exported)</small></strong>
          </div>
        </div>

        {/* AI RECOMMENDATION FLOATING CARD */}
        {showAiRec && (
          <div className="ai-recommendation-card">
            <button type="button" className="close-ai-btn" onClick={() => setShowAiRec(false)}>×</button>
            <div className="ai-card-header">
              <span className="ai-icon">✨</span>
              <span className="ai-title">AI Recommendation</span>
            </div>
            <h4>You&apos;re losing 3.0 kWh/day</h4>
            <p>Due to dust, suboptimal orientation and 12% cloud cover.</p>
            <button type="button" className="fix-loss-btn" onClick={() => onNavigate('/loss-detector')}>
              Fix Energy Loss →
            </button>
          </div>
        )}
      </section>

      {/* METRICS ROW */}
      <section className="metrics-cards-grid">
        <div className="metric-stat-card">
          <div className="card-top-row">
            <div className="card-icon-box yellow">☀️</div>
            <span className="card-badge green">↑ +6%</span>
          </div>
          <span className="card-label">Solar Potential</span>
          <div className="card-main-val">82 %</div>
          <span className="card-sub-info text-green">Good conditions</span>
        </div>

        <div className="metric-stat-card">
          <div className="card-top-row">
            <div className="card-icon-box blue">⚡</div>
            <svg viewBox="0 0 60 20" className="mini-sparkline">
              <path d="M0 15 Q15 5 30 12 T60 3" fill="none" stroke="#00f2fe" strokeWidth="2" />
            </svg>
          </div>
          <span className="card-label">Today&apos;s Generation</span>
          <div className="card-main-val">{formatFixed(energyEstimate, 1)} kWh</div>
          <span className="card-sub-info text-cyan">+ 12% vs. yesterday</span>
        </div>

        <div className="metric-stat-card">
          <div className="card-top-row">
            <div className="card-icon-box cyan">🕒</div>
          </div>
          <span className="card-label">Peak Sunlight</span>
          <div className="card-main-val">12:15 PM</div>
          <span className="card-sub-info">Optimal time</span>
        </div>

        <div className="metric-stat-card">
          <div className="card-top-row">
            <div className="card-icon-box emerald">📊</div>
          </div>
          <span className="card-label">Optimization Gain</span>
          <div className="card-main-val text-emerald">+14.8%</div>
          <span className="card-sub-info">vs. current setup</span>
        </div>

        <div className="metric-stat-card">
          <div className="card-top-row">
            <div className="card-icon-box green">🍃</div>
          </div>
          <span className="card-label">CO₂ Avoided</span>
          <div className="card-main-val">12.4 kg</div>
          <span className="card-sub-info">Today</span>
        </div>
      </section>

      {/* MIDDLE WIDGETS GRID */}
      <section className="middle-widgets-grid">
        <div className="glass-card energy-curve-card">
          <div className="card-header">
            <div className="header-title">
              <span className="icon-glow">📈</span>
              <h4>Energy Generation Curve</h4>
            </div>
            <div className="time-filter-tabs">
              {['Today', '7 Days', '30 Days'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="curve-widget-split">
            <div className="chart-container">
              <div className="y-axis">
                <span>6 kWh</span>
                <span>4 kWh</span>
                <span>2 kWh</span>
                <span>0</span>
              </div>
              <div className="svg-chart-wrapper">
                <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="area-chart-svg">
                  <defs>
                    <linearGradient id="cyan-glow-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.5" />
                      <stop offset="60%" stopColor="#4facfe" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="190" x2="500" y2="190" stroke="rgba(255,255,255,0.08)" />

                  <path d="M 0 190 Q 70 185 140 140 T 250 40 T 360 140 Q 430 185 500 190 L 500 190 L 0 190 Z" fill="url(#cyan-glow-fill)" />
                  <path d="M 0 190 Q 70 185 140 140 T 250 40 T 360 140 Q 430 185 500 190" fill="none" stroke="#00f2fe" strokeWidth="3" />
                  <circle cx="250" cy="40" r="5" fill="#ffffff" stroke="#00f2fe" strokeWidth="3" />
                </svg>

                <div className="peak-chart-tooltip" style={{ left: '50%', top: '15%' }}>
                  <span className="tooltip-time">12 PM</span>
                  <strong>4.8 kWh</strong>
                </div>

                <div className="x-axis">
                  <span>6 AM</span>
                  <span>8 AM</span>
                  <span>10 AM</span>
                  <span>12 PM</span>
                  <span>2 PM</span>
                  <span>4 PM</span>
                  <span>6 PM</span>
                  <span>8 PM</span>
                </div>
              </div>
            </div>

            <div className="energy-flow-side">
              <h5>Live Energy Flow</h5>
              <div className="donut-wrapper">
                <svg viewBox="0 0 120 120" className="donut-svg">
                  <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#00f2fe" strokeWidth="12" strokeDasharray="210 290" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#4facfe" strokeWidth="12" strokeDasharray="50 290" strokeDashoffset="-215" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#ffb830" strokeWidth="12" strokeDasharray="15 290" strokeDashoffset="-270" />
                </svg>
                <div className="donut-center-text">
                  <strong>18.6 kWh</strong>
                  <small>Generated Today</small>
                </div>
              </div>

              <div className="flow-legend-list">
                <div className="legend-item"><span className="dot cyan" /><span className="val">16.8 kWh</span><span className="lbl">Used</span></div>
                <div className="legend-item"><span className="dot blue" /><span className="val">2.8 kWh</span><span className="lbl">Exported</span></div>
                <div className="legend-item"><span className="dot yellow" /><span className="val">0.0 kWh</span><span className="lbl">Stored</span></div>
              </div>
            </div>
          </div>
        </div>

        <GlobalSolarMap />

        <div className="glass-card score-card">
          <div className="card-header">
            <div className="header-title">
              <span className="icon-glow">⚙️</span>
              <h4>SolarQuest Score</h4>
            </div>
          </div>

          <div className="score-card-body">
            <div className="score-gauge-area">
              <svg viewBox="0 0 140 140" className="gauge-svg">
                <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                <circle cx="70" cy="70" r="54" fill="none" stroke="url(#gauge-grad)" strokeWidth="12" strokeDasharray="339" strokeDashoffset="45" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38ef7d" />
                    <stop offset="100%" stopColor="#00f2fe" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="gauge-inner">
                <div className="score-num">87 <small>/100</small></div>
                <span className="score-verdict">Excellent</span>
                <small className="score-subtext">Keep it up!</small>
              </div>
            </div>

            <div className="score-sub-metrics">
              <div className="metric-row"><span className="icon">🧭</span><span className="name">Orientation</span><strong className="val">92</strong></div>
              <div className="metric-row"><span className="icon">🧹</span><span className="name">Cleanliness</span><strong className="val">84</strong></div>
              <div className="metric-row"><span className="icon">☂️</span><span className="name">Shading</span><strong className="val">85</strong></div>
              <div className="metric-row"><span className="icon">⚡</span><span className="name">Efficiency</span><strong className="val">81</strong></div>
            </div>
          </div>

          <div className="quick-actions-bar">
            <span className="bar-label">⚡ Quick Actions</span>
            <div className="btn-group">
              <button type="button" className="action-btn" onClick={() => onNavigate('/loss-detector')}>Scan Panel</button>
              <button type="button" className="action-btn" onClick={() => onNavigate('/simulation')}>Run Simulation</button>
              <button type="button" className="action-btn">View Report</button>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM SECTION */}
      <section className="bottom-tools-section">
        <div className="step-flow-banner">
          <div className="step-chain">
            <span className="step">Detect</span>
            <span className="arrow">→</span>
            <span className="step">Explain</span>
            <span className="arrow">→</span>
            <span className="step">Simulate</span>
            <span className="arrow">→</span>
            <span className="step">Recommend</span>
            <span className="arrow">→</span>
            <span className="step">Recover</span>
          </div>
          <p className="flow-desc">Turn solar data into real energy savings.</p>
        </div>

        <div className="feature-tools-grid">
          <div className="tool-card" onClick={() => onNavigate('/loss-detector')}>
            <div className="tool-icon cyan-icon">🔍</div>
            <div className="tool-info">
              <h6>AI Loss Detector</h6>
              <p>Finds where you&apos;re losing energy</p>
            </div>
          </div>

          <div className="tool-card" onClick={() => onNavigate('/loss-detector')}>
            <div className="tool-icon green-icon">🩺</div>
            <div className="tool-info">
              <h6>Panel Health Scanner</h6>
              <p>Detects dust, cracks &amp; faults</p>
            </div>
          </div>

          <div className="tool-card" onClick={() => onNavigate('/simulation')}>
            <div className="tool-icon yellow-icon">🧪</div>
            <div className="tool-info">
              <h6>What-If Simulator</h6>
              <p>Test different conditions</p>
            </div>
          </div>

          <div className="tool-card" onClick={() => onNavigate('/loss-detector')}>
            <div className="tool-icon blue-icon">🤖</div>
            <div className="tool-info">
              <h6>SolarQuest AI Copilot</h6>
              <p>Ask anything about your solar system</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
