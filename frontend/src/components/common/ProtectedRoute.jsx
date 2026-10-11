import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication session..." />;
  }

  if (!isAuthenticated || !user) {
    // Determine fallback login page based on target route
    let loginTarget = '/patient/login';
    if (location.pathname.startsWith('/admin')) loginTarget = '/admin/login';
    else if (location.pathname.startsWith('/doctor')) loginTarget = '/doctor/login';
    else if (location.pathname.startsWith('/lab')) loginTarget = '/lab/login';

    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '16px' }}>
          🛡️
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Access Restricted</h2>
        <p style={{ color: '#64748b', maxWidth: '440px', marginBottom: '24px' }}>
          Your current account role (<strong>{user.role}</strong>) does not have authorization to view this healthcare portal.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (user.role === 'ADMIN') window.location.href = '/admin/dashboard';
            else if (user.role === 'DOCTOR') window.location.href = '/doctor/dashboard';
            else if (user.role === 'PATIENT') window.location.href = '/patient/dashboard';
            else if (user.role === 'LAB') window.location.href = '/lab/dashboard';
            else window.location.href = '/';
          }}
        >
          Return to My Dashboard
        </button>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
