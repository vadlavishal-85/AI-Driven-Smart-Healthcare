import React from 'react';
import PatientTopNav from './PatientTopNav';

const PatientLayout = ({ children, title, subtitle, actions }) => {
  return (
    <div className="patient-layout-root">
      {/* Horizontal Top Navigation Bar */}
      <PatientTopNav />

      {/* Main Content Area */}
      <main className="patient-layout-main">
        <div className="patient-layout-container">
          {(title || actions) && (
            <div className="patient-page-header">
              <div>
                {title && <h1 className="patient-page-title">{title}</h1>}
                {subtitle && <p className="patient-page-subtitle">{subtitle}</p>}
              </div>
              {actions && <div className="patient-page-actions">{actions}</div>}
            </div>
          )}

          {children}
        </div>
      </main>

      <style>{`
        .patient-layout-root {
          min-height: 100vh;
          background-color: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        .patient-layout-main {
          flex: 1;
          width: 100%;
          padding: 32px 24px 64px;
        }

        .patient-layout-container {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .patient-page-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
        }

        .patient-page-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin: 0;
        }

        .patient-page-subtitle {
          font-size: 15px;
          color: #64748b;
          margin-top: 6px;
          line-height: 1.5;
        }

        .patient-page-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .patient-layout-main {
            padding: 20px 16px 48px;
          }

          .patient-page-title {
            font-size: 24px;
          }

          .patient-page-subtitle {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default PatientLayout;
