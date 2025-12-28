import React, { useState, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergency } from '@/contexts/EmergencyContext';
import TopNavbar from '@/components/layout/TopNavbar';
import CriticalAlertBanner from '@/components/layout/CriticalAlertBanner';
import DashboardStats from '@/components/dashboard/DashboardStats';
import FilterPanel from '@/components/dashboard/FilterPanel';
import IncidentTable from '@/components/dashboard/IncidentTable';
import IncidentDetailPanel from '@/components/dashboard/IncidentDetailPanel';
import ActivityLogPanel from '@/components/dashboard/ActivityLogPanel';
import BulkActionsBar from '@/components/dashboard/BulkActionsBar';
import PerformanceIndicator from '@/components/dashboard/PerformanceIndicator';
import IncidentMap from '@/components/dashboard/IncidentMap';
import { IncidentType, IncidentStatus, IncidentSeverity } from '@/types/emergency';

const Dashboard: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const { incidents, selectedIncident, setSelectedIncident, verifyIncident } = useEmergency();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<IncidentType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'ALL'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'ALL'>('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Banner height state
  const [bannerHeight, setBannerHeight] = useState(0);

  const handleBannerHeightChange = useCallback((height: number) => {
    setBannerHeight(height);
  }, []);

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check role
  if (!hasRole(['ADMIN', 'RESPONDER'])) {
    return <Navigate to="/" replace />;
  }

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          incident.id.toLowerCase().includes(query) ||
          incident.title.toLowerCase().includes(query) ||
          incident.description.toLowerCase().includes(query) ||
          incident.location.area.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== 'ALL' && incident.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL' && incident.status !== statusFilter) return false;

      // Severity filter
      if (severityFilter !== 'ALL' && incident.severity !== severityFilter) return false;

      // Time filter
      if (timeFilter !== 'ALL') {
        const now = new Date();
        const incidentTime = incident.createdAt;
        const diffMs = now.getTime() - incidentTime.getTime();
        const diffMins = diffMs / (1000 * 60);

        switch (timeFilter) {
          case '15m':
            if (diffMins > 15) return false;
            break;
          case '1h':
            if (diffMins > 60) return false;
            break;
          case '6h':
            if (diffMins > 360) return false;
            break;
          case '24h':
            if (diffMins > 1440) return false;
            break;
        }
      }

      return true;
    });
  }, [incidents, searchQuery, typeFilter, statusFilter, severityFilter, timeFilter]);

  return (
    <div className="min-h-screen bg-muted/30">
      <TopNavbar />
      
      {/* Critical Alert Banner - positioned below navbar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-background">
        <CriticalAlertBanner onHeightChange={handleBannerHeightChange} />
      </div>

      <main 
        className="transition-all duration-300 pb-16"
        style={{ paddingTop: `${64 + bannerHeight}px` }}
      >
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Incident Dashboard</h1>
                <p className="text-muted-foreground">
                  {filteredIncidents.length} incidents • Last updated: just now
                </p>
              </div>
              <PerformanceIndicator />
            </div>

            {/* Stats Cards */}
            <DashboardStats />

            {/* Filters */}
            <FilterPanel
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              severityFilter={severityFilter}
              onSeverityChange={setSeverityFilter}
              timeFilter={timeFilter}
              onTimeChange={setTimeFilter}
            />

            {/* Map */}
            <div className="mb-6">
              <IncidentMap
                incidents={filteredIncidents}
                selectedIncident={selectedIncident}
                onSelectIncident={setSelectedIncident}
              />
            </div>

            {/* Incident Table */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <IncidentTable
                  incidents={filteredIncidents}
                  selectedIds={selectedIds}
                  onSelectIds={setSelectedIds}
                  onViewIncident={setSelectedIncident}
                  onVerifyIncident={verifyIncident}
                />
              </div>

              {/* Activity Log */}
              <div className="xl:col-span-1">
                <ActivityLogPanel />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Incident Detail Panel */}
      {selectedIncident && (
        <IncidentDetailPanel 
          incident={selectedIncident} 
          onClose={() => setSelectedIncident(null)} 
        />
      )}

      {/* Bulk Actions */}
      <BulkActionsBar 
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 px-6 py-3 bg-card/95 backdrop-blur border-t border-border text-xs text-muted-foreground flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <span>Emergency Response System v2.0</span>
          <span>•</span>
          <span className="text-status-online">API: Healthy</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
          <span>•</span>
          <a href="#" className="hover:text-foreground transition-colors">Debug Mode</a>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;