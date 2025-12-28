import React from 'react';
import { 
  Flame, 
  Stethoscope, 
  Car, 
  Building2, 
  ShieldAlert,
  MapPin,
  ThumbsUp,
  Clock,
  Eye,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Incident, IncidentType, IncidentSeverity, IncidentStatus } from '@/types/emergency';
import { getTimeAgo } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface IncidentTableProps {
  incidents: Incident[];
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onViewIncident: (incident: Incident) => void;
  onVerifyIncident: (id: string) => void;
}

const typeIcons: Record<IncidentType, React.ReactNode> = {
  FIRE: <Flame className="w-4 h-4" />,
  MEDICAL: <Stethoscope className="w-4 h-4" />,
  ACCIDENT: <Car className="w-4 h-4" />,
  INFRASTRUCTURE: <Building2 className="w-4 h-4" />,
  CRIME: <ShieldAlert className="w-4 h-4" />,
};

const typeColors: Record<IncidentType, string> = {
  FIRE: 'text-incident-fire',
  MEDICAL: 'text-incident-medical',
  ACCIDENT: 'text-incident-accident',
  INFRASTRUCTURE: 'text-incident-infrastructure',
  CRIME: 'text-incident-police',
};

const severityVariants: Record<IncidentSeverity, 'critical' | 'high' | 'medium' | 'low'> = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

const statusVariants: Record<IncidentStatus, 'unverified' | 'verified' | 'inProgress' | 'resolved' | 'duplicate' | 'falseReport'> = {
  UNVERIFIED: 'unverified',
  VERIFIED: 'verified',
  ASSIGNED: 'verified',
  IN_PROGRESS: 'inProgress',
  RESOLVED: 'resolved',
  DUPLICATE: 'duplicate',
  FALSE: 'falseReport',
};

const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  selectedIds,
  onSelectIds,
  onViewIncident,
  onVerifyIncident,
}) => {
  const toggleSelectAll = () => {
    if (selectedIds.length === incidents.length) {
      onSelectIds([]);
    } else {
      onSelectIds(incidents.map(i => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter(i => i !== id));
    } else {
      onSelectIds([...selectedIds, id]);
    }
  };

  // Sort incidents by priority (smart sorting)
  const sortedIncidents = [...incidents].sort((a, b) => {
    // Critical first
    if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
    if (b.severity === 'CRITICAL' && a.severity !== 'CRITICAL') return 1;
    
    // Then by priority score
    if (a.priority !== b.priority) return b.priority - a.priority;
    
    // Then by upvotes
    if (a.upvotes !== b.upvotes) return b.upvotes - a.upvotes;
    
    // Then by time (oldest first for unresolved)
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  if (incidents.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No Incidents Found</h3>
        <p className="text-muted-foreground">No incidents match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[40px_100px_1fr_100px_130px_90px_70px_140px] gap-3 px-4 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <div className="flex items-center justify-center">
              <Checkbox 
                checked={selectedIds.length === incidents.length && incidents.length > 0}
                onCheckedChange={toggleSelectAll}
              />
            </div>
            <div>ID</div>
            <div>Incident</div>
            <div className="text-center">Severity</div>
            <div>Location</div>
            <div>Time</div>
            <div className="text-center">Votes</div>
            <div className="text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {sortedIncidents.map((incident) => (
              <div
                key={incident.id}
                className={cn(
                  "grid grid-cols-[40px_100px_1fr_100px_130px_90px_70px_140px] gap-3 px-4 py-3 items-center hover:bg-accent/30 transition-colors",
                  incident.severity === 'CRITICAL' && incident.status !== 'RESOLVED' && "bg-severity-critical/5",
                  selectedIds.includes(incident.id) && "bg-primary/5"
                )}
              >
                {/* Checkbox */}
                <div className="flex items-center justify-center">
                  <Checkbox 
                    checked={selectedIds.includes(incident.id)}
                    onCheckedChange={() => toggleSelect(incident.id)}
                  />
                </div>

                {/* ID */}
                <div>
                  <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
                </div>

                {/* Incident Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    typeColors[incident.type],
                    "bg-current/10"
                  )}>
                    {typeIcons[incident.type]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{incident.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={statusVariants[incident.status]} className="text-[10px] h-5">
                        {incident.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">{incident.type.toLowerCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Severity */}
                <div className="flex justify-center">
                  <Badge variant={severityVariants[incident.severity]} className={cn(
                    incident.severity === 'CRITICAL' && "animate-pulse"
                  )}>
                    {incident.severity}
                  </Badge>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{incident.location.area}</span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{getTimeAgo(incident.createdAt)}</span>
                </div>

                {/* Upvotes */}
                <div className="flex items-center justify-center gap-1.5 text-sm">
                  <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{incident.upvotes}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewIncident(incident)}
                    className="gap-1 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Button>
                  {incident.status === 'UNVERIFIED' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => onVerifyIncident(incident.id)}
                      className="gap-1 text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentTable;