import { motion } from 'framer-motion';
import { Database, Users, TrendingUp, MapPin, Brain, Shield, FileCheck, Bell } from 'lucide-react';

const WorkflowSection = () => {
  const steps = [
    {
      icon: Database,
      title: 'Data Collection',
      description: 'Real-time demographic data aggregation from Aadhaar databases across all states and union territories.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: Users,
      title: 'Population Analysis',
      description: 'Advanced analytics to track population movements, migration patterns, and demographic shifts.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: MapPin,
      title: 'Spatial Mapping',
      description: 'Geo-spatial visualization of stress zones, high-density areas, and critical infrastructure needs.',
      color: 'from-orange-600 to-red-500',
    },
    {
      icon: TrendingUp,
      title: 'Trend Forecasting',
      description: 'Predictive models to anticipate future demographic changes and resource requirements.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Machine learning algorithms provide actionable insights for policy makers and administrators.',
      color: 'from-orange-400 to-amber-500',
    },
    {
      icon: Bell,
      title: 'Early Warnings',
      description: 'Automated alert system for critical demographic events requiring immediate attention.',
      color: 'from-red-500 to-orange-600',
    },
    {
      icon: Shield,
      title: 'Data Governance',
      description: 'Robust security protocols ensuring data integrity, privacy, and regulatory compliance.',
      color: 'from-orange-500 to-yellow-500',
    },
    {
      icon: FileCheck,
      title: 'Policy Support',
      description: 'Evidence-based recommendations for effective governance and resource allocation.',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-white to-cream">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Intelligent Demographic
            <span className="text-primary"> Workflow</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive system designed to transform raw demographic data into actionable intelligence for nation-building.
          </p>
        </motion.div>

        {/* Workflow Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-border/50 h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/30">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <motion.div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <step.icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                {/* Connector Line */}
                {index < steps.length - 1 && index % 4 !== 3 && (
                  <motion.div
                    className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-foreground mb-2">End-to-End Data Pipeline</h3>
              <p className="text-muted-foreground">From data ingestion to policy recommendations in real-time</p>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              {['Collect', 'Process', 'Analyze', 'Visualize', 'Act'].map((stage, index) => (
                <motion.div
                  key={stage}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="px-4 py-2 bg-white rounded-full shadow-md border border-primary/20 font-medium text-foreground">
                    {stage}
                  </div>
                  {index < 4 && (
                    <motion.div
                      className="w-6 h-0.5 bg-primary"
                      animate={{ scaleX: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WorkflowSection;
