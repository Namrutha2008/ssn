import { useState } from 'react'

export default function SolarMemory({
  experiments = [],
  onSaveExperiment,
  onLoadExperiment,
  onClearExperiments,
}) {
  const [selectedExp, setSelectedExp] = useState(null)

  // Chart coordinate calculations
  const chartHeight = 160
  const chartWidth = 500
  const padding = 35

  const maxGen = experiments.length > 0
    ? Math.max(...experiments.map((e) => Number(e.modeledGeneration) || 0), 1)
    : 1

  const points = experiments.map((exp, idx) => {
    const x = experiments.length === 1
      ? chartWidth / 2
      : padding + (idx / (experiments.length - 1)) * (chartWidth - padding * 2)
    const y = chartHeight - padding - ((Number(exp.modeledGeneration) || 0) / maxGen) * (chartHeight - padding * 2)
    return { x, y, exp }
  })

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="solar-memory-container glass-card">
      <div className="card-header">
        <div className="title-with-badge">
          <h4>🧠 MY SOLAR EXPERIMENTS</h4>
          <span className="source-tag">Persistent Simulation Registry</span>
        </div>
        <div className="memory-actions">
          <button
            type="button"
            className="save-exp-btn"
            onClick={onSaveExperiment}
          >
            💾 SAVE EXPERIMENT
          </button>
          {experiments.length > 0 && (
            <button
              type="button"
              className="clear-exp-btn"
              onClick={onClearExperiments}
              title="Clear saved experiments"
            >
              🗑 Clear
            </button>
          )}
        </div>
      </div>

      {experiments.length === 0 ? (
        <div className="empty-memory-state">
          <div className="empty-icon">🧪</div>
          <p className="empty-title">No experiments yet. Rotate the panel and run your first simulation.</p>
          <small>Adjust tilt and azimuth sliders, inspect the 3D twin, and click <strong>SAVE EXPERIMENT</strong> to log your engineering run.</small>
        </div>
      ) : (
        <div className="memory-content-grid">
          {/* Experiment History Chart */}
          <div className="experiment-chart-block">
            <div className="chart-title-row">
              <strong>EXPERIMENT HISTORY</strong>
              <small>X-axis: Date / Time · Y-axis: Modeled Energy Generation (kWh)</small>
            </div>

            <div className="svg-chart-wrapper">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="history-svg-chart">
                {/* Grid horizontal guidelines */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                  const gy = chartHeight - padding - ratio * (chartHeight - padding * 2)
                  const gval = (ratio * maxGen).toFixed(1)
                  return (
                    <g key={ratio}>
                      <line x1={padding} y1={gy} x2={chartWidth - padding} y2={gy} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                      <text x={padding - 6} y={gy + 4} fill="#8da4be" fontSize="9" textAnchor="end">{gval}</text>
                    </g>
                  )
                })}

                {/* Y-axis label */}
                <text x={12} y={chartHeight / 2} fill="#ffd45f" fontSize="9" transform={`rotate(-90 12 ${chartHeight / 2})`} textAnchor="middle">
                  Generation (kWh)
                </text>

                {/* Area Gradient Fill */}
                <defs>
                  <linearGradient id="history-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffd45f" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffd45f" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {points.length > 1 && (
                  <path
                    d={`M ${points[0].x} ${chartHeight - padding} L ${polylineStr} L ${points[points.length - 1].x} ${chartHeight - padding} Z`}
                    fill="url(#history-grad)"
                  />
                )}

                {/* Connecting Line */}
                {points.length > 1 && (
                  <polyline
                    points={polylineStr}
                    fill="none"
                    stroke="#ffd45f"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive Data Points */}
                {points.map((p, i) => (
                  <g key={i} className="chart-point-group" onClick={() => setSelectedExp(p.exp)}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={selectedExp?.id === p.exp.id ? 7 : 5}
                      fill={selectedExp?.id === p.exp.id ? '#4ee78f' : '#ffd45f'}
                      stroke="#05192f"
                      strokeWidth="2"
                      className="data-node"
                    />
                    <text x={p.x} y={chartHeight - 14} fill="#8da4be" fontSize="8" textAnchor="middle">
                      {p.exp.time}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Selected Experiment Telemetry Detail or Card List */}
          <div className="experiment-cards-block">
            <div className="cards-header">
              <strong>LOGGED RUNS ({experiments.length})</strong>
              <small>Click to inspect details and re-simulate in 3D</small>
            </div>

            <div className="cards-scroll-list">
              {experiments.map((exp) => (
                <div
                  key={exp.id}
                  className={`exp-card-item ${selectedExp?.id === exp.id ? 'selected' : ''}`}
                  onClick={() => setSelectedExp(exp)}
                >
                  <div className="exp-card-top">
                    <div>
                      <span className="exp-date-badge">{exp.date} · {exp.time}</span>
                      <strong className="exp-location-name">{exp.location}</strong>
                    </div>
                    <div className="exp-gen-pill">
                      <span>{Number(exp.modeledGeneration).toFixed(2)} kWh</span>
                    </div>
                  </div>

                  <div className="exp-quick-telemetry">
                    <span>Tilt: <strong>{exp.tilt}°</strong></span>
                    <span>Azimuth: <strong>{exp.azimuth}°</strong></span>
                    <span>Score: <strong className="green">{exp.solarQuestScore}/100</strong></span>
                    <span>GHI: <strong>{Math.round(exp.solarRadiation)} W/m²</strong></span>
                  </div>

                  <div className="exp-card-actions">
                    <button
                      type="button"
                      className="load-in-lab-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onLoadExperiment(exp)
                      }}
                    >
                      🔬 LOAD INTO LAB
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal / Drawer if an experiment is selected */}
      {selectedExp && (
        <div className="experiment-inspect-overlay" onClick={() => setSelectedExp(null)}>
          <div className="inspect-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h4>EXPERIMENT TELEMETRY INSPECTOR</h4>
              <button type="button" className="close-btn" onClick={() => setSelectedExp(null)}>✕</button>
            </div>

            <div className="inspect-telemetry-grid">
              <div><span>Date &amp; Time</span><strong>{selectedExp.date} at {selectedExp.time}</strong></div>
              <div><span>Location</span><strong>{selectedExp.location}</strong></div>
              <div><span>Latitude / Longitude</span><strong>{selectedExp.latitude?.toFixed(4)}, {selectedExp.longitude?.toFixed(4)}</strong></div>
              <div><span>Panel Capacity</span><strong>{selectedExp.capacity} kW ({selectedExp.panelType || 'Monocrystalline Si'})</strong></div>
              <div><span>Panel Tilt / Azimuth</span><strong>{selectedExp.tilt}° / {selectedExp.azimuth}°</strong></div>
              <div><span>Solar Radiation (GHI)</span><strong>{Math.round(selectedExp.solarRadiation)} W/m²</strong></div>
              <div><span>Cloud Cover</span><strong>{selectedExp.cloudCover}%</strong></div>
              <div><span>Sun Altitude / Azimuth</span><strong>{Math.round(selectedExp.sunAltitude)}° / {Math.round(selectedExp.sunAzimuth)}°</strong></div>
              <div className="full-span highlight">
                <span>Modeled Generation</span>
                <strong className="huge">{Number(selectedExp.modeledGeneration).toFixed(2)} kWh</strong>
              </div>
              <div className="full-span highlight">
                <span>SolarQuest Score</span>
                <strong className="huge green">{selectedExp.solarQuestScore} / 100</strong>
              </div>
            </div>

            <div className="dialog-footer">
              <button
                type="button"
                className="apply-opt-btn"
                onClick={() => {
                  onLoadExperiment(selectedExp)
                  setSelectedExp(null)
                }}
              >
                🔬 LOAD CONFIGURATION INTO 3D LAB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

