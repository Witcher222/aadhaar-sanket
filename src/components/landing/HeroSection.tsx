import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import IndiaMap from './IndiaMap';

const HeroSection = () => {
  const navigate = useNavigate();

  const features = [
    { icon: BarChart3, label: 'Real-time Analytics' },
    { icon: Shield, label: 'Secure & Compliant' },
    { icon: Zap, label: 'AI-Powered Insights' },
    { icon: Globe, label: 'Pan-India Coverage' },
  ];

  return (
    <section id="home" className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-cream via-white to-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">Government of India Initiative</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6"
            >
              Aadhaar
              <span className="text-primary"> Sanket</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="block text-2xl md:text-3xl mt-2 font-normal text-muted-foreground"
              >
                Demographic Intelligence Platform
              </motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed"
            >
              Transform demographic data into actionable intelligence. Monitor migration patterns, 
              predict population trends, and make data-driven policy decisions for 1.4 billion citizens.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Button
                onClick={() => navigate('/dashboard')}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all group"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-foreground/20 hover:border-primary hover:text-primary font-semibold px-8 py-6 text-lg rounded-xl"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap gap-3"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-border/50"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - India Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative"
          >
            {/* Decorative Elements */}
            <motion.div
              className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-10 -left-10 w-60 h-60 bg-orange-300/20 rounded-full blur-3xl"
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
              transition={{ duration: 5, repeat: Infinity }}
            />

            {/* Map Container */}
            <div className="relative z-10 bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-border/50">
              <IndiaMap />
              
              {/* Stats Overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-4"
              >
                {[
                  { value: '1.4B+', label: 'Citizens' },
                  { value: '28', label: 'States' },
                  { value: '99.9%', label: 'Uptime' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ scale: 1.1 }}
                    className="bg-white px-4 py-2 rounded-xl shadow-lg border border-border/50 text-center"
                  >
                    <div className="text-xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 15, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-3 bg-primary rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
