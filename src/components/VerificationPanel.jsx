// components/VerificationPanel.jsx
import React, { useState } from 'react';
import './VerificationPanel.css';

const VerificationPanel = ({ incident, onVerify }) => {
  const [verificationData, setVerificationData] = useState({
    verified: incident.verified,
    confidence: Math.min(100, incident.upvotes * 20),
    notes: '',
    assignedUnit: ''
  });

  const handleVerify = () => {
    onVerify(incident.id);
    alert('Incident verified successfully!');
  };

  return (
    <div className="verification-panel">
      <h3>🔍 Verification Panel</h3>
      
      <div className="verification-info">
        <div className="info-row">
          <strong>Incident ID:</strong>
          <span>{incident.id}</span>
        </div>
        <div className="info-row">
          <strong>Type:</strong>
          <span>{incident.type}</span>
        </div>
        <div className="info-row">
          <strong>Reports Count:</strong>
          <span>{incident.reports} independent reports</span>
        </div>
        <div className="info-row">
          <strong>Public Confidence:</strong>
          <span className="confidence-meter">
            <div 
              className="confidence-fill"
              style={{width: `${verificationData.confidence}%`}}
            ></div>
            <span className="confidence-text">{verificationData.confidence}%</span>
          </span>
        </div>
      </div>

      <div className="verification-controls">
        <div className="control-group">
          <label>Verification Status</label>
          <div className="verification-buttons">
            <button 
              className={`verify-btn ${incident.verified ? 'active' : ''}`}
              onClick={handleVerify}
            >
              ✅ Mark as Verified
            </button>
            <button className="reject-btn">
              ❌ Mark as False Report
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Assign Response Unit</label>
          <select 
            value={verificationData.assignedUnit}
            onChange={(e) => setVerificationData({...verificationData, assignedUnit: e.target.value})}
          >
            <option value="">Select unit</option>
            <option value="MED-01">Medical Unit 01</option>
            <option value="FIR-02">Fire Unit 02</option>
            <option value="POL-03">Police Unit 03</option>
            <option value="INF-04">Infrastructure Unit 04</option>
          </select>
        </div>

        <div className="control-group">
          <label>Internal Notes</label>
          <textarea 
            value={verificationData.notes}
            onChange={(e) => setVerificationData({...verificationData, notes: e.target.value})}
            placeholder="Add verification notes..."
            rows="3"
          />
        </div>
      </div>

      <div className="panel-actions">
        <button className="save-btn">Save Changes</button>
        <button className="coordinate-btn">Coordinate Response</button>
        <button className="escalate-btn">Escalate to Supervisor</button>
      </div>
    </div>
  );
};

export default VerificationPanel;