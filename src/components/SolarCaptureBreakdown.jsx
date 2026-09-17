export default function SolarCaptureBreakdown({ breakdown }) {
  const factors = [
    {
      id: 'sunAngle',
      name: 'Sun Angle (Elevation)',
      value: breakdown?.sunAngle ?? 0,
      description: 'Atmospheric air mass attenuation based on solar altitude above horizon.',
      color: '#ffd45f',
      icon: '☀️',
    },
    {
      id: 'panelOrientation',
      name: 'Panel Orientation (Cosine)',
      value: breakdown?.panelOrientation ?? 0,
      description: 'Direct beam capture efficiency determined by panel tilt & azimuth alignment.',
      color: '#38bdf8',
      icon: '📐',
    },
    {
      id: 'cloudCover',
      name: 'Cloud Transmission',
      value: breakdown?.cloudCover ?? 0,
      description: 'Atmospheric transparency from live Open-Meteo cloud cover data.',
      color: '#94a3b8',
      icon: '☁️',
    },
    {
      id: 'availableRadiation',
      name: 'Available Solar Radiation',
      value: breakdown?.availableRadiation ?? 0,
      description: 'Global irradiance potential relative to standard 1000 W/m² peak conditions.',
      color: '#f59e0b',
      icon: '⚡',
    },
    {
      id: 'timeOfDay',
      name: 'Time of Day Window',
      value: breakdown?.timeOfDay ?? 0,
      description: 'Diurnal solar radiation curve factor across daylight hours.',
      color: '#a855f7',
      icon: '🕒',
    },
  ]

  return (
    <div className="capture-breakdown-card glass-card">
      <div className="card-header">
        <div className="title-with-badge">
          <h4>SOLAR CAPTURE BREAKDOWN</h4>
          <span className="source-tag modeled-tag">SolarQuest Modelled Impact</span>
        </div>
        <div className="breakdown-overall">
          <span>Modelled Index:</span>
          <strong>{breakdown?.overallEfficiency ?? 0}%</strong>
        </div>
      </div>

      <p className="breakdown-disclaimer">
        ℹ️ <em>SolarQuest Modelled Impact</em> estimates the relative influence of environmental and geometrical variables on photovoltaic yield. These are modeled computational factors, not directly measured hardware loss telemetry.
      </p>

      <div className="breakdown-bars-list">
        {factors.map((factor) => (
          <div key={factor.id} className="breakdown-bar-item">
            <div className="bar-header">
              <div className="bar-title-group">
                <span className="bar-icon">{factor.icon}</span>
                <strong>{factor.name}</strong>
              </div>
              <span className="bar-val" style={{ color: factor.color }}>
                {factor.value}%
              </span>
            </div>
            <div className="factor-progress-track">
              <div
                className="factor-progress-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, factor.value))}%`,
                  backgroundColor: factor.color,
                  boxShadow: `0 0 10px ${factor.color}66`,
                }}
              />
            </div>
            <small className="bar-desc">{factor.description}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

