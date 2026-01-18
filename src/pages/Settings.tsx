import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
    Settings as SettingsIcon, User, Bell, Palette, Shield, Database, Globe,
    Key, Mail, Smartphone, Sun, Moon, Monitor, Check, ChevronRight,
    Save, RefreshCw, AlertTriangle, Info, Lock, Eye, EyeOff
} from 'lucide-react';

interface SettingsSection {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const Settings = () => {
    const { toast } = useToast();
    const [activeSection, setActiveSection] = useState('profile');
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
    const [showApiKey, setShowApiKey] = useState(false);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        name: 'Admin User',
        email: 'admin@gov.in',
        role: 'Administrator',
        department: 'Ministry of Home Affairs',
        phone: '+91 98765 43210',
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        pushNotifications: true,
        smsAlerts: false,
        criticalOnly: false,
        dailyDigest: true,
        weeklyReport: true,
    });

    const [alertThresholds, setAlertThresholds] = useState({
        migrationSpike: 10,
        stressPressure: 80,
        dataAnomaly: 5,
        forecastConfidence: 70,
    });

    const sections: SettingsSection[] = [
        { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
        { id: 'alerts', label: 'Alert Thresholds', icon: <AlertTriangle className="w-5 h-5" /> },
        { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
        { id: 'api', label: 'API Configuration', icon: <Key className="w-5 h-5" /> },
        { id: 'data', label: 'Data Sources', icon: <Database className="w-5 h-5" /> },
    ];

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            toast({ title: '✅ Settings Saved', description: 'Your preferences have been updated successfully.' });
        }, 1000);
    };

    const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (val: boolean) => void; label: string }) => (
        <div className="flex items-center justify-between py-3">
            <span className="text-sm text-foreground">{label}</span>
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-secondary'}`}
            >
                <motion.div
                    initial={false}
                    animate={{ x: checked ? 24 : 2 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                />
            </button>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-border">
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <User className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
                                <p className="text-muted-foreground">{profile.role}</p>
                                <p className="text-sm text-muted-foreground">{profile.department}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-foreground">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                    className="w-full mt-1 px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground">Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                                    className="w-full mt-1 px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground">Department</label>
                                <input
                                    type="text"
                                    value={profile.department}
                                    onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
                                    className="w-full mt-1 px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground">Phone</label>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                                    className="w-full mt-1 px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-info/5 border border-info/20 rounded-xl flex items-start gap-3">
                            <Info className="w-5 h-5 text-info mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Notification Preferences</p>
                                <p className="text-xs text-muted-foreground">Configure how you receive alerts and updates from the system.</p>
                            </div>
                        </div>

                        <div className="divide-y divide-border">
                            <ToggleSwitch
                                checked={notifications.emailAlerts}
                                onChange={val => setNotifications(n => ({ ...n, emailAlerts: val }))}
                                label="Email Alerts"
                            />
                            <ToggleSwitch
                                checked={notifications.pushNotifications}
                                onChange={val => setNotifications(n => ({ ...n, pushNotifications: val }))}
                                label="Push Notifications"
                            />
                            <ToggleSwitch
                                checked={notifications.smsAlerts}
                                onChange={val => setNotifications(n => ({ ...n, smsAlerts: val }))}
                                label="SMS Alerts (Critical Only)"
                            />
                            <ToggleSwitch
                                checked={notifications.criticalOnly}
                                onChange={val => setNotifications(n => ({ ...n, criticalOnly: val }))}
                                label="Critical Alerts Only"
                            />
                            <ToggleSwitch
                                checked={notifications.dailyDigest}
                                onChange={val => setNotifications(n => ({ ...n, dailyDigest: val }))}
                                label="Daily Digest Email"
                            />
                            <ToggleSwitch
                                checked={notifications.weeklyReport}
                                onChange={val => setNotifications(n => ({ ...n, weeklyReport: val }))}
                                label="Weekly Summary Report"
                            />
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-foreground mb-4">Theme</h4>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'light', label: 'Light', icon: <Sun className="w-5 h-5" /> },
                                    { id: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" /> },
                                    { id: 'system', label: 'System', icon: <Monitor className="w-5 h-5" /> },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id as any)}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === t.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/30'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl ${theme === t.id ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                            {t.icon}
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <h4 className="text-sm font-medium text-foreground mb-2">Accent Color</h4>
                            <p className="text-xs text-muted-foreground mb-4">Coming soon - customize your dashboard accent color.</p>
                            <div className="flex gap-3">
                                {['hsl(30, 100%, 60%)', 'hsl(160, 84%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(280, 70%, 50%)', 'hsl(340, 75%, 55%)'].map((color, i) => (
                                    <button
                                        key={i}
                                        className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'alerts':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Alert Thresholds</p>
                                <p className="text-xs text-muted-foreground">Configure when the system should trigger alerts based on data thresholds.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-foreground">Migration Spike Threshold</label>
                                    <span className="text-sm font-bold text-primary">{alertThresholds.migrationSpike}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={alertThresholds.migrationSpike}
                                    onChange={e => setAlertThresholds(a => ({ ...a, migrationSpike: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Trigger alert when migration exceeds this % change</p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-foreground">Stress Pressure Threshold</label>
                                    <span className="text-sm font-bold text-primary">{alertThresholds.stressPressure}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="100"
                                    value={alertThresholds.stressPressure}
                                    onChange={e => setAlertThresholds(a => ({ ...a, stressPressure: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Alert when zone pressure index exceeds this threshold</p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-foreground">Data Anomaly Rate</label>
                                    <span className="text-sm font-bold text-primary">{alertThresholds.dataAnomaly}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={alertThresholds.dataAnomaly}
                                    onChange={e => setAlertThresholds(a => ({ ...a, dataAnomaly: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Flag data quality issues above this anomaly rate</p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-foreground">Forecast Confidence Minimum</label>
                                    <span className="text-sm font-bold text-primary">{alertThresholds.forecastConfidence}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="95"
                                    value={alertThresholds.forecastConfidence}
                                    onChange={e => setAlertThresholds(a => ({ ...a, forecastConfidence: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Only show forecasts with confidence above this level</p>
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                                </div>
                                <span className="px-3 py-1 bg-success/10 text-success text-sm font-medium rounded-lg">Enabled</span>
                            </div>
                            <button className="text-sm text-primary hover:underline">Configure 2FA Settings →</button>
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="font-medium text-foreground">Password</h4>
                                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                                </div>
                                <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <button className="text-sm text-primary hover:underline">Change Password →</button>
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <h4 className="font-medium text-foreground mb-2">Active Sessions</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-card rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-foreground">Windows PC - Chrome</span>
                                        <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Current</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">New Delhi</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-card rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-foreground">iPhone 15 Pro</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Mumbai</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'api':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-info/5 border border-info/20 rounded-xl flex items-start gap-3">
                            <Key className="w-5 h-5 text-info mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-foreground">API Configuration</p>
                                <p className="text-xs text-muted-foreground">Manage API keys for external integrations and AI services.</p>
                            </div>
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <h4 className="font-medium text-foreground mb-3">Gemini API Key</h4>
                            <div className="flex items-center gap-2">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value="sk-xxxx-xxxx-xxxx-xxxx-xxxx"
                                    readOnly
                                    className="flex-1 px-4 py-2.5 bg-card border border-border rounded-xl text-foreground text-sm font-mono"
                                />
                                <button onClick={() => setShowApiKey(!showApiKey)} className="p-2.5 bg-card border border-border rounded-xl hover:bg-secondary transition-colors">
                                    {showApiKey ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Used for AI Assistant features. Set in .env file.</p>
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <h4 className="font-medium text-foreground mb-3">UIDAI API Endpoint</h4>
                            <input
                                type="text"
                                value="https://api.uidai.gov.in/v2/analytics"
                                readOnly
                                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground text-sm font-mono"
                            />
                            <p className="text-xs text-muted-foreground mt-2">Read-only. Contact admin to modify.</p>
                        </div>
                    </div>
                );

            case 'data':
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-foreground">UIDAI Central Database</h4>
                                <span className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs rounded-lg">
                                    <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                                    Connected
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">Last sync: 2 minutes ago</p>
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-foreground">State Registry Feeds</h4>
                                <span className="text-sm text-foreground">28/28 Active</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: '100%' }} />
                            </div>
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-foreground">Census Integration</h4>
                                <span className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs rounded-lg">Active</span>
                            </div>
                            <p className="text-sm text-muted-foreground">2021 Census data + live projections</p>
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-foreground">Employment Ministry Feed</h4>
                                <span className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs rounded-lg">Active</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Real-time job sector data</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
                        <p className="text-muted-foreground mt-1">Manage your preferences and configurations</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="card-elevated p-4 h-fit">
                        <nav className="space-y-1">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeSection === section.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-foreground hover:bg-secondary'
                                        }`}
                                >
                                    {section.icon}
                                    <span className="font-medium">{section.label}</span>
                                    {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:col-span-3 card-elevated p-6"
                    >
                        <h2 className="text-xl font-display font-semibold text-foreground mb-6">
                            {sections.find(s => s.id === activeSection)?.label}
                        </h2>
                        {renderContent()}
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default Settings;