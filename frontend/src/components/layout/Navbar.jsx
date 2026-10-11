import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, Menu, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
import StatusBadge from '../common/StatusBadge';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              color: '#475569',
              background: '#ffffff',
            }}
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>
        )}

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
            }}
          >
            <Activity size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Smart<span style={{ color: '#0284c7' }}>Care</span>
            </span>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '-3px' }}>
              Healthcare Platform
            </span>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {isAuthenticated && user ? (
          <>
            <NotificationBell />

            <div
              style={{
                height: '32px',
                width: '1px',
                backgroundColor: '#e2e8f0',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: '1.5px solid #ffffff',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05)',
                }}
              >
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>

              <div style={{ display: 'none', flexDirection: 'column' }} className="d-md-flex">
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  {user.full_name}
                </span>
                <span style={{ marginTop: '3px' }}>
                  <StatusBadge status={user.role} />
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{
                  padding: '8px 14px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  color: '#ef4444',
                  borderColor: '#fecaca',
                }}
                title="Sign out of healthcare portal"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/patient/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Sign In
            </Link>
            <Link to="/#portals" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Portals
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .d-md-flex {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
