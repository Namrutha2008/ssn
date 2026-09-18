import React, { useEffect, useState } from 'react'
import './App.css'
import DashboardView from './components/DashboardView'
import LossDetector from './pages/LossDetector'
import WhatIfSimulator from './pages/WhatIfSimulator'
import SolarAnalysis from './pages/SolarAnalysis'
import Optimizer from './pages/Optimizer'
import SolarAnalyst from './pages/SolarAnalyst'
import Settings from './pages/Settings'
import Alerts from './pages/Alerts'
import sidebarCardImg from './assets/sidebar_card.jpg'

function App() {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextPath) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
    setPath(nextPath)
  }

  // Active navigation helper
  const getActiveNavItem = () => {
    if (path === '/optimizer') return 'Optimizer'
    if (path === '/solar-analysis' || path === '/analysis') return 'Solar Analysis'
    if (path === '/simulation' || path === '/what-if-simulator') return 'Simulation'
    if (path === '/solar-analyst') return 'Solar Analyst'
    if (path === '/dashboard') return 'Dashboard'
    if (path === '/settings') return 'Settings'
    if (path === '/alerts') return 'Alerts'
    return 'AI Prediction'
  }

  const activeNav = getActiveNavItem()

  const handleNavClick = (navId) => {
    if (navId === 'Dashboard') navigate('/dashboard')
    else if (navId === 'Optimizer') navigate('/optimizer')
    else if (navId === 'Solar Analysis') navigate('/solar-analysis')
    else if (navId === 'Simulation') navigate('/simulation')
    else if (navId === 'AI Prediction') navigate('/ai-prediction')
    else if (navId === 'Solar Analyst') navigate('/solar-analyst')
    else if (navId === 'Settings') navigate('/settings')
    else if (navId === 'Alerts') navigate('/alerts')
    else navigate('/ai-prediction')
  }

  return (
    <div className="solarquest-app">
      {/* SHARED LEFT SIDEBAR */}
      <aside className="app-sidebar">
        <div className="brand-logo-area" onClick={() => navigate('/ai-prediction')} style={{ cursor: 'pointer' }}>
          <div className="sun-logo-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" fill="#ffb830" stroke="#ffb830" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#ffb830" />
            </svg>
          </div>
          <div className="brand-titles">
            <h2>SolarQuest</h2>
            <span className="brand-tagline">Smarter Solar. Brighter Tomorrow.</span>
          </div>
        </div>

        <nav className="main-nav">
          <div className="nav-group">
            {[
              { id: 'Dashboard', label: 'Dashboard', icon: '◫' },
              { id: 'Solar Analysis', label: 'Solar Analysis', icon: '☀️' },
              { id: 'Optimizer', label: 'Optimizer', icon: '⚡' },
              { id: 'Simulation', label: 'Simulation', icon: '🔄' },
              { id: 'AI Prediction', label: 'AI Prediction', icon: '🤖' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-button ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="nav-icon-symbol">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="nav-divider-label">More</div>

          <div className="nav-group">
            <button type="button" className={`nav-button ${activeNav === 'Alerts' ? 'active' : ''}`} onClick={() => handleNavClick('Alerts')}>
              <span className="nav-icon-symbol">🔔</span>
              <span className="nav-label">Alerts</span>
              <span className="badge-count">3</span>
            </button>
            <button type="button" className={`nav-button ${activeNav === 'Settings' ? 'active' : ''}`} onClick={() => handleNavClick('Settings')}>
              <span className="nav-icon-symbol">⚙️</span>
              <span className="nav-label">Settings</span>
            </button>
          </div>
        </nav>

        {/* Bottom Sidebar Visual Card */}
        <div className="sidebar-visual-card">
          <img src={sidebarCardImg} alt="Clean Energy" className="card-bg-img" />
          <div className="card-overlay-content">
            <span className="leaf-icon">🌱</span>
            <h5>Clean Energy</h5>
            <p>For a Sustainable Future</p>
          </div>
        </div>

        {/* Sidebar User Profile Footer */}
        <div className="sidebar-user-profile">
          <div className="user-avatar-circle">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="user-info">
            <h4>Meenakshi</h4>
            <span>Solar Explorer</span>
          </div>
          <button type="button" className="user-settings-btn" title="Settings" onClick={() => handleNavClick('Settings')}>
            ⚙️
          </button>
        </div>
      </aside>

      {/* DYNAMIC PAGE CONTENT CONTAINER */}
      <main className="dashboard-content">
        {path === '/optimizer' && (
          <Optimizer onNavigate={navigate} />
        )}
        {(path === '/solar-analysis' || path === '/analysis') && (
          <SolarAnalysis onNavigate={navigate} />
        )}
        {(path === '/simulation' || path === '/what-if-simulator') && (
          <WhatIfSimulator onNavigate={navigate} />
        )}
        {path === '/solar-analyst' && (
          <SolarAnalyst onNavigate={navigate} />
        )}
        {path === '/dashboard' && (
          <DashboardView onNavigate={navigate} />
        )}
        {path === '/settings' && (
          <Settings onNavigate={navigate} />
        )}
        {path === '/alerts' && (
          <Alerts onNavigate={navigate} />
        )}
        {(path === '/' || path === '/loss-detector' || path === '/ai-prediction' || (path !== '/optimizer' && path !== '/solar-analysis' && path !== '/analysis' && path !== '/simulation' && path !== '/what-if-simulator' && path !== '/solar-analyst' && path !== '/dashboard' && path !== '/settings' && path !== '/alerts')) && (
          <LossDetector onNavigate={navigate} />
        )}
      </main>
    </div>
  )

}

export default App
