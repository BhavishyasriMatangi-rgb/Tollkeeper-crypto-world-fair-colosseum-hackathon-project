/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { CheckAddressPage } from './pages/CheckAddressPage';
import { AgentDemoPage } from './pages/AgentDemoPage';
import { HistoryPage } from './pages/HistoryPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { ApiDocsPage } from './pages/ApiDocsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ThreatFeedPage } from './pages/ThreatFeedPage';
import { AcademyPage } from './pages/AcademyPage';
import { EcosystemPage } from './pages/EcosystemPage';
import { SupportPage } from './pages/SupportPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SupportChatbot } from './components/common/SupportChatbot';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
}

// Redirect helper for legacy or root /check links
function CheckRedirect() {
  const location = useLocation();
  return <Navigate to={`/app/check${location.search}`} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <SettingsProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Landing Page */}
                <Route
                  path="/"
                  element={
                    <>
                      <LandingPage />
                      <SupportChatbot />
                    </>
                  }
                />

                {/* Authentication Page */}
                <Route path="/auth" element={<AuthPage />} />

                {/* Legacy or shortcut route */}
                <Route path="/check" element={<CheckRedirect />} />

                {/* Dashboard & Tool Routes */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/app/overview" replace />} />
                  <Route path="overview" element={<OverviewPage />} />
                  <Route path="check" element={<CheckAddressPage />} />
                  <Route path="threats" element={<ThreatFeedPage />} />
                  <Route path="demo" element={<AgentDemoPage />} />
                  <Route path="history" element={<HistoryPage />} />
                  <Route path="watchlist" element={<WatchlistPage />} />
                  <Route path="academy" element={<AcademyPage />} />
                  <Route path="ecosystem" element={<EcosystemPage />} />
                  <Route path="support" element={<SupportPage />} />
                  <Route path="docs" element={<ApiDocsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </SettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
