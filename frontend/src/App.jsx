import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import FrostedHeader from './components/ui/FrostedHeader';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import RoleSelectionPage from './pages/RoleSelectionPage';

// Auth Pages
import PatientLoginPage from './pages/patient/PatientLoginPage';
import StoreLoginPage from './pages/store/StoreLoginPage';
import StoreSignupPage from './pages/store/StoreSignupPage';
import StorePendingApprovalPage from './pages/store/StorePendingApprovalPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Patient Protected Pages
import UploadPrescriptionPage from './pages/patient/UploadPrescriptionPage';
import OcrReviewPage from './pages/patient/OcrReviewPage';
import LiveBroadcastPage from './pages/patient/LiveBroadcastPage';
import MatchFoundPage from './pages/patient/MatchFoundPage';
import PatientHistoryPage from './pages/patient/PatientHistoryPage';

// Store Protected Pages
import StoreDashboardPage from './pages/store/StoreDashboardPage';
import StoreHistoryPage from './pages/store/StoreHistoryPage';

// Admin Protected Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#FFFFFF] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-200">
            <FrostedHeader />

            <main className="flex-grow">
              <Routes>
                {/* 1. Public Landing Page */}
                <Route path="/" element={<HomePage />} />

                {/* 2. Role Selection Screen */}
                <Route path="/select-role" element={<RoleSelectionPage />} />

                {/* 3a. Patient Auth (Google + Email/Password + Signup) */}
                <Route path="/patient/login" element={<PatientLoginPage />} />
                <Route path="/patient/signup" element={<PatientLoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* 3b. Medical Store Auth (Email + Password) */}
                <Route path="/store/login" element={<StoreLoginPage />} />
                <Route path="/store/signup" element={<StoreSignupPage />} />
                <Route path="/store/pending-approval" element={<StorePendingApprovalPage />} />

                {/* 4. Admin Auth (Discreet URL) */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Legacy / Helper Fallbacks */}
                <Route path="/login" element={<Navigate to="/patient/login" replace />} />
                <Route path="/signup" element={<Navigate to="/patient/signup" replace />} />

                {/* 5. Patient Protected Routes */}
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <UploadPrescriptionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/prescription/:id/review"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <OcrReviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/request/:id/broadcast"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <LiveBroadcastPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/request/:id/match-found"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <MatchFoundPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/history"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <PatientHistoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* 6. Medical Store Protected Routes */}
                <Route
                  path="/store/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['store']}>
                      <StoreDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/store/history"
                  element={
                    <ProtectedRoute allowedRoles={['store']}>
                      <StoreHistoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* 7. Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>

            {/* Apple Minimal Footer */}
            <footer className="py-12 hairline-t border-[#D2D2D7] dark:border-[#333336] text-center text-xs text-[#6E6E73] dark:text-[#86868B]">
              <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span>Copyright © {new Date().getFullYear()} MedEmergency Inc. All rights reserved.</span>
                <div className="flex items-center space-x-6">
                  <a href="/#how-it-works" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">How It Works</a>
                  <a href="/#for-stores" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">For Stores</a>
                  <a href="/#about" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">Trust & Safety</a>
                  <a href="/admin/login" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">Admin Portal</a>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
