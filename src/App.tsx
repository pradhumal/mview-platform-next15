import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfessionalRoute } from "@/components/ProfessionalRoute";
import { featureFlags } from "@/lib/featureFlags";
import { MViewAppLayout } from "./components/MViewAppLayout";
import { PublicLayout } from "./components/PublicLayout";

// Auth pages
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OnboardingPage from "./pages/OnboardingPage";

// MineralView Intelligence (primary experience)
import OwnerIntelligencePage from "./pages/OwnerIntelligencePage";

// Explore pages (simplified verification)
import ExplorePage from "./pages/ExplorePage";
import MineralsPage from "./pages/MineralsPage";
import MineralDetailPage from "./pages/MineralDetailPage";
import AddMineralPage from "./pages/AddMineralPage";
import ActivityPage from "./pages/ActivityPage";
import ProductionPage from "./pages/ProductionPage";
import MapPage from "./pages/MapPage";
import ReportsPage from "./pages/ReportsPage";
import ReportDetailPage from "./pages/ReportDetailPage";

// Advanced View pages (pro features)
import AdvancedViewPage from "./pages/AdvancedViewPage";
import AdvancedOwnersPage from "./pages/advanced/AdvancedOwnersPage";
import AdvancedPortfolioPage from "./pages/advanced/AdvancedPortfolioPage";
import AdvancedVerificationPage from "./pages/advanced/AdvancedVerificationPage";
import AdvancedDeclinePage from "./pages/advanced/AdvancedDeclinePage";
import AdvancedReportsPage from "./pages/advanced/AdvancedReportsPage";
import AdvancedActivityPage from "./pages/advanced/AdvancedActivityPage";

// Settings
// Settings is now a sheet component, not a routed page

// Public pages
import LandingPage from "./pages/public/LandingPage";
import HowItWorksPage from "./pages/public/HowItWorksPage";
import PricingPage from "./pages/public/PricingPage";
import TrustPage from "./pages/public/TrustPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/trust" element={<TrustPage />} />
            </Route>

            {/* Auth */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/onboarding" element={
              <ProtectedRoute><OnboardingPage /></ProtectedRoute>
            } />

            {/* MView App (protected) */}
            <Route path="/app" element={
              <ProtectedRoute><MViewAppLayout /></ProtectedRoute>
            }>
              {/* Layer 1: Intelligence (default) */}
              <Route index element={<OwnerIntelligencePage />} />

              {/* Layer 2: Explore (data verification) */}
              <Route path="explore" element={<ExplorePage />} />
              <Route path="explore/minerals" element={<MineralsPage />} />
              {featureFlags.addMineral && <Route path="explore/minerals/add" element={<AddMineralPage />} />}
              <Route path="explore/minerals/:id" element={<MineralDetailPage />} />
              <Route path="explore/activity" element={<ActivityPage />} />
              <Route path="explore/production" element={<ProductionPage />} />
              <Route path="explore/map" element={<MapPage />} />
              <Route path="explore/reports" element={<ReportsPage />} />
              <Route path="explore/reports/:id" element={<ReportDetailPage />} />

              {/* Layer 3: Advanced View (pro features — gated by launch mode) */}
              {featureFlags.advancedView && (
                <>
                  <Route path="advanced" element={<ProfessionalRoute><AdvancedViewPage /></ProfessionalRoute>} />
                  <Route path="advanced/owners" element={<ProfessionalRoute><AdvancedOwnersPage /></ProfessionalRoute>} />
                  <Route path="advanced/portfolio" element={<ProfessionalRoute><AdvancedPortfolioPage /></ProfessionalRoute>} />
                  <Route path="advanced/verification" element={<ProfessionalRoute><AdvancedVerificationPage /></ProfessionalRoute>} />
                  <Route path="advanced/decline" element={<ProfessionalRoute><AdvancedDeclinePage /></ProfessionalRoute>} />
                  <Route path="advanced/reports" element={<ProfessionalRoute><AdvancedReportsPage /></ProfessionalRoute>} />
                  <Route path="advanced/activity" element={<ProfessionalRoute><AdvancedActivityPage /></ProfessionalRoute>} />
                </>
              )}

              {/* Settings is now a slide-over sheet, not a route */}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
