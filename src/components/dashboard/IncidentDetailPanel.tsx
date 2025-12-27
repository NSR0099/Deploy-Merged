import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  User, 
  ThumbsUp, 
  CheckCircle, 
  XCircle, 
  Copy,
  MessageSquare,
  Send,
  Image as ImageIcon,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Incident, IncidentStatus, IncidentSeverity, Department } from '@/types/emergency';
import { useEmergency } from '@/contexts/EmergencyContext';
import { getTimeAgo } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface IncidentDetailPanelProps {
  incident: Incident;
  onClose: () => void;
}

const severityOptions: IncidentSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statusOptions: IncidentStatus[] = ['UNVERIFIED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
const departmentOptions: { value: Department; label: string }[] = [
  { value: 'POLICE', label: 'Police' },
  { value: 'AMBULANCE', label: 'Ambulance' },
  { value: 'FIRE_DEPARTMENT', label: 'Fire Department' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
];

const IncidentDetailPanel: React.FC<IncidentDetailPanelProps> = ({ incident, onClose }) => {
  const { 
    updateIncidentStatus, 
    updateIncidentSeverity, 
    verifyIncident, 
    markAsFalse,
    markAsDuplicate,
    addAdminNote,
    adminNotes,
    incidents,
  } = useEmergency();

  const [showConfirmDialog, setShowConfirmDialog] = useState<'verify' | 'false' | 'duplicate' | null>(null);
  const [newNote, setNewNote] = useState('');
  const [falseReason, setFalseReason] = useState('');
  const [duplicateId, setDuplicateId] = useState('');

  const incidentNotes = adminNotes.filter(n => n.incidentId === incident.id);

  const handleVerify = () => {
    verifyIncident(incident.id);
    setShowConfirmDialog(null);
    toast.success('Incident verified', { description: `${incident.id} has been verified` });
  };

  const handleMarkFalse = () => {
    markAsFalse(incident.id, falseReason);
    setShowConfirmDialog(null);
    toast.success('Marked as false report', { description: `${incident.id} has been removed from feed` });
  };

  const handleMarkDuplicate = () => {
    markAsDuplicate(incident.id, duplicateId);
    setShowConfirmDialog(null);
    toast.success('Marked as duplicate', { description: `${incident.id} merged with ${duplicateId}` });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addAdminNote(incident.id, newNote);
    setNewNote('');
    toast.success('Note added');
  };

  const handleStatusChange = (status: IncidentStatus) => {
    updateIncidentStatus(incident.id, status);
    toast.success('Status updated', { description: `Changed to ${status}` });
  };

  const handleSeverityChange = (severity: IncidentSeverity) => {
    updateIncidentSeverity(incident.id, severity);
    toast.success('Severity updated', { description: `Changed to ${severity}` });
  };

  return (
    <>
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-card border-l border-border shadow-2xl z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-muted-foreground">{incident.id}</span>
              <Badge variant={incident.severity === 'CRITICAL' ? 'critical' : incident.severity === 'HIGH' ? 'high' : incident.severity === 'MEDIUM' ? 'medium' : 'low'}>
                {incident.severity}
              </Badge>
            </div>
            <h2 className="text-lg font-semibold text-foreground truncate">{incident.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                Details
              </TabsTrigger>
              <TabsTrigger value="location" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                Location
              </TabsTrigger>
              <TabsTrigger value="media" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                Media ({incident.media.length})
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                Notes ({incidentNotes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-4 space-y-6 mt-0">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-foreground">{incident.description}</p>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Reported</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{getTimeAgo(incident.createdAt)}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs">Upvotes</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{incident.upvotes}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs">Reporter</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {incident.reporterAnonymous ? 'Anonymous' : incident.reporterId}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs">Area</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{incident.location.area}</p>
                </div>
              </div>

              {/* Status & Severity Controls */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
                  <Select value={incident.status} onValueChange={(v) => handleStatusChange(v as IncidentStatus)}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Severity Override</label>
                  <Select value={incident.severity} onValueChange={(v) => handleSeverityChange(v as IncidentSeverity)}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map((sev) => (
                        <SelectItem key={sev} value={sev}>
                          {sev}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Assign Department</label>
                  <Select value={incident.assignedDepartment || ''}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="p-4 mt-0">
              {/* Map Placeholder */}
              <div className="aspect-video rounded-lg bg-secondary/50 border border-border flex items-center justify-center mb-4">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Interactive Map</p>
                  <p className="text-xs text-muted-foreground/60">Connect Mapbox for live view</p>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Address</p>
                  <p className="text-sm font-medium text-foreground">{incident.location.address}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Coordinates</p>
                  <p className="text-sm font-mono text-foreground">
                    {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                  </p>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open in Google Maps
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="media" className="p-4 mt-0">
              {incident.media.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No media attached</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {incident.media.map((url, index) => (
                    <div key={index} className="aspect-video rounded-lg bg-secondary/50 border border-border overflow-hidden">
                      <img src={url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="p-4 mt-0 space-y-4">
              {/* Add Note */}
              <div className="space-y-2">
                <Textarea 
                  placeholder="Add internal note (visible to admins only)..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-secondary/50 border-border resize-none"
                  rows={3}
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()} className="gap-2">
                  <Send className="w-4 h-4" />
                  Add Note
                </Button>
              </div>

              {/* Notes List */}
              <div className="space-y-3 pt-4 border-t border-border">
                {incidentNotes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No notes yet</p>
                ) : (
                  incidentNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-sm text-foreground">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{note.authorName}</span>
                        <span>•</span>
                        <span>{getTimeAgo(note.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            {incident.status === 'UNVERIFIED' && (
              <>
                <Button 
                  variant="success" 
                  className="flex-1 gap-2"
                  onClick={() => setShowConfirmDialog('verify')}
                >
                  <CheckCircle className="w-4 h-4" />
                  Verify
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 gap-2"
                  onClick={() => setShowConfirmDialog('false')}
                >
                  <XCircle className="w-4 h-4" />
                  False Report
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowConfirmDialog('duplicate')}
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </Button>
              </>
            )}
            {incident.status !== 'UNVERIFIED' && (
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showConfirmDialog === 'verify'} onOpenChange={() => setShowConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-status-online" />
              Verify Incident
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the incident as verified and lock it from deletion. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVerify} className="bg-status-online text-primary-foreground hover:bg-status-online/90">
              Confirm Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmDialog === 'false'} onOpenChange={() => setShowConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Mark as False Report
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the incident from the public feed. Please provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea 
            placeholder="Reason for marking as false..."
            value={falseReason}
            onChange={(e) => setFalseReason(e.target.value)}
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkFalse} disabled={!falseReason.trim()}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmDialog === 'duplicate'} onOpenChange={() => setShowConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-incident-police" />
              Mark as Duplicate
            </AlertDialogTitle>
            <AlertDialogDescription>
              Select the original incident to merge upvotes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select value={duplicateId} onValueChange={setDuplicateId}>
            <SelectTrigger>
              <SelectValue placeholder="Select original incident" />
            </SelectTrigger>
            <SelectContent>
              {incidents
                .filter(i => i.id !== incident.id && i.status !== 'DUPLICATE' && i.status !== 'FALSE')
                .map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.id} - {i.title.slice(0, 30)}...
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkDuplicate} disabled={!duplicateId}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default IncidentDetailPanel;
