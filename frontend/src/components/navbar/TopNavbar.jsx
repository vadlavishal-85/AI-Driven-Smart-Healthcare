import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  ArrowLeftRight,
  BarChart3,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  Pill,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import './TopNavbar.css';

// Dynamic role-based navigation configuration
const getNavItemsForRole = (role) => {
  switch (role) {
    case 'DOCTOR':
      return [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Appointments', path: '/appointments', icon: Calendar },
        { name: 'Patients', path: '/patients', icon: Users },
        { name: 'Medical Records', path: '/medical-records', icon: FileText },
        { name: 'Clinical Notes', path: '/clinical-notes', icon: FileText },
        { name: 'Prescriptions', path: '/prescriptions', icon: Pill },
        { name: 'Data Exchange', path: '/data-exchange', icon: ArrowLeftRight },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      ];
    case 'PATIENT':
      return [
        { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Appointments', path: '/appointments', icon: Calendar },
        { name: 'Medical Records', path: '/medical-records', icon: FileText },
        { name: 'Clinical Notes', path: '/clinical-notes', icon: FileText },
        { name: 'Prescriptions', path: '/prescriptions', icon: Pill },
        { name: 'Data Exchange', path: '/data-exchange', icon: ArrowLeftRight },
        { name: 'Care Team', path: '/doctors', icon: Stethoscope },
      ];
    case 'ADMIN':
    default:
      return [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Patients', path: '/patients', icon: Users },
        { name: 'Doctors', path: '/doctors', icon: Stethoscope },
        { name: 'Appointments', path: '/appointments', icon: Calendar },
        { name: 'Data Exchange', path: '/data-exchange', icon: ArrowLeftRight },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'System Activity', path: '/settings', icon: Settings },
      ];
  }
};

function formatRole(role) {
  if (role === 'ADMIN') return 'Hospital Administrator';
  if (role === 'DOCTOR') return 'Attending Physician';
  if (role === 'PATIENT') return 'Verified Patient';
  return 'Healthcare Member';
}

function getRoleAtmosphereBadge(role) {
  if (role === 'ADMIN') return { label: 'Operations Center', theme: 'cyan' };
  if (role === 'DOCTOR') return { label: 'Clinical Workspace', theme: 'teal' };
  if (role === 'PATIENT') return { label: 'Personal Healthcare', theme: 'blue' };
  return { label: 'Healthcare Portal', theme: 'neutral' };
}

export default function TopNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const { currentUser, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.sh-notif-wrapper')) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/select-role');
  };

  const roleFormatted = formatRole(currentUser?.role);
  const currentNavItems = getNavItemsForRole(currentUser?.role);
  const atmosphere = getRoleAtmosphereBadge(currentUser?.role);

  return (
    <header className={`sh-topbar ${scrolled ? 'sh-topbar-scrolled' : ''}`}>
      <div className="container-wide sh-topbar-inner">
        {/* Brand / Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="sh-topbar-brand">
          <div className="sh-brand-icon-box">
            <HeartPulse size={22} className="sh-pulse-icon" />
          </div>
          <div className="sh-brand-text">
            <span className="sh-brand-main">
              Smart<span className="sh-brand-cyan">Healthcare</span>
            </span>
            {isAuthenticated && (
              <span className={`sh-brand-tagline theme-${atmosphere.theme}`}>
                {atmosphere.label}
              </span>
            )}
          </div>
        </Link>

        {/* Center Workspace Navigation (Dynamic by Role) */}
        {isAuthenticated ? (
          <nav className="sh-workspace-nav desktop-only">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  aria-label={item.name}
                  title={item.name}
                  className={({ isActive }) =>
                    `sh-nav-pill ${isActive ? 'sh-nav-pill-active' : ''}`
                  }
                >
                  <Icon size={15} className="sh-nav-pill-icon" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        ) : (
          <div className="desktop-only" />
        )}

        {/* Right Actions */}
        <div className="sh-topbar-right">
          {isAuthenticated ? (
            <>
              <div className="sh-topbar-workspace-actions desktop-only">
                <div className="sh-status-pill-wrap">
                  <span className="pulse-dot-green" />
                  <span className="sh-status-text">Connected Node</span>
                </div>

              {/* Notification Trigger */}
              <div className="sh-notif-wrapper">
                <button
                  type="button"
                  className="sh-topbar-icon-btn"
                  title="System Notifications"
                  aria-label="Notifications"
                  onClick={() => setNotifOpen(!notifOpen)}
                >
                  <Bell size={18} />
                  <span className="sh-notif-dot" />
                </button>

                {notifOpen && (
                  <div className="sh-notif-dropdown animate-fade-in">
                    <div className="sh-notif-header">
                      <strong>Clinical Notifications</strong>
                      <span className="sh-notif-badge">Live</span>
                    </div>
                    <div className="sh-notif-item">
                      <ShieldCheck size={16} className="text-success" />
                      <div>
                        <p className="notif-title">Appointment Workflow</p>
                        <span className="notif-time">Account and appointment data use the configured SQL database</span>
                      </div>
                    </div>
                    <div className="sh-notif-item">
                      <Radio size={16} className="text-cyan" />
                      <div>
                        <p className="notif-title">Other Modules</p>
                        <span className="notif-time">Clinical records and data exchange are preview screens only</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              </div>

              <div className="sh-topbar-account-actions" aria-label="Account actions">
                <Link
                  to="/profile"
                  className="sh-topbar-account-action"
                  aria-label="Account Profile"
                  title="Account Profile"
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                <button
                  type="button"
                  className="sh-topbar-account-action sh-topbar-signout"
                  aria-label="Sign Out"
                  title="Sign Out"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="desktop-only">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/select-role')}
              >
                Select Role & Enter
              </Button>
            </div>
          )}

          <ThemeToggle />

          {/* Mobile Toggle */}
          <button
            type="button"
            className="sh-mobile-toggle mobile-only"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="sh-mobile-drawer animate-fade-in">
          {isAuthenticated ? (
            <div className="sh-mobile-nav-group">
              <div className="sh-mobile-section-title">
                {currentUser?.first_name} {currentUser?.last_name} ({roleFormatted})
              </div>
              <NavLink
                to="/profile"
                className="sh-mobile-pill"
                onClick={() => setMobileOpen(false)}
              >
                <User size={18} />
                <span>Account Profile</span>
              </NavLink>
              {currentNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="sh-mobile-pill"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
              <div className="sh-mobile-divider" />
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="sh-mobile-nav-group">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/select-role');
                }}
              >
                Select Role & Sign In
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
