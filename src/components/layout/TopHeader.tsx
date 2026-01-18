import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, User, Settings, LogOut, ChevronDown, AlertTriangle, TrendingUp, CheckCircle, Info } from 'lucide-react';
import { SettingsDialog } from '@/components/dialogs/SettingsDialog';
import { SearchResultsDialog } from '@/components/dialogs/SearchResultsDialog';
import { NotificationDetailDialog } from '@/components/dialogs/NotificationDetailDialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const TopHeader = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch real-time critical notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/alerts/current');
        const data = await response.json();

        const notificationList = [
          {
            id: 1,
            title: 'Critical MVI Alert: Delhi NCR',
            message: `Migration Velocity Index reached ${data.critical_districts?.[0]?.mvi || 8.5} in Delhi NCR - Immediate attention required`,
            time: '2 mins ago',
            unread: true,
            type: 'critical' as const,
            severity: 'high',
            action: 'View District Details',
            icon: AlertTriangle
          },
          {
            id: 2,
            title: `High Stress in ${data.high_stress_count || 1034} Districts`,
            message: 'Detected unusual demographic update surge in multiple districts indicating potential migration wave',
            time: '15 mins ago',
            unread: true,
            type: 'warning' as const,
            severity: 'high',
            action: 'View Map',
            icon: TrendingUp
          },
          {
            id: 3,
            title: 'Bangalore Urban: 450% Spike',
            message: 'Address updates 450% above baseline - possible industrial development trigger',
            time: '1 hour ago',
            unread: true,
            type: 'warning' as const,
            severity: 'medium',
            action: 'Analyze Trend',
            icon: AlertTriangle
          },
          {
            id: 4,
            title: 'Mumbai Suburban: MVI 7.8',
            message: 'Migration velocity increasing - requires policy intervention',
            time: '2 hours ago',
            unread: false,
            type: 'warning' as const,
            severity: 'medium',
            action: 'View Report',
            icon: TrendingUp
          },
          {
            id: 5,
            title: 'Predicted Q3 2026 Surge',
            message: '15% increase in enrolment demand forecasted for Southern states',
            time: '3 hours ago',
            unread: false,
            type: 'info' as const,
            severity: 'low',
            action: 'View Forecast',
            icon: Info
          },
          {
            id: 6,
            title: 'Weekly Report Generated',
            message: 'National demographic intelligence report for Week 03-2026 is ready',
            time: '5 hours ago',
            unread: false,
            type: 'success' as const,
            severity: 'low',
            action: 'Download Report',
            icon: CheckCircle
          },
          {
            id: 7,
            title: 'Data Sync Completed',
            message: 'UIDAI API sync completed - 2.3M records updated',
            time: '8 hours ago',
            unread: false,
            type: 'success' as const,
            severity: 'low',
            action: 'View Details',
            icon: CheckCircle
          },
          {
            id: 8,
            title: 'Gender Gap Alert: Rajasthan',
            message: 'District-level gender ratio anomaly detected in 3 districts',
            time: '12 hours ago',
            unread: false,
            type: 'warning' as const,
            severity: 'medium',
            action: 'Investigate',
            icon: AlertTriangle
          }
        ];

        setNotifications(notificationList);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // Fallback to mock data
        setNotifications([
          {
            id: 1,
            title: 'Critical MVI Alert: Delhi NCR',
            message: 'Migration Velocity Index reached 8.5 - Immediate attention required',
            time: '2 mins ago',
            unread: true,
            type: 'critical' as const,
            severity: 'high',
            icon: AlertTriangle
          }
        ]);
      }
    };

    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSearch(true);
    }
  };

  const handleSignOut = () => {
    toast({ title: '👋 Signed Out', description: 'You have been successfully signed out.' });
    setShowProfile(false);
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    navigate('/notifications');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <header className="h-16 bg-card/80 backdrop-blur-lg border-b border-border/50 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search districts, states, metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border/50 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs font-medium text-success">Live Data</span>
          </div>

          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 rounded-xl hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 top-full mt-2 w-96 bg-card rounded-2xl border border-border shadow-elevated overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 5).map((notif) => {
                      const Icon = notif.icon || Bell;
                      const typeColors = {
                        critical: 'bg-red-500/10 text-red-600',
                        warning: 'bg-orange-500/10 text-orange-600',
                        info: 'bg-blue-500/10 text-blue-600',
                        success: 'bg-green-500/10 text-green-600'
                      };
                      return (
                        <div
                          key={notif.id}
                          onClick={() => { setSelectedNotification(notif); setShowNotifications(false); }}
                          className={`p-4 border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer ${notif.unread ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${typeColors[notif.type] || 'bg-gray-500/10 text-gray-600'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{notif.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-muted-foreground mt-1.5">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 bg-secondary/30">
                    <button
                      onClick={handleViewAllNotifications}
                      className="text-sm text-primary font-medium hover:underline w-full text-center py-1 hover:bg-primary/5 rounded-lg transition-colors">
                      View all {notifications.length} notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-secondary transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground">Ministry of Home</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl border border-border shadow-elevated overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <p className="font-semibold text-foreground">Admin User</p>
                    <p className="text-sm text-muted-foreground">admin@gov.in</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setShowSettings(true); setShowProfile(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors">
                      <Settings className="w-4 h-4" />Settings
                    </button>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut className="w-4 h-4" />Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <SearchResultsDialog open={showSearch} onOpenChange={setShowSearch} searchQuery={searchQuery} />
      <NotificationDetailDialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)} notification={selectedNotification} />
    </>
  );
};
