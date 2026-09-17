import React from 'react'

export default function GlobalSolarMap() {
  const topRegions = [
    { rank: 1, name: 'Australia', val: '94%' },
    { rank: 2, name: 'Middle East', val: '92%' },
    { rank: 3, name: 'India', val: '88%' },
    { rank: 4, name: 'Spain', val: '85%' },
    { rank: 5, name: 'USA', val: '78%' },
  ]

  return (
    <div className="glass-card global-map-card">
      <div className="card-header">
        <div className="header-title">
          <span className="icon-glow">🌐</span>
          <h4>Global Solar Intelligence</h4>
        </div>
      </div>

      <div className="global-map-body">
        <div className="svg-map-wrapper">
          <svg viewBox="0 0 1000 500" className="world-svg-map">
            <defs>
              <radialGradient id="heat-aus" cx="80%" cy="75%" r="18%">
                <stop offset="0%" stopColor="#ff4b4b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ffb830" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heat-me" cx="58%" cy="45%" r="15%">
                <stop offset="0%" stopColor="#ff3b3b" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#ffb830" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heat-ind" cx="68%" cy="50%" r="14%">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#4facfe" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heat-esp" cx="47%" cy="38%" r="12%">
                <stop offset="0%" stopColor="#ffb830" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#00f2fe" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heat-usa" cx="24%" cy="36%" r="18%">
                <stop offset="0%" stopColor="#38ef7d" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#11998e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="map-grid-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0f2b48" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#051224" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Grid background lines */}
            <rect width="1000" height="500" fill="url(#map-grid-grad)" rx="12" />
            <line x1="0" y1="125" x2="1000" y2="125" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
            <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255,255,255,0.06)" />
            <line x1="0" y1="375" x2="1000" y2="375" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
            <line x1="250" y1="0" x2="250" y2="500" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
            <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(255,255,255,0.06)" />
            <line x1="750" y1="0" x2="750" y2="500" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />

            {/* Simplified World Continents Base Vector */}
            <g fill="#162e4a" stroke="#1d426a" strokeWidth="1">
              {/* North America */}
              <path d="M 120 100 Q 200 80 300 110 T 320 220 Q 240 280 180 260 T 100 180 Z" />
              {/* South America */}
              <path d="M 270 270 Q 340 280 350 360 T 290 460 Q 250 400 250 330 Z" />
              {/* Europe */}
              <path d="M 440 100 Q 520 90 560 140 T 480 200 Q 430 180 430 130 Z" />
              {/* Africa */}
              <path d="M 450 200 Q 560 190 580 290 T 520 420 Q 440 380 440 280 Z" />
              {/* Asia */}
              <path d="M 560 90 Q 750 70 880 140 T 820 280 Q 660 300 580 200 Z" />
              {/* Australia */}
              <path d="M 750 320 Q 860 310 880 400 T 780 430 Q 720 400 740 340 Z" />
            </g>

            {/* Solar Heatmap Overlays */}
            <rect width="1000" height="500" fill="url(#heat-aus)" />
            <rect width="1000" height="500" fill="url(#heat-me)" />
            <rect width="1000" height="500" fill="url(#heat-ind)" />
            <rect width="1000" height="500" fill="url(#heat-esp)" />
            <rect width="1000" height="500" fill="url(#heat-usa)" />

            {/* Hotspot Markers */}
            <g className="map-hotspots">
              {/* Australia */}
              <circle cx="810" cy="370" r="6" fill="#ff4b4b" />
              <circle cx="810" cy="370" r="14" fill="none" stroke="#ff4b4b" strokeWidth="1.5" opacity="0.7">
                <animate attributeName="r" values="6;18;6" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Middle East */}
              <circle cx="580" cy="220" r="6" fill="#ff9100" />
              <circle cx="580" cy="220" r="14" fill="none" stroke="#ff9100" strokeWidth="1.5" opacity="0.7">
                <animate attributeName="r" values="6;18;6" dur="2.5s" repeatCount="indefinite" />
              </circle>

              {/* India */}
              <circle cx="680" cy="240" r="6" fill="#00f2fe" />
              <circle cx="680" cy="240" r="14" fill="none" stroke="#00f2fe" strokeWidth="1.5" opacity="0.7">
                <animate attributeName="r" values="6;18;6" dur="2.8s" repeatCount="indefinite" />
              </circle>

              {/* Spain */}
              <circle cx="470" cy="180" r="5" fill="#ffb830" />

              {/* USA */}
              <circle cx="240" cy="180" r="5" fill="#38ef7d" />
            </g>
          </svg>

          {/* Floating Global Solar Potential Overlay Card */}
          <div className="map-overlay-card potential-card">
            <span className="sub-title">Global Solar Potential</span>
            <div className="big-stat">
              82% <span className="stat-label">World average</span>
            </div>
            <div className="mini-progress-bar">
              <div className="bar-fill" style={{ width: '82%' }} />
            </div>
          </div>

          {/* Floating Top Regions Ranking Card */}
          <div className="map-overlay-card regions-card">
            <h5>Top Regions</h5>
            <ol className="regions-list">
              {topRegions.map((r) => (
                <li key={r.name}>
                  <span className="rank">{r.rank}.</span>
                  <span className="region-name">{r.name}</span>
                  <span className="region-val">{r.val}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Heatmap Color Scale Bar */}
        <div className="map-legend-bar">
          <div className="legend-items">
            <span className="legend-chip high"><i /> High</span>
            <span className="legend-chip mod"><i /> Moderate</span>
            <span className="legend-chip low"><i /> Low</span>
            <span className="legend-chip cloud"><i /> Cloud Cover</span>
            <span className="legend-chip storm"><i /> Storm Risk</span>
          </div>
        </div>
      </div>
    </div>
  )
}
