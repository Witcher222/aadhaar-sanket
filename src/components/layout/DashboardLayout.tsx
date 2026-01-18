import { ReactNode, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppSidebar } from './AppSidebar';
import { TopHeader } from './TopHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [dataReady, setDataReady] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Whitelist pages that don't need data
  const publicPages = ['/', '/guide', '/ingestion', '/uidai-live', '/settings'];
  const isPublicPage = publicPages.includes(location.pathname);

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check Health & Data Status
        const response = await fetch('http://localhost:8000/api/upload/status');
        const data = await response.json();
        const isReady = data.data_status?.pipeline_complete || data.data_status?.ready_for_pipeline;

        // If status changed from not ready to ready, or new data detected
        if (dataReady === false && isReady) {
          console.log("Data detected! Refreshing dashboard...");
          queryClient.invalidateQueries();
          // Optional: Trigger a toast notification
        }

        // If new data flag is explicitly set by backend (if implemented)
        if (data.data_status?.new_data_detected) {
          queryClient.invalidateQueries();
        }

        setDataReady(isReady);
      } catch (e) {
        console.error("Status check failed", e);
        // Don't lock out if just network blip, keep previous state or separate error state
      }
    };

    checkStatus(); // Initial check
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [dataReady, queryClient]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopHeader />
        <main className="flex-1 p-6 overflow-x-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Locked Overlay */}
          {!isPublicPage && dataReady === false && (
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center max-w-md bg-card p-8 rounded-3xl border border-destructive/20 shadow-2xl"
              >
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                  Dashboard Locked
                </h2>
                <p className="text-muted-foreground mb-8">
                  No analyzed data found. Please ingest data to unlock the analytics dashboard.
                </p>
                <button
                  onClick={() => navigate('/ingestion')}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:shadow-glow transition-all flex items-center gap-2 mx-auto"
                >
                  Go to Ingestion <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
