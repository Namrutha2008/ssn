export default function SunlightAlignment({
  sunAltitude,
  sunAzimuth,
  panelTilt,
  panelAzimuth,
  alignmentAngle,
  orientationScore,
  isDaylight,
}) {
  // Score color gradient
  const getScoreColor = (score) => {
    if (score >= 85) return '#4ee78f'
    if (score >= 65) return '#ffd45f'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const scoreColor = getScoreColor(orientationScore)
  const strokeDashoffset = 283 - (283 * Math.min(100, Math.max(0, orientationScore))) / 100

  // 2D visual schematic angles
  // Panel normal inclination from vertical
  const panelAngleDeg = Math.round(panelTilt)
  // Sun ray incoming angle from horizontal
  const sunAngleDeg = Math.max(0, Math.round(sunAltitude))

  return (
    <div className="sunlight-alignment-card glass-card">
      <div className="card-header">
        <div className="title-with-badge">
          <h4>☀️ SUNLIGHT ALIGNMENT</h4>
          <span className="source-tag">Vector Geometry · Sun → Panel Path</span>
        </div>
        <div className="status-tag">
          {isDaylight ? (
            <span className="daylight-badge">☀️ Direct Solar Ray Path Active</span>
          ) : (
            <span className="night-badge">🌙 Sun Below Horizon</span>
          )}
        </div>
      </div>

      <div className="alignment-layout">
        {/* Metric Grid */}
        <div className="alignment-metrics-grid">
          <div className="align-metric-pill">
            <span className="label">Sun Altitude</span>
            <strong className="value">{Math.round(sunAltitude)}°</strong>
            <small>Above horizon</small>
          </div>
          <div className="align-metric-pill">
            <span className="label">Sun Azimuth</span>
            <strong className="value">{Math.round(sunAzimuth)}°</strong>
            <small>Compass bearing</small>
          </div>
          <div className="align-metric-pill">
            <span className="label">Panel Tilt</span>
            <strong className="value">{Math.round(panelTilt)}°</strong>
            <small>From horizontal</small>
          </div>
          <div className="align-metric-pill">
            <span className="label">Panel Azimuth</span>
            <strong className="value">{Math.round(panelAzimuth)}°</strong>
            <small>Facing direction</small>
          </div>
          <div className="align-metric-pill highlight">
            <span className="label">Alignment</span>
            <strong className="value">{alignmentAngle.toFixed(1)}°</strong>
            <small>Angle of incidence (θ)</small>
          </div>
          <div className="align-metric-pill highlight">
            <span className="label">Orientation Score</span>
            <strong className="value" style={{ color: scoreColor }}>
              {Math.round(orientationScore)} <span className="score-den">/ 100</span>
            </strong>
            <small>Direct capture efficiency</small>
          </div>
        </div>

        {/* Dynamic Vector & Gauge Visualization */}
        <div className="alignment-visual-pane">
          {/* Circular Score Gauge */}
          <div className="score-dial-wrap">
            <svg className="score-dial-svg" viewBox="0 0 100 100">
              <circle
                className="score-track"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="8"
              />
              <circle
                className="score-fill"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
              />
            </svg>
            <div className="score-dial-content">
              <span className="score-number" style={{ color: scoreColor }}>
                {Math.round(orientationScore)}
              </span>
              <span className="score-label">SCORE</span>
            </div>
          </div>

          {/* 2D Incidence Angle Diagram */}
          <div className="vector-diagram-wrap">
            <svg className="vector-diagram-svg" viewBox="0 0 200 120">
              {/* Horizon Line */}
              <line x1="20" y1="95" x2="180" y2="95" stroke="rgba(148, 197, 245, 0.3)" strokeWidth="2" strokeDasharray="3 3" />
              <text x="25" y="112" fill="#7ba3c7" fontSize="10">0° Ground</text>

              {/* Panel Cross-section */}
              <g transform="translate(100, 95)">
                {/* Rotated panel plate */}
                <line
                  x1={-35 * Math.cos((panelAngleDeg * Math.PI) / 180)}
                  y1={-35 * Math.sin((panelAngleDeg * Math.PI) / 180)}
                  x2={35 * Math.cos((panelAngleDeg * Math.PI) / 180)}
                  y2={35 * Math.sin((panelAngleDeg * Math.PI) / 180)}
                  stroke="#38bdf8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Panel Normal Vector */}
                <line
                  x1="0"
                  y1="0"
                  x2={-45 * Math.sin((panelAngleDeg * Math.PI) / 180)}
                  y2={-45 * Math.cos((panelAngleDeg * Math.PI) / 180)}
                  stroke="#ffd45f"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
                <circle cx="0" cy="0" r="4" fill="#cbd5e1" />
              </g>

              {/* Sun Ray Incoming Vector */}
              {isDaylight && (
                <g>
                  {/* Sun Icon */}
                  <circle
                    cx={100 - 75 * Math.cos((sunAngleDeg * Math.PI) / 180)}
                    cy={95 - 75 * Math.sin((sunAngleDeg * Math.PI) / 180)}
                    r="8"
                    fill="#ffd45f"
                  />
                  {/* Ray Beam to panel center */}
                  <line
                    x1={100 - 75 * Math.cos((sunAngleDeg * Math.PI) / 180)}
                    y1={95 - 75 * Math.sin((sunAngleDeg * Math.PI) / 180)}
                    x2="100"
                    y2="95"
                    stroke="#ffaa3b"
                    strokeWidth="2.5"
                    markerEnd="url(#arrow)"
                  />
                </g>
              )}

              <text x="100" y="20" fill="#f8fafc" fontSize="11" textAnchor="middle" fontWeight="bold">
                θ Incidence: {alignmentAngle.toFixed(1)}°
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

