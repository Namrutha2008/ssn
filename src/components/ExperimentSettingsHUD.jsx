export default function ExperimentSettingsHUD({
  locationName,
  latitude,
  longitude,
  capacity,
  tilt,
  azimuth,
  date,
  timeString,
  solarRadiation,
  cloudCover,
  sunAltitude,
  sunAzimuth,
}) {
  const formatDateDDMMYYYY = (d) => {
    const obj = d instanceof Date ? d : new Date(d)
    const day = String(obj.getDate()).padStart(2, '0')
    const month = String(obj.getMonth() + 1).padStart(2, '0')
    const year = obj.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <div className="experiment-settings-hud">
      <div className="hud-title-bar">
        <span className="hud-dot"></span>
        <h5>EXPERIMENT SETTINGS</h5>
      </div>

      <div className="hud-metrics-list">
        <div className="hud-item">
          <span className="hud-label">Location:</span>
          <strong className="hud-value" title={locationName}>{locationName || 'Registered Location'}</strong>
        </div>
        <div className="hud-item">
          <span className="hud-label">Latitude:</span>
          <strong className="hud-value">{Number.isFinite(Number(latitude)) ? Number(latitude).toFixed(4) : '—'}</strong>
        </div>
        <div className="hud-item">
          <span className="hud-label">Longitude:</span>
          <strong className="hud-value">{Number.isFinite(Number(longitude)) ? Number(longitude).toFixed(4) : '—'}</strong>
        </div>
        <div className="hud-item">
          <span className="hud-label">Panel Capacity:</span>
          <strong className="hud-value">{Number(capacity).toFixed(1)} kW</strong>
        </div>
        <div className="hud-item">
          <span className="hud-label">Tilt:</span>
          <strong className="hud-value gold">{Math.round(tilt)}°</strong>
        </div>
        <div className="hud-item">
          <span className="hud-label">Azimuth:</span>
          <strong className="hud-value gold">{Math.round(azimuth)}°</strong>
        </div>
        <div className="hud-item">
          <span className="hud-label">Date:</span>
          <strong className="hud-value">{formatDateDDMMYYYY(date)}</strong>
        </div>
        <div className="hud-item">
          <span className="hud-label">Time:</span>
          <strong className="hud-value">{timeString}</strong>
        </div>
        <div className="hud-item">
          <span className="hud-label">Solar Radiation:</span>
          <strong className="hud-value">{Math.round(solarRadiation || 0)} W/m²</strong>
        </div>
        <div className="hud-item">
          <span className="hud-label">Cloud Cover:</span>
          <strong className="hud-value">{Math.round(cloudCover || 0)}%</strong>
        </div>
        <div className="hud-item">
          <span className="hud-label">Sun Altitude:</span>
          <strong className="hud-value">{Math.round(sunAltitude)}°</strong>
        </div>
        <div className="hud-item">
          <span className="hud-label">Sun Azimuth:</span>
          <strong className="hud-value">{Math.round(sunAzimuth)}°</strong>
        </div>
      </div>
    </div>
  )
}

