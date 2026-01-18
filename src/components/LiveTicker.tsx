import { motion } from 'framer-motion';
import { liveTicker } from '@/data/realData';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

export const LiveTicker = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Info className="w-4 h-4 text-info" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-warning/5 border-warning/20';
      case 'success':
        return 'bg-success/5 border-success/20';
      default:
        return 'bg-info/5 border-info/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="card-elevated p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
        <h4 className="text-sm font-semibold text-foreground">Live Intelligence Feed</h4>
        <span className="text-xs text-muted-foreground ml-auto">Real-time from UIDAI data</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {liveTicker.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.8 + idx * 0.1 }}
            className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border ${getBgColor(item.type)} min-w-[300px]`}
          >
            {getIcon(item.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{item.message}</p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
