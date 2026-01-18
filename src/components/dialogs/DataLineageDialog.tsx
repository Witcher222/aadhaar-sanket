import { FileText, CheckCircle, Clock, XCircle, Database, Server, Shield, Calendar, Download } from 'lucide-react';
import { DetailDialog, InfoItem, ActionButton } from './DetailDialog';
import { useToast } from '@/hooks/use-toast';

interface LineageItem {
  id: number;
  file: string;
  records: string;
  timestamp: string;
  status: string;
  error?: string;
}

interface DataLineageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: LineageItem | null;
}

export const DataLineageDialog = ({ open, onOpenChange, item }: DataLineageDialogProps) => {
  const { toast } = useToast();

  if (!item) return null;

  const getStatusIcon = () => {
    switch (item.status) {
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-warning animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusDetails = () => {
    switch (item.status) {
      case 'validated':
        return {
          color: 'text-success',
          bg: 'bg-success/10',
          message: 'Data has been validated and integrated into the system',
          steps: [
            { label: 'File Upload', status: 'complete' },
            { label: 'Schema Validation', status: 'complete' },
            { label: 'Data Integrity Check', status: 'complete' },
            { label: 'Integration', status: 'complete' },
          ],
        };
      case 'processing':
        return {
          color: 'text-warning',
          bg: 'bg-warning/10',
          message: 'Data is currently being processed and validated',
          steps: [
            { label: 'File Upload', status: 'complete' },
            { label: 'Schema Validation', status: 'complete' },
            { label: 'Data Integrity Check', status: 'in-progress' },
            { label: 'Integration', status: 'pending' },
          ],
        };
      case 'error':
        return {
          color: 'text-destructive',
          bg: 'bg-destructive/10',
          message: item.error || 'An error occurred during processing',
          steps: [
            { label: 'File Upload', status: 'complete' },
            { label: 'Schema Validation', status: 'error' },
            { label: 'Data Integrity Check', status: 'skipped' },
            { label: 'Integration', status: 'skipped' },
          ],
        };
      default:
        return {
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          message: 'Status unknown',
          steps: [],
        };
    }
  };

  const details = getStatusDetails();

  const handleRetry = () => {
    toast({
      title: '🔄 Processing Restarted',
      description: `Re-processing ${item.file}...`,
    });
    onOpenChange(false);
  };

  const handleDownload = () => {
    toast({
      title: '📥 Download Started',
      description: `Downloading ${item.file} validation report...`,
    });
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={item.file}
      description="Data Lineage & Processing Details"
      icon={getStatusIcon()}
    >
      <div className="space-y-4">
        {/* Status Banner */}
        <div className={`p-4 rounded-xl ${details.bg}`}>
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon()}
            <span className={`font-medium capitalize ${details.color}`}>{item.status}</span>
          </div>
          <p className="text-sm text-muted-foreground">{details.message}</p>
        </div>

        {/* File Details */}
        <div className="space-y-1 p-4 bg-secondary/30 rounded-xl">
          <InfoItem label="Total Records" value={item.records} icon={<Database className="w-4 h-4" />} />
          <InfoItem label="Processed At" value={item.timestamp} icon={<Calendar className="w-4 h-4" />} />
          <InfoItem label="Source" value="UIDAI Central Registry" icon={<Server className="w-4 h-4" />} />
          <InfoItem label="Encryption" value="AES-256" icon={<Shield className="w-4 h-4" />} />
        </div>

        {/* Processing Pipeline */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Processing Pipeline</p>
          <div className="space-y-3">
            {details.steps.map((step, idx) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === 'complete' ? 'bg-success/10' :
                  step.status === 'in-progress' ? 'bg-warning/10' :
                  step.status === 'error' ? 'bg-destructive/10' :
                  'bg-muted'
                }`}>
                  {step.status === 'complete' && <CheckCircle className="w-4 h-4 text-success" />}
                  {step.status === 'in-progress' && <Clock className="w-4 h-4 text-warning animate-spin" />}
                  {step.status === 'error' && <XCircle className="w-4 h-4 text-destructive" />}
                  {(step.status === 'pending' || step.status === 'skipped') && (
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    step.status === 'complete' ? 'text-foreground' :
                    step.status === 'in-progress' ? 'text-warning' :
                    step.status === 'error' ? 'text-destructive' :
                    'text-muted-foreground'
                  }`}>{step.label}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  step.status === 'complete' ? 'bg-success/10 text-success' :
                  step.status === 'in-progress' ? 'bg-warning/10 text-warning' :
                  step.status === 'error' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {step.status === 'in-progress' ? 'In Progress' : step.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          {item.status === 'error' && (
            <ActionButton onClick={handleRetry} variant="primary">
              Retry Processing
            </ActionButton>
          )}
          <ActionButton onClick={handleDownload} variant="secondary">
            <Download className="w-4 h-4 mr-2 inline" />
            Download Report
          </ActionButton>
          <ActionButton onClick={() => onOpenChange(false)} variant="secondary">
            Close
          </ActionButton>
        </div>
      </div>
    </DetailDialog>
  );
};
