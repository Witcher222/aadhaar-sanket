import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, TrendingUp, CheckCircle, Info, Archive, Trash2 } from 'lucide-react';

export const Notifications = () => {
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        // Fetch notifications
        const fetchNotifications = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/alerts/current');
                const data = await response.json();

                const notificationList = [
                    {
                        id: 1,
                        title: 'Critical MVI Alert: Delhi NCR',
                        message: 'Migration Velocity Index reached 8.5 in Delhi NCR - Immediate attention required. Analysis shows rapid demographic shift pattern.',
                        time: '2 mins ago',
                        timestamp: new Date(Date.now() - 2 * 60 * 1000),
                        unread: true,
                        type: 'critical' as const,
                        severity: 'high',
                        icon: AlertTriangle,
                        details: 'Districts affected: New Delhi, North Delhi, South Delhi'
                    },
                    {
                        id: 2,
                        title: `High Stress in ${data.high_stress_count || 1034} Districts`,
                        message: 'Detected unusual demographic update surge in multiple districts indicating potential migration wave triggered by seasonal employment',
                        time: '15 mins ago',
                        timestamp: new Date(Date.now() - 15 * 60 * 1000),
                        unread: true,
                        type: 'warning' as const,
                        severity: 'high',
                        icon: TrendingUp,
                        details: 'Primary regions: Maharashtra, Karnataka, Tamil Nadu'
                    },
                    {
                        id: 3,
                        title: 'Bangalore Urban: 450% Spike',
                        message: 'Address updates 450% above baseline - possible industrial development trigger in Electronic City Phase 2',
                        time: '1 hour ago',
                        timestamp: new Date(Date.now() - 60 * 60 * 1000),
                        unread: true,
                        type: 'warning' as const,
                        severity: 'medium',
                        icon: AlertTriangle,
                        details: 'Affected wards: 23, 45, 67, 89'
                    },
                    {
                        id: 4,
                        title: 'Mumbai Suburban: MVI 7.8',
                        message: 'Migration velocity increasing steadily - requires immediate policy intervention to manage infrastructure load',
                        time: '2 hours ago',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                        unread: false,
                        type: 'warning' as const,
                        severity: 'medium',
                        icon: TrendingUp,
                        details: 'Hotspots: Andheri, Borivali, Thane'
                    },
                    {
                        id: 5,
                        title: 'Predicted Q3 2026 Surge',
                        message: '15% increase in enrolment demand forecasted for Southern states based on Prophet time-series model with 94% confidence',
                        time: '3 hours ago',
                        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                        unread: false,
                        type: 'info' as const,
                        severity: 'low',
                        icon: Info,
                        details: 'States: Tamil Nadu, Karnataka, Andhra Pradesh, Telangana'
                    },
                    {
                        id: 6,
                        title: 'Weekly Report Generated',
                        message: 'National demographic intelligence report for Week 03-2026 is ready for download. Contains critical insights on migration patterns.',
                        time: '5 hours ago',
                        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
                        unread: false,
                        type: 'success' as const,
                        severity: 'low',
                        icon: CheckCircle,
                        details: 'Size: 2.4 MB | Format: PDF'
                    },
                    {
                        id: 7,
                        title: 'Data Sync Completed',
                        message: 'UIDAI API sync completed successfully - 2.3M records updated, 450K new enrolments processed',
                        time: '8 hours ago',
                        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
                        unread: false,
                        type: 'success' as const,
                        severity: 'low',
                        icon: CheckCircle,
                        details: 'Next sync scheduled: 6 hours'
                    },
                    {
                        id: 8,
                        title: 'Gender Gap Alert: Rajasthan',
                        message: 'District-level gender ratio anomaly detected in 3 districts - Ratio dropped below critical threshold of 940',
                        time: '12 hours ago',
                        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
                        unread: false,
                        type: 'warning' as const,
                        severity: 'medium',
                        icon: AlertTriangle,
                        details: 'Districts: Jaipur Rural, Alwar, Bharatpur'
                    },
                    {
                        id: 9,
                        title: 'Pune District: Population Density Alert',
                        message: 'Population density exceeded optimal threshold - Urban planning intervention recommended',
                        time: '18 hours ago',
                        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
                        unread: false,
                        type: 'warning' as const,
                        severity: 'medium',
                        icon: TrendingUp,
                        details: 'Current density: 3,450 per sq km'
                    },
                    {
                        id: 10,
                        title: 'Forecast Model Updated',
                        message: 'Prophet forecasting model retrained with latest data - Predictions updated for Q2-Q3 2026',
                        time: '1 day ago',
                        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        unread: false,
                        type: 'success' as const,
                        severity: 'low',
                        icon: CheckCircle,
                        details: 'Model accuracy: 96.2%'
                    }
                ];

                setNotifications(notificationList);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return n.unread;
        if (filter === 'critical') return n.type === 'critical' || n.severity === 'high';
        return true;
    });

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const typeColors = {
        critical: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
        warning: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' },
        info: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
        success: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20' }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <Bell className="w-8 h-8 text-primary" />
                                All Notifications
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Manage and review all system alerts and updates
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {['all', 'unread', 'critical'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === f
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                {f === 'unread' && notifications.filter(n => n.unread).length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-primary-foreground/20 rounded-full text-xs">
                                        {notifications.filter(n => n.unread).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.map((notif, index) => {
                        const Icon = notif.icon || Bell;
                        const colors = typeColors[notif.type] || typeColors['info'];

                        return (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-card border ${colors.border} rounded-xl p-6 hover:shadow-lg transition-all ${notif.unread ? 'border-l-4 border-l-primary' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground text-lg">
                                                    {notif.title}
                                                    {notif.unread && (
                                                        <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                                                            New
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-muted-foreground mt-2 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                {notif.details && (
                                                    <p className="text-sm text-muted-foreground/70 mt-3 bg-secondary/50 px-3 py-2 rounded-lg inline-block">
                                                        <Info className="w-4 h-4 inline mr-2" />
                                                        {notif.details}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-3">{notif.time}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {notif.unread && (
                                                    <button
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Archive className="w-4 h-4 text-muted-foreground" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notif.id)}
                                                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {filteredNotifications.length === 0 && (
                        <div className="text-center py-12">
                            <Bell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg">No notifications found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
