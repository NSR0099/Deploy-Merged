import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Incident, IncidentType } from '@/types/emergency';
import { Map, Layers, Navigation, Circle, AlertTriangle } from 'lucide-react';

interface IncidentMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
}

const INCIDENT_COLORS: Record<IncidentType, string> = {
  ACCIDENT: '#f59e0b',
  MEDICAL: '#3b82f6',
  FIRE: '#ef4444',
  INFRASTRUCTURE: '#8b5cf6',
  CRIME: '#ec4899',
};

const SEVERITY_SIZES: Record<string, number> = {
  LOW: 20,
  MEDIUM: 25,
  HIGH: 30,
  CRITICAL: 35,
};

const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const proximityCircleRef = useRef<string | null>(null);

  const [mapboxToken, setMapboxToken] = useState(() => 
    localStorage.getItem('mapbox_token') || ''
  );
  const [isTokenSet, setIsTokenSet] = useState(() => 
    !!localStorage.getItem('mapbox_token')
  );
  const [showTraffic, setShowTraffic] = useState(false);
  const [showProximity, setShowProximity] = useState(true);
  const [proximityRadius, setProximityRadius] = useState(5); // km

  const saveToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken.trim());
      setIsTokenSet(true);
    }
  };

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  }, []);

  const addProximityCircle = useCallback((center: [number, number], radiusKm: number) => {
    if (!map.current) return;

    // Remove existing circle
    if (proximityCircleRef.current) {
      if (map.current.getLayer(proximityCircleRef.current)) {
        map.current.removeLayer(proximityCircleRef.current);
      }
      if (map.current.getSource(proximityCircleRef.current)) {
        map.current.removeSource(proximityCircleRef.current);
      }
    }

    const circleId = `proximity-circle-${Date.now()}`;
    proximityCircleRef.current = circleId;

    // Create circle polygon
    const points = 64;
    const coordinates: [number, number][] = [];
    const distanceX = radiusKm / (111.320 * Math.cos((center[1] * Math.PI) / 180));
    const distanceY = radiusKm / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = center[0] + distanceX * Math.cos(theta);
      const y = center[1] + distanceY * Math.sin(theta);
      coordinates.push([x, y]);
    }
    coordinates.push(coordinates[0]); // Close the circle

    map.current.addSource(circleId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      },
    });

    map.current.addLayer({
      id: circleId,
      type: 'fill',
      source: circleId,
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.15,
      },
    });

    // Add circle outline
    map.current.addLayer({
      id: `${circleId}-outline`,
      type: 'line',
      source: circleId,
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-dasharray': [2, 2],
      },
    });
  }, []);

  const addMarkers = useCallback(() => {
    if (!map.current) return;

    clearMarkers();

    incidents.forEach(incident => {
      const el = document.createElement('div');
      el.className = 'incident-marker';
      el.style.cssText = `
        width: ${SEVERITY_SIZES[incident.severity]}px;
        height: ${SEVERITY_SIZES[incident.severity]}px;
        background-color: ${INCIDENT_COLORS[incident.type]};
        border: 3px solid ${incident.severity === 'CRITICAL' ? '#fff' : 'rgba(255,255,255,0.5)'};
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s, box-shadow 0.2s;
        ${incident.severity === 'CRITICAL' ? 'animation: pulse 1.5s infinite;' : ''}
      `;

      // Add pulse animation for critical incidents
      if (incident.severity === 'CRITICAL') {
        el.style.animation = 'pulse 1.5s infinite';
      }

      // Highlight selected incident
      if (selectedIncident?.id === incident.id) {
        el.style.transform = 'scale(1.3)';
        el.style.boxShadow = '0 0 20px rgba(255,255,255,0.5)';
      }

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });

      el.addEventListener('mouseleave', () => {
        if (selectedIncident?.id !== incident.id) {
          el.style.transform = 'scale(1)';
        }
      });

      el.addEventListener('click', () => {
        onSelectIncident(incident);
      });

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="color: #1a1a2e; padding: 8px; max-width: 200px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${incident.title}</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${incident.location.area}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="
                background: ${INCIDENT_COLORS[incident.type]};
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 500;
              ">${incident.type}</span>
              <span style="
                background: ${incident.severity === 'CRITICAL' ? '#dc2626' : incident.severity === 'HIGH' ? '#ea580c' : '#6b7280'};
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 500;
              ">${incident.severity}</span>
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([incident.location.lng, incident.location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [incidents, selectedIncident, onSelectIncident, clearMarkers]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [77.5946, 12.9716], // Default to Bangalore
        zoom: 11,
        pitch: 30,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      map.current.addControl(
        new mapboxgl.FullscreenControl(),
        'top-right'
      );

      map.current.on('load', () => {
        addMarkers();
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setIsTokenSet(false);
      localStorage.removeItem('mapbox_token');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isTokenSet, mapboxToken]);

  // Update markers when incidents change
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      addMarkers();
    }
  }, [incidents, selectedIncident, addMarkers]);

  // Handle traffic layer
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;

    if (showTraffic) {
      if (!map.current.getSource('mapbox-traffic')) {
        map.current.addSource('mapbox-traffic', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1',
        });

        map.current.addLayer({
          id: 'traffic-layer',
          type: 'line',
          source: 'mapbox-traffic',
          'source-layer': 'traffic',
          paint: {
            'line-width': 2,
            'line-color': [
              'match',
              ['get', 'congestion'],
              'low', '#22c55e',
              'moderate', '#f59e0b',
              'heavy', '#ef4444',
              'severe', '#7f1d1d',
              '#6b7280'
            ],
          },
        });
      }
    } else {
      if (map.current.getLayer('traffic-layer')) {
        map.current.removeLayer('traffic-layer');
      }
      if (map.current.getSource('mapbox-traffic')) {
        map.current.removeSource('mapbox-traffic');
      }
    }
  }, [showTraffic]);

  // Handle proximity circle for selected incident
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;

    if (selectedIncident && showProximity) {
      addProximityCircle(
        [selectedIncident.location.lng, selectedIncident.location.lat],
        proximityRadius
      );

      // Fly to incident
      map.current.flyTo({
        center: [selectedIncident.location.lng, selectedIncident.location.lat],
        zoom: 13,
        duration: 1000,
      });
    }
  }, [selectedIncident, showProximity, proximityRadius, addProximityCircle]);

  if (!isTokenSet) {
    return (
      <Card className="bg-card border-border h-[400px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Incident Map
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px] gap-4">
          <AlertTriangle className="h-12 w-12 text-status-warning" />
          <p className="text-muted-foreground text-center max-w-md">
            Enter your Mapbox public token to enable the interactive map.
            Get one at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
          </p>
          <div className="flex gap-2 w-full max-w-md">
            <Input
              type="text"
              placeholder="pk.eyJ1..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="bg-background"
            />
            <Button onClick={saveToken} disabled={!mapboxToken.trim()}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Live Incident Map
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* Traffic Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="traffic"
                checked={showTraffic}
                onCheckedChange={setShowTraffic}
              />
              <Label htmlFor="traffic" className="text-xs text-muted-foreground flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Traffic
              </Label>
            </div>

            {/* Proximity Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="proximity"
                checked={showProximity}
                onCheckedChange={setShowProximity}
              />
              <Label htmlFor="proximity" className="text-xs text-muted-foreground flex items-center gap-1">
                <Circle className="h-3 w-3" />
                {proximityRadius}km Radius
              </Label>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {Object.entries(INCIDENT_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground capitalize">
                {type.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={mapContainer}
          className="h-[400px] rounded-b-lg overflow-hidden"
        />
      </CardContent>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </Card>
  );
};

export default IncidentMap;
