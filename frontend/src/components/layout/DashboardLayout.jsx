import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PatientLayout from './PatientLayout';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children, title, subtitle, actions }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (user?.role === 'PATIENT') {
    return (
      <PatientLayout title={title} subtitle={subtitle} actions={actions}>
        {children}
      </PatientLayout>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main
          style={{
            flex: 1,
            padding: '32px 36px',
            maxWidth: '100%',
            overflowX: 'hidden',
          }}
          className="dashboard-main-content"
        >
          {(title || actions) && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              <div>
                {title && (
                  <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div style={{ display: 'flex', gap: '10px' }}>{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-main-content {
            margin-left: 260px;
          }
        }
        @media (max-width: 768px) {
          .dashboard-main-content {
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
