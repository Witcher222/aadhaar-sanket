import { motion } from 'framer-motion';
import { useState } from 'react';

const IndiaMap = () => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Simplified India map paths for major states
  const states = [
    { id: 'J&K', name: 'Jammu & Kashmir', path: 'M120,20 L150,25 L155,50 L140,60 L115,55 Z', population: '1.25 Cr', color: '#FF9933' },
    { id: 'HP', name: 'Himachal Pradesh', path: 'M140,60 L165,55 L175,75 L150,85 L135,75 Z', population: '0.73 Cr', color: '#FFB366' },
    { id: 'PB', name: 'Punjab', path: 'M115,70 L140,65 L145,90 L120,95 L105,85 Z', population: '3.0 Cr', color: '#FF9933' },
    { id: 'UK', name: 'Uttarakhand', path: 'M165,75 L195,70 L200,95 L175,100 L160,90 Z', population: '1.1 Cr', color: '#FFB366' },
    { id: 'HR', name: 'Haryana', path: 'M120,95 L145,90 L150,115 L125,120 L115,110 Z', population: '2.8 Cr', color: '#FFCC99' },
    { id: 'DL', name: 'Delhi', path: 'M135,110 L145,108 L147,118 L137,120 Z', population: '1.9 Cr', color: '#FF6600' },
    { id: 'RJ', name: 'Rajasthan', path: 'M60,100 L120,95 L130,180 L75,190 L45,150 Z', population: '7.9 Cr', color: '#FF9933' },
    { id: 'UP', name: 'Uttar Pradesh', path: 'M145,100 L220,90 L240,160 L180,180 L130,165 Z', population: '23.1 Cr', color: '#FF6600' },
    { id: 'BR', name: 'Bihar', path: 'M240,130 L290,125 L295,165 L250,175 Z', population: '12.4 Cr', color: '#FF9933' },
    { id: 'WB', name: 'West Bengal', path: 'M290,130 L320,145 L310,220 L275,230 L270,175 Z', population: '10.0 Cr', color: '#FFB366' },
    { id: 'MP', name: 'Madhya Pradesh', path: 'M100,180 L200,170 L210,240 L110,250 Z', population: '8.5 Cr', color: '#FFCC99' },
    { id: 'GJ', name: 'Gujarat', path: 'M30,170 L90,165 L100,250 L60,270 L20,230 Z', population: '7.0 Cr', color: '#FF9933' },
    { id: 'MH', name: 'Maharashtra', path: 'M60,250 L170,240 L180,320 L80,340 L40,290 Z', population: '12.6 Cr', color: '#FF6600' },
    { id: 'CG', name: 'Chhattisgarh', path: 'M200,230 L260,220 L270,290 L220,300 Z', population: '2.9 Cr', color: '#FFB366' },
    { id: 'OD', name: 'Odisha', path: 'M255,260 L310,250 L320,320 L265,330 Z', population: '4.6 Cr', color: '#FF9933' },
    { id: 'JH', name: 'Jharkhand', path: 'M250,190 L300,180 L305,230 L260,240 Z', population: '3.9 Cr', color: '#FFCC99' },
    { id: 'AP', name: 'Andhra Pradesh', path: 'M180,320 L280,300 L290,380 L200,400 Z', population: '5.3 Cr', color: '#FFB366' },
    { id: 'TS', name: 'Telangana', path: 'M170,290 L240,280 L250,340 L185,350 Z', population: '3.9 Cr', color: '#FF9933' },
    { id: 'KA', name: 'Karnataka', path: 'M100,340 L180,330 L190,420 L110,440 L80,390 Z', population: '6.7 Cr', color: '#FFCC99' },
    { id: 'KL', name: 'Kerala', path: 'M110,440 L140,430 L150,500 L120,510 L100,480 Z', population: '3.5 Cr', color: '#FF9933' },
    { id: 'TN', name: 'Tamil Nadu', path: 'M140,420 L210,400 L220,490 L150,510 Z', population: '7.7 Cr', color: '#FF6600' },
    { id: 'NE', name: 'North East', path: 'M320,120 L380,100 L390,180 L340,200 L315,160 Z', population: '5.0 Cr', color: '#FFB366' },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg viewBox="0 0 400 520" className="w-full h-auto">
        {/* Background glow */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9933" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#FF6600" stopOpacity="0.6"/>
          </linearGradient>
        </defs>

        {/* States */}
        {states.map((state, index) => (
          <motion.path
            key={state.id}
            d={state.path}
            fill={hoveredState === state.id ? '#FF6600' : state.color}
            stroke="#FFFFFF"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            whileHover={{ scale: 1.05, filter: 'url(#glow)' }}
            onMouseEnter={() => setHoveredState(state.id)}
            onMouseLeave={() => setHoveredState(null)}
            className="cursor-pointer transition-all duration-300"
          />
        ))}

        {/* Animated data points */}
        {[
          { cx: 137, cy: 115, label: 'Delhi' },
          { cx: 130, cy: 300, label: 'Mumbai' },
          { cx: 180, cy: 450, label: 'Chennai' },
          { cx: 280, cy: 180, label: 'Kolkata' },
          { cx: 140, cy: 400, label: 'Bangalore' },
        ].map((point, index) => (
          <motion.g key={point.label}>
            <motion.circle
              cx={point.cx}
              cy={point.cy}
              r="8"
              fill="#FF6600"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ 
                delay: 1 + index * 0.2,
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
            <motion.circle
              cx={point.cx}
              cy={point.cy}
              r="4"
              fill="#FFFFFF"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + index * 0.2 }}
            />
          </motion.g>
        ))}
      </svg>

      {/* Hover tooltip */}
      <AnimatedTooltip state={states.find(s => s.id === hoveredState)} />
    </div>
  );
};

const AnimatedTooltip = ({ state }: { state: typeof states[0] | undefined }) => {
  if (!state) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-4 right-4 bg-white rounded-xl shadow-xl p-4 border border-border"
    >
      <h4 className="font-bold text-foreground">{state.name}</h4>
      <p className="text-sm text-muted-foreground">Population: {state.population}</p>
    </motion.div>
  );
};

const states = [
  { id: 'J&K', name: 'Jammu & Kashmir', population: '1.25 Cr' },
];

export default IndiaMap;
