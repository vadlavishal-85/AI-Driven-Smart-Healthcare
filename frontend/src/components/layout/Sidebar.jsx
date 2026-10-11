import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  HeartPulse,
  Calendar,
  BarChart3,
  ShieldCheck,
  FileText,
  Pill,
  Share2,
  TestTubes,
  User as UserIcon,
  ClipboardEdit,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  const menuConfig = {
    ADMIN: [
      { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'User Directory', path: '/admin/users', icon: Users },
      { label: 'Doctor Directory', path: '/admin/doctors', icon: Stethoscope },
      { label: 'Patient Directory', path: '/admin/patients', icon: HeartPulse },
      { label: 'All Appointments', path: '/admin/appointments', icon: Calendar },
      { label: 'System Analytics', path: '/admin/analytics', icon: BarChart3 },
      { label: 'Audit Access Logs', path: '/admin/access-logs', icon: ShieldCheck },
    ],
    DOCTOR: [
      { label: 'Clinical Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
      { label: 'My Patients', path: '/doctor/patients', icon: Users },
      { label: 'Appointments', path: '/doctor/appointments', icon: Calendar },
      { label: 'Medical Records', path: '/doctor/medical-records', icon: FileText },
      { label: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
      { label: 'Clinical Notes', path: '/doctor/notes', icon: ClipboardEdit },
      { label: 'Secure Data Sharing', path: '/doctor/data-sharing', icon: Share2 },
      { label: 'Doctor Profile', path: '/doctor/profile', icon: UserIcon },
    ],
    PATIENT: [
      { label: 'Health Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
      { label: 'My Appointments', path: '/patient/appointments', icon: Calendar },
      { label: 'Medical Records', path: '/patient/medical-records', icon: FileText },
      { label: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
      { label: 'Shared With Me', path: '/patient/shared-records', icon: Share2 },
      { label: 'Lab Reports', path: '/patient/lab-reports', icon: TestTubes },
      { label: 'My Profile', path: '/patient/profile', icon: UserIcon },
    ],
    LAB: [
      { label: 'Laboratory Dashboard', path: '/lab/dashboard', icon: LayoutDashboard },
      { label: 'Lab Diagnostic Reports', path: '/lab/reports', icon: TestTubes },
      { label: 'Staff Profile', path: '/lab/profile', icon: UserIcon },
    ],
  };

  const menuItems = menuConfig[role] || [];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: '70px',
          bottom: 0,
          left: 0,
          zIndex: 45,
          overflowY: 'auto',
          transition: 'transform 0.25s ease',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="app-sidebar"
      >
        <div style={{ padding: '24px 18px 12px 18px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94a3b8',
              paddingLeft: '12px',
            }}
          >
            {role} Portal Navigation
          </span>
        </div>

        <nav style={{ padding: '0 12px 24px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0284c7' : '#475569',
                  backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                  border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                }}
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ color: isActive ? '#0284c7' : '#64748b' }}
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={18} />
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>System Online</p>
              <p style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>PostgreSQL + MongoDB</p>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 1024px) {
            .app-sidebar {
              transform: translateX(0) !important;
            }
            .sidebar-backdrop {
              display: none !important;
            }
          }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
