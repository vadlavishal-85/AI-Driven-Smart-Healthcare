import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Database, Zap, Lock } from 'lucide-react';
import './AuthLayout.css';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="sh-auth-container">
      {/* Left Storytelling Banner */}
      <div className="sh-auth-hero-panel">
        <div className="sh-auth-hero-content">
          <Link to="/" className="sh-auth-brand">
            <div className="sh-auth-brand-icon">
              <Activity size={24} />
            </div>
            <span>SmartHealthcare</span>
          </Link>

          <div className="sh-auth-hero-text">
            <h2>A connected workspace for patient accounts and appointments.</h2>
            <p>
              Patients can book visits and review their own appointment details.
              Doctors can manage assigned visits and add clinical notes. This demo is
              not intended for real patient information.
            </p>
          </div>

          <div className="sh-auth-features">
            <div className="sh-auth-feature-pill">
              <ShieldCheck size={18} className="text-secondary" />
              <span>Role-Based Access Governance</span>
            </div>
            <div className="sh-auth-feature-pill">
              <Database size={18} className="text-primary" />
              <span>PostgreSQL on Render · SQLite locally</span>
            </div>
            <div className="sh-auth-feature-pill">
              <Zap size={18} className="text-accent" />
              <span>FastAPI & Vite High-Performance Stack</span>
            </div>
            <div className="sh-auth-feature-pill">
              <Lock size={18} className="text-secondary" />
              <span>Hashed Passwords & Role-Based Access</span>
            </div>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="sh-auth-grid-overlay" aria-hidden="true" />
      </div>

      {/* Right Form Area */}
      <div className="sh-auth-form-panel">
        <div className="sh-auth-form-wrapper animate-fade-up">
          <div className="sh-auth-form-header">
            <Link to="/" className="sh-auth-back-link">
              ← Back to main site
            </Link>
            <h1 className="sh-auth-title">{title}</h1>
            {subtitle && <p className="sh-auth-subtitle">{subtitle}</p>}
          </div>

          <div className="sh-auth-form-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
