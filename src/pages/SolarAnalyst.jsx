import { useCallback, useEffect, useMemo, useState } from 'react'
import '../App.css'
import { fetchSolarData, fetchSolarDataForDate } from '../services/openMeteoService'
import { getSunPhase, getSunPosition } from '../services/sunPositionService'
import {
  calculateCaptureBreakdown,
  calculateIncidenceAngle,
  calculateInstantaneousPower,
  calculateModeledDailyEnergy,
  calculateOrientationScore,
  calculateTiltedIrradiance,
  runSolarOptimizer,
} from '../services/solarCalculationService'
import SolarAnalystTwin from '../components/SolarAnalystTwin'
import ExperimentSettingsHUD from '../components/ExperimentSettingsHUD'
import ExperimentControls from '../components/ExperimentControls'
import LiveEnergyResponse from '../components/LiveEnergyResponse'
import SunlightAlignment from '../components/SunlightAlignment'
import SolarCaptureBreakdown from '../components/SolarCaptureBreakdown'
import SolarOptimizer from '../components/SolarOptimizer'
import SolarTimeMachine from '../components/SolarTimeMachine'
import SolarMemory from '../components/SolarMemory'

const PROFILE_STORAGE_KEY = 'solarquest-profile'
const EXPERIMENTS_STORAGE_KEY = 'solarquest_experiments'

const EMPTY_PROFILE = {
  latitude: null,
  longitude: null,
  label: '',
  source: 'GPS',
}

const DEFAULT_CURRENT_PANEL = {
  tilt: 18,
  azimuth: 180,
  capacity: 2.5,
  efficiency: 0.2,
  systemEfficiency: 0.85,
}

export default function SolarAnalyst({ onNavigate }) {
  // Load saved profile or fallback
  const [profile] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || 'null')
      if (saved?.latitude !== undefined && saved?.longitude !== undefined) return saved
      return EMPTY_PROFILE
    } catch {
      return EMPTY_PROFILE
    }
  })

  // Current registered panel configuration
  const currentPanel = useMemo(() => {
    return {
      ...DEFAULT_CURRENT_PANEL,
      ...(profile.panelConfiguration || {}),
    }
  }, [profile])

  // Experiment parameters
  const [expTilt, setExpTilt] = useState(35)
  const [expAzimuth, setExpAzimuth] = useState(180)
  const [expCapacity, setExpCapacity] = useState(2.5)

  // 3D Viewport settings
  const [isCompare, setIsCompare] = useState(false)
  const [showRays, setShowRays] = useState(true)
  const [showEnergy, setShowEnergy] = useState(true)

  // Solar Time Machine state
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedMinutes, setSelectedMinutes] = useState(() => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  })

  // Weather and Solar data
  const [weatherData, setWeatherData] = useState(null)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [weatherError, setWeatherError] = useState('')

  // Optimization state
  const [optimizationResult, setOptimizationResult] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Solar Memory (localStorage)
  const [experiments, setExperiments] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(EXPERIMENTS_STORAGE_KEY) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  // Fetch solar/weather data whenever location or selected date changes
  useEffect(() => {
    let active = true
    setLoadingWeather(true)

    const loadData = async () => {
      try {
        const isToday =
          new Date().toISOString().slice(0, 10) === selectedDate.toISOString().slice(0, 10)
        let data
        if (isToday) {
          data = await fetchSolarData(profile.latitude, profile.longitude)
        } else {
          data = await fetchSolarDataForDate(profile.latitude, profile.longitude, selectedDate)
        }

        if (active) {
          setWeatherData(data)
          setWeatherError('')
          setLoadingWeather(false)
        }
      } catch (err) {
        if (active) {
          setWeatherError(err.message || 'Weather service unavailable.')
          setLoadingWeather(false)
        }
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [profile.latitude, profile.longitude, selectedDate])

  // Active Date & Time constructed from date + minutes
  const activeDateTime = useMemo(() => {
    const d = new Date(selectedDate)
    const hours = Math.floor(selectedMinutes / 60)
    const mins = Math.floor(selectedMinutes % 60)
    d.setHours(hours, mins, 0, 0)
    return d
  }, [selectedDate, selectedMinutes])

  // SunCalc astronomical positions
  const sunPosition = useMemo(() => {
    return getSunPosition(profile.latitude, profile.longitude, activeDateTime)
  }, [profile.latitude, profile.longitude, activeDateTime])

  const sunPhase = useMemo(() => {
    return getSunPhase(profile.latitude, profile.longitude, selectedDate)
  }, [profile.latitude, profile.longitude, selectedDate])

  // Active weather slice matching selected time
  const activeWeather = useMemo(() => {
    if (!weatherData?.hourly?.length) return {}

    const activeHourStr = activeDateTime.toISOString().slice(0, 13)
    const exact = weatherData.hourly.find((h) => h.time && h.time.startsWith(activeHourStr))
    if (exact) return exact

    const hIdx = Math.min(23, Math.max(0, Math.floor(selectedMinutes / 60)))
    return weatherData.hourly[hIdx] || weatherData.hourly[0] || {}
  }, [weatherData, activeDateTime, selectedMinutes])

  // Active Solar calculations for Experiment Setup
  const expPOA = useMemo(() => {
    return calculateTiltedIrradiance(
      activeWeather,
      sunPosition.altitudeDeg,
      sunPosition.azimuthDeg,
      expTilt,
      expAzimuth
    )
  }, [activeWeather, sunPosition, expTilt, expAzimuth])

  const expPowerKw = useMemo(() => {
    return calculateInstantaneousPower(
      expPOA.gti,
      { capacityKw: expCapacity, systemEfficiency: 0.85 },
      activeWeather.temperature ?? 25
    )
  }, [expPOA.gti, expCapacity, activeWeather.temperature])

  const expDailyKwh = useMemo(() => {
    if (!weatherData?.hourly?.length) return 0
    return calculateModeledDailyEnergy(
      weatherData.hourly,
      { capacityKw: expCapacity, tilt: expTilt, azimuth: expAzimuth },
      profile.latitude,
      profile.longitude,
      selectedDate
    )
  }, [weatherData, expCapacity, expTilt, expAzimuth, profile.latitude, profile.longitude, selectedDate])

  // Active Solar calculations for Current Registered Baseline
  const currPOA = useMemo(() => {
    return calculateTiltedIrradiance(
      activeWeather,
      sunPosition.altitudeDeg,
      sunPosition.azimuthDeg,
      currentPanel.tilt,
      currentPanel.azimuth
    )
  }, [activeWeather, sunPosition, currentPanel])

  const currDailyKwh = useMemo(() => {
    if (!weatherData?.hourly?.length) return 0
    return calculateModeledDailyEnergy(
      weatherData.hourly,
      currentPanel,
      profile.latitude,
      profile.longitude,
      selectedDate
    )
  }, [weatherData, currentPanel, profile.latitude, profile.longitude, selectedDate])

  // Alignment and Capture Metrics
  const alignment = useMemo(() => {
    return calculateIncidenceAngle(
      sunPosition.altitudeDeg,
      sunPosition.azimuthDeg,
      expTilt,
      expAzimuth
    )
  }, [sunPosition, expTilt, expAzimuth])

  const orientationScore = useMemo(() => {
    return calculateOrientationScore(
      sunPosition.altitudeDeg,
      sunPosition.azimuthDeg,
      expTilt,
      expAzimuth
    )
  }, [sunPosition, expTilt, expAzimuth])

  const captureBreakdown = useMemo(() => {
    return calculateCaptureBreakdown(
      activeWeather,
      sunPosition.altitudeDeg,
      sunPosition.azimuthDeg,
      expTilt,
      expAzimuth
    )
  }, [activeWeather, sunPosition, expTilt, expAzimuth])

  // Capture percentages relative to standard STC 1000 W/m²
  const expCapturePercent = useMemo(() => {
    if (sunPosition.altitudeDeg <= 0) return 0
    return Math.min(100, Math.max(0, (expPOA.gti / 1000) * 100))
  }, [sunPosition.altitudeDeg, expPOA.gti])

  const currCapturePercent = useMemo(() => {
    if (sunPosition.altitudeDeg <= 0) return 0
    return Math.min(100, Math.max(0, (currPOA.gti / 1000) * 100))
  }, [sunPosition.altitudeDeg, currPOA.gti])

  const energyDifferencePercent = useMemo(() => {
    if (currDailyKwh <= 0.001) {
      return expDailyKwh > 0 ? 100 : 0
    }
    return ((expDailyKwh - currDailyKwh) / currDailyKwh) * 100
  }, [expDailyKwh, currDailyKwh])

  const alignmentMessage = useMemo(() => {
    if (!sunPosition.isDaylight) return 'Night: solar energy flow is stopped.'
    if (orientationScore >= 85) return 'Panel is closely aligned with the current Sun position.'
    if (orientationScore >= 60) return 'Panel orientation is improving solar alignment.'
    return 'Panel orientation is reducing solar capture.'
  }, [sunPosition.isDaylight, orientationScore])

  // Run SolarQuest Optimizer
  const handleRunOptimizer = useCallback(() => {
    if (!weatherData?.hourly?.length) return
    setIsOptimizing(true)

    setTimeout(() => {
      const res = runSolarOptimizer(
        profile.latitude,
        profile.longitude,
        weatherData.hourly,
        currentPanel,
        selectedDate
      )
      setOptimizationResult(res)
      setIsOptimizing(false)
    }, 400)
  }, [weatherData, profile, currentPanel, selectedDate])

  // Apply Optimization to Experiment Panel
  const handleApplyOptimization = (recommendedTilt, recommendedAzimuth) => {
    setExpTilt(recommendedTilt)
    setExpAzimuth(recommendedAzimuth)
  }

  // Save experiment to Solar Memory
  const handleSaveExperiment = () => {
    const hours = String(Math.floor(selectedMinutes / 60)).padStart(2, '0')
    const mins = String(selectedMinutes % 60).padStart(2, '0')
    const timeStr = `${hours}:${mins}`

    const newExperiment = {
      id: `exp-${Date.now()}`,
      date: selectedDate.toISOString().slice(0, 10),
      time: timeStr,
      location: profile.label || 'Registered Site',
      latitude: profile.latitude,
      longitude: profile.longitude,
      capacity: expCapacity,
      panelType: 'Monocrystalline Si',
      tilt: Math.round(expTilt),
      azimuth: Math.round(expAzimuth),
      solarRadiation: activeWeather.ghi ?? 0,
      cloudCover: activeWeather.cloudCover ?? 0,
      sunAltitude: sunPosition.altitudeDeg,
      sunAzimuth: sunPosition.azimuthDeg,
      modeledGeneration: expDailyKwh,
      solarQuestScore: Math.round(orientationScore),
      timestamp: Date.now(),
    }

    const updated = [newExperiment, ...experiments].slice(0, 40)
    setExperiments(updated)
    localStorage.setItem(EXPERIMENTS_STORAGE_KEY, JSON.stringify(updated))
  }

  // Load experiment from Solar Memory back into 3D Lab
  const handleLoadExperiment = (exp) => {
    if (!exp) return
    setExpTilt(Number(exp.tilt) || 0)
    setExpAzimuth(Number(exp.azimuth) || 0)
    setExpCapacity(Number(exp.capacity) || 2.5)
    if (exp.time && exp.time.includes(':')) {
      const [h, m] = exp.time.split(':').map(Number)
      setSelectedMinutes(h * 60 + m)
    }
  }

  // Clear experiments
  const handleClearExperiments = () => {
    setExperiments([])
    localStorage.removeItem(EXPERIMENTS_STORAGE_KEY)
  }

  const timeString = `${String(Math.floor(selectedMinutes / 60)).padStart(2, '0')}:${String(selectedMinutes % 60).padStart(2, '0')}`

  return (
    <div className="solar-shell analyst-shell">
      {/* Existing Sidebar */}
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-icon">☀️</div>
          <div className="brand-copy">
            <h1>SolarQuest</h1>
            <p>Innovate to Capture More Sunlight &amp; Boost Energy</p>
          </div>
        </div>

        <nav className="side-nav">
          <button className="nav-item" type="button" onClick={() => onNavigate('/dashboard')}>
            <span className="nav-icon">◫</span>Dashboard
          </button>
          <button className="nav-item active" type="button">
            <span className="nav-icon">◌</span>Solar Analyst
          </button>
          <button className="nav-item" type="button" onClick={() => onNavigate('/dashboard')}>
            <span className="nav-icon">◌</span>Solar Analysis
          </button>
          <button className="nav-item" type="button" onClick={() => onNavigate('/dashboard')}>
            <span className="nav-icon">Ø</span>Optimizer
          </button>
          <button className="nav-item" type="button" onClick={() => onNavigate('/dashboard')}>
            <span className="nav-icon">◐</span>Simulation
          </button>
          <button className="nav-item" type="button" onClick={() => onNavigate('/dashboard')}>
            <span className="nav-icon">✦</span>AI Prediction
          </button>
          <button className="nav-item" type="button" onClick={() => onNavigate('/dashboard')}>
            <span className="nav-icon">▣</span>Analytics
          </button>
          <button className="nav-item" type="button" onClick={() => onNavigate('/dashboard')}>
            <span className="nav-icon">☼</span>Weather &amp; Sunlight
          </button>
          <button className="nav-item" type="button" onClick={() => onNavigate('/dashboard')}>
            <span className="nav-icon">◔</span>What-if Simulator
          </button>
          <button className="nav-item" type="button" onClick={() => onNavigate('/dashboard')}>
            <span className="nav-icon">⚑</span>SolarQuest Challenge
          </button>
        </nav>

        <div className="profile-card">
          <div className="profile-avatar">N</div>
          <div>
            <strong>Namrutha</strong>
            <small>General User</small>
          </div>
        </div>
      </aside>

      {/* Solar Analyst 3D Lab Main Stage */}
      <main className="dashboard-main analyst-lab-main">
        {/* Top telemetry strip */}
        <header className="top-strip">
          <div className="live-status-block">
            <span className={`dot ${weatherData ? 'good' : 'warn'}`}></span>
            <span>{weatherData ? 'Laboratory Simulation Ready' : loadingWeather ? 'Connecting Telemetry...' : 'Offline'}</span>
            <span className="timestamp">Simulated Time: {timeString}</span>
          </div>
          <div className="status-pills">
            <span>Weather: {weatherData ? 'Open-Meteo ✓' : 'Connecting...'}</span>
            <span>Sun: SunCalc Physics ✓</span>
            <span>Coordinates: {profile.latitude?.toFixed(2)}°, {profile.longitude?.toFixed(2)}°</span>
          </div>
        </header>

        {/* Page Title & Mission */}
        <section className="analyst-lab-header">
          <div className="header-text">
            <div className="badge-row">
              <span className="lab-badge">LIVE SOLAR SIMULATOR</span>
              <span className="sub-badge">WHAT-IF EXPERIMENT LAB</span>
            </div>
            <h2>☀️ Solar Analyst</h2>
            <p className="subtitle">
              Experiment with sunlight. Rotate your panel. Discover how to capture more energy.
            </p>
          </div>

          <div className="analyst-site-pill">
            <span className="site-label">REGISTERED SITE</span>
            <strong className="site-name">{profile.label || 'Your Solar Site'}</strong>
            <small>{profile.latitude?.toFixed(4)}° N, {profile.longitude?.toFixed(4)}° E</small>
          </div>
        </section>

        {weatherError && (
          <div className="error-banner">
            <strong>⚠️ {weatherError}</strong>
          </div>
        )}

        {/* 1. CENTERPIECE — 3D SOLAR TWIN WITH FLOATING EXPERIMENT SETTINGS */}
        <section className="lab-twin-section">
          <div className="twin-stage-wrapper">
            <SolarAnalystTwin
              tilt={expTilt}
              azimuth={expAzimuth}
              capacityKw={expCapacity}
              currentTilt={currentPanel.tilt}
              currentAzimuth={currentPanel.azimuth}
              isCompare={isCompare}
              sunAltitude={sunPosition.altitudeDeg}
              sunAzimuth={sunPosition.azimuthDeg}
              isDaylight={sunPosition.isDaylight}
              cloudCover={activeWeather.cloudCover ?? 0}
              solarRadiation={activeWeather.ghi ?? 0}
              powerKw={expPowerKw}
              predictedGenerationKwh={expDailyKwh}
              solarCapturePercent={expCapturePercent}
              alignmentPercent={orientationScore}
              alignmentMessage={alignmentMessage}
              isOptimized={orientationScore >= 95}
              showRays={showRays}
              showEnergy={showEnergy}
            />

            {/* Floating Experiment Settings HUD (Section 6) */}
            <ExperimentSettingsHUD
              locationName={profile.label}
              latitude={profile.latitude}
              longitude={profile.longitude}
              capacity={expCapacity}
              tilt={expTilt}
              azimuth={expAzimuth}
              date={selectedDate}
              timeString={timeString}
              solarRadiation={activeWeather.ghi}
              cloudCover={activeWeather.cloudCover}
              sunAltitude={sunPosition.altitudeDeg}
              sunAzimuth={sunPosition.azimuthDeg}
            />
          </div>
        </section>

        {/* 2. PANEL PHYSICAL CONTROLS */}
        <section className="lab-controls-section">
          <ExperimentControls
            tilt={expTilt}
            azimuth={expAzimuth}
            capacity={expCapacity}
            onChangeTilt={setExpTilt}
            onChangeAzimuth={setExpAzimuth}
            onChangeCapacity={setExpCapacity}
            isCompare={isCompare}
            onToggleCompare={() => setIsCompare(!isCompare)}
            showRays={showRays}
            onToggleRays={() => setShowRays(!showRays)}
            showEnergy={showEnergy}
            onToggleEnergy={() => setShowEnergy(!showEnergy)}
          />
        </section>

        {/* 3. LIVE ENERGY RESPONSE (Section 8) */}
        <section className="lab-energy-section">
          <LiveEnergyResponse
            currentCapturePercent={currCapturePercent}
            experimentCapturePercent={expCapturePercent}
            currentGenerationKwh={currDailyKwh}
            experimentGenerationKwh={expDailyKwh}
            differencePercent={energyDifferencePercent}
            powerKw={expPowerKw}
            gtiIrradiance={expPOA.gti}
          />
        </section>

        {/* 4. SUNLIGHT ALIGNMENT & SOLAR CAPTURE BREAKDOWN (Sections 9 & 10) */}
        <section className="lab-dual-grid">
          <SunlightAlignment
            sunAltitude={sunPosition.altitudeDeg}
            sunAzimuth={sunPosition.azimuthDeg}
            panelTilt={expTilt}
            panelAzimuth={expAzimuth}
            alignmentAngle={alignment.incidenceAngleDeg}
            orientationScore={orientationScore}
            isDaylight={sunPosition.isDaylight}
          />

          <SolarCaptureBreakdown breakdown={captureBreakdown} />
        </section>

        {/* 5. SOLARQUEST OPTIMIZER & SOLAR TIME MACHINE (Sections 11, 4 & 12) */}
        <section className="lab-dual-grid">
          <SolarOptimizer
            onRunOptimization={handleRunOptimizer}
            optimizationResult={optimizationResult}
            onApplyOptimization={handleApplyOptimization}
            isOptimizing={isOptimizing}
          />

          <SolarTimeMachine
            selectedDate={selectedDate}
            selectedMinutes={selectedMinutes}
            onChangeDate={setSelectedDate}
            onChangeMinutes={setSelectedMinutes}
            sunPhase={sunPhase}
            sunAltitude={sunPosition.altitudeDeg}
            sunAzimuth={sunPosition.azimuthDeg}
          />
        </section>

        {/* 6. SOLAR MEMORY & EXPERIMENT HISTORY (Sections 13 & 14) */}
        <section className="lab-memory-section">
          <SolarMemory
            experiments={experiments}
            onSaveExperiment={handleSaveExperiment}
            onLoadExperiment={handleLoadExperiment}
            onClearExperiments={handleClearExperiments}
          />
        </section>
      </main>
    </div>
  )
}
