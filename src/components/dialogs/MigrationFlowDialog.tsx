import { ArrowRightLeft, Users, Briefcase, TrendingUp, Calendar, Building, MapPin } from 'lucide-react';
import { DetailDialog, InfoItem, ActionButton } from './DetailDialog';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MigrationFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowData: {
    type: 'source' | 'destination';
    state: string;
    flow: number;
  } | null;
  flowName?: string;
}

const sectorData = [
  { name: 'Manufacturing', value: 35, color: 'hsl(30, 100%, 60%)' },
  { name: 'Services', value: 28, color: 'hsl(160, 84%, 39%)' },
  { name: 'Construction', value: 22, color: 'hsl(199, 89%, 48%)' },
  { name: 'Agriculture', value: 10, color: 'hsl(280, 70%, 50%)' },
  { name: 'Other', value: 5, color: 'hsl(220, 9%, 46%)' },
];

const demographicData = [
  { name: '18-25 years', value: 42, color: 'hsl(30, 100%, 60%)' },
  { name: '26-35 years', value: 35, color: 'hsl(160, 84%, 39%)' },
  { name: '36-45 years', value: 15, color: 'hsl(199, 89%, 48%)' },
  { name: '46+ years', value: 8, color: 'hsl(280, 70%, 50%)' },
];

export const MigrationFlowDialog = ({ open, onOpenChange, flowData, flowName }: MigrationFlowDialogProps) => {
  const navigate = useNavigate();

  if (!flowData) return null;

  const isSource = flowData.type === 'source';

  const getStateDetails = () => {
    const baseDetails = {
      'Uttar Pradesh': { topDest: 'Maharashtra, Delhi NCR, Gujarat', avgStay: '4.2 years', mainReason: 'Employment' },
      'Bihar': { topDest: 'Maharashtra, Delhi NCR, Punjab', avgStay: '3.8 years', mainReason: 'Employment' },
      'Rajasthan': { topDest: 'Gujarat, Maharashtra, Delhi NCR', avgStay: '5.1 years', mainReason: 'Seasonal work' },
      'MP': { topDest: 'Maharashtra, Gujarat, Delhi NCR', avgStay: '4.5 years', mainReason: 'Employment' },
      'West Bengal': { topDest: 'Karnataka, Kerala, Maharashtra', avgStay: '6.2 years', mainReason: 'Education, Employment' },
      'Odisha': { topDest: 'Gujarat, Tamil Nadu, Andhra Pradesh', avgStay: '3.9 years', mainReason: 'Industrial work' },
      'Maharashtra': { topSource: 'UP, Bihar, Rajasthan', retention: '78%', mainSector: 'Manufacturing, Services' },
      'Karnataka': { topSource: 'Tamil Nadu, AP, Kerala', retention: '82%', mainSector: 'IT, Services' },
      'Gujarat': { topSource: 'Rajasthan, MP, UP', retention: '71%', mainSector: 'Manufacturing, Textiles' },
      'Delhi NCR': { topSource: 'UP, Bihar, Haryana', retention: '65%', mainSector: 'Services, Retail' },
    };
    return baseDetails[flowData.state as keyof typeof baseDetails] || {};
  };

  const details = getStateDetails();

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={flowData.state}
      description={isSource ? 'Migration Source Analysis' : 'Migration Destination Analysis'}
      icon={isSource ? <MapPin className="w-5 h-5 text-primary" /> : <Building className="w-5 h-5 text-success" />}
    >
      <div className="space-y-4">
        {/* Flow Summary */}
        <div className={`p-4 rounded-xl ${isSource ? 'bg-primary/10' : 'bg-success/10'}`}>
          <div className="flex items-center gap-3">
            <ArrowRightLeft className={`w-6 h-6 ${isSource ? 'text-primary' : 'text-success'}`} />
            <div>
              <p className="text-sm text-muted-foreground">{isSource ? 'Total Outflow' : 'Total Inflow'}</p>
              <p className="text-2xl font-bold text-foreground">{(flowData.flow / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {isSource ? (
            <>
              <div className="p-3 bg-secondary/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Top Destinations</p>
                <p className="text-sm font-medium text-foreground">{(details as any).topDest || 'Various'}</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Avg Stay Duration</p>
                <p className="text-sm font-medium text-foreground">{(details as any).avgStay || '4+ years'}</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-secondary/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Top Sources</p>
                <p className="text-sm font-medium text-foreground">{(details as any).topSource || 'Various'}</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Retention Rate</p>
                <p className="text-sm font-medium text-foreground">{(details as any).retention || '75%'}</p>
              </div>
            </>
          )}
        </div>

        {/* Sector Distribution */}
        <div className="p-4 bg-secondary/30 rounded-xl">
          <p className="text-sm font-medium text-foreground mb-3">Employment Sector Distribution</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(40, 20%, 90%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {sectorData.slice(0, 3).map((sector) => (
              <div key={sector.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sector.color }} />
                <span className="text-xs text-muted-foreground">{sector.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Age Demographics
          </p>
          <div className="space-y-2">
            {demographicData.map((demo) => (
              <div key={demo.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20">{demo.name}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${demo.value}%`, backgroundColor: demo.color }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-8">{demo.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <ActionButton
            onClick={() => {
              onOpenChange(false);
              navigate('/trends');
            }}
            variant="primary"
          >
            View Trends
          </ActionButton>
          <ActionButton
            onClick={() => {
              onOpenChange(false);
              navigate('/stress-map');
            }}
            variant="secondary"
          >
            Check Stress Map
          </ActionButton>
          <ActionButton
            onClick={() => {
              onOpenChange(false);
              navigate('/forecasts');
            }}
            variant="secondary"
          >
            Forecasts
          </ActionButton>
        </div>
      </div>
    </DetailDialog>
  );
};
