import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  ArrowLeftRight,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Patients', path: '/dashboard/patients', icon: Users, badge: 'Workspace' },
  { name: 'Doctors', path: '/dashboard/doctors', icon: Stethoscope },
  { name: 'Appointments', path: '/dashboard/appointments', icon: Calendar },
  { name: 'Medical Records', path: '/dashboard/records', icon: FileText },
  { name: 'Data Exchange', path: '/dashboard/exchange', icon: ArrowLeftRight, badge: 'HL7/FHIR' },
  { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
];

const bottomNavItems = [
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  { name: 'Profile', path: '/dashboard/profile', icon: User },
];

export default function Sidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Return to landing page
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="sh-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sh-sidebar ${collapsed ? 'sh-sidebar-collapsed' : ''} ${mobileOpen ? 'sh-sidebar-mobile-open' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="sh-sidebar-header">
          <Link to="/" className="sh-sidebar-brand" title="SmartHealthcare">
            <div className="sh-sidebar-brand-icon">
              <Activity size={20} />
            </div>
            {!collapsed && (
              <span className="sh-sidebar-brand-name">
                Smart<span className="sh-sidebar-brand-highlight">Health</span>
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            className="sh-sidebar-collapse-btn desktop-only"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="sh-sidebar-close-btn mobile-only"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="sh-sidebar-nav-container">
          <div className="sh-sidebar-section-label">
            {!collapsed ? 'MAIN MENU' : '•'}
          </div>

          <nav className="sh-sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `sh-sidebar-item ${isActive ? 'sh-sidebar-item-active' : ''}`
                  }
                  title={collapsed ? item.name : undefined}
                  onClick={() => onCloseMobile && onCloseMobile()}
                >
                  <Icon size={19} className="sh-sidebar-item-icon" />
                  {!collapsed && (
                    <span className="sh-sidebar-item-text">{item.name}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="sh-sidebar-item-badge">{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="sh-sidebar-divider" />

          <div className="sh-sidebar-section-label">
            {!collapsed ? 'PREFERENCES' : '•'}
          </div>

          <nav className="sh-sidebar-nav">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sh-sidebar-item ${isActive ? 'sh-sidebar-item-active' : ''}`
                  }
                  title={collapsed ? item.name : undefined}
                  onClick={() => onCloseMobile && onCloseMobile()}
                >
                  <Icon size={19} className="sh-sidebar-item-icon" />
                  {!collapsed && (
                    <span className="sh-sidebar-item-text">{item.name}</span>
                  )}
                </NavLink>
              );
            })}

            <button
              type="button"
              className="sh-sidebar-item sh-sidebar-logout-btn"
              onClick={handleLogout}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut size={19} className="sh-sidebar-item-icon text-danger" />
              {!collapsed && (
                <span className="sh-sidebar-item-text">Sign Out</span>
              )}
            </button>
          </nav>
        </div>

        {/* Footer User Mini-Card */}
        {!collapsed && (
          <div className="sh-sidebar-footer">
            <div className="sh-sidebar-user-avatar">
              <span>SH</span>
            </div>
            <div className="sh-sidebar-user-info">
              <span className="sh-sidebar-user-name">Healthcare Workspace</span>
              <span className="sh-sidebar-user-role">Connected Node</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
