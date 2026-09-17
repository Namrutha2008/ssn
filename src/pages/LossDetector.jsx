import React, { useState } from 'react'
import './LossDetector.css'

export default function LossDetector({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('Today')
  const [selectedLocation, setSelectedLocation] = useState('Chennai, Tamil Nadu')
  const [showReportModal, setShowReportModal] = useState(false)

  return (
    <div className="ai-pred-page max-w-[1600px] mx-auto p-4 md:p-6 space-y-4 font-sans text-slate-100">
      
      {/* ================= HEADER SECTION ================= */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-slate-900 border border-cyan-400/50 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] relative group">
            <svg viewBox="0 0 36 36" className="w-8 h-8 text-cyan-400">
              <rect x="8" y="8" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 18h12M18 12v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="18" cy="18" r="3" fill="#38bdf8" />
              <text x="18" y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#ffffff">AI</text>
            </svg>
            <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm group-hover:bg-cyan-400/20 transition-all"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                AI Prediction
              </h1>
            </div>
            <p className="text-xs text-cyan-300/80 font-medium">Predict. Plan. Optimize.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* AI ONLINE Indicator */}
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4"></span>
            <span>AI ONLINE</span>
          </div>

          {/* Last Updated */}
          <div className="bg-slate-950/80 border border-slate-700/60 text-slate-300 text-xs px-3.5 py-1.5 rounded-full backdrop-blur-md">
            Last updated: 11:42 AM
          </div>

          {/* Notification Icon */}
          <button 
            type="button" 
            className="w-9 h-9 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-cyan-400/60 text-slate-300 hover:text-white flex items-center justify-center transition-all relative"
            title="Notifications"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_6px_#f43f5e]"></span>
          </button>

          {/* Profile Icon */}
          <div 
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border border-cyan-300/40 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer hover:scale-105 transition-transform"
            title="Meenakshi - Solar Explorer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </header>


      {/* ================= TOP CONTROLS ROW ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Time Tabs */}
        <div className="bg-slate-950/80 p-1 border border-cyan-500/20 rounded-full flex items-center gap-1 shadow-inner self-start">
          {['Today', 'Tomorrow', '7 Days', '30 Days'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-4 py-1.5 rounded-full transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(6,182,212,0.45)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Location & Weather Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
          {/* Location Selector */}
          <div className="bg-slate-900/90 border border-cyan-500/30 text-slate-200 text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-2 hover:border-cyan-400/60 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.1)] transition-all">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{selectedLocation}</span>
            <svg viewBox="0 0 24 24" className="w-3 h-3 text-slate-400 ml-1" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          {/* Current Weather Indicator */}
          <div className="bg-slate-900/90 border border-cyan-500/30 text-slate-200 text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.1)]">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" fill="#fbbf24" stroke="#fbbf24" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#fbbf24" />
            </svg>
            <span className="font-bold text-white">28°C</span>
            <span className="text-slate-400">Partly Cloudy</span>
          </div>
        </div>
      </div>


      {/* ================= MAIN UPPER GRID (3 COLUMNS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ---------------- CARD 1: MAIN AI PREDICTION CARD ---------------- */}
        <div className="lg:col-span-3 bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.12)] flex flex-col justify-between relative overflow-hidden hover:border-cyan-400/50 transition-all duration-300">
          
          {/* Subtle Cyber Grid Texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#082f4915_1px,transparent_1px),linear-gradient(to_bottom,#082f4915_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

          {/* Card Header */}
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="text-xs font-bold tracking-wider text-cyan-400 uppercase">AI PREDICTION</h3>
            </div>
            <span className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors text-sm font-bold">›</span>
          </div>

          {/* Center Graphic: Glowing Circular Progress Indicator */}
          <div className="flex flex-col items-center justify-center py-4 relative z-10">
            <div className="relative w-44 h-44 flex items-center justify-center">
              
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-pulse"></div>

              <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                <defs>
                  <linearGradient id="cyanArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f2fe" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                  <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Track Circle */}
                <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(15, 23, 42, 0.8)" strokeWidth="12" />
                <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="10" />

                {/* Animated Glowing Progress Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="url(#cyanArcGrad)"
                  strokeWidth="10"
                  strokeDasharray="427"
                  strokeDashoffset="100"
                  strokeLinecap="round"
                  filter="url(#glowEffect)"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inside Ring Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-1 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4" fill="#fbbf24" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" stroke="#fbbf24" />
                  </svg>
                </div>
                <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                  18.6 kWh
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Expected Today</span>
              </div>
            </div>
          </div>

          {/* Bottom Card Stat */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80 relative z-10">
            <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-xs">
              🎯
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white">94%</span>
              <span className="text-xs text-cyan-400 font-semibold">Confidence</span>
            </div>
          </div>

        </div>


        {/* ---------------- CARD 2: SOLAR GENERATION FORECAST CHART ---------------- */}
        <div className="lg:col-span-6 bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.12)] flex flex-col justify-between relative overflow-hidden">
          
          {/* Card Header & Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-amber-400">
                ☀️
              </div>
              <h3 className="text-xs font-bold tracking-wider text-cyan-400 uppercase">SOLAR GENERATION FORECAST</h3>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] font-medium text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_6px_#38bdf8]"></span>
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-b-2 border-dashed border-cyan-400"></span>
                <span>Predicted</span>
              </div>
            </div>
          </div>

          {/* Forecast Chart Body */}
          <div className="relative flex-1 min-h-[200px] flex items-center">
            
            {/* Y-Axis Label */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-slate-500 font-semibold tracking-wider pointer-events-none">
              Generation (kWh)
            </div>

            {/* Chart Area Container */}
            <div className="w-full pl-6 pr-2 pt-4 pb-2">
              
              {/* SVG Area Chart */}
              <div className="relative w-full h-44">
                
                {/* Horizontal Gridlines & Y-labels */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-500">
                  <div className="border-b border-slate-800/80 w-full flex justify-between"><span>25</span></div>
                  <div className="border-b border-slate-800/80 w-full flex justify-between"><span>20</span></div>
                  <div className="border-b border-slate-800/80 w-full flex justify-between"><span>15</span></div>
                  <div className="border-b border-slate-800/80 w-full flex justify-between"><span>10</span></div>
                  <div className="border-b border-slate-800/80 w-full flex justify-between"><span>5</span></div>
                  <div className="border-b border-slate-800/80 w-full flex justify-between"><span>0</span></div>
                </div>

                {/* SVG Curve Lines */}
                <svg viewBox="0 0 600 170" preserveAspectRatio="none" className="w-full h-full relative z-10 overflow-visible">
                  <defs>
                    <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="cyanGlow" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Gradient Fill under curve */}
                  <path
                    d="M 20,155 C 100,150 180,95 300,18 C 420,95 500,150 580,155 L 580,165 L 20,165 Z"
                    fill="url(#forecastFill)"
                  />

                  {/* Predicted Line (Cyan Dashed) */}
                  <path
                    d="M 20,155 C 100,150 180,95 300,18 C 420,95 500,150 580,155"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="chart-line-pred"
                  />

                  {/* Actual Line (Cyan Solid) */}
                  <path
                    d="M 20,155 C 95,152 175,100 295,22 C 340,60 410,120 490,152"
                    fill="none"
                    stroke="#00f2fe"
                    strokeWidth="3"
                    filter="url(#cyanGlow)"
                    className="chart-line-act"
                  />

                  {/* Peak Marker Dot */}
                  <g transform="translate(300, 18)">
                    <circle r="9" fill="rgba(16, 185, 129, 0.3)" className="animate-ping" />
                    <circle r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" className="shadow-lg" />
                    <circle r="2" fill="#ffffff" />
                  </g>
                </svg>

                {/* Floating Peak Tooltip Badge */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-cyan-400/60 rounded-xl px-3 py-1 text-center shadow-[0_0_15px_rgba(6,182,212,0.4)] z-20 pointer-events-none backdrop-blur-md">
                  <div className="text-[11px] font-extrabold text-white flex items-center gap-1 justify-center">
                    <span>Peak:</span>
                    <span className="text-cyan-300">21.4 kWh</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">12:30 PM</div>
                </div>

              </div>

              {/* X-Axis Time Labels */}
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mt-2 px-2">
                <span>6 AM</span>
                <span>9 AM</span>
                <span className="text-cyan-400 font-bold">12 PM</span>
                <span>3 PM</span>
                <span>6 PM</span>
                <span>9 PM</span>
              </div>

            </div>
          </div>

        </div>


        {/* ---------------- CARD 3: 3 RIGHT COMPACT STAT CARDS ---------------- */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3">
          
          {/* Stat 1: PEAK GENERATION */}
          <div className="bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center gap-3.5 hover:border-cyan-400/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)] group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#38bdf8" stroke="#38bdf8" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">PEAK GENERATION</span>
              <div className="text-lg font-bold text-white tracking-tight">12:30 PM</div>
              <span className="text-[11px] text-slate-400 font-medium">Expected peak time</span>
            </div>
          </div>

          {/* Stat 2: ENERGY TOMORROW */}
          <div className="bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center gap-3.5 hover:border-cyan-400/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" fill="#f59e0b" stroke="#f59e0b" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">ENERGY TOMORROW</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-bold text-white tracking-tight">21.4 kWh</span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  ↑ +15% <span className="text-[9px] text-slate-400 font-normal">vs. today</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stat 3: CONFIDENCE LEVEL */}
          <div className="bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center gap-3.5 hover:border-cyan-400/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)] group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(59,130,246,0.2)" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">CONFIDENCE LEVEL</span>
              <div className="text-lg font-bold text-white tracking-tight">94%</div>
              <span className="text-[11px] text-slate-400 font-medium">High accuracy</span>
            </div>
          </div>

        </div>

      </div>


      {/* ================= MIDDLE GRID ROW (3 EQUAL CARDS) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ---------------- MIDDLE CARD 1: WEATHER IMPACT ---------------- */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col justify-between hover:border-cyan-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                🌧️
              </div>
              <h3 className="text-xs font-bold tracking-wider text-cyan-400 uppercase">WEATHER IMPACT</h3>
            </div>
            <span className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors text-sm font-bold">›</span>
          </div>

          <div className="space-y-2.5">
            {/* Row 1: Condition + Temp */}
            <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">☀️</span>
                <span className="text-xs font-semibold text-white">Clear / Partly Cloudy</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white">28°C</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Temperature</span>
              </div>
            </div>

            {/* Row 2: Cloud Cover */}
            <div className="flex items-center justify-between px-2 py-1 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-400">☁️</span>
                <span>Cloud Cover</span>
              </div>
              <span className="font-bold text-white">12%</span>
            </div>

            {/* Row 3: Wind Speed */}
            <div className="flex items-center justify-between px-2 py-1 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-400">💨</span>
                <span>Wind Speed</span>
              </div>
              <span className="font-bold text-white">12 km/h</span>
            </div>

            {/* Row 4: Humidity */}
            <div className="flex items-center justify-between px-2 py-1 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-400">💧</span>
                <span>Humidity</span>
              </div>
              <span className="font-bold text-white">68%</span>
            </div>
          </div>
        </div>


        {/* ---------------- MIDDLE CARD 2: AI INSIGHTS ---------------- */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col justify-between hover:border-cyan-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                🧠
              </div>
              <h3 className="text-xs font-bold tracking-wider text-cyan-400 uppercase">AI INSIGHTS</h3>
            </div>
            <span className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors text-sm font-bold">›</span>
          </div>

          <div className="space-y-2.5">
            {/* Insight 1 */}
            <div className="flex items-start gap-2.5 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="leading-snug">
                High generation expected due to clear sky conditions.
              </p>
            </div>

            {/* Insight 2 */}
            <div className="flex items-start gap-2.5 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                !
              </div>
              <p className="leading-snug">
                Afternoon heat loss possible (12 PM – 3 PM).
              </p>
            </div>

            {/* Insight 3 */}
            <div className="flex items-start gap-2.5 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="leading-snug">
                Panel condition looks good (&gt; 90% efficiency).
              </p>
            </div>
          </div>
        </div>


        {/* ---------------- MIDDLE CARD 3: EXPECTED ENERGY GAIN / LOSS ---------------- */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col justify-between hover:border-cyan-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                ⚖️
              </div>
              <h3 className="text-xs font-bold tracking-wider text-cyan-400 uppercase">EXPECTED ENERGY GAIN / LOSS</h3>
            </div>
            <span className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors text-sm font-bold">›</span>
          </div>

          <div className="space-y-3">
            {/* Gain Box */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between shadow-[0_0_12px_rgba(16,185,129,0.1)] relative overflow-hidden group">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-10 rounded-full bg-gradient-to-b from-emerald-400 to-teal-600 shadow-[0_0_10px_rgba(52,211,153,0.6)]"></div>
                <div>
                  <span className="text-[11px] text-slate-300 font-medium block">Gain (vs. yesterday)</span>
                  <span className="text-base font-extrabold text-emerald-400 tracking-tight">+2.8 kWh</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                +15% ↑
              </span>
            </div>

            {/* Loss Box */}
            <div className="bg-slate-950/80 border border-rose-500/40 rounded-xl p-3 flex items-center justify-between shadow-[0_0_12px_rgba(244,63,94,0.1)] relative overflow-hidden group">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-10 rounded-full bg-gradient-to-b from-rose-500 to-pink-700 shadow-[0_0_10px_rgba(244,63,94,0.6)]"></div>
                <div>
                  <span className="text-[11px] text-slate-300 font-medium block">Loss (potential)</span>
                  <span className="text-base font-extrabold text-rose-400 tracking-tight">-0.6 kWh</span>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                -3% ↓
              </span>
            </div>
          </div>
        </div>

      </div>


      {/* ================= BOTTOM SECTION: SOLARQUEST AI ASSISTANT ================= */}
      <div className="bg-slate-900/75 backdrop-blur-md border border-cyan-500/35 rounded-2xl p-4 md:p-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Subtle Cyber Waves Background Accent */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Left Side: Futuristic AI Robot Avatar */}
        <div className="flex items-center justify-center shrink-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            {/* Robot Pedestal Glowing Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse"></div>
            <div className="absolute inset-2 rounded-full border border-blue-500/30"></div>

            {/* AI Robot Vector SVG */}
            <svg viewBox="0 0 100 100" className="w-20 h-20 relative z-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              {/* Antenna */}
              <line x1="50" y1="12" x2="50" y2="24" stroke="#38bdf8" strokeWidth="3" />
              <circle cx="50" cy="10" r="4" fill="#38bdf8" className="animate-ping" />
              <circle cx="50" cy="10" r="4" fill="#00f2fe" />

              {/* Head Shell */}
              <rect x="22" y="24" width="56" height="48" rx="18" fill="#091428" stroke="#00f2fe" strokeWidth="3" />
              
              {/* Screen Face */}
              <rect x="28" y="30" width="44" height="34" rx="12" fill="#030712" stroke="#38bdf8" strokeWidth="1.5" />
              
              {/* Glowing Eyes */}
              <ellipse cx="40" cy="46" rx="5" ry="6" fill="#00f2fe" className="animate-pulse" />
              <ellipse cx="60" cy="46" rx="5" ry="6" fill="#00f2fe" className="animate-pulse" />
              
              {/* Eye pupils */}
              <circle cx="41" cy="45" r="2" fill="#ffffff" />
              <circle cx="61" cy="45" r="2" fill="#ffffff" />

              {/* Smile / Voice Wave */}
              <path d="M 42 56 Q 50 61 58 56" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

              {/* Chest AI Badge */}
              <circle cx="50" cy="78" r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="50" y="81" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#ffffff">AI</text>
            </svg>
          </div>
        </div>

        {/* Middle Area: Heading, Message Bubble & Recommendation */}
        <div className="flex-1 space-y-3 text-center md:text-left z-10">
          
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <div className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-xs">
              🤖
            </div>
            <h3 className="text-sm font-extrabold text-cyan-400 tracking-wider uppercase drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              SOLARQUEST AI
            </h3>
          </div>

          {/* AI Prediction Message Speech Bubble */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 shadow-inner">
            <p className="text-xs text-slate-200 leading-relaxed">
              "Tomorrow's generation is expected to increase by 15%. The weather conditions are ideal for solar production."
            </p>
          </div>

          {/* Recommended Action Pill */}
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-3 flex items-center gap-3 text-xs shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0">
              💡
            </div>
            <div className="text-left">
              <span className="font-bold text-amber-400">Recommended Action:</span>
              <span className="text-slate-200 ml-1.5">Clean panels before 10 AM to maximize generation.</span>
            </div>
          </div>

        </div>

        {/* Right Side: View Full Report Action Button */}
        <div className="shrink-0 z-10">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="bg-slate-900/90 hover:bg-cyan-950/80 text-cyan-300 font-semibold text-xs px-5 py-3 rounded-full border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:border-cyan-400 transition-all flex items-center gap-2 group cursor-pointer"
          >
            <span>View Full Report</span>
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>


      {/* ================= FULL REPORT MODAL ================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowReportModal(false)}>
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 max-w-lg w-full shadow-[0_0_40px_rgba(6,182,212,0.3)] space-y-4" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <h3 className="text-base font-bold text-white">SolarQuest AI Forecast Report</h3>
              </div>
              <button type="button" className="text-slate-400 hover:text-white text-lg font-bold" onClick={() => setShowReportModal(false)}>✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                AI neural model predicts peak irradiance window between <strong className="text-cyan-400">11:45 AM and 1:15 PM</strong> with high confidence (<strong className="text-emerald-400">94%</strong>).
              </p>

              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Expected Today</span>
                  <strong className="text-sm text-white">18.6 kWh</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Forecast Peak</span>
                  <strong className="text-sm text-cyan-400">21.4 kWh</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Confidence Level</span>
                  <strong className="text-sm text-emerald-400">94%</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Optimized Potential</span>
                  <strong className="text-sm text-amber-400">22.6 kWh</strong>
                </div>
              </div>

              <p className="text-slate-400 italic">
                Action Plan: Schedule panel surface cleaning at 9:30 AM to remove dust buildup and prevent heat degradation.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button 
                type="button" 
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-lg"
                onClick={() => setShowReportModal(false)}
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
