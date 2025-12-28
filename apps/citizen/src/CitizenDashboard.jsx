import { useState, useEffect, useContext } from 'react';
import './CitizenDashboard.css';
import IncidentMap from './IncidentMap';
import AuthContext from './context/AuthContext';
import logo from './assets/logo.png';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CitizenDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('feed');
    const [incidents, setIncidents] = useState([]);
    const [filteredIncidents, setFilteredIncidents] = useState([]);
    const [filters, setFilters] = useState({
        type: 'all',
        severity: 'all',
        timeRange: 'all',
        searchRadius: 10,
        verificationStatus: 'all'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [incidentForm, setIncidentForm] = useState({
        type: '',
        description: '',
        location: '',
        latitude: '',
        longitude: '',
        media: null
    });

    const [mediaPreview, setMediaPreview] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [analysis, setAnalysis] = useState({ severity: null, departments: [], adminType: null, loading: false });

    // Fetch incidents from API
    const fetchIncidents = async () => {
        try {
            setIsLoading(true);
            // Build query string from filters
            const queryParams = new URLSearchParams();
            if (filters.type !== 'all') queryParams.append('type', filters.type);
            if (filters.severity !== 'all') queryParams.append('severity', filters.severity);
            if (filters.verificationStatus !== 'all') queryParams.append('verificationStatus', filters.verificationStatus);
            if (filters.timeRange !== 'all') queryParams.append('timeRange', filters.timeRange);

            const response = await fetch(`${API_BASE_URL}/incidents?${queryParams.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch incidents');
            }

            const data = await response.json();
            setIncidents(data);
            setFilteredIncidents(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load incidents. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    // fetch data on mount and filter change
    useEffect(() => {
        fetchIncidents();
    }, [filters]);

    // AI Analysis debounced
    useEffect(() => {
        if (!incidentForm.description || incidentForm.description.length < 10) {
            setAnalysis({ severity: null, departments: [], loading: false });
            return;
        }

        const timer = setTimeout(async () => {
            setAnalysis(prev => ({ ...prev, loading: true }));
            try {
                const response = await fetch(`${API_BASE_URL}/incidents/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description: incidentForm.description })
                });
                if (response.ok) {
                    const data = await response.json();
                    setAnalysis({
                        severity: data.severity,
                        departments: data.departments,
                        adminType: data.adminType,
                        loading: false
                    });
                }
            } catch (err) {
                console.error('Analysis error:', err);
                setAnalysis(prev => ({ ...prev, loading: false }));
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [incidentForm.description]);


    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setIncidentForm(prev => ({ ...prev, [name]: value }));
    };

    const handleMediaUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIncidentForm(prev => ({ ...prev, media: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Auto-fill coordinates
                setIncidentForm(prev => ({
                    ...prev,
                    latitude: latitude,
                    longitude: longitude
                }));

                // Attempt reverse geocoding
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    if (data.display_name) {
                        setIncidentForm(prev => ({
                            ...prev,
                            location: data.display_name,
                            latitude: latitude,
                            longitude: longitude
                        }));
                    } else {
                        setIncidentForm(prev => ({
                            ...prev,
                            location: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
                            latitude: latitude,
                            longitude: longitude
                        }));
                    }
                } catch (error) {
                    console.error("Geocoding error:", error);
                    setIncidentForm(prev => ({
                        ...prev,
                        location: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
                        latitude: latitude,
                        longitude: longitude
                    }));
                }

                setIsLocating(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Unable to retrieve your location. Please check browser permissions.");
                setIsLocating(false);
            }
        );
    };

    const handleSubmitIncident = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('type', incidentForm.type);
            formData.append('description', incidentForm.description);
            formData.append('location', incidentForm.location);
            formData.append('latitude', incidentForm.latitude || 37.7749);
            formData.append('longitude', incidentForm.longitude || -122.4194);
            formData.append('severity', incidentForm.severity);
            formData.append('reportedBy', user ? user.name : 'Anonymous');
            formData.append('reporterEmail', user ? user.email : 'unknown@example.com');

            if (incidentForm.media) {
                formData.append('media', incidentForm.media);
            }

            const response = await fetch(`${API_BASE_URL}/incidents`, {
                method: 'POST',
                body: formData // allow browser to set content-type header for multipart
            });

            if (!response.ok) {
                throw new Error('Failed to submit incident');
            }

            const data = await response.json();

            // Add new incident to list
            setIncidents(prev => [data.incident, ...prev]);

            // Also refresh list to ensure consistency
            fetchIncidents();

            // Reset form
            setIncidentForm({
                type: '',
                description: '',
                location: '',
                latitude: '',
                longitude: ''
            });
            setMediaPreview(null);

            // Switch to feed tab to show the new incident
            setActiveTab('feed');

            // Show success message
            alert('Incident reported successfully! ID: ' + data.incident.id);
        } catch (err) {
            console.error('Error submitting incident:', err);
            alert('Failed to report incident. Please try again.');
        }
    };

    const handleUpvote = async (incidentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/upvote`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Failed to upvote');
            }

            const data = await response.json();

            // Update local state
            setIncidents(prev => prev.map(inc =>
                inc.id === incidentId
                    ? { ...inc, upvotes: data.upvotes }
                    : inc
            ));
        } catch (err) {
            console.error('Error upvoting:', err);
        }
    };

    const getTimeAgo = (timestamp) => {
        const now = Date.now();
        const incTime = new Date(timestamp).getTime();
        const diff = now - incTime;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getIncidentTypeLabel = (type) => {
        const labels = {
            road_accident: 'Road Accident',
            medical_emergency: 'Medical Emergency',
            infrastructure_failure: 'Infrastructure Failure',
            public_safety: 'Public Safety',
            fire: 'Fire',
            flood: 'Flood',
            other: 'Other'
        };
        return labels[type] || type;
    };

    const getIncidentIcon = (type) => {
        const icons = {
            road_accident: '🚗',
            medical_emergency: '🚑',
            infrastructure_failure: '🔧',
            public_safety: '⚠️',
            fire: '🔥',
            flood: '🌊',
            other: '📍'
        };
        return icons[type] || '📍';
    };

    const getSeverityColor = (severity) => {
        const colors = {
            critical: 'var(--status-critical)',
            high: 'var(--status-high)',
            medium: 'var(--status-medium)',
            low: 'var(--status-low)'
        };
        return colors[severity] || colors.medium;
    };

    return (
        <div className="citizen-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={logo} alt="CrisisLink Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                            <div>
                                <h1 className="gradient-text">CrisisLink</h1>
                                <p className="header-subtitle" style={{ fontSize: '0.75rem' }}>Secure AI-Driven Incident Routing</p>
                            </div>
                        </div>
                        <div className="header-stats">
                            <div className="stat-card">
                                <div className="stat-value">{incidents.length}</div>
                                <div className="stat-label">Total Incidents</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{incidents.filter(i => i.status === 'active').length}</div>
                                <div className="stat-label">Active</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{incidents.filter(i => i.verified).length}</div>
                                <div className="stat-label">Verified</div>
                            </div>
                        </div>

                        {/* User Profile */}
                        <div className="header-user-profile" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user ? user.name : 'Guest'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Citizen</div>
                            </div>
                            <button
                                onClick={logout}
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    color: 'var(--status-critical)',
                                    fontWeight: '500',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span>🚪</span> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="container">
                <div className="tab-navigation">
                    <button
                        className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('feed')}
                    >
                        <span className="tab-icon">📊</span>
                        Incident Feed
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
                        onClick={() => setActiveTab('report')}
                    >
                        <span className="tab-icon">📝</span>
                        Report Incident
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
                        onClick={() => setActiveTab('map')}
                    >
                        <span className="tab-icon">🗺️</span>
                        Map View
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="container">
                <div className="dashboard-content">
                    {/* Incident Feed Tab */}
                    {activeTab === 'feed' && (
                        <div className="feed-section fade-in-up">
                            {/* Filters */}
                            <div className="filters-panel glass-card">
                                <h3 className="filter-title">
                                    <span>🔍</span> Filter Incidents
                                </h3>
                                <div className="filters-grid">
                                    <div className="filter-group">
                                        <label>Incident Type</label>
                                        <select
                                            className="input-field"
                                            value={filters.type}
                                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                        >
                                            <option value="all">All Types</option>
                                            <option value="road_accident">Road Accident</option>
                                            <option value="medical_emergency">Medical Emergency</option>
                                            <option value="infrastructure_failure">Infrastructure Failure</option>
                                            <option value="public_safety">Public Safety</option>
                                            <option value="fire">Fire</option>
                                            <option value="flood">Flood</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="filter-group">
                                        <label>Severity</label>
                                        <select
                                            className="input-field"
                                            value={filters.severity}
                                            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                                        >
                                            <option value="all">All Severities</option>
                                            <option value="critical">Critical</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>

                                    <div className="filter-group">
                                        <label>Time Range</label>
                                        <select
                                            className="input-field"
                                            value={filters.timeRange}
                                            onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                                        >
                                            <option value="all">All Time</option>
                                            <option value="15min">Last 15 Minutes</option>
                                            <option value="1hour">Last Hour</option>
                                            <option value="6hours">Last 6 Hours</option>
                                            <option value="24hours">Last 24 Hours</option>
                                        </select>
                                    </div>

                                    <div className="filter-group">
                                        <label>Verification Status</label>
                                        <select
                                            className="input-field"
                                            value={filters.verificationStatus}
                                            onChange={(e) => setFilters(prev => ({ ...prev, verificationStatus: e.target.value }))}
                                        >
                                            <option value="all">All Incidents</option>
                                            <option value="verified">Verified Only</option>
                                            <option value="unverified">Unverified Only</option>
                                        </select>
                                    </div>

                                    <div className="filter-group">
                                        <label>Search Radius (km)</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={filters.searchRadius}
                                            onChange={(e) => setFilters(prev => ({ ...prev, searchRadius: e.target.value }))}
                                            className="range-slider"
                                        />
                                        <span className="range-value">{filters.searchRadius} km</span>
                                    </div>
                                </div>
                            </div>

                            {/* Incidents List */}
                            <div className="incidents-container">
                                <div className="incidents-header">
                                    <h2>Live Incidents ({filteredIncidents.length})</h2>
                                    <div className="live-indicator">
                                        <span className="pulse-dot"></span>
                                        Live Updates
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="loading-state glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                                        <div className="spinner" style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
                                        <h3>Loading Incidents...</h3>
                                    </div>
                                ) : error ? (
                                    <div className="error-state glass-card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid var(--status-critical)' }}>
                                        <div className="error-icon" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--status-critical)' }}>⚠️</div>
                                        <h3 style={{ color: 'var(--status-critical)' }}>Connection Error</h3>
                                        <p>{error}</p>
                                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            Please ensure the backend server is running on port 5000 and MongoDB is active.
                                        </p>
                                        <button
                                            onClick={fetchIncidents}
                                            className="tab-btn active"
                                            style={{ marginTop: '1.5rem', width: 'auto', padding: '0.75rem 2rem' }}
                                        >
                                            Retry Connection
                                        </button>
                                    </div>
                                ) : filteredIncidents.length === 0 ? (
                                    <div className="no-incidents glass-card">
                                        <div className="no-incidents-icon">🔍</div>
                                        <h3>No incidents found</h3>
                                        <p>Try adjusting your filters or check back later</p>
                                    </div>
                                ) : (
                                    <div className="incidents-grid">
                                        {filteredIncidents.map((incident, index) => (
                                            <div
                                                key={incident.id}
                                                className="incident-card glass-card"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                <div className="incident-header">
                                                    <div className="incident-type">
                                                        <span className="type-icon">{getIncidentIcon(incident.type)}</span>
                                                        <span className="type-label">{getIncidentTypeLabel(incident.type)}</span>
                                                    </div>
                                                    <div className="incident-badges">
                                                        {incident.verified && (
                                                            <span className="badge badge-verified">
                                                                ✓ Verified
                                                            </span>
                                                        )}
                                                        <span className={`badge badge-${incident.severity}`}>
                                                            {incident.severity}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="incident-body">
                                                    <h3 className="incident-id">#{incident.id}</h3>
                                                    <p className="incident-description">{incident.description}</p>

                                                    {incident.media && (
                                                        <div className="incident-media">
                                                            <img
                                                                src={`${API_BASE_URL.replace('/api', '')}${incident.media}`}
                                                                alt="Incident documentation"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '200px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '8px',
                                                                    marginBottom: '1rem',
                                                                    border: '1px solid var(--border-color)'
                                                                }}
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="incident-meta">
                                                        <div className="meta-item">
                                                            <span className="meta-icon">📍</span>
                                                            <span>{incident.location}</span>
                                                        </div>
                                                        <div className="meta-item">
                                                            <span className="meta-icon">🔑</span>
                                                            <span style={{ fontWeight: '500' }}>{incident.adminType} Admin</span>
                                                        </div>
                                                        <div className="meta-item">
                                                            <span className="meta-icon">🕒</span>
                                                            <span>{getTimeAgo(incident.timestamp)}</span>
                                                        </div>
                                                        <div className="meta-item author-info" title={incident.reporterEmail}>
                                                            <span className="meta-icon">👤</span>
                                                            <span style={{ fontWeight: '500' }}>{incident.reportedBy}</span>
                                                            <span className="reporter-email" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                                                                ({incident.reporterEmail})
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="incident-footer">
                                                    <div className="incident-status">
                                                        <span className={`status-dot status-${incident.status}`}></span>
                                                        <span className="status-text">{incident.status}</span>
                                                    </div>
                                                    <button
                                                        className="upvote-btn"
                                                        onClick={() => handleUpvote(incident.id)}
                                                    >
                                                        <span className="upvote-icon">👍</span>
                                                        <span className="upvote-count">{incident.upvotes}</span>
                                                    </button>
                                                </div>
                                                <div
                                                    className="severity-indicator"
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Report Incident Tab */}
                    {activeTab === 'report' && (
                        <div className="report-section fade-in-up">
                            <div className="report-container glass-card">
                                <div className="report-header">
                                    <h2>📝 Report New Incident</h2>
                                    <p>Provide accurate information to help emergency responders</p>
                                </div>

                                <form onSubmit={handleSubmitIncident} className="report-form">
                                    <div className="form-grid">
                                        <div className="form-group full-width">
                                            <label htmlFor="type">Incident Type *</label>
                                            <select
                                                id="type"
                                                name="type"
                                                className="input-field"
                                                value={incidentForm.type}
                                                onChange={handleFormChange}
                                                required
                                            >
                                                <option value="">Select incident type...</option>
                                                <option value="road_accident">🚗 Road Accident</option>
                                                <option value="medical_emergency">🚑 Medical Emergency</option>
                                                <option value="infrastructure_failure">🔧 Infrastructure Failure</option>
                                                <option value="public_safety">⚠️ Public Safety</option>
                                                <option value="fire">🔥 Fire</option>
                                                <option value="flood">🌊 Flood</option>
                                                <option value="other">📍 Other</option>
                                            </select>
                                        </div>

                                        <div className="form-group full-width">
                                            <label htmlFor="description">Description *</label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                className="input-field"
                                                rows="4"
                                                placeholder="Provide detailed description of the incident..."
                                                value={incidentForm.description}
                                                onChange={handleFormChange}
                                                required
                                            ></textarea>

                                            {/* AI Insight Section */}
                                            {(analysis.loading || analysis.departments.length > 0 || analysis.severity) && (
                                                <div className="ai-analysis-box glass-card" style={{ marginTop: '0.5rem', padding: '0.75rem', border: '1px solid var(--primary-blue)', background: 'rgba(52, 152, 219, 0.05)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontSize: '1.2rem' }}>🤖</span>
                                                        <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--primary-blue)' }}>Smart Analysis</span>
                                                        {analysis.loading && <span className="spinner" style={{ fontSize: '0.8rem' }}>⏳</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {analysis.severity && (
                                                            <span className={`badge badge-${analysis.severity}`} style={{ fontSize: '0.75rem' }}>
                                                                AI Predicted Severity: {analysis.severity.toUpperCase()}
                                                            </span>
                                                        )}
                                                        {analysis.departments.map(dept => (
                                                            <span key={dept} style={{
                                                                background: 'var(--secondary-blue)',
                                                                color: 'white',
                                                                padding: '2px 8px',
                                                                borderRadius: '10px',
                                                                fontSize: '0.75rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                🏢 {dept}
                                                            </span>
                                                        ))}
                                                        {analysis.adminType && (
                                                            <span style={{
                                                                background: 'var(--text-primary)',
                                                                color: 'white',
                                                                padding: '2px 8px',
                                                                borderRadius: '10px',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                🔑 Admin: {analysis.adminType}
                                                            </span>
                                                        )}
                                                        {(analysis.departments.length > 0 || analysis.adminType) && (
                                                            <div style={{ width: '100%', marginTop: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                                This incident will be routed to: <strong>{analysis.adminType || analysis.departments.join(', ')}</strong>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group full-width">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <label htmlFor="location" style={{ marginBottom: 0 }}>Location *</label>
                                                <button
                                                    type="button"
                                                    onClick={handleGetCurrentLocation}
                                                    className="location-btn" // We will style this with inline or existing class for now, inline is safer
                                                    style={{
                                                        background: 'var(--primary-gradient)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '20px',
                                                        padding: '6px 16px',
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontWeight: 500,
                                                        boxShadow: 'var(--shadow-sm)'
                                                    }}
                                                    disabled={isLocating}
                                                >
                                                    {isLocating ? '📍 Locating...' : '📍 Use Current Location'}
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                id="location"
                                                name="location"
                                                className="input-field"
                                                placeholder="Street address or landmark..."
                                                value={incidentForm.location}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="latitude">Latitude (Optional)</label>
                                            <input
                                                type="number"
                                                id="latitude"
                                                name="latitude"
                                                className="input-field"
                                                placeholder="37.7749"
                                                step="0.000001"
                                                value={incidentForm.latitude}
                                                onChange={handleFormChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="longitude">Longitude (Optional)</label>
                                            <input
                                                type="number"
                                                id="longitude"
                                                name="longitude"
                                                className="input-field"
                                                placeholder="-122.4194"
                                                step="0.000001"
                                                value={incidentForm.longitude}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label htmlFor="media">Upload Media (Optional)</label>
                                        <div className="media-upload">
                                            <input
                                                type="file"
                                                id="media"
                                                name="media"
                                                accept="image/*,video/*"
                                                onChange={handleMediaUpload}
                                                className="media-input"
                                            />
                                            <label htmlFor="media" className="media-upload-label">
                                                <span className="upload-icon">📷</span>
                                                <span>Click to upload photo or video</span>
                                            </label>
                                            {mediaPreview && (
                                                <div className="media-preview">
                                                    <img src={mediaPreview} alt="Preview" />
                                                    <button
                                                        type="button"
                                                        className="remove-media"
                                                        onClick={() => {
                                                            setMediaPreview(null);
                                                            setIncidentForm(prev => ({ ...prev, media: null }));
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn btn-secondary" onClick={() => {
                                            setIncidentForm({
                                                type: '',
                                                description: '',
                                                location: '',
                                                latitude: '',
                                                longitude: '',
                                                media: null
                                            });
                                            setMediaPreview(null);
                                        }}>
                                            Clear Form
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Submit Incident Report
                                        </button>
                                    </div>
                                </form>

                                <div className="report-info">
                                    <div className="info-card">
                                        <span className="info-icon">ℹ️</span>
                                        <div>
                                            <h4>Important Information</h4>
                                            <ul>
                                                <li>All reports are timestamped and uniquely identifiable</li>
                                                <li>False reports may result in account suspension</li>
                                                <li>Your report will be visible to emergency responders immediately</li>
                                                <li>Include as much detail as possible for faster response</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Map View Tab */}
                    {activeTab === 'map' && (
                        <div className="map-section fade-in-up">
                            <div className="map-container glass-card">
                                <div className="map-header">
                                    <h2>🗺️ Incident Map View</h2>
                                    <p>Visualize all incidents by location and severity</p>
                                </div>
                                <IncidentMap
                                    incidents={filteredIncidents}
                                    searchRadius={filters.searchRadius}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default CitizenDashboard;
