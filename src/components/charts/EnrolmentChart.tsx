import { motion } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { dailyEnrolmentData } from '@/data/realData';

export const EnrolmentChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card-elevated p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Daily Enrolment & Update Trends</h3>
          <p className="text-sm text-muted-foreground">Data from api_data_aadhar_enrolment (March 2025)</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Enrolments</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-info" />
            <span className="text-sm text-muted-foreground">Updates (Bio + Demo)</span>
          </div>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyEnrolmentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="enrolmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(30, 100%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(30, 100%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="updatesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 20%, 90%)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(40, 20%, 90%)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 8 }}
              formatter={(value: number, name: string) => [
                value.toLocaleString('en-IN'),
                name === 'enrolments' ? 'Enrolments' : 'Updates'
              ]}
            />
            <Area
              type="monotone"
              dataKey="enrolments"
              stroke="hsl(30, 100%, 60%)"
              strokeWidth={2}
              fill="url(#enrolmentGradient)"
              name="Enrolments"
            />
            <Area
              type="monotone"
              dataKey="updates"
              stroke="hsl(199, 89%, 48%)"
              strokeWidth={2}
              fill="url(#updatesGradient)"
              name="Updates"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
