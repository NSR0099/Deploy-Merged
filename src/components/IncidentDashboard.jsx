// components/IncidentDashboard.jsx
import React, { useState } from 'react';
import './IncidentDashboard.css';

const IncidentDashboard = ({ incidents, onSelectIncident, userType }) => {
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    radius: 10,
    verifiedOnly: false
  });

  const filterIncidents = () => {
    return incidents.filter(incident => {
      if (filters.type !== 'all' && incident.type !== filters.type) return false;
      if (filters.severity !== 'all' && incident.severity !== filters.severity) return false;
      if (filters.verifiedOnly && !incident.verified) return false;
      return true;
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#ff4444',
      high: '#ff8800',
      medium: '#ffbb33',
      low: '#00C851'
    };
    return colors[severity] || '#00C851';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffbb33',
      active: '#33b5e5',
      resolved: '#00C851',
      cancelled: '#ff4444'
    };
    return colors[status] || '#ffbb33';
  };

  const filteredIncidents = filterIncidents();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📡 Live Incident Feed</h2>
        <div className="stats">
          <div className="stat">
            <span className="stat-number">{incidents.length}</span>
            <span className="stat-label">Total Reports</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {incidents.filter(i => i.verified).length}
            </span>
            <span className="stat-label">Verified</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {incidents.filter(i => i.status === 'active').length}
            </span>
            <span className="stat-label">Active</span>
          </div>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Incident Type</label>
          <select 
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="all">All Types</option>
            <option value="Road Accident">Road Accident</option>
            <option value="Medical Emergency">Medical Emergency</option>
            <option value="Fire">Fire</option>
            <option value="Infrastructure Failure">Infrastructure Failure</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severity</label>
          <select 
            value={filters.severity}
            onChange={(e) => setFilters({...filters, severity: e.target.value})}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <input 
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => setFilters({...filters, verifiedOnly: e.target.checked})}
            />
            Verified Only
          </label>
        </div>

        <div className="filter-group">
          <label>Radius (km)</label>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={filters.radius}
            onChange={(e) => setFilters({...filters, radius: e.target.value})}
          />
          <span>{filters.radius} km</span>
        </div>
      </div>

      <div className="incident-list">
        {filteredIncidents.map(incident => (
          <div 
            key={incident.id} 
            className={`incident-card ${incident.verified ? 'verified' : ''}`}
            onClick={() => userType === 'responder' && onSelectIncident(incident)}
          >
            <div className="incident-header">
              <div className="incident-type">
                <span className="type-icon">
                  {incident.type === 'Road Accident' ? '🚗' : 
                   incident.type === 'Medical Emergency' ? '🏥' : 
                   incident.type === 'Fire' ? '🔥' : '⚠️'}
                </span>
                <h3>{incident.type}</h3>
              </div>
              <div className="incident-meta">
                <span 
                  className="severity-badge"
                  style={{backgroundColor: getSeverityColor(incident.severity)}}
                >
                  {incident.severity.toUpperCase()}
                </span>
                <span 
                  className="status-badge"
                  style={{backgroundColor: getStatusColor(incident.status)}}
                >
                  {incident.status}
                </span>
                {incident.verified && <span className="verified-badge">✅ Verified</span>}
              </div>
            </div>

            <p className="incident-description">{incident.description}</p>
            
            <div className="incident-details">
              <div className="detail">
                <span className="detail-label">📍</span>
                <span>{incident.location.address}</span>
              </div>
              <div className="detail">
                <span className="detail-label">🕐</span>
                <span>{incident.timestamp.toLocaleTimeString()}</span>
              </div>
              <div className="detail">
                <span className="detail-label">👍</span>
                <span>{incident.upvotes} upvotes</span>
              </div>
              <div className="detail">
                <span className="detail-label">📋</span>
                <span>{incident.reports} reports</span>
              </div>
            </div>

            {userType === 'citizen' && !incident.verified && (
              <button className="upvote-btn">
                👍 Confirm This Report
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentDashboard;