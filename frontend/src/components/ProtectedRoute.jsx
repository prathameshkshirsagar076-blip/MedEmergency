import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0071E3] dark:text-[#2997FF] mb-3" />
        <p className="text-xs font-medium text-[#6E6E73] dark:text-[#86868B]">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!user) {
    // Route to role selection or specific role login based on requested path
    if (location.pathname.startsWith('/patient')) return <Navigate to="/patient/login" replace />;
    if (location.pathname.startsWith('/store')) return <Navigate to="/store/login" replace />;
    if (location.pathname.startsWith('/admin')) return <Navigate to="/admin/login" replace />;
    return <Navigate to="/select-role" replace />;
  }

  // If user is a medical store but pending admin approval
  if (
    user.role === 'store' &&
    user.store &&
    user.store.is_approved === false &&
    location.pathname !== '/store/pending-approval'
  ) {
    return <Navigate to="/store/pending-approval" replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'patient') return <Navigate to="/upload" replace />;
    if (user.role === 'store') return <Navigate to="/store/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
