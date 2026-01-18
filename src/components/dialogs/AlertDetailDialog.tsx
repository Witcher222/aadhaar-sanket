import { AlertTriangle, AlertCircle, Info, TrendingUp, Calendar, Percent, MapPin, Users, Building, ExternalLink } from 'lucide-react';
import { DetailDialog, InfoItem, ActionButton } from './DetailDialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: number;
  title: string;
  description: string;
  level: string;
  region: string;
  date: string;
  probability: number;
}

interface AlertDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
}

export const AlertDetailDialog = ({ open, onOpenChange, alert }: AlertDetailDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!alert) return null;

  const getIcon = () => {
    switch (alert.level) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  // Mock detailed data based on alert
  const getDetailedInfo = () => {
    if (alert.level === 'critical') {
      return {
        impact: 'Immediate infrastructure stress expected',
        affectedPopulation: '2.4 million residents',
        resources: ['Water supply', 'Public transport', 'Healthcare facilities'],
        recommendations: [
          'Activate emergency resource allocation protocols',
          'Coordinate with state disaster management',
          'Deploy mobile healthcare units',
        ],
      };
    } else if (alert.level === 'warning') {
      return {
        impact: 'Moderate strain on urban services anticipated',
        affectedPopulation: '850K residents',
        resources: ['Housing', 'Employment services', 'Schools'],
        recommendations: [
          'Increase public housing allocation',
          'Expand job training programs',
          'Plan for additional school capacity',
        ],
      };
    }
    return {
      impact: 'Gradual demographic shift observed',
      affectedPopulation: '320K residents',
      resources: ['Administrative services', 'Utilities'],
      recommendations: [
        'Monitor trends over next quarter',
        'Update infrastructure planning',
        'Prepare contingency resources',
      ],
    };
  };

  const details = getDetailedInfo();

  const handleAcknowledge = () => {
    toast({
      title: '✅ Alert Acknowledged',
      description: `${alert.title} has been marked as reviewed.`,
    });
    onOpenChange(false);
  };

  const handleEscalate = () => {
    toast({
      title: '🚨 Alert Escalated',
      description: 'This alert has been escalated to senior officials.',
    });
    onOpenChange(false);
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={alert.title}
      description={`${alert.level.toUpperCase()} • ${alert.region}`}
      icon={getIcon()}
    >
      <div className="space-y-4">
        {/* Alert Description */}
        <p className="text-sm text-foreground leading-relaxed">{alert.description}</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Timeline</span>
            </div>
            <p className="font-medium text-foreground">{alert.date}</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Probability</span>
            </div>
            <p className="font-medium text-foreground">{alert.probability}%</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-xl col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Affected Population</span>
            </div>
            <p className="font-medium text-foreground">{details.affectedPopulation}</p>
          </div>
        </div>

        {/* Impact */}
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <p className="text-sm font-medium text-foreground mb-1">Expected Impact</p>
          <p className="text-sm text-muted-foreground">{details.impact}</p>
        </div>

        {/* Affected Resources */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            Affected Resources
          </p>
          <div className="flex flex-wrap gap-2">
            {details.resources.map((resource, idx) => (
              <span key={idx} className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-foreground">
                {resource}
              </span>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Recommended Actions</p>
          <ul className="space-y-2">
            {details.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <ActionButton onClick={handleAcknowledge} variant="primary">
            Acknowledge Alert
          </ActionButton>
          {alert.level === 'critical' && (
            <ActionButton onClick={handleEscalate} variant="destructive">
              Escalate to Ministry
            </ActionButton>
          )}
          <ActionButton
            onClick={() => {
              onOpenChange(false);
              navigate('/policy');
            }}
            variant="secondary"
          >
            View Policy Options
          </ActionButton>
        </div>
      </div>
    </DetailDialog>
  );
};
