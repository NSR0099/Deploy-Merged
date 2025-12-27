import React from 'react';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Copy, 
  AlertTriangle,
  ArrowRight,
  Plus,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEmergency } from '@/contexts/EmergencyContext';
import { getTimeAgo } from '@/data/mockData';
import { cn } from '@/lib/utils';

const actionIcons: Record<string, React.ReactNode> = {
  INCIDENT_CREATED: <Plus className="w-3.5 h-3.5" />,
  VERIFIED: <CheckCircle className="w-3.5 h-3.5" />,
  MARKED_FALSE: <XCircle className="w-3.5 h-3.5" />,
  MARKED_DUPLICATE: <Copy className="w-3.5 h-3.5" />,
  STATUS_CHANGED: <RefreshCw className="w-3.5 h-3.5" />,
  SEVERITY_CHANGED: <AlertTriangle className="w-3.5 h-3.5" />,
  ASSIGNED: <ArrowRight className="w-3.5 h-3.5" />,
  NOTE_ADDED: <MessageSquare className="w-3.5 h-3.5" />,
};

const actionColors: Record<string, string> = {
  INCIDENT_CREATED: 'text-primary bg-primary/10',
  VERIFIED: 'text-status-online bg-status-online/10',
  MARKED_FALSE: 'text-destructive bg-destructive/10',
  MARKED_DUPLICATE: 'text-incident-police bg-incident-police/10',
  STATUS_CHANGED: 'text-severity-medium bg-severity-medium/10',
  SEVERITY_CHANGED: 'text-severity-high bg-severity-high/10',
  ASSIGNED: 'text-primary bg-primary/10',
  NOTE_ADDED: 'text-muted-foreground bg-muted/50',
};

const ActivityLogPanel: React.FC = () => {
  const { activityLogs } = useEmergency();

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-foreground">Activity Log</h3>
        </div>
        <span className="text-xs text-muted-foreground">Real-time</span>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {activityLogs.map((log, index) => (
            <div
              key={log.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-accent/30",
                index === 0 && "animate-fade-in"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                actionColors[log.action] || 'text-muted-foreground bg-muted/50'
              )}>
                {actionIcons[log.action] || <Activity className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{log.details}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{log.userName}</span>
                  {log.incidentId && (
                    <>
                      <span>•</span>
                      <span className="font-mono">{log.incidentId}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{getTimeAgo(log.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ActivityLogPanel;
