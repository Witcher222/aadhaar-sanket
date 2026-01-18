import { useState } from 'react';
import { Settings, Bell, Moon, Globe, Shield, Database, Clock } from 'lucide-react';
import { DetailDialog, InfoItem, ActionButton } from './DetailDialog';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleSave = () => {
    toast({
      title: '✅ Settings Saved',
      description: 'Your preferences have been updated successfully.',
    });
    onOpenChange(false);
  };

  const toggleDarkMode = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Settings"
      description="Manage your application preferences"
      icon={<Settings className="w-5 h-5 text-primary" />}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Push Notifications</p>
              <p className="text-xs text-muted-foreground">Receive alerts for critical updates</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-secondary'
              }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifications ? 'left-6' : 'left-1'
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Switch to dark theme</p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`w-11 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary' : 'bg-secondary'
              }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'left-6' : 'left-1'
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Auto Refresh</p>
              <p className="text-xs text-muted-foreground">Automatically update data every 30s</p>
            </div>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`w-11 h-6 rounded-full transition-colors relative ${autoRefresh ? 'bg-primary' : 'bg-secondary'
              }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoRefresh ? 'left-6' : 'left-1'
                }`}
            />
          </button>
        </div>

        <div className="py-3 border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Language</p>
          </div>
          <select className="w-full px-3 py-2 bg-secondary border border-border rounded-xl text-sm">
            <option>English (India)</option>
            <option>हिंदी</option>
            <option>தமிழ்</option>
            <option>తెలుగు</option>
          </select>
        </div>

        <div className="py-3 border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Data Region</p>
          </div>
          <select className="w-full px-3 py-2 bg-secondary border border-border rounded-xl text-sm">
            <option>India Central (Mumbai)</option>
            <option>India South (Chennai)</option>
            <option>India West (Pune)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <ActionButton onClick={handleSave} variant="primary">
          Save Changes
        </ActionButton>
        <ActionButton onClick={() => onOpenChange(false)} variant="secondary">
          Cancel
        </ActionButton>
      </div>
    </DetailDialog>
  );
};
