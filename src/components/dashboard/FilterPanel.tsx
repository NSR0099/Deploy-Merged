import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { IncidentType, IncidentStatus, IncidentSeverity } from '@/types/emergency';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: IncidentType | 'ALL';
  onTypeChange: (type: IncidentType | 'ALL') => void;
  statusFilter: IncidentStatus | 'ALL';
  onStatusChange: (status: IncidentStatus | 'ALL') => void;
  severityFilter: IncidentSeverity | 'ALL';
  onSeverityChange: (severity: IncidentSeverity | 'ALL') => void;
  timeFilter: string;
  onTimeChange: (time: string) => void;
}

const incidentTypes: { value: IncidentType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'ACCIDENT', label: 'Accident' },
  { value: 'MEDICAL', label: 'Medical' },
  { value: 'FIRE', label: 'Fire' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'CRIME', label: 'Crime' },
];

const statusOptions: { value: IncidentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'UNVERIFIED', label: 'Unverified' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'DUPLICATE', label: 'Duplicate' },
  { value: 'FALSE', label: 'False' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
];

const severityOptions: { value: IncidentSeverity | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Severity' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const timeOptions = [
  { value: 'ALL', label: 'All Time' },
  { value: '15m', label: 'Last 15 min' },
  { value: '1h', label: 'Last 1 hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '24h', label: 'Last 24 hours' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  severityFilter,
  onSeverityChange,
  timeFilter,
  onTimeChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [radiusKm, setRadiusKm] = useState([10]);

  const activeFilters = [
    typeFilter !== 'ALL' && typeFilter,
    statusFilter !== 'ALL' && statusFilter,
    severityFilter !== 'ALL' && severityFilter,
    timeFilter !== 'ALL' && timeFilter,
  ].filter(Boolean);

  const clearFilters = () => {
    onTypeChange('ALL');
    onStatusChange('ALL');
    onSeverityChange('ALL');
    onTimeChange('ALL');
    onSearchChange('');
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, keywords, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-secondary/50 border-border"
          />
        </div>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                isExpanded && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* Filter Options */}
      <Collapsible open={isExpanded}>
        <CollapsibleContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4 border-t border-border">
            {/* Type Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Incident Type
              </label>
              <Select value={typeFilter} onValueChange={(v) => onTypeChange(v as IncidentType | 'ALL')}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Status
              </label>
              <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as IncidentStatus | 'ALL')}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Severity
              </label>
              <Select value={severityFilter} onValueChange={(v) => onSeverityChange(v as IncidentSeverity | 'ALL')}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((sev) => (
                    <SelectItem key={sev.value} value={sev.value}>
                      {sev.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Time Range
              </label>
              <Select value={timeFilter} onValueChange={onTimeChange}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Radius Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Radius: {radiusKm[0]}km
              </label>
              <Slider
                value={radiusKm}
                onValueChange={setRadiusKm}
                min={1}
                max={20}
                step={1}
                className="mt-3"
              />
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">Active:</span>
              {typeFilter !== 'ALL' && (
                <Badge variant="outline" className="gap-1">
                  {typeFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onTypeChange('ALL')} />
                </Badge>
              )}
              {statusFilter !== 'ALL' && (
                <Badge variant="outline" className="gap-1">
                  {statusFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onStatusChange('ALL')} />
                </Badge>
              )}
              {severityFilter !== 'ALL' && (
                <Badge variant="outline" className="gap-1">
                  {severityFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onSeverityChange('ALL')} />
                </Badge>
              )}
              {timeFilter !== 'ALL' && (
                <Badge variant="outline" className="gap-1">
                  {timeFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onTimeChange('ALL')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs ml-auto">
                Clear all
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FilterPanel;
