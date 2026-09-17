export default function LiveEnergyResponse({
  currentCapturePercent,
  experimentCapturePercent,
  currentGenerationKwh,
  experimentGenerationKwh,
  differencePercent,
  powerKw,
  gtiIrradiance,
}) {
  const isPositive = differencePercent >= 0
  const diffSign = isPositive ? '+' : ''

  return (
    <div className="live-energy-response-card glass-card">
      <div className="card-header">
        <div className="title-with-badge">
          <h4>⚡ LIVE ENERGY RESPONSE</h4>
          <span className="source-tag">SolarQuest Physics Model · Zero Synthetic Noise</span>
        </div>
        <div className="live-power-pill">
          <span>Instantaneous Power:</span>
          <strong>{powerKw > 0 ? `${powerKw.toFixed(2)} kW` : '0.00 kW'}</strong>
          <small>POA: {Math.round(gtiIrradiance || 0)} W/m²</small>
        </div>
      </div>

      <div className="energy-response-grid">
        {/* Solar Capture Comparison */}
        <div className="energy-metric-box">
          <span className="metric-title">Current Solar Capture</span>
          <div className="metric-val-row">
            <strong className="metric-num base">{Math.round(currentCapturePercent)}%</strong>
            <span className="metric-tag">Registered Setup</span>
          </div>
          <div className="meter-track">
            <div
              className="meter-bar base-bar"
              style={{ width: `${Math.min(100, Math.max(0, currentCapturePercent))}%` }}
            />
          </div>
        </div>

        <div className="energy-metric-box highlight">
          <span className="metric-title">Experiment Solar Capture</span>
          <div className="metric-val-row">
            <strong className="metric-num exp">{Math.round(experimentCapturePercent)}%</strong>
            <span className="metric-tag gold">Active Experiment</span>
          </div>
          <div className="meter-track">
            <div
              className="meter-bar exp-bar"
              style={{ width: `${Math.min(100, Math.max(0, experimentCapturePercent))}%` }}
            />
          </div>
        </div>

        {/* Daily Generation Comparison */}
        <div className="energy-metric-box">
          <span className="metric-title">Current Estimated Generation</span>
          <div className="metric-val-row">
            <strong className="metric-num base">{currentGenerationKwh.toFixed(2)} <span className="unit">kWh</span></strong>
            <small>Full daylight integration</small>
          </div>
        </div>

        <div className="energy-metric-box highlight">
          <span className="metric-title">Experiment Estimated Generation</span>
          <div className="metric-val-row">
            <strong className="metric-num exp">{experimentGenerationKwh.toFixed(2)} <span className="unit">kWh</span></strong>
            <small>At selected orientation</small>
          </div>
        </div>

        {/* Energy Difference */}
        <div className={`energy-metric-box diff-box ${isPositive ? 'positive' : 'negative'}`}>
          <span className="metric-title">Difference</span>
          <div className="diff-val-wrap">
            <strong className="diff-val">
              {diffSign}{differencePercent.toFixed(2)}%
            </strong>
            <span className="diff-kwh">
              {diffSign}{(experimentGenerationKwh - currentGenerationKwh).toFixed(2)} kWh
            </span>
          </div>
          <small className="diff-explainer">
            {isPositive
              ? 'Orientation captures more direct sunlight than your baseline setup.'
              : 'Orientation has lower solar incidence than baseline for this location.'}
          </small>
        </div>
      </div>
    </div>
  )
}

