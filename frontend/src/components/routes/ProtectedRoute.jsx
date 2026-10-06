import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { HeartPulse, ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import './ProtectedRoute.css';

/**
 * Route guard that ensures only authenticated and role-authorized users access protected routes.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="sh-auth-init-screen">
        <div className="sh-auth-init-card animate-fade-in">
          <div className="sh-auth-init-icon-wrapper">
            <HeartPulse size={36} className="sh-auth-pulse-icon" />
          </div>
          <h2 className="sh-auth-init-title">SmartHealthcare</h2>
          <p className="sh-auth-init-text">Loading your healthcare workspace...</p>
          <div className="sh-auth-init-progress-bar">
            <div className="sh-auth-init-progress-fill" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to role selection / login entry
    return <Navigate to="/select-role" state={{ from: location }} replace />;
  }

  // Check role authorization if allowedRoles is specified
  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = currentUser?.role;
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="sh-access-denied-screen">
          <div className="sh-access-denied-card animate-fade-scale">
            <div className="sh-denied-icon-circle">
              <ShieldAlert size={36} className="text-danger" />
            </div>
            <h2>403 — Access Restricted</h2>
            <p>
              Your authenticated role (<strong>{userRole || 'User'}</strong>) is not authorized to access this specific healthcare module.
            </p>
            <div className="sh-denied-actions">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft size={16} /> Return to My Workspace
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}
