// components/Header.jsx
import React from 'react';
import './Header.css';

const Header = ({ userType, onUserTypeChange, activeView, onViewChange }) => {
  return (
    <header className="header">
      <div className="header-top">
        <div className="logo">
          <h1>PROMETEO</h1>
          <span className="year">2026</span>
        </div>
        <div className="sponsor">
          <span>Sponsored by</span>
          <h2>Anginat</h2>
        </div>
      </div>
      
      <nav className="nav">
        <div className="nav-left">
          <button 
            className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onViewChange('dashboard')}
          >
            📊 Incident Dashboard
          </button>
          <button 
            className={`nav-btn ${activeView === 'report' ? 'active' : ''}`}
            onClick={() => onViewChange('report')}
          >
            🚨 Report Incident
          </button>
          {userType === 'responder' && (
            <button 
              className={`nav-btn ${activeView === 'responder' ? 'active' : ''}`}
              onClick={() => onViewChange('responder')}
            >
              👮 Responder View
            </button>
          )}
        </div>
        
        <div className="user-controls">
          <div className="user-type-toggle">
            <span className="user-label">User Type:</span>
            <select 
              value={userType}
              onChange={(e) => onUserTypeChange(e.target.value)}
              className="user-select"
            >
              <option value="citizen">Citizen</option>
              <option value="responder">Responder/Admin</option>
            </select>
          </div>
          <div className="status-indicator">
            <div className="status-dot live"></div>
            <span>LIVE</span>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;