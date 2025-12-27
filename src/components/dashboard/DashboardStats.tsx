import React from 'react';
import { AlertCircle, Clock, CheckCircle2, Shield } from 'lucide-react';
import { useEmergency } from '@/contexts/EmergencyContext';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'critical' | 'warning' | 'success' | 'info';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => {
  const colorClasses = {
    critical: 'border-severity-critical/30 bg-severity-critical/5 hover:bg-severity-critical/10',
    warning: 'border-severity-medium/30 bg-severity-medium/5 hover:bg-severity-medium/10',
    success: 'border-status-online/30 bg-status-online/5 hover:bg-status-online/10',
    info: 'border-primary/30 bg-primary/5 hover:bg-primary/10',
  };

  const iconColors = {
    critical: 'text-severity-critical',
    warning: 'text-severity-medium',
    success: 'text-status-online',
    info: 'text-primary',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 min-w-[160px] p-4 rounded-xl border transition-all duration-200",
        "flex items-center gap-4 text-left",
        colorClasses[color]
      )}
    >
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", `bg-${color}/10`)}>
        <div className={iconColors[color]}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </button>
  );
};

const DashboardStats: React.FC = () => {
  const { dashboardStats } = useEmergency();

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <StatCard
        title="Active Incidents"
        value={dashboardStats.totalActive}
        icon={<AlertCircle className="w-6 h-6" />}
        color="critical"
      />
      <StatCard
        title="Unverified"
        value={dashboardStats.unverified}
        icon={<Clock className="w-6 h-6" />}
        color="warning"
      />
      <StatCard
        title="In Progress"
        value={dashboardStats.verifiedInProgress}
        icon={<Shield className="w-6 h-6" />}
        color="info"
      />
      <StatCard
        title="Resolved Today"
        value={dashboardStats.resolvedToday}
        icon={<CheckCircle2 className="w-6 h-6" />}
        color="success"
      />
    </div>
  );
};

export default DashboardStats;
