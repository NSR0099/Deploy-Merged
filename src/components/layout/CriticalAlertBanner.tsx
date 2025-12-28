import React from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmergency } from '@/contexts/EmergencyContext';
import { cn } from '@/lib/utils';

interface CriticalAlertBannerProps {
  onHeightChange?: (height: number) => void;
}

const CriticalAlertBanner: React.FC<CriticalAlertBannerProps> = ({ onHeightChange }) => {
  const { incidents, setSelectedIncident } = useEmergency();
  const [dismissed, setDismissed] = React.useState<string[]>([]);
  const bannerRef = React.useRef<HTMLDivElement>(null);

  const criticalIncidents = incidents.filter(
    inc => inc.severity === 'CRITICAL' && 
           inc.status !== 'RESOLVED' && 
           inc.status !== 'FALSE' &&
           !dismissed.includes(inc.id)
  );

  React.useEffect(() => {
    if (onHeightChange) {
      const height = bannerRef.current?.offsetHeight || 0;
      onHeightChange(height);
    }
  }, [criticalIncidents.length, onHeightChange]);

  if (criticalIncidents.length === 0) {
    React.useEffect(() => {
      if (onHeightChange) {
        onHeightChange(0);
      }
    }, [onHeightChange]);
    return null;
  }

  return (
    <div ref={bannerRef} className="w-full">
      {criticalIncidents.slice(0, 2).map((incident, index) => (
        <div
          key={incident.id}
          className={cn(
            "critical-flash border-b border-severity-critical/30",
            "px-6 py-3 flex items-center justify-between gap-4"
          )}
          style={{ animationDelay: `${index * 0.5}s` }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-severity-critical animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wide text-severity-critical">
                Critical Alert
              </span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-severity-critical/30" />
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
              <span className="font-medium text-foreground">{incident.title}</span>
              <span className="text-sm text-muted-foreground hidden md:inline">
                — {incident.location.area}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="critical"
              size="sm"
              onClick={() => setSelectedIncident(incident)}
              className="gap-1"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={() => setDismissed(prev => [...prev, incident.id])}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CriticalAlertBanner;