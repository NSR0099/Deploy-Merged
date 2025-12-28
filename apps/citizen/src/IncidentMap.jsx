import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './IncidentMap.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on severity
const createCustomIcon = (severity, type) => {
    const colors = {
        critical: '#dc2626',
        high: '#f97316',
        medium: '#fbbf24',
        low: '#10b981'
    };

    const icons = {
        road_accident: '🚗',
        medical_emergency: '🚑',
        infrastructure_failure: '🔧',
        public_safety: '⚠️',
        fire: '🔥',
        flood: '🌊',
        other: '📍'
    };

    const color = colors[severity] || colors.medium;
    const emoji = icons[type] || '📍';

    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: ${color};
                width: 36px;
                height: 36px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <span style="
                    transform: rotate(45deg);
                    font-size: 18px;
                ">${emoji}</span>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });
};

// Component to handle map view updates
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const IncidentMap = ({ incidents, searchRadius }) => {
    const [center, setCenter] = useState([37.7749, -122.4194]); // Default
    const [hasLocation, setHasLocation] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newCenter = [position.coords.latitude, position.coords.longitude];
                    setCenter(newCenter);
                    setHasLocation(true);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

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

    const getTimeAgo = (timestamp) => {
        const now = Date.now();
        const incTime = new Date(timestamp).getTime();
        const diff = now - incTime;

        if (diff < 60000) return 'Just now';
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(diff / 3600000);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    };

    const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div style="font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🔵</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    return (
        <div className="map-wrapper">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '600px', width: '100%', borderRadius: '12px' }}
                scrollWheelZoom={true}
            >
                <MapController center={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Search radius circle follows user/center */}
                <Circle
                    center={center}
                    radius={searchRadius * 1000}
                    pathOptions={{
                        color: '#3b82f6',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.1,
                        weight: 2,
                        dashArray: '5, 5'
                    }}
                />

                {/* User Location Marker */}
                {hasLocation && (
                    <Marker position={center} icon={userIcon}>
                        <Popup>
                            <strong>You are here</strong>
                        </Popup>
                    </Marker>
                )}

                {/* Incident markers */}
                {incidents.map((incident) => (
                    <Marker
                        key={incident.id}
                        position={[incident.latitude, incident.longitude]}
                        icon={createCustomIcon(incident.severity, incident.type)}
                    >
                        <Popup className="incident-popup">
                            <div className="popup-content">
                                <div className="popup-header">
                                    <h3 className="popup-title">
                                        {getIncidentTypeLabel(incident.type)}
                                    </h3>
                                    <span className={`popup-badge badge-${incident.severity}`}>
                                        {incident.severity}
                                    </span>
                                </div>

                                <div className="popup-id">#{incident.id}</div>

                                <p className="popup-description">{incident.description}</p>

                                <div className="popup-meta">
                                    <div className="popup-meta-item">
                                        <span className="meta-icon">📍</span>
                                        <span>{incident.location}</span>
                                    </div>
                                    <div className="popup-meta-item">
                                        <span className="meta-icon">🕒</span>
                                        <span>{getTimeAgo(incident.timestamp)}</span>
                                    </div>
                                    <div className="popup-meta-item">
                                        <span className="meta-icon">👤</span>
                                        <span>{incident.reportedBy} ({incident.reporterEmail})</span>
                                    </div>
                                </div>

                                <div className="popup-footer">
                                    <div className="popup-status">
                                        <span className={`status-dot status-${incident.status}`}></span>
                                        <span>{incident.status}</span>
                                    </div>
                                    {incident.verified && (
                                        <span className="popup-verified">✓ Verified</span>
                                    )}
                                    <div className="popup-upvotes">
                                        <span>👍</span>
                                        <span>{incident.upvotes}</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <div className="map-legend">
                <h4>Severity Levels</h4>
                <div className="legend-items">
                    <div className="legend-item">
                        <div className="legend-color" style={{ background: '#dc2626' }}></div>
                        <span>Critical</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{ background: '#f97316' }}></div>
                        <span>High</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{ background: '#fbbf24' }}></div>
                        <span>Medium</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{ background: '#10b981' }}></div>
                        <span>Low</span>
                    </div>
                    <div className="legend-item">
                        <div style={{ fontSize: '18px', marginRight: '8px' }}>🔵</div>
                        <span>You</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncidentMap;
