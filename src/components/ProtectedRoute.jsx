import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/';
    return null;
  }

  return children;
};

export default ProtectedRoute;