import { TrendingUp, Clock, Zap, Calendar, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DetailDialog, InfoItem, ActionButton } from './DetailDialog';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface InsightData {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

interface TrendInsightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insight: InsightData | null;
}

// Mock comparison data
const generateComparisonData = () =>
  Array.from({ length: 12 }, (_, i) => ({
    month: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i],
    current: Math.floor(60 + Math.random() * 40 + Math.sin(i * 0.5) * 15),
    previous: Math.floor(50 + Math.random() * 35 + Math.sin(i * 0.5) * 12),
    forecast: i >= 9 ? Math.floor(75 + Math.random() * 30) : null,
  }));

const mockData = generateComparisonData();

const insightDetails: Record<string, {
  description: string;
  methodology: string;
  factors: string[];
  implications: string[];
}> = {
  'Peak Season': {
    description: 'Analysis of seasonal migration patterns showing peak activity during the October-December period, driven by festival season, agricultural harvest completion, and year-end employment cycles.',
    methodology: 'Based on 5-year rolling average of address change requests and cross-referenced with employment data.',
    factors: [
      'Diwali/Durga Puja festival returns',
      'Post-monsoon agricultural lull',
      'Year-end employment recruitment',
      'Educational admissions',
    ],
    implications: [
      'Plan infrastructure surge capacity',
      'Increase transport connectivity',
      'Prepare healthcare facilities',
    ],
  },
  'Retention Rate': {
    description: 'Measures the percentage of migrants who permanently settle in destination areas versus those who return to source regions within 3 years.',
    methodology: 'Calculated from longitudinal address history analysis of Aadhaar records over 36-month periods.',
    factors: [
      'Employment stability',
      'Housing affordability',
      'Social integration',
      'Family relocation',
    ],
    implications: [
      'Focus on long-term housing',
      'Invest in community facilities',
      'Expand education access',
    ],
  },
  'Return Migration': {
    description: 'Tracks reverse migration flows from urban to rural areas, indicating economic conditions, quality of life factors, and policy effectiveness.',
    methodology: 'Derived from return address updates filtered for rural destinations from urban origins.',
    factors: [
      'Economic downturns',
      'Healthcare crises',
      'Rural employment programs',
      'Quality of life concerns',
    ],
    implications: [
      'Strengthen rural infrastructure',
      'Develop local employment',
      'Improve healthcare access',
    ],
  },
  'New Corridors': {
    description: 'Identification of emerging migration routes that show significant growth compared to historical patterns, indicating new economic opportunities.',
    methodology: 'Detected through anomaly detection algorithms comparing current flows to 3-year baseline patterns.',
    factors: [
      'New industrial zones',
      'IT hub development',
      'Infrastructure projects',
      'Policy incentives',
    ],
    implications: [
      'Pre-emptive infrastructure planning',
      'Policy coordination needed',
      'Resource allocation updates',
    ],
  },
};

export const TrendInsightDialog = ({ open, onOpenChange, insight }: TrendInsightDialogProps) => {
  const navigate = useNavigate();

  if (!insight) return null;

  const details = insightDetails[insight.label] || {
    description: 'Detailed analysis of this migration metric.',
    methodology: 'Based on Aadhaar data analysis.',
    factors: ['Various demographic factors', 'Economic conditions'],
    implications: ['Monitor trends', 'Update policies'],
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={insight.label}
      description="Trend Analysis Deep Dive"
      icon={<TrendingUp className="w-5 h-5 text-primary" />}
    >
      <div className="space-y-4">
        {/* Current Value */}
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div>
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-3xl font-display font-bold text-foreground">{insight.value}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
            insight.positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          }`}>
            {insight.positive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            <span className="font-medium">{insight.change}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{details.description}</p>

        {/* Trend Chart */}
        <div className="p-4 bg-secondary/30 rounded-xl">
          <p className="text-sm font-medium text-foreground mb-3">Historical Comparison</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
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
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="hsl(220, 9%, 70%)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Last Year"
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="hsl(30, 100%, 60%)"
                  strokeWidth={2}
                  dot={false}
                  name="Current"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="hsl(160, 84%, 39%)"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={false}
                  name="Forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <span className="w-4 h-0.5 bg-muted-foreground" style={{ borderTop: '2px dashed' }} />
              <span className="text-xs text-muted-foreground">Last Year</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-0.5 bg-primary" />
              <span className="text-xs text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-0.5 bg-success" style={{ borderTop: '2px dashed' }} />
              <span className="text-xs text-muted-foreground">Forecast</span>
            </div>
          </div>
        </div>

        {/* Methodology */}
        <div className="p-3 bg-info/5 rounded-xl border border-info/20">
          <p className="text-xs font-medium text-info mb-1">Methodology</p>
          <p className="text-sm text-muted-foreground">{details.methodology}</p>
        </div>

        {/* Contributing Factors */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Contributing Factors</p>
          <div className="flex flex-wrap gap-2">
            {details.factors.map((factor, idx) => (
              <span key={idx} className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-foreground">
                {factor}
              </span>
            ))}
          </div>
        </div>

        {/* Policy Implications */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Policy Implications</p>
          <ul className="space-y-2">
            {details.implications.map((impl, idx) => (
              <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">
                {impl}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <ActionButton
            onClick={() => {
              onOpenChange(false);
              navigate('/forecasts');
            }}
            variant="primary"
          >
            View Forecasts
          </ActionButton>
          <ActionButton
            onClick={() => {
              onOpenChange(false);
              navigate('/policy');
            }}
            variant="secondary"
          >
            Policy Decisions
          </ActionButton>
        </div>
      </div>
    </DetailDialog>
  );
};
