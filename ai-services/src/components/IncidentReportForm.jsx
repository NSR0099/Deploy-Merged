// components/IncidentReportForm.jsx
import React, { useState } from 'react';
import './IncidentReportForm.css';

const IncidentReportForm = ({ onSubmit }) => {
  const [incident, setIncident] = useState({
    type: '',
    description: '',
    location: '',
    media: null,
    severity: 'low'
  });

  const incidentTypes = [
    'Road Accident',
    'Medical Emergency',
    'Fire',
    'Infrastructure Failure',
    'Public Safety',
    'Natural Disaster',
    'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (incident.type && incident.description && incident.location) {
      onSubmit(incident);
      setIncident({
        type: '',
        description: '',
        location: '',
        media: null,
        severity: 'low'
      });
      alert('Incident reported successfully!');
    }
  };

  return (
    <div className="report-form-container">
      <h2>🚨 Report an Incident</h2>
      <p className="form-subtitle">Help authorities respond faster by reporting emergencies</p>
      
      <form onSubmit={handleSubmit} className="incident-form">
        <div className="form-group">
          <label>Incident Type *</label>
          <select 
            value={incident.type}
            onChange={(e) => setIncident({...incident, type: e.target.value})}
            required
          >
            <option value="">Select type</option>
            {incidentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Severity Level</label>
          <div className="severity-buttons">
            {['low', 'medium', 'high', 'critical'].map(level => (
              <button
                key={level}
                type="button"
                className={`severity-btn ${incident.severity === level ? 'active' : ''} ${level}`}
                onClick={() => setIncident({...incident, severity: level})}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea 
            value={incident.description}
            onChange={(e) => setIncident({...incident, description: e.target.value})}
            placeholder="Please describe the incident in detail..."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>Location *</label>
          <input 
            type="text"
            value={incident.location}
            onChange={(e) => setIncident({...incident, location: e.target.value})}
            placeholder="Enter address or click to use current location"
            required
          />
          <button type="button" className="location-btn">
            📍 Use Current Location
          </button>
        </div>

        <div className="form-group">
          <label>Upload Media (Optional)</label>
          <div className="media-upload">
            <input 
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setIncident({...incident, media: e.target.files[0]})}
            />
            <div className="upload-hint">
              <small>Upload photos or videos (Max: 10MB)</small>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Submit Report
          </button>
          <p className="disclaimer">
            * Your report will be verified by authorities. False reports may be penalized.
          </p>
        </div>
      </form>
    </div>
  );
};

export default IncidentReportForm;