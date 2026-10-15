import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-100 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-forest-700 animate-spin mb-4" />
        <p className="text-stone-500 text-sm font-medium tracking-wide">
          Verifying JobPilot session...
        </p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-100 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-forest-700 animate-spin mb-4" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
