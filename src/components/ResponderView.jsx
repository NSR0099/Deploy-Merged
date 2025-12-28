// components/ResponderView.jsx
import React, { useState } from 'react';
import './ResponderView.css';

const ResponderView = ({ incidents, onStatusUpdate, onSelectIncident }) => {
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [notes, setNotes] = useState({});

  const priorityIncidents = incidents.filter(incident => {
    if (priorityFilter === 'all') return true;
    if (priorityFilter === 'unverified') return !incident.verified;
    if (priorityFilter === 'critical') return incident.severity === 'critical';
    return incident.severity === priorityFilter;
  });

  const handleStatusChange = (incidentId, newStatus) => {
    onStatusUpdate(incidentId, newStatus);
  };

  const handleAddNote = (incidentId) => {
    const note = prompt('Add internal note:');
    if (note) {
      setNotes({...notes, [incidentId]: note});
    }
  };

  return (
    <div className="responder-view">
      <div className="responder-header">
        <h2>👮 Responder Command Center</h2>
        <div className="priority-controls">
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="priority-select"
          >
            <option value="all">All Incidents</option>
            <option value="unverified">Unverified Only</option>
            <option value="critical">Critical Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
          </select>
          <div className="resource-status">
            <span className="resource-label">Available Units: 12</span>
            <div className="resource-bar">
              <div className="resource-fill" style={{width: '75%'}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="incident-grid">
        {priorityIncidents.map(incident => (
          <div key={incident.id} className="responder-incident-card">
            <div className="card-header">
              <h3>{incident.type}</h3>
              <div className="priority-tags">
                <span className={`priority-tag ${incident.severity}`}>
                  {incident.severity.toUpperCase()}
                </span>
                <span className={`status-tag ${incident.status}`}>
                  {incident.status}
                </span>
              </div>
            </div>

            <div className="card-body">
              <p className="incident-desc">{incident.description}</p>
              
              <div className="location-info">
                <strong>📍 Location:</strong>
                <p>{incident.location.address}</p>
              </div>

              <div className="verification-info">
                <div className="verification-status">
                  <strong>Verification:</strong>
                  <span className={incident.verified ? 'verified' : 'unverified'}>
                    {incident.verified ? '✅ Verified' : '❓ Unverified'}
                  </span>
                </div>
                <div className="confidence">
                  <strong>Confidence:</strong>
                  <span>{Math.min(100, incident.upvotes * 20)}%</span>
                </div>
              </div>

              <div className="reports-info">
                <span>📋 {incident.reports} reports</span>
                <span>👍 {incident.upvotes} confirmations</span>
                <span>🕐 {Math.round((Date.now() - incident.timestamp) / 60000)} min ago</span>
              </div>

              {notes[incident.id] && (
                <div className="internal-notes">
                  <strong>📝 Internal Notes:</strong>
                  <p>{notes[incident.id]}</p>
                </div>
              )}
            </div>

            <div className="card-actions">
              <div className="status-buttons">
                <button 
                  className={`status-btn ${incident.status === 'pending' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(incident.id, 'pending')}
                >
                  Pending
                </button>
                <button 
                  className={`status-btn ${incident.status === 'active' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(incident.id, 'active')}
                >
                  Active
                </button>
                <button 
                  className={`status-btn ${incident.status === 'resolved' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(incident.id, 'resolved')}
                >
                  Resolved
                </button>
              </div>

              <div className="action-buttons">
                <button 
                  className="verify-btn"
                  onClick={() => onSelectIncident(incident)}
                >
                  {incident.verified ? 'Update Verification' : 'Verify'}
                </button>
                <button 
                  className="note-btn"
                  onClick={() => handleAddNote(incident.id)}
                >
                  Add Note
                </button>
                <button className="assign-btn">
                  Assign Unit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="resource-panel">
        <h3>📊 Resource Allocation</h3>
        <div className="resource-list">
          {['Medical', 'Fire', 'Police', 'Infrastructure'].map(resource => (
            <div key={resource} className="resource-item">
              <span className="resource-name">{resource}</span>
              <div className="resource-metrics">
                <span>Available: 3</span>
                <span>Deployed: 5</span>
                <span>Response Time: 8min</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResponderView;