import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { fetchSolarData, getWeatherLabel } from './services/openMeteoService'
import { getSunPhase, getSunPosition } from './services/sunPositionService'
import SolarAnalyst from './pages/SolarAnalyst'

const PROFILE_STORAGE_KEY = 'solarquest-profile'
const PANEL_CONFIG = {
  capacityKw: 2.5,
  areaM2: 12,
  panelEfficiency: 0.2,
  systemEfficiency: 0.85,
  tilt: 18,
  direction: 'South',
}

const icon = L.icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const formatNumber = (value) =>
  Number.isFinite(value) ? Number(value).toFixed(0) : '—'

const isNumeric = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))

const formatFixed = (value, digits = 1) => (isNumeric(value) ? Number(value).toFixed(digits) : '—')

const formatSolar = (value) => (isNumeric(value) ? `${Number(value).toFixed(0)} W/m²` : '—')

const formatSigned = (value) => (isNumeric(value) ? `${Number(value).toFixed(0)}°` : '—')

const formatTime = (date) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)

const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const hasCoordinates = isNumeric

async function getLocationName(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      { headers: { Accept: 'application/json' } },
    )

    if (!response.ok) {
      return `Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`
    }

    const data = await response.json()
    const address = data.address || {}
    const placeName =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      address.state ||
      data.display_name?.split(',').slice(0, 2).join(',') ||
      `Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`

    return placeName
  } catch {
    return `Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`
  }
}

function Dashboard({ onNavigate }) {
  const [location, setLocation] = useState(() => {
    try {
      const savedProfile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || 'null')
      return savedProfile?.latitude !== undefined && savedProfile?.longitude !== undefined
        ? savedProfile
        : { latitude: null, longitude: null, source: 'GPS', label: '' }
    } catch {
      return { latitude: null, longitude: null, source: 'GPS', label: '' }
    }
  })
  const [manualLocation, setManualLocation] = useState({ latitude: '', longitude: '' })
  const [statusMessage, setStatusMessage] = useState(() => (
    hasCoordinates(location.latitude) && hasCoordinates(location.longitude)
      ? 'Loading weather data...'
      : 'Getting your location...'
  ))
  const [locationError, setLocationError] = useState('')
  const [weatherError, setWeatherError] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [sunPosition, setSunPosition] = useState({ altitude: null, azimuth: null, isDaylight: false })
  const [now, setNow] = useState(new Date())
  const [manualMode, setManualMode] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (hasCoordinates(location.latitude) && hasCoordinates(location.longitude)) {
      setManualMode(false)
      return
    }

    if (!navigator.geolocation) {
      setLocationError('Location access is required to provide location-specific solar analysis.')
      setManualMode(true)
      setStatusMessage('Location access is required to provide location-specific solar analysis.')
      return
    }

    setStatusMessage('Getting your location...')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: 'GPS',
          label: '',
        }

        const placeName = await getLocationName(nextLocation.latitude, nextLocation.longitude)
        const registeredLocation = { ...nextLocation, label: placeName }
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(registeredLocation))
        setLocation(registeredLocation)
        setLocationError('')
        setManualMode(false)
        setStatusMessage('Loading weather data...')
      },
      () => {
        setLocationError('Location access is required to provide location-specific solar analysis.')
        setStatusMessage('Location access is required to provide location-specific solar analysis.')
        setManualMode(true)
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 300000,
      },
    )
  }, [location.latitude, location.longitude])

  useEffect(() => {
    if (!hasCoordinates(location.latitude) || !hasCoordinates(location.longitude)) {
      return
    }

    const fetchWeather = async () => {
      try {
        setWeatherError('')
        setStatusMessage('Loading weather data...')
        const solar = await fetchSolarData(location.latitude, location.longitude)
        setWeatherData(solar)
        setStatusMessage('Calculating Sun position...')
      } catch (error) {
        setWeatherError(error.message || 'Weather data unavailable.')
        setStatusMessage(error.message || 'Weather data unavailable.')
      }
    }

    fetchWeather()
  }, [location.latitude, location.longitude])

  useEffect(() => {
    if (!hasCoordinates(location.latitude) || !hasCoordinates(location.longitude)) {
      return
    }

    const frame = () => {
      const next = getSunPosition(location.latitude, location.longitude, new Date())
      setSunPosition(next)
    }

    frame()
    const interval = setInterval(frame, 5000)
    return () => clearInterval(interval)
  }, [location.latitude, location.longitude])

  useEffect(() => {
    if (weatherData && hasCoordinates(location.latitude) && hasCoordinates(location.longitude) && sunPosition) {
      setStatusMessage('Preparing Solar Intelligence...')
    }
  }, [weatherData, location.latitude, location.longitude, sunPosition])

  const handleManualSubmit = async (event) => {
    event.preventDefault()

    const latitude = Number(manualLocation.latitude)
    const longitude = Number(manualLocation.longitude)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setLocationError('Please enter valid latitude and longitude values.')
      return
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setLocationError('Coordinates are outside the valid global range.')
      return
    }

    const placeName = await getLocationName(latitude, longitude)
    const registeredLocation = { latitude, longitude, source: 'Manual', label: placeName }
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(registeredLocation))
    setLocation(registeredLocation)
    setLocationError('')
    setManualMode(false)
    setStatusMessage('Loading weather data...')
  }

  const panelLocation = useMemo(() => {
    if (!hasCoordinates(location.latitude) || !hasCoordinates(location.longitude)) {
      return null
    }

    return { latitude: location.latitude, longitude: location.longitude }
  }, [location])

  const currentWeather = weatherData?.current || {}
  const hourly = weatherData?.hourly || []
  const validHourly = hourly.filter((point) => Number.isFinite(Number(point.ghi)))
  const peakGhi = validHourly.reduce((peak, point) => Math.max(peak, Number(point.ghi)), 0)
  const peakHour = validHourly.find((point) => Number(point.ghi) === peakGhi)
  const energyEstimate = validHourly
    .slice(0, 24)
    .reduce((sum, point) => sum + (Number(point.ghi) / 1000) * PANEL_CONFIG.areaM2 * PANEL_CONFIG.panelEfficiency * PANEL_CONFIG.systemEfficiency, 0)

  const locationReady = hasCoordinates(location.latitude) && hasCoordinates(location.longitude)
  const dashboardReady = locationReady && !!weatherData && Number.isFinite(sunPosition.altitude)

  const sunScene = useMemo(() => {
    const altitude = Number(sunPosition.altitude)
    const hasSunPosition = isNumeric(sunPosition.altitude)
    const azimuth = ((sunPosition.azimuth || 0) + 360) % 360
    const x = Math.sin((azimuth - 180) * (Math.PI / 180)) * (110 + altitude * 1.35)
    const y = -Math.sin((altitude * Math.PI) / 180) * 120

    return {
      x,
      y,
      visible: hasSunPosition && (sunPosition.isDaylight || altitude > -10),
      orb: hasSunPosition && altitude > -10 ? 'sun' : 'moon',
    }
  }, [sunPosition])

  const weatherSummary = useMemo(() => {
    const weatherCode = Number(currentWeather.weatherCode)
    const cloud = Number(currentWeather.cloudCover)
    const temp = Number(currentWeather.temperature)
    const wind = Number(currentWeather.windSpeed)
    const solar = Number(weatherData?.solar?.ghi)

    if (!Number.isFinite(weatherCode) || !Number.isFinite(cloud) || !Number.isFinite(solar)) {
      return 'Weather conditions are being updated.'
    }

    if (cloud < 30 && solar > 500) {
      return 'Cloud cover is currently low, so solar radiation conditions are favorable.'
    }
    if (cloud > 60) {
      return 'Cloud cover is high, and solar production is reduced by atmospheric attenuation.'
    }
    if (temp > 32) {
      return 'High ambient temperature is reducing efficiency slightly while irradiance is still strong.'
    }
    if (wind > 20) {
      return 'Wind is elevated, which can cool the panels and slightly improve efficiency.'
    }

    return 'Solar conditions are stable and suitable for steady generation.'
  }, [currentWeather, weatherData])

  const currentTilt = PANEL_CONFIG.tilt
  const currentDirection = PANEL_CONFIG.direction
  const recommendedTilt = clamp(Math.abs(Number(location.latitude)) || 26, 15, 42)
  const recommendedDirection = Number(location.latitude) >= 0 ? 'South' : 'North'
  const currentOutput = Number.isFinite(Number(weatherData?.solar?.ghi))
    ? (Number(weatherData.solar.ghi) / 1000) * PANEL_CONFIG.areaM2 * PANEL_CONFIG.panelEfficiency * PANEL_CONFIG.systemEfficiency
    : null
  const orientationFactor = sunPosition.isDaylight ? 1 + Math.min(0.2, Math.abs(Number(sunPosition.altitude)) / 500) : 1
  const optimizedOutput = currentOutput === null ? null : currentOutput * orientationFactor
  const gainPercent = currentOutput && optimizedOutput !== null ? ((optimizedOutput - currentOutput) / currentOutput) * 100 : null

  const curvePoints = useMemo(() => {
    if (!hourly.length) {
      return ''
    }

    const values = hourly.slice(0, 24).map((point) => Number(point.ghi))
    if (!values.some(Number.isFinite)) {
      return ''
    }
    const maxValue = Math.max(...values, 1)
    const step = 100 / Math.max(values.length - 1, 1)

    return values
      .map((value, index) => {
        const x = index * step
        const y = 100 - (value / maxValue) * 85
        return `${x},${y}`
      })
      .join(' ')
  }, [hourly])

  const currentGhi = Number(weatherData?.solar?.ghi)
  const currentDni = Number(weatherData?.solar?.dni)
  const currentDhi = Number(weatherData?.solar?.dhi)
  const sunPhase = locationReady ? getSunPhase(location.latitude, location.longitude, now) : null
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="solar-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-icon">☀️</div>
          <div className="brand-copy">
            <h1>SolarQuest</h1>
            <p>Innovate to Capture More Sunlight &amp; Boost Energy</p>
          </div>
        </div>

        <nav className="side-nav">
          {['Dashboard', 'Solar Analyst', 'Solar Analysis', 'Optimizer', 'Simulation', 'AI Prediction', 'Analytics', 'Weather & Sunlight', 'What-if Simulator', 'SolarQuest Challenge'].map((item, index) => (
            <button key={item} className={`nav-item ${index === 0 ? 'active' : ''}`} type="button" onClick={() => item === 'Solar Analyst' ? onNavigate('/solar-analyst') : onNavigate('/dashboard')}>
              <span className="nav-icon">{['◫', '◌', '◌', 'Ø', '◐', '✦', '▣', '☼', '◔', '⚑'][index]}</span>
              {item}
            </button>
          ))}
        </nav>

        <div className="profile-card">
          <div className="profile-avatar">N</div>
          <div>
            <strong>Namrutha</strong>
            <small>General User</small>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="top-strip">
          <div className="live-status-block">
            <span className={`dot ${dashboardReady ? 'good' : 'warn'}`}></span>
            <span>{dashboardReady ? 'Live Data' : locationError ? 'Location permission required' : weatherError || 'Loading...'}</span>
            <span className="timestamp">Last updated: {formatTime(now)}</span>
          </div>
          <div className="status-pills">
            <span>Weather: {weatherData ? 'Open-Meteo ✓' : 'Weather data unavailable'}</span>
            <span>Sun Position: {sunPosition ? 'SunCalc ✓' : 'Calculating...'}</span>
            <span>Location: {locationReady ? `${location.source} ✓` : 'Permission required'}</span>
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-copy">
            <h2>{greeting}, {location.label ? location.label.split(',')[0] : 'Solar User'}!</h2>
            <h3>Your Solar Intelligence Center</h3>
            <p>Monitor sunlight, optimize panel positioning, and discover how much more energy you can capture.</p>
            <div className="meta-row">
              <span>📍 {location.label || 'Waiting for location...'}</span>
              <span>📅 {formatDate(now)}</span>
              <span>🕒 {formatTime(now)} local</span>
            </div>
            <div className="hero-actions">
              <button type="button" className="primary">Analyze Sunlight</button>
              <button type="button">Optimize Panel</button>
            </div>
          </div>

          <div className="sun-scene">
            <div className="sun-orbit" />
            <div
              className={`sun-spot ${sunScene.visible ? 'visible' : 'hidden'}`}
              style={{ left: `calc(50% + ${sunScene.x}px)`, top: `calc(50% - ${sunScene.y}px)` }}
            />
            <div className="panel-frame">
              <div className="panel-surface" />
              <div className="panel-grid" />
            </div>
          </div>

          <aside className="hero-side-card">
            <div className="mini-block">
              <div className="mini-label">Sun Position</div>
              <div className="mini-stat">Altitude: {formatSigned(sunPosition.altitude)}</div>
              <div className="mini-stat">Azimuth: {formatSigned(sunPosition.azimuth)}</div>
              <div className="mini-stat">{isNumeric(sunPosition.altitude) ? (sunPosition.isDaylight ? '☀️ Daylight' : '🌙 Night / No direct sunlight') : 'Calculating Sun position...'}</div>
            </div>
            <div className="mini-weather">
              <div className="mini-label">Location</div>
              <div className="city-name">{location.label || 'Awaiting GPS'}</div>
              <div className="mini-row">
                <span>🌡️ {formatNumber(currentWeather.temperature)}°C</span>
                <span>☁️ {formatNumber(currentWeather.cloudCover)}%</span>
                <span>💨 {formatNumber(currentWeather.windSpeed)} km/h</span>
              </div>
            </div>
          </aside>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Solar Potential</div>
            <div className="stat-value">{Number.isFinite(currentGhi) ? `${Math.min(100, Math.max(0, Math.round((currentGhi / 1200) * 100)))}%` : '—'}</div>
            <small>Based on current irradiance</small>
          </div>
          <div className="stat-card">
            <div className="stat-label">Energy Today</div>
            <div className="stat-value">{Number.isFinite(energyEstimate) ? `${formatFixed(energyEstimate)} kWh` : '—'}</div>
            <small>Modelled estimate</small>
          </div>
          <div className="stat-card">
            <div className="stat-label">Peak Sunlight</div>
            <div className="stat-value">{peakHour ? formatTime(new Date(peakHour.time)) : '—'}</div>
            <small>Peak irradiance window</small>
          </div>
          <div className="stat-card accent">
            <div className="stat-label">Optimization Gain</div>
            <div className="stat-value">{gainPercent === null ? '—' : `+${formatFixed(gainPercent)}%`}</div>
            <small>Versus current configuration</small>
          </div>
        </section>

        <section className="middle-grid">
          <div className="glass-card wide-card">
            <div className="card-header">
              <h4>Live Sunlight Intelligence</h4>
            </div>
            <div className="metric-grid">
              <div className="metric"><span>Solar Irradiance</span><strong>{formatSolar(currentGhi)}</strong><small>Open-Meteo GHI</small></div>
              <div className="metric"><span>Direct Irradiance</span><strong>{formatSolar(currentDni)}</strong><small>Open-Meteo DNI</small></div>
              <div className="metric"><span>Diffuse Irradiance</span><strong>{formatSolar(currentDhi)}</strong><small>Open-Meteo DHI</small></div>
              <div className="metric"><span>Sun Altitude</span><strong>{formatSigned(sunPosition.altitude)}</strong><small>SunCalc</small></div>
              <div className="metric"><span>Sun Azimuth</span><strong>{formatSigned(sunPosition.azimuth)}</strong><small>SunCalc</small></div>
              <div className="metric"><span>Cloud Cover</span><strong>{formatNumber(currentWeather.cloudCover)}%</strong><small>Open-Meteo</small></div>
              <div className="metric"><span>Temperature</span><strong>{formatNumber(currentWeather.temperature)}°C</strong><small>Open-Meteo</small></div>
              <div className="metric"><span>Wind Speed</span><strong>{formatNumber(currentWeather.windSpeed)} km/h</strong><small>Open-Meteo</small></div>
            </div>
          </div>

          <div className="glass-card compact-card">
            <div className="card-header">
              <h4>Weather Impact on Solar</h4>
            </div>
            <div className="impact-list">
              <div><span>☀️ Weather condition</span><strong>{getWeatherLabel(Number(currentWeather.weatherCode))}</strong></div>
              <div><span>☁️ Cloud cover</span><strong>{formatNumber(currentWeather.cloudCover)}%</strong></div>
              <div><span>🌡️ Temperature</span><strong>{formatNumber(currentWeather.temperature)}°C</strong></div>
              <div><span>💨 Wind speed</span><strong>{formatNumber(currentWeather.windSpeed)} km/h</strong></div>
              <div><span>☀️ Solar radiation</span><strong>{formatSolar(currentGhi)}</strong></div>
            </div>
            <p className="impact-summary">{weatherSummary}</p>
          </div>
        </section>

        <section className="lower-grid">
          <div className="glass-card curve-card">
            <div className="card-header">
              <h4>Today&apos;s Solar Energy Curve</h4>
            </div>
            <div className="curve-wrap">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="curve-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f7d86c" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f7d86c" stopOpacity="0.08" />
                  </linearGradient>
                </defs>
                <path d={curvePoints ? `M 0 100 L ${curvePoints} L 100 100 Z` : 'M 0 100 L 100 100 Z'} fill="url(#curve-fill)" />
                {curvePoints && <polyline points={curvePoints} fill="none" stroke="#f7d86c" strokeWidth="2" />}
              </svg>
            </div>
            <div className="curve-legend">
              <div>
                <span>Peak Solar Radiation</span>
                <strong>{Number.isFinite(peakGhi) ? `${formatFixed(peakGhi, 0)} W/m²` : '—'}</strong>
              </div>
              <div>
                <span>Peak Estimated Generation</span>
                <strong>{Number.isFinite(peakGhi) ? `${formatFixed((peakGhi / 1000) * PANEL_CONFIG.areaM2 * PANEL_CONFIG.panelEfficiency * PANEL_CONFIG.systemEfficiency)} kWh` : '—'}</strong>
              </div>
            </div>
          </div>

          <div className="glass-card map-card">
            <div className="card-header">
              <h4>Your Registered Solar Site</h4>
            </div>
            {panelLocation ? (
              <div className="map-box">
                <MapContainer
                  key={`${panelLocation.latitude}-${panelLocation.longitude}`}
                  center={[panelLocation.latitude, panelLocation.longitude]}
                  zoom={10}
                  scrollWheelZoom
                  className="leaflet-map"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[panelLocation.latitude, panelLocation.longitude]} icon={icon}>
                    <Popup>
                      <strong>Your Solar Site</strong><br />
                      Latitude: {formatFixed(panelLocation.latitude, 4)}<br />
                      Longitude: {formatFixed(panelLocation.longitude, 4)}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div className="map-placeholder">Location required for map view.</div>
            )}
            <div className="map-detail">
              <div><strong>Location:</strong> {location.label || 'Pending'}</div>
              <div><strong>Latitude:</strong> {location.latitude ?? '—'}</div>
              <div><strong>Longitude:</strong> {location.longitude ?? '—'}</div>
              <div><strong>GPS Status:</strong> {location.source === 'GPS' ? '✓ Registered Location' : 'Manual Location'}</div>
              {sunPhase && <div><strong>Sun cycle:</strong> {formatTime(sunPhase.sunrise)} sunrise · {formatTime(sunPhase.sunset)} sunset</div>}
            </div>
          </div>
        </section>

        <section className="optimization-grid">
          <div className="glass-card panel-card">
            <div className="card-header">
              <h4>Current Panel</h4>
            </div>
            <div className="panel-details">
              <div><span>Tilt</span><strong>{currentTilt}°</strong></div>
              <div><span>Direction</span><strong>{currentDirection}</strong></div>
              <div><span>Energy model</span><strong>{currentOutput === null ? '—' : `${formatFixed(currentOutput, 2)} kWh/day`}</strong></div>
            </div>
          </div>

          <div className="glass-card panel-card highlight">
            <div className="card-header">
              <h4>Optimized Panel</h4>
            </div>
            <div className="panel-details">
              <div><span>Recommended Tilt</span><strong>{formatFixed(recommendedTilt, 0)}°</strong></div>
              <div><span>Recommended Direction</span><strong>{recommendedDirection}</strong></div>
              <div><span>Estimated Energy</span><strong>{optimizedOutput === null ? '—' : `${formatFixed(optimizedOutput, 2)} kWh/day`}</strong></div>
            </div>
          </div>
        </section>

        <section className="recommendation-row">
          <div className="glass-card full-card">
            <div className="card-header">
              <h4>SolarQuest Optimization</h4>
            </div>
            <p>
              Energy output is a modelled estimate based on Open-Meteo solar radiation data and the user&apos;s panel configuration.
            </p>
            <div className="optimization-summary">
              <div>
                <span>Current Output</span>
                <strong>{currentOutput === null ? '—' : `${formatFixed(currentOutput, 2)} kWh/day`}</strong>
              </div>
              <div>
                <span>Optimized Output</span>
                <strong>{optimizedOutput === null ? '—' : `${formatFixed(optimizedOutput, 2)} kWh/day`}</strong>
              </div>
              <div>
                <span>Estimated Gain</span>
                <strong>{gainPercent === null ? '—' : `${formatFixed(gainPercent)}%`}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="source-legend">
          <h4>DATA SOURCES</h4>
          <div className="legend-grid">
            <span>📍 Location — Browser GPS</span>
            <span>🌤️ Weather — Open-Meteo</span>
            <span>☀️ Solar Radiation — Open-Meteo</span>
            <span>🌞 Sun Position — SunCalc</span>
            <span>⚡ Energy Estimate — SolarQuest Calculation</span>
          </div>
        </section>

        {!dashboardReady && (
          <div className="loading-overlay">
            <strong>{statusMessage}</strong>
          </div>
        )}

        {manualMode && (
          <div className="manual-modal">
            <form onSubmit={handleManualSubmit}>
              <h4>Manual Location</h4>
              <p>Location access is required to provide location-specific solar analysis.</p>
              <label>
                Latitude
                <input
                  type="number"
                  step="0.0001"
                  value={manualLocation.latitude}
                  onChange={(event) => setManualLocation((current) => ({ ...current, latitude: event.target.value }))}
                  placeholder="e.g. 13.0827"
                />
              </label>
              <label>
                Longitude
                <input
                  type="number"
                  step="0.0001"
                  value={manualLocation.longitude}
                  onChange={(event) => setManualLocation((current) => ({ ...current, longitude: event.target.value }))}
                  placeholder="e.g. 80.2707"
                />
              </label>
              {locationError && <small className="error-text">{locationError}</small>}
              <button type="submit">Use Manual Location</button>
            </form>
          </div>
        )}

        {weatherError && (
          <div className="error-banner">
            <strong>⚠️ {weatherError}</strong>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextPath) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
    setPath(nextPath)
  }

  if (path === '/solar-analyst') {
    return <SolarAnalyst onNavigate={navigate} />
  }

  return <Dashboard onNavigate={navigate} />
}

export default App
