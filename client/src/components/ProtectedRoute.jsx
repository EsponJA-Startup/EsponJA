import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const userRole = localStorage.getItem('user_role');

  if (!userRole) {
    // Not logged in at all, kick to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Logged in but trying to access a page they don't have permission for
    // E.g., customer trying to view provider home
    if (userRole === 'customer') return <Navigate to="/client/home" replace />;
    if (userRole === 'provider') return <Navigate to="/provider/home" replace />;
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
