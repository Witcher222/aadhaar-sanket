import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";

import LandingPage from "./pages/LandingPage";
import NationalOverview from "./pages/NationalOverview";
import MigrationPatterns from "./pages/MigrationPatterns";
import TrendAnalysis from "./pages/TrendAnalysis";
import MapDashboard from "./pages/MapDashboard";
import SpatialStressMap from "./pages/SpatialStressMap";
import Forecasts from "./pages/Forecasts";
import PolicyDecisions from "./pages/PolicyDecisions";
import DataQuality from "./pages/DataQuality";
import UserGuide from "./pages/UserGuide";
import AIAssistant from "./pages/AIAssistant";
import AIChatbot from "./pages/AIChatbot";
import Reports from "./pages/Reports";
import CriticalAlerts from "./pages/CriticalAlerts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { AIFloatingWidget } from "./components/AIFloatingWidget";
import DataIngestion from "./pages/DataIngestion";
import UIDAILiveData from "./pages/UIDAILiveData";
import DataJustificationPage from "./pages/DataJustification";
import { Notifications } from "./pages/Notifications";
import AdvancedInsights from "./pages/AdvancedInsights";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Layout Wrapper
const DashboardLayoutWrapper = () => (
  <DashboardLayout>
    <Outlet />
  </DashboardLayout>
);

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              {/* Dashboard Routes with Sidebar */}
              <Route element={<DashboardLayoutWrapper />}>
                <Route path="/dashboard" element={<NationalOverview />} />
                <Route path="/guide" element={<UserGuide />} />
                <Route path="/advanced" element={<AdvancedInsights />} />
                <Route path="/ingestion" element={<DataIngestion />} />
                <Route path="/uidai-live" element={<UIDAILiveData />} />
                <Route path="/migration" element={<MigrationPatterns />} />
                <Route path="/trends" element={<TrendAnalysis />} />
                <Route path="/map-dashboard" element={<MapDashboard />} />
                <Route path="/stress-map" element={<SpatialStressMap />} />
                <Route path="/forecasts" element={<Forecasts />} />
                <Route path="/critical-alerts" element={<CriticalAlerts />} />
                <Route path="/policy" element={<PolicyDecisions />} />
                <Route path="/data-quality" element={<DataQuality />} />
                <Route path="/justification" element={<DataJustificationPage />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/ai-chatbot" element={<AIChatbot />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIFloatingWidget />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
