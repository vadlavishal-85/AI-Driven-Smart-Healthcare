import React from 'react';
import TopNavbar from '../components/navbar/TopNavbar';
import './DashboardLayout.css';

export default function DashboardLayout({ children }) {
  return (
    <div className="sh-dash-layout">
      {/* Premium Top Navigation Bar */}
      <TopNavbar mode="workspace" />

      {/* Main Healthcare Workspace */}
      <main className="sh-dash-main animate-fade-in">
        <div className="container-wide">
          {children}
        </div>
      </main>
    </div>
  );
}
