import { useState } from 'react'

export default function SolarOptimizer({
  onRunOptimization,
  optimizationResult,
  onApplyOptimization,
  isOptimizing,
}) {
  return (
    <div className="solar-optimizer-card glass-card">
      <div className="card-header">
        <div className="title-with-badge">
          <h4>SOLARQUEST OPTIMIZER</h4>
          <span className="source-tag">Deterministic Orientation Solver</span>
        </div>
        <button
          type="button"
          className="optimize-run-btn"
          onClick={onRunOptimization}
          disabled={isOptimizing}
        >
          {isOptimizing ? '🔄 SIMULATING ORIENTATIONS...' : '✨ OPTIMIZE PANEL'}
        </button>
      </div>

      <p className="optimizer-intro">
        Scans all panel tilts (0°–85°) and azimuth bearings (0°–360°) against your site coordinates and Open-Meteo solar irradiance forecast to locate the orientation capturing maximum daily energy.
      </p>

      {optimizationResult ? (
        <div className="optimization-result-box">
          <div className="result-badge">
            <span>✨ SOLARQUEST OPTIMIZED</span>
          </div>

          <div className="result-grid">
            <div className="result-stat">
              <span className="label">Recommended Tilt</span>
              <strong className="value gold">{optimizationResult.recommendedTilt}°</strong>
              <small>Optimal elevation angle</small>
            </div>
            <div className="result-stat">
              <span className="label">Recommended Azimuth</span>
              <strong className="value gold">{optimizationResult.recommendedAzimuth}°</strong>
              <small>Optimal compass bearing</small>
            </div>
            <div className="result-stat">
              <span className="label">Modeled Generation</span>
              <strong className="value green">{optimizationResult.modeledGeneration.toFixed(2)} kWh</strong>
              <small>Full daylight integration</small>
            </div>
            <div className="result-stat">
              <span className="label">Improvement</span>
              <strong className="value green">+{optimizationResult.improvementPercent.toFixed(1)}%</strong>
              <small>Over registered baseline</small>
            </div>
          </div>

          <div className="result-actions">
            <button
              type="button"
              className="apply-opt-btn"
              onClick={() => onApplyOptimization(optimizationResult.recommendedTilt, optimizationResult.recommendedAzimuth)}
            >
              🚀 APPLY TO EXPERIMENT
            </button>
            <small className="no-perm-note">
              *Applies to the interactive 3D laboratory experiment. Does not alter your registered permanent baseline.
            </small>
          </div>
        </div>
      ) : (
        <div className="optimizer-placeholder">
          <span>Click <strong>✨ OPTIMIZE PANEL</strong> to simulate physical sunlight collection and find your site's peak orientation.</span>
        </div>
      )}
    </div>
  )
}

