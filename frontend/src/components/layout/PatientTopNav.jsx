import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  Bell,
  Share2,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';

const PatientTopNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/patient/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { label: 'Medical Records', path: '/patient/medical-records', icon: FileText },
    { label: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
    { label: 'Notifications', path: '/patient/notifications', icon: Bell },
    { label: 'Data Sharing', path: '/patient/shared-records', icon: Share2 },
    { label: 'Profile', path: '/patient/profile', icon: User },
  ];

  return (
    <header className="patient-topnav-root">
      <div className="patient-topnav-container">
        {/* Brand Logo & Portal Tag */}
        <div className="patient-topnav-brand">
          <Link to="/patient/dashboard" className="patient-topnav-brand-link">
            <div className="patient-topnav-brand-icon">
              <Activity size={22} strokeWidth={2.5} />
            </div>
            <div className="patient-topnav-brand-text">
              <div className="patient-topnav-brand-title">
                Smart<span>Care</span>
              </div>
              <span className="patient-topnav-portal-badge">Patient Health Portal</span>
            </div>
          </Link>
        </div>

        {/* Desktop Horizontal Navigation */}
        <nav className="patient-topnav-nav-desktop" aria-label="Patient Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: active }) =>
                  `patient-nav-btn ${active ? 'patient-nav-btn-active' : ''}`
                }
              >
                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.9} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Utilities & Profile */}
        <div className="patient-topnav-right">
          <div className="patient-topnav-bell">
            <NotificationBell />
          </div>

          <div className="patient-profile-chip">
            <div className="patient-avatar-badge">
              <User size={16} strokeWidth={2.2} />
            </div>
            <div className="patient-chip-meta">
              <span className="patient-chip-name">{user?.full_name || 'Patient'}</span>
              <span className="patient-chip-role">Verified Patient</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="patient-logout-btn"
            title="Log out from patient account"
          >
            <LogOut size={16} />
            <span className="patient-logout-text">Logout</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="patient-mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="patient-mobile-menu">
          <nav className="patient-mobile-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive: active }) =>
                    `patient-mobile-nav-item ${active ? 'patient-mobile-nav-item-active' : ''}`
                  }
                >
                  <div className="patient-mobile-icon-box">
                    <Icon size={19} strokeWidth={isActive ? 2.3 : 2} />
                  </div>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="patient-mobile-divider" />

            <div className="patient-mobile-user-row">
              <div className="patient-avatar-badge">
                <User size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {user?.full_name || 'Patient'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.email}</div>
              </div>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="patient-mobile-logout-btn"
            >
              <LogOut size={18} />
              <span>Logout of Patient Portal</span>
            </button>
          </nav>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .patient-topnav-root {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.06);
          font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
        }

        .patient-topnav-container {
          max-width: 1440px;
          margin: 0 auto;
          height: 72px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .patient-topnav-brand-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .patient-topnav-brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(2, 132, 199, 0.28);
          flex-shrink: 0;
        }

        .patient-topnav-brand-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .patient-topnav-brand-title span {
          color: #0284c7;
        }

        .patient-topnav-portal-badge {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          color: #0d9488;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 1px;
        }

        /* Desktop Nav List */
        .patient-topnav-nav-desktop {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: nowrap;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .patient-topnav-nav-desktop::-webkit-scrollbar {
          display: none;
        }

        .patient-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 9999px;
          font-size: 14.5px;
          font-weight: 600;
          color: #475569;
          text-decoration: none;
          transition: all 0.18s ease;
          white-space: nowrap;
          border: 1px solid transparent;
        }

        .patient-nav-btn:hover {
          color: #0284c7;
          background-color: #f0f9ff;
        }

        .patient-nav-btn-active {
          color: #ffffff !important;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
          font-weight: 700;
        }

        .patient-topnav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .patient-profile-chip {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 4px 10px 4px 6px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
        }

        .patient-avatar-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e0f2fe;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .patient-chip-meta {
          display: flex;
          flex-direction: column;
        }

        .patient-chip-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .patient-chip-role {
          font-size: 10.5px;
          font-weight: 600;
          color: #0d9488;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .patient-logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 600;
          color: #b91c1c;
          background-color: #fff1f2;
          border: 1px solid #fecaca;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .patient-logout-btn:hover {
          background-color: #fee2e2;
          border-color: #fca5a5;
          transform: translateY(-1px);
        }

        .patient-mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
          cursor: pointer;
        }

        /* Mobile Menu */
        .patient-mobile-menu {
          background-color: #ffffff;
          border-top: 1px solid #e2e8f0;
          padding: 16px 20px 24px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .patient-mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .patient-mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          color: #334155;
          text-decoration: none;
          transition: background-color 0.15s ease;
        }

        .patient-mobile-nav-item:hover {
          background-color: #f1f5f9;
          color: #0284c7;
        }

        .patient-mobile-nav-item-active {
          background-color: #e0f2fe !important;
          color: #0284c7 !important;
          font-weight: 700;
        }

        .patient-mobile-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          color: inherit;
        }

        .patient-mobile-divider {
          height: 1px;
          background-color: #e2e8f0;
          margin: 12px 0;
        }

        .patient-mobile-user-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background-color: #f8fafc;
          border-radius: 10px;
          margin-bottom: 12px;
        }

        .patient-mobile-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 11px;
          border-radius: 10px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-weight: 700;
          font-size: 14.5px;
          cursor: pointer;
        }

        @media (max-width: 1180px) {
          .patient-topnav-nav-desktop {
            gap: 2px;
          }
          .patient-nav-btn {
            padding: 7px 10px;
            font-size: 13.5px;
            gap: 5px;
          }
        }

        @media (max-width: 980px) {
          .patient-topnav-nav-desktop {
            display: none;
          }
          .patient-mobile-toggle {
            display: flex;
          }
          .patient-profile-chip {
            display: none;
          }
          .patient-logout-btn {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default PatientTopNav;
