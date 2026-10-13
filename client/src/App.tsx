import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore.js';
import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { RoomLobbyPage } from './pages/RoomLobbyPage.js';
import { GameRoomPage } from './pages/GameRoomPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-plum-700" />
        <p className="text-xs text-plum-500 font-medium">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/auth?mode=login&from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-cream-100 text-plum-950 font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:code"
              element={
                <ProtectedRoute>
                  <RoomLobbyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:code/play"
              element={
                <ProtectedRoute>
                  <GameRoomPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
