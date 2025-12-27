import React from 'react';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceIndicatorProps {
  isHighLoad?: boolean;
  reportingRate?: number;
}

const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  isHighLoad = false,
  reportingRate = 12,
}) => {
  return (
    <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
      <div className="flex items-center gap-2">
        <Activity className={cn(
          "w-4 h-4",
          isHighLoad ? "text-severity-high" : "text-status-online"
        )} />
        <span className="text-xs font-medium text-foreground">
          {reportingRate} reports/min
        </span>
      </div>

      {isHighLoad && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-severity-high/10 border border-severity-high/20">
          <AlertTriangle className="w-3.5 h-3.5 text-severity-high" />
          <span className="text-xs font-medium text-severity-high">Peak Load</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-muted-foreground">
        <TrendingUp className="w-3.5 h-3.5" />
        <span className="text-xs">+15% vs avg</span>
      </div>
    </div>
  );
};

export default PerformanceIndicator;
