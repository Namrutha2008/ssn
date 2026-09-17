import { useEffect, useState } from 'react'

export default function SolarTimeMachine({
  selectedDate,
  selectedMinutes, // Minutes from 00:00 (e.g. 12 * 60 + 30 = 750 for 12:30)
  onChangeDate,
  onChangeMinutes,
  sunPhase,
  sunAltitude,
  sunAzimuth,
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [dateMode, setDateMode] = useState('today') // 'today' | 'tomorrow' | 'custom'

  // Play Sun Path Animation Loop
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      onChangeMinutes((prev) => {
        // Step forward 10 minutes
        const next = prev + 10
        // Loop back to 06:00 (360m) if past 19:30 (1170m)
        if (next > 1200) {
          return 360
        }
        return next
      })
    }, 180)

    return () => clearInterval(interval)
  }, [isPlaying, onChangeMinutes])

  const formatMinutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)
    const mins = Math.floor(totalMinutes % 60)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 === 0 ? 12 : hours % 12
    const displayMins = mins < 10 ? `0${mins}` : mins
    return `${displayHours}:${displayMins} ${period}`
  }

  const formatTime24 = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)
    const mins = Math.floor(totalMinutes % 60)
    return `${hours < 10 ? '0' : ''}${hours}:${mins < 10 ? '0' : ''}${mins}`
  }

  const handleDateModeChange = (mode) => {
    setDateMode(mode)
    const now = new Date()
    if (mode === 'today') {
      onChangeDate(now)
    } else if (mode === 'tomorrow') {
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      onChangeDate(tomorrow)
    }
  }

  const handleCustomDate = (e) => {
    if (e.target.value) {
      setDateMode('custom')
      const [y, m, d] = e.target.value.split('-').map(Number)
      const custom = new Date(y, m - 1, d, 12, 0, 0)
      onChangeDate(custom)
    }
  }

  const sunriseStr = sunPhase?.sunrise instanceof Date
    ? sunPhase.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '06:00'
  const sunsetStr = sunPhase?.sunset instanceof Date
    ? sunPhase.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '18:30'

  const dateInputStr = selectedDate instanceof Date
    ? selectedDate.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  return (
    <div className="solar-time-machine-card glass-card">
      <div className="card-header">
        <div className="title-with-badge">
          <h4>🕐 SOLAR TIME MACHINE</h4>
          <span className="source-tag">SunCalc Astronomical Trajectory</span>
        </div>
        <div className="date-mode-tabs">
          <button
            type="button"
            className={`date-tab ${dateMode === 'today' ? 'active' : ''}`}
            onClick={() => handleDateModeChange('today')}
          >
            Today
          </button>
          <button
            type="button"
            className={`date-tab ${dateMode === 'tomorrow' ? 'active' : ''}`}
            onClick={() => handleDateModeChange('tomorrow')}
          >
            Tomorrow
          </button>
          <label className={`custom-date-label ${dateMode === 'custom' ? 'active' : ''}`}>
            <span>Custom:</span>
            <input
              type="date"
              value={dateInputStr}
              onChange={handleCustomDate}
              className="custom-date-picker"
            />
          </label>
        </div>
      </div>

      {/* Sun Position & Times HUD */}
      <div className="sun-trajectory-hud">
        <div className="traj-stat">
          <span className="traj-label">SUN ALTITUDE</span>
          <strong className="traj-val">{Math.round(sunAltitude)}°</strong>
          <small>{sunAltitude > 0 ? '☀️ Daylight' : '🌙 Night'}</small>
        </div>
        <div className="traj-stat">
          <span className="traj-label">SUN AZIMUTH</span>
          <strong className="traj-val">{Math.round(sunAzimuth)}°</strong>
          <small>Compass direction</small>
        </div>
        <div className="traj-stat">
          <span className="traj-label">SUNRISE</span>
          <strong className="traj-val yellow">{sunriseStr}</strong>
          <small>Calculated Dawn</small>
        </div>
        <div className="traj-stat">
          <span className="traj-label">SUNSET</span>
          <strong className="traj-val orange">{sunsetStr}</strong>
          <small>Calculated Dusk</small>
        </div>
      </div>

      {/* Solar Time Slider and Play Sun Path */}
      <div className="time-slider-section">
        <div className="time-slider-header">
          <div className="time-display-badge">
            <span className="time-label">SOLAR TIME:</span>
            <strong className="time-value-highlight">{formatMinutesToTime(selectedMinutes)}</strong>
            <span className="time-24">({formatTime24(selectedMinutes)})</span>
          </div>

          <button
            type="button"
            className={`play-path-btn ${isPlaying ? 'playing' : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? '⏸ PAUSE SUN PATH' : '▶ PLAY SUN PATH'}
          </button>
        </div>

        <div className="solar-time-track-wrap">
          <input
            type="range"
            min="300" // 05:00
            max="1260" // 21:00
            step="5"
            value={selectedMinutes}
            onChange={(e) => {
              setIsPlaying(false)
              onChangeMinutes(Number(e.target.value))
            }}
            className="analyst-slider time-slider"
          />
          <div className="time-ticks">
            <span>05:00</span>
            <span>07:00 (Dawn)</span>
            <span>09:00</span>
            <span>12:00 (Solar Noon)</span>
            <span>15:00</span>
            <span>18:00 (Sunset)</span>
            <span>21:00</span>
          </div>
        </div>
      </div>
    </div>
  )
}

