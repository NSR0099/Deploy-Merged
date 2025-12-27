import React from 'react';
import { CheckCircle, XCircle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmergency } from '@/contexts/EmergencyContext';
import { toast } from 'sonner';

interface BulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({ selectedIds, onClearSelection }) => {
  const { verifyIncident, markAsFalse } = useEmergency();

  if (selectedIds.length === 0) return null;

  const handleBulkVerify = () => {
    selectedIds.forEach(id => verifyIncident(id));
    toast.success(`${selectedIds.length} incidents verified`);
    onClearSelection();
  };

  const handleBulkMarkFalse = () => {
    selectedIds.forEach(id => markAsFalse(id, 'Bulk action'));
    toast.success(`${selectedIds.length} incidents marked as false`);
    onClearSelection();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/95 backdrop-blur-xl border border-border shadow-lg">
        <div className="flex items-center gap-2 pr-3 border-r border-border">
          <span className="text-sm font-medium text-foreground">{selectedIds.length} selected</span>
          <Button variant="ghost" size="icon" className="w-6 h-6" onClick={onClearSelection}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="success" size="sm" onClick={handleBulkVerify} className="gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Verify All
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkMarkFalse} className="gap-1.5">
            <XCircle className="w-4 h-4" />
            Mark False
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
            Close All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;
