import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import portalPatientImg from '../../assets/images/portal-patient.jpg';
import portalDoctorImg from '../../assets/images/portal-doctor.jpg';
import portalAdminImg from '../../assets/images/portal-admin.jpg';
import heroHospitalImg from '../../assets/images/hero-hospital.jpg';

const portalConfig = {
  PATIENT: {
    title: 'Patient Portal Login',
    subtitle: 'Access your medical records, appointments, and prescriptions',
    badge: 'Patient Access',
    badgeColor: '#0d9488',
    badgeBg: '#ccfbf1',
    image: portalPatientImg,
    demoEmail: 'vishal@healthcare.com',
    demoRole: 'PATIENT',
    redirect: '/patient/dashboard',
  },
  DOCTOR: {
    title: 'Doctor Portal Login',
    subtitle: 'Access clinical management, patient records, and appointments',
    badge: 'Physician Access',
    badgeColor: '#0284c7',
    badgeBg: '#e0f2fe',
    image: portalDoctorImg,
    demoEmail: 'dr.rahul.sharma@healthcare.com',
    demoRole: 'DOCTOR',
    redirect: '/doctor/dashboard',
  },
  ADMIN: {
    title: 'Admin Portal Login',
    subtitle: 'Healthcare operations, analytics, and system audit logs',
    badge: 'Administrative Access',
    badgeColor: '#7e22ce',
    badgeBg: '#f3e8ff',
    image: portalAdminImg,
    demoEmail: 'admin.rbac.test@healthcare.com',
    demoRole: 'ADMIN',
    redirect: '/admin/dashboard',
  },
  LAB: {
    title: 'Laboratory Portal Login',
    subtitle: 'Upload and manage diagnostic lab reports and results',
    badge: 'Laboratory Staff',
    badgeColor: '#d97706',
    badgeBg: '#fef3c7',
    image: heroHospitalImg,
    demoEmail: 'lab.rbac.test@healthcare.com',
    demoRole: 'LAB',
    redirect: '/lab/dashboard',
  },
};

const LoginPage = ({ portalRole, roleHint = 'PATIENT' }) => {
  const effectiveRole = portalRole || roleHint || 'PATIENT';
  const config = portalConfig[effectiveRole] || portalConfig.PATIENT;
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // Verify that the user role matches or redirect to the user's role dashboard
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (user.role === 'PATIENT') navigate('/patient/dashboard');
      else if (user.role === 'LAB') navigate('/lab/dashboard');
      else navigate(config.redirect);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Invalid credentials or authentication error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail(config.demoEmail);
    setPassword(effectiveRole === 'PATIENT' || effectiveRole === 'DOCTOR' ? 'Demo@12345' : 'TestPassword123');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#ffffff',
      }}
      className="login-container"
    >
      {/* Left Column: Visual Feature */}
      <div
        style={{
          flex: '1.1',
          position: 'relative',
          backgroundColor: '#f8fafc',
          display: 'none',
          overflow: 'hidden',
          borderRight: '1px solid #e2e8f0',
        }}
        className="login-left-pane"
      >
        <img
          src={config.image}
          alt={config.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.75) 100%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '36px',
            left: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ffffff',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            }}
          >
            <Activity size={24} color="#ffffff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Smart<span style={{ color: '#7dd3fc' }}>Care</span>
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '36px',
            right: '36px',
            color: '#ffffff',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: config.badgeBg,
              color: config.badgeColor,
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}
          >
            {config.badge}
          </span>
          <h2 style={{ fontSize: '30px', fontWeight: 800, lineHeight: 1.25, marginBottom: '10px' }}>
            {config.title}
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', maxWidth: '440px', lineHeight: 1.6 }}>
            {config.subtitle}. All sessions are protected by verified Role-Based Access Control and audit logging.
          </p>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0284c7',
                marginBottom: '20px',
              }}
            >
              ← Back to Main Home
            </Link>

            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: config.badgeBg,
                color: config.badgeColor,
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
              {config.badge}
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Sign In
            </h1>
            <p style={{ color: '#64748b', fontSize: '14.5px' }}>
              Enter your authorized credentials to access your dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '13.5px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@healthcare.com"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '15px',
                borderRadius: '10px',
                marginTop: '12px',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Demo Account Box */}
          <div
            style={{
              marginTop: '28px',
              padding: '18px',
              backgroundColor: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Seeded Demo Account ({effectiveRole})
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0284c7',
                  background: '#e0f2fe',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Auto Fill
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0' }}>
              Email: <strong>{config.demoEmail}</strong>
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
              Click <em>Auto Fill</em> to populate credentials verified in Steps 7–13.
            </p>
          </div>

          {/* Switch Portals Links */}
          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            <span>Need a different portal? </span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '8px' }}>
              {portalRole !== 'PATIENT' && <Link to="/patient/login" style={{ color: '#0284c7', fontWeight: 600 }}>Patient</Link>}
              {portalRole !== 'DOCTOR' && <Link to="/doctor/login" style={{ color: '#0284c7', fontWeight: 600 }}>Doctor</Link>}
              {portalRole !== 'ADMIN' && <Link to="/admin/login" style={{ color: '#0284c7', fontWeight: 600 }}>Admin</Link>}
              {portalRole !== 'LAB' && <Link to="/lab/login" style={{ color: '#0284c7', fontWeight: 600 }}>Lab</Link>}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .login-left-pane {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
