export default function ExperimentControls({
  tilt,
  azimuth,
  capacity,
  onChangeTilt,
  onChangeAzimuth,
  onChangeCapacity,
  isCompare,
  onToggleCompare,
  showRays,
  onToggleRays,
  showEnergy,
  onToggleEnergy,
}) {
  const getCompassDirection = (deg) => {
    const norm = ((deg % 360) + 360) % 360
    if (norm >= 337.5 || norm < 22.5) return 'North (0°)'
    if (norm >= 22.5 && norm < 67.5) return 'North-East (45°)'
    if (norm >= 67.5 && norm < 112.5) return 'East (90°)'
    if (norm >= 112.5 && norm < 157.5) return 'South-East (135°)'
    if (norm >= 157.5 && norm < 202.5) return 'South (180°)'
    if (norm >= 202.5 && norm < 247.5) return 'South-West (225°)'
    if (norm >= 247.5 && norm < 292.5) return 'West (270°)'
    return 'North-West (315°)'
  }

  return (
    <div className="experiment-controls-card glass-card">
      <div className="card-header">
        <div className="title-with-badge">
          <h4>Panel Laboratory Controls</h4>
          <span className="source-tag">3D Physical Kinematics</span>
        </div>
        <div className="twin-toggles">
          <button
            type="button"
            className={`twin-toggle-btn ${showRays ? 'active' : ''}`}
            onClick={onToggleRays}
            title="Toggle volumetric sunlight rays"
          >
            ☀️ SUN RAYS
          </button>
          <button
            type="button"
            className={`twin-toggle-btn ${showEnergy ? 'active' : ''}`}
            onClick={onToggleEnergy}
            title="Toggle particle energy flow"
          >
            ⚡ ENERGY FLOW
          </button>
          <button
            type="button"
            className={`twin-toggle-btn highlight ${isCompare ? 'active' : ''}`}
            onClick={onToggleCompare}
            title="Show Current vs Experiment panels side by side"
          >
            ⚖ COMPARE
          </button>
        </div>
      </div>

      <div className="controls-grid">
        {/* Panel Tilt Slider */}
        <div className="control-block">
          <div className="control-label-row">
            <div className="control-label">
              <span className="label-icon">📐</span>
              <strong>PANEL TILT</strong>
            </div>
            <div className="control-value-display">
              <span className="deg-highlight">{Math.round(tilt)}°</span>
              <span className="angle-name">{tilt === 0 ? 'Flat' : tilt === 90 ? 'Vertical' : `${Math.round(tilt)}° inclination`}</span>
            </div>
          </div>
          <div className="slider-track-wrap">
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={tilt}
              onChange={(e) => onChangeTilt(Number(e.target.value))}
              className="analyst-slider tilt-slider"
            />
            <div className="slider-ticks">
              <span>0° (Flat)</span>
              <span>30°</span>
              <span>45°</span>
              <span>60°</span>
              <span>90° (Vertical)</span>
            </div>
          </div>
          <div className="preset-pills">
            <button type="button" onClick={() => onChangeTilt(0)}>0° Flat</button>
            <button type="button" onClick={() => onChangeTilt(18)}>18° Baseline</button>
            <button type="button" onClick={() => onChangeTilt(35)}>35° Standard</button>
            <button type="button" onClick={() => onChangeTilt(60)}>60° High</button>
          </div>
        </div>

        {/* Panel Azimuth Slider */}
        <div className="control-block">
          <div className="control-label-row">
            <div className="control-label">
              <span className="label-icon">🧭</span>
              <strong>PANEL AZIMUTH</strong>
            </div>
            <div className="control-value-display">
              <span className="deg-highlight">{Math.round(azimuth)}°</span>
              <span className="angle-name">{getCompassDirection(azimuth)}</span>
            </div>
          </div>
          <div className="slider-track-wrap">
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={azimuth}
              onChange={(e) => onChangeAzimuth(Number(e.target.value))}
              className="analyst-slider az-slider"
            />
            <div className="slider-ticks">
              <span>N 0°</span>
              <span>E 90°</span>
              <span>S 180°</span>
              <span>W 270°</span>
              <span>N 360°</span>
            </div>
          </div>
          <div className="preset-pills">
            <button type="button" onClick={() => onChangeAzimuth(0)}>North (0°)</button>
            <button type="button" onClick={() => onChangeAzimuth(90)}>East (90°)</button>
            <button type="button" onClick={() => onChangeAzimuth(180)}>South (180°)</button>
            <button type="button" onClick={() => onChangeAzimuth(270)}>West (270°)</button>
          </div>
        </div>

        {/* Panel Capacity Input */}
        <div className="control-block capacity-block">
          <div className="control-label-row">
            <div className="control-label">
              <span className="label-icon">⚡</span>
              <strong>PANEL CAPACITY</strong>
            </div>
            <div className="control-value-display">
              <span className="deg-highlight">{Number(capacity).toFixed(1)} kW</span>
            </div>
          </div>
          <div className="capacity-input-wrap">
            <input
              type="number"
              min="0.5"
              max="50"
              step="0.1"
              value={capacity}
              onChange={(e) => onChangeCapacity(Math.max(0.1, Number(e.target.value)))}
              className="capacity-number-input"
            />
            <span className="input-unit">kWp STC</span>
          </div>
          <div className="preset-pills">
            <button type="button" onClick={() => onChangeCapacity(1.5)}>1.5 kW</button>
            <button type="button" onClick={() => onChangeCapacity(2.5)}>2.5 kW</button>
            <button type="button" onClick={() => onChangeCapacity(4.0)}>4.0 kW</button>
            <button type="button" onClick={() => onChangeCapacity(6.5)}>6.5 kW</button>
          </div>
        </div>
      </div>
    </div>
  )
}

