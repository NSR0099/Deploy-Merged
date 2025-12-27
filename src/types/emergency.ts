export type UserRole = 'ADMIN' | 'RESPONDER' | 'USER';

export type IncidentType = 'ACCIDENT' | 'MEDICAL' | 'FIRE' | 'INFRASTRUCTURE' | 'CRIME';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'UNVERIFIED' | 'VERIFIED' | 'DUPLICATE' | 'FALSE' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';

export type Department = 'POLICE' | 'AMBULANCE' | 'FIRE_DEPARTMENT' | 'INFRASTRUCTURE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  area: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: Location;
  reporterId: string;
  reporterAnonymous: boolean;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  assignedDepartment?: Department;
  assignedResponder?: string;
  duplicateOf?: string;
  media: string[];
  priority: number;
}

export interface AdminNote {
  id: string;
  incidentId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  incidentId?: string;
  action: string;
  details: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'CRITICAL_INCIDENT' | 'DUPLICATE_DETECTED' | 'UNVERIFIED_THRESHOLD' | 'SYSTEM';
  title: string;
  message: string;
  incidentId?: string;
  read: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalActive: number;
  unverified: number;
  verifiedInProgress: number;
  resolvedToday: number;
}
