import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Incident, IncidentStatus, IncidentSeverity, ActivityLog, Notification, DashboardStats, AdminNote } from '@/types/emergency';
import { mockIncidents, mockActivityLogs, mockNotifications, mockAdminNotes, mockDashboardStats } from '@/data/mockData';

interface EmergencyContextType {
  incidents: Incident[];
  selectedIncident: Incident | null;
  activityLogs: ActivityLog[];
  notifications: Notification[];
  adminNotes: AdminNote[];
  dashboardStats: DashboardStats;
  isLiveUpdates: boolean;
  isSystemOnline: boolean;
  setSelectedIncident: (incident: Incident | null) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  updateIncidentSeverity: (id: string, severity: IncidentSeverity) => void;
  verifyIncident: (id: string) => void;
  markAsFalse: (id: string, reason: string) => void;
  markAsDuplicate: (id: string, originalId: string) => void;
  addAdminNote: (incidentId: string, content: string) => void;
  toggleLiveUpdates: () => void;
  markNotificationRead: (id: string) => void;
  getUnreadNotificationCount: () => number;
  refreshData: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>(mockAdminNotes);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(mockDashboardStats);
  const [isLiveUpdates, setIsLiveUpdates] = useState(true);
  const [isSystemOnline, setIsSystemOnline] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLiveUpdates) return;

    const interval = setInterval(() => {
      // Random upvote updates
      setIncidents(prev => prev.map(inc => ({
        ...inc,
        upvotes: inc.status !== 'RESOLVED' ? inc.upvotes + Math.floor(Math.random() * 2) : inc.upvotes,
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, [isLiveUpdates]);

  const addLog = useCallback((incidentId: string, action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      incidentId,
      action,
      details,
      userId: 'admin-001',
      userName: 'John Commander',
      timestamp: new Date(),
    };
    setActivityLogs(prev => [newLog, ...prev]);
  }, []);

  const updateIncidentStatus = useCallback((id: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, status, updatedAt: new Date() } : inc
    ));
    addLog(id, 'STATUS_CHANGED', `Status changed to ${status}`);
  }, [addLog]);

  const updateIncidentSeverity = useCallback((id: string, severity: IncidentSeverity) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, severity, updatedAt: new Date() } : inc
    ));
    addLog(id, 'SEVERITY_CHANGED', `Severity updated to ${severity}`);
  }, [addLog]);

  const verifyIncident = useCallback((id: string) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { 
        ...inc, 
        status: 'VERIFIED' as IncidentStatus, 
        verifiedAt: new Date(),
        verifiedBy: 'admin-001',
        updatedAt: new Date() 
      } : inc
    ));
    addLog(id, 'VERIFIED', 'Incident verified by admin');
  }, [addLog]);

  const markAsFalse = useCallback((id: string, reason: string) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, status: 'FALSE' as IncidentStatus, updatedAt: new Date() } : inc
    ));
    addLog(id, 'MARKED_FALSE', `Marked as false report: ${reason}`);
  }, [addLog]);

  const markAsDuplicate = useCallback((id: string, originalId: string) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { 
        ...inc, 
        status: 'DUPLICATE' as IncidentStatus, 
        duplicateOf: originalId,
        updatedAt: new Date() 
      } : inc
    ));
    addLog(id, 'MARKED_DUPLICATE', `Marked as duplicate of ${originalId}`);
  }, [addLog]);

  const addAdminNote = useCallback((incidentId: string, content: string) => {
    const newNote: AdminNote = {
      id: `note-${Date.now()}`,
      incidentId,
      content,
      authorId: 'admin-001',
      authorName: 'John Commander',
      createdAt: new Date(),
    };
    setAdminNotes(prev => [newNote, ...prev]);
    addLog(incidentId, 'NOTE_ADDED', 'Admin note added');
  }, [addLog]);

  const toggleLiveUpdates = useCallback(() => {
    setIsLiveUpdates(prev => !prev);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const getUnreadNotificationCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const refreshData = useCallback(() => {
    // In production, this would fetch fresh data from the backend
    setIncidents([...mockIncidents]);
    setActivityLogs([...mockActivityLogs]);
  }, []);

  // Update selected incident when incidents change
  useEffect(() => {
    if (selectedIncident) {
      const updated = incidents.find(i => i.id === selectedIncident.id);
      if (updated) {
        setSelectedIncident(updated);
      }
    }
  }, [incidents, selectedIncident]);

  return (
    <EmergencyContext.Provider value={{
      incidents,
      selectedIncident,
      activityLogs,
      notifications,
      adminNotes,
      dashboardStats,
      isLiveUpdates,
      isSystemOnline,
      setSelectedIncident,
      updateIncidentStatus,
      updateIncidentSeverity,
      verifyIncident,
      markAsFalse,
      markAsDuplicate,
      addAdminNote,
      toggleLiveUpdates,
      markNotificationRead,
      getUnreadNotificationCount,
      refreshData,
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
