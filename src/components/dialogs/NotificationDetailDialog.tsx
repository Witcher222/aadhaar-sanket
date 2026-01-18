import { AlertTriangle, Bell, CheckCircle, Info, Clock, MapPin, ExternalLink } from 'lucide-react';
import { DetailDialog, InfoItem, ActionButton } from './DetailDialog';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  title: string;
  time: string;
  unread: boolean;
  type?: 'warning' | 'info' | 'success';
  description?: string;
  region?: string;
  action?: string;
}

interface NotificationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: Notification | null;
}

export const NotificationDetailDialog = ({
  open,
  onOpenChange,
  notification,
}: NotificationDetailDialogProps) => {
  const navigate = useNavigate();

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getDetails = () => {
    // Mock details based on notification
    if (notification.title.includes('Critical')) {
      return {
        type: 'warning',
        description: 'Population pressure in Delhi NCR has exceeded critical threshold. Infrastructure stress indicators show 92% capacity utilization. Immediate attention required for water and transport resources.',
        region: 'Delhi NCR',
        action: '/stress-map',
        actionLabel: 'View Stress Map',
        metrics: [
          { label: 'Pressure Index', value: '92%' },
          { label: 'Population Inflow', value: '+45K/month' },
          { label: 'Infrastructure Gap', value: '18%' },
        ],
      };
    } else if (notification.title.includes('report')) {
      return {
        type: 'info',
        description: 'The weekly migration and demographic analysis report has been generated. It includes state-wise breakdowns, trend analysis, and policy recommendations.',
        region: 'All India',
        action: '/data-quality',
        actionLabel: 'View Report',
        metrics: [
          { label: 'Report Period', value: 'Week 2, Jan 2026' },
          { label: 'Data Points', value: '2.4M records' },
          { label: 'Accuracy Score', value: '98.2%' },
        ],
      };
    } else {
      return {
        type: 'success',
        description: 'All data sources have been synchronized successfully. The system is running with real-time updates from UIDAI and state registries.',
        region: 'System-wide',
        action: '/data-quality',
        actionLabel: 'View Data Status',
        metrics: [
          { label: 'Sources Synced', value: '28/28' },
          { label: 'Last Update', value: 'Just now' },
          { label: 'Data Freshness', value: 'Live' },
        ],
      };
    }
  };

  const details = getDetails();

  const handleAction = () => {
    onOpenChange(false);
    navigate(details.action);
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={notification.title}
      description={notification.time}
      icon={getIcon()}
    >
      <div className="space-y-4">
        <p className="text-sm text-foreground leading-relaxed">{details.description}</p>

        <div className="p-4 bg-secondary/50 rounded-xl space-y-1">
          {details.metrics.map((metric) => (
            <InfoItem key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Region: {details.region}</span>
        </div>

        <div className="flex gap-3 pt-2">
          <ActionButton onClick={handleAction} variant="primary">
            {details.actionLabel}
            <ExternalLink className="w-4 h-4 ml-2 inline" />
          </ActionButton>
          <ActionButton onClick={() => onOpenChange(false)} variant="secondary">
            Dismiss
          </ActionButton>
        </div>
      </div>
    </DetailDialog>
  );
};
