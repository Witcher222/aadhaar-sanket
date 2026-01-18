import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
}

export const StatCard = ({ title, value, subtitle, icon, trend, trendValue, delay = 0 }: StatCardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success bg-success/10';
      case 'down':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          {icon}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
};
