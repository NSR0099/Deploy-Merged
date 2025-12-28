// src/App.jsx
import React, { useState, useEffect } from 'react'
import '../style/UserDashboard.css'
import Header from '../components/Header'
import IncidentReportForm from '../components/IncidentReportForm'
import IncidentDashboard from '../components/IncidentDashboard'
import ResponderView from '../components/ResponderView'
import VerificationPanel from '../components/VerificationPanel'

function App() {
  const [incidents, setIncidents] = useState([])
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [userType, setUserType] = useState('citizen')

  // Mock initial data
  useEffect(() => {
    const mockIncidents = [
      {
        id: '1',
        type: 'Road Accident',
        description: 'Two-car collision on Main Street',
        location: { lat: 40.7128, lng: -74.0060, address: 'Main St & 5th Ave' },
        timestamp: new Date(Date.now() - 3600000),
        severity: 'high',
        status: 'pending',
        verified: true,
        media: [],
        upvotes: 5,
        reports: 3
      },
      {
        id: '2',
        type: 'Medical Emergency',
        description: 'Person collapsed near Central Park',
        location: { lat: 40.7829, lng: -73.9654, address: 'Central Park West' },
        timestamp: new Date(Date.now() - 1800000),
        severity: 'critical',
        status: 'active',
        verified: true,
        media: [],
        upvotes: 8,
        reports: 5
      },
      {
        id: '3',
        type: 'Fire',
        description: 'Small fire reported in apartment building',
        location: { lat: 40.7589, lng: -73.9851, address: 'Times Square' },
        timestamp: new Date(Date.now() - 900000),
        severity: 'medium',
        status: 'pending',
        verified: false,
        media: [],
        upvotes: 2,
        reports: 1
      }
    ]
    setIncidents(mockIncidents)
  }, [])

  const handleNewIncident = (incident) => {
    const newIncident = {
      ...incident,
      id: Date.now().toString(),
      timestamp: new Date(),
      severity: 'low',
      status: 'pending',
      verified: false,
      upvotes: 0,
      reports: 1
    }
    setIncidents([newIncident, ...incidents])
  }

  const handleVerifyIncident = (incidentId) => {
    setIncidents(incidents.map(inc => 
      inc.id === incidentId ? { ...inc, verified: true } : inc
    ))
  }

  const handleStatusUpdate = (incidentId, status) => {
    setIncidents(incidents.map(inc => 
      inc.id === incidentId ? { ...inc, status } : inc
    ))
  }

  return (
    <div className="App">
      <Header 
        userType={userType}
        onUserTypeChange={setUserType}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <div className="container">
        {activeView === 'report' ? (
          <IncidentReportForm onSubmit={handleNewIncident} />
        ) : activeView === 'responder' && userType === 'responder' ? (
          <ResponderView 
            incidents={incidents}
            onStatusUpdate={handleStatusUpdate}
            onSelectIncident={setSelectedIncident}
          />
        ) : (
          <>
            <IncidentDashboard 
              incidents={incidents}
              onSelectIncident={setSelectedIncident}
              userType={userType}
            />
            {selectedIncident && userType === 'responder' && (
              <VerificationPanel 
                incident={selectedIncident}
                onVerify={handleVerifyIncident}
              />
            )}
          </>
        )}
      </div>

      <footer className="footer">
        <p>© 2026 PROMETEO Hackathon | Sponsored by Anginat</p>
        <p>Real-Time Incident Reporting and Resource Coordination Platform</p>
      </footer>
    </div>
  )
}

export default App