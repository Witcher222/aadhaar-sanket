import { MapPin, Users, TrendingUp, Building, AlertTriangle, Droplets, Bus, Heart, School, ExternalLink } from 'lucide-react';
import { DetailDialog, InfoItem, ActionButton } from './DetailDialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Zone {
  id: number;
  name: string;
  severity: string;
  population: string;
  growthRate: string;
  pressure: number;
}

interface ZoneDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: Zone | null;
}

const mockInfraData = [
  { name: 'Water', capacity: 85, usage: 92 },
  { name: 'Power', capacity: 95, usage: 88 },
  { name: 'Transport', capacity: 75, usage: 95 },
  { name: 'Healthcare', capacity: 80, usage: 78 },
  { name: 'Education', capacity: 70, usage: 85 },
];

export const ZoneDetailDialog = ({ open, onOpenChange, zone }: ZoneDetailDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!zone) return null;

  const getSeverityDetails = () => {
    switch (zone.severity) {
      case 'severe':
        return {
          color: 'text-destructive',
          bg: 'bg-destructive/10',
          message: 'Critical infrastructure stress - immediate intervention required',
        };
      case 'high':
        return {
          color: 'text-warning',
          bg: 'bg-warning/10',
          message: 'High pressure zone - monitoring and planning needed',
        };
      case 'moderate':
        return {
          color: 'text-info',
          bg: 'bg-info/10',
          message: 'Moderate growth - standard resource allocation',
        };
      default:
        return {
          color: 'text-success',
          bg: 'bg-success/10',
          message: 'Stable zone - normal operations',
        };
    }
  };

  const severity = getSeverityDetails();

  const handleRequestResources = () => {
    toast({
      title: '📋 Resource Request Submitted',
      description: `Emergency resource allocation request for ${zone.name} has been submitted.`,
    });
  };

  const handleViewPolicies = () => {
    onOpenChange(false);
    navigate('/policy');
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={zone.name}
      description="Detailed zone analysis and infrastructure status"
      icon={<MapPin className="w-5 h-5 text-primary" />}
    >
      <div className="space-y-4">
        {/* Severity Badge */}
        <div className={`p-3 rounded-xl ${severity.bg}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`w-4 h-4 ${severity.color}`} />
            <span className={`font-medium capitalize ${severity.color}`}>{zone.severity} Pressure</span>
          </div>
          <p className="text-sm text-muted-foreground">{severity.message}</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-secondary/50 rounded-xl text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold text-foreground">{zone.population}</p>
            <p className="text-xs text-muted-foreground">Population</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-xl text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-success" />
            <p className="text-lg font-bold text-foreground">{zone.growthRate}</p>
            <p className="text-xs text-muted-foreground">Growth Rate</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-xl text-center">
            <Building className="w-5 h-5 mx-auto mb-1 text-warning" />
            <p className="text-lg font-bold text-foreground">{zone.pressure}%</p>
            <p className="text-xs text-muted-foreground">Pressure Index</p>
          </div>
        </div>

        {/* Infrastructure Capacity Chart */}
        <div className="p-4 bg-secondary/30 rounded-xl">
          <p className="text-sm font-medium text-foreground mb-3">Infrastructure Capacity vs Usage</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockInfraData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(40, 20%, 90%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="capacity" fill="hsl(160, 84%, 39%)" name="Capacity %" radius={4} />
                <Bar dataKey="usage" fill="hsl(30, 100%, 60%)" name="Usage %" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-success" />
              <span className="text-xs text-muted-foreground">Capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-primary" />
              <span className="text-xs text-muted-foreground">Usage</span>
            </div>
          </div>
        </div>

        {/* Infrastructure Needs */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Priority Infrastructure Needs</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
              <Droplets className="w-4 h-4 text-info" />
              <span className="text-sm text-foreground">Water Supply</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
              <Bus className="w-4 h-4 text-warning" />
              <span className="text-sm text-foreground">Public Transit</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
              <Heart className="w-4 h-4 text-destructive" />
              <span className="text-sm text-foreground">Healthcare</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
              <School className="w-4 h-4 text-success" />
              <span className="text-sm text-foreground">Education</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <ActionButton onClick={handleRequestResources} variant="primary">
            Request Resources
          </ActionButton>
          <ActionButton onClick={handleViewPolicies} variant="secondary">
            View Policies
          </ActionButton>
          <ActionButton
            onClick={() => {
              onOpenChange(false);
              navigate('/forecasts');
            }}
            variant="secondary"
          >
            See Forecasts
          </ActionButton>
        </div>
      </div>
    </DetailDialog>
  );
};
