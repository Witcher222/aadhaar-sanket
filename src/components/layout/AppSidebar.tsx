import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  ArrowRightLeft,
  TrendingUp,
  Map,
  AlertTriangle,
  FileCheck,
  Database,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  Bot,
  FileText,
  Upload,
  Download,
  Rocket,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'National Overview', path: '/dashboard' },
  { icon: BookOpen, label: 'User Guide', path: '/guide' },
  { icon: Rocket, label: 'Advanced Insights', path: '/advanced' },
  { icon: Upload, label: 'Data Ingestion', path: '/ingestion' },
  { icon: Download, label: 'UIDAI Live Data', path: '/uidai-live' },
  { icon: ArrowRightLeft, label: 'Migration Patterns', path: '/migration' },
  { icon: TrendingUp, label: 'Trend Analysis', path: '/trends' },
  { icon: Map, label: 'Indian Map', path: '/map-dashboard' },
  { icon: Map, label: 'Spatial Stress Map', path: '/stress-map' },
  { icon: AlertTriangle, label: 'Forecasts & Alerts', path: '/forecasts' },
  { icon: FileCheck, label: 'Policy Decisions', path: '/policy' },
  { icon: Database, label: 'Data Trust & Quality', path: '/data-quality' },
  { icon: MessageSquare, label: 'AI Assistant', path: '/ai-assistant' },
  { icon: Bot, label: 'AI Chatbot', path: '/ai-chatbot' },
  { icon: FileText, label: 'Reports', path: '/reports' },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="glass-sidebar h-screen sticky top-0 flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-display font-bold text-lg">आ</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display font-bold text-lg text-foreground">Aadhaar Sanket</h1>
              <p className="text-xs text-muted-foreground">Demographic Intelligence</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item group ${isActive ? 'active' : ''}`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                  transition={{ duration: 0.3 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border/50 space-y-1">
        <NavLink to="/settings" className="nav-item w-full">
          <Settings className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
        <button className="nav-item w-full">
          <HelpCircle className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Help & Support
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-soft hover:shadow-medium transition-all"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </motion.aside>
  );
};
