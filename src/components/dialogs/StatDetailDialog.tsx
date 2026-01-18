import { ReactNode } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Target, Info } from 'lucide-react';
import { DetailDialog, InfoItem, ActionButton } from './DetailDialog';
import { useNavigate } from 'react-router-dom';

interface StatDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stat: {
    title: string;
    value: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon: ReactNode;
  } | null;
}

// Mock historical data
const generateMockData = () =>
  Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: Math.floor(80 + Math.random() * 40 + Math.sin(i * 0.5) * 15),
    previous: Math.floor(70 + Math.random() * 35 + Math.sin(i * 0.5) * 12),
  }));

const mockData = generateMockData();

const statDetails: Record<string, { description: string; insights: string[]; actions: { label: string; route: string }[] }> = {
  'Total Enrolments': {
    description: 'Total number of active Aadhaar registrations in the national database. This includes new enrollments and active updates from all states and union territories.',
    insights: [
      'Enrollment rate has increased by 2.4% compared to last month',
      'Highest enrollment activity in UP, Maharashtra, and Bihar',
      'Mobile enrollment camps contributed to 35% of new registrations',
    ],
    actions: [
      { label: 'View State Breakdown', route: '/migration' },
      { label: 'See Enrollment Trends', route: '/trends' },
    ],
  },
  'Active Migrations': {
    description: 'Address change requests processed this month, indicating population movement between districts and states.',
    insights: [
      'Migration velocity is 8.1% higher than seasonal average',
      'Top corridors: Bihar→Maharashtra, UP→Delhi, Bengal→Karnataka',
      'Urban-to-urban migration dominates at 62%',
    ],
    actions: [
      { label: 'View Migration Patterns', route: '/migration' },
      { label: 'Check Stress Zones', route: '/stress-map' },
    ],
  },
  'Migration Velocity Index': {
    description: 'A composite index measuring the speed and volume of demographic changes across the country based on weekly address update patterns.',
    insights: [
      'Current index indicates accelerated movement patterns',
      'Index factors: volume, speed, destination clustering',
      'Compared to 5-year average: 12% higher velocity',
    ],
    actions: [
      { label: 'Analyze Trends', route: '/trends' },
      { label: 'View Forecasts', route: '/forecasts' },
    ],
  },
  'Data Freshness': {
    description: 'Real-time synchronization status with UIDAI central database and state registries. Live status indicates sub-minute data latency.',
    insights: [
      'All 28 state registries synchronized',
      'Average data latency: <30 seconds',
      'Last full sync: 2 minutes ago',
    ],
    actions: [
      { label: 'View Data Quality', route: '/data-quality' },
      { label: 'Check System Health', route: '/data-quality' },
    ],
  },
};

export const StatDetailDialog = ({ open, onOpenChange, stat }: StatDetailDialogProps) => {
  const navigate = useNavigate();

  if (!stat) return null;

  const details = statDetails[stat.title] || {
    description: 'Detailed metrics and analysis for this indicator.',
    insights: ['Historical data available', 'Trend analysis enabled'],
    actions: [{ label: 'View More', route: '/' }],
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={stat.title}
      description={stat.subtitle}
      icon={stat.icon}
    >
      <div className="space-y-4">
        {/* Current Value */}
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div>
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
          </div>
          {stat.trend && stat.trendValue && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
              stat.trend === 'up' ? 'bg-success/10 text-success' :
              stat.trend === 'down' ? 'bg-destructive/10 text-destructive' :
              'bg-muted text-muted-foreground'
            }`}>
              {stat.trend === 'up' && <TrendingUp className="w-5 h-5" />}
              {stat.trend === 'down' && <TrendingDown className="w-5 h-5" />}
              <span className="font-medium">{stat.trendValue}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{details.description}</p>

        {/* Mini Chart */}
        <div className="p-4 bg-secondary/30 rounded-xl">
          <p className="text-xs font-medium text-muted-foreground mb-3">12-Month Trend</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="statGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(30, 100%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(30, 100%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(40, 20%, 90%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(30, 100%, 60%)"
                  strokeWidth={2}
                  fill="url(#statGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Key Insights
          </p>
          <ul className="space-y-2">
            {details.insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">
                {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          {details.actions.map((action, idx) => (
            <ActionButton
              key={idx}
              onClick={() => {
                onOpenChange(false);
                navigate(action.route);
              }}
              variant={idx === 0 ? 'primary' : 'secondary'}
            >
              {action.label}
            </ActionButton>
          ))}
        </div>
      </div>
    </DetailDialog>
  );
};
