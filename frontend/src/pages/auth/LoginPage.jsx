import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building2,
  Stethoscope,
  Users,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import portalPatientImg from '../../assets/images/portal-patient.jpg';
import portalDoctorImg from '../../assets/images/portal-doctor.jpg';
import portalAdminImg from '../../assets/images/portal-admin.jpg';
import heroHospitalImg from '../../assets/images/hero-hospital.jpg';

// Doctor specialist photographs
import drRahulImg from '../../assets/images/doctor-rahul.jpg';
import drPriyaImg from '../../assets/images/doctor-priya.jpg';
import drArjunImg from '../../assets/images/doctor-arjun.jpg';
import drSnehaImg from '../../assets/images/doctor-sneha.jpg';
import drVikramImg from '../../assets/images/doctor-vikram.jpg';

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

const getDoctorPhoto = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('rahul')) return drRahulImg;
  if (n.includes('priya')) return drPriyaImg;
  if (n.includes('arjun')) return drArjunImg;
  if (n.includes('sneha')) return drSnehaImg;
  if (n.includes('vikram')) return drVikramImg;
  return null;
};

const getDoctorInitials = (name) => {
  if (!name) return 'DR';
  const clean = name.replace(/^dr\.?\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return clean.slice(0, 2).toUpperCase() || 'DR';
};

const LoginPage = ({ portalRole, roleHint = 'PATIENT' }) => {
  const effectiveRole = portalRole || roleHint || 'PATIENT';
  const config = portalConfig[effectiveRole] || portalConfig.PATIENT;
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Doctor specialist directory preview state
  const [directory, setDirectory] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [directoryError, setDirectoryError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    if (effectiveRole === 'DOCTOR') {
      const fetchDir = async () => {
        try {
          setLoadingDirectory(true);
          setDirectoryError('');
          const data = await doctorService.getPublicDirectory();
          setDirectory(Array.isArray(data) ? data : []);
        } catch {
          setDirectoryError('Unable to load department specialist directory.');
        } finally {
          setLoadingDirectory(false);
        }
      };
      fetchDir();
    }
  }, [effectiveRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // Verify that the user role matches or redirect to role dashboard
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

  const getDoctorEmail = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('rahul')) return 'dr.rahul.sharma@healthcare.com';
    if (n.includes('priya')) return 'dr.priya.reddy@healthcare.com';
    if (n.includes('arjun')) return 'dr.arjun.kumar@healthcare.com';
    if (n.includes('sneha')) return 'dr.sneha.patel@healthcare.com';
    if (n.includes('vikram')) return 'dr.vikram.rao@healthcare.com';
    return 'dr.rahul.sharma@healthcare.com';
  };

  const handleSelectDoctor = (doc, deptName) => {
    const docEmail = getDoctorEmail(doc.full_name);
    setEmail(docEmail);
    setPassword('Demo@12345');
    setSelectedDoctor({ ...doc, department: deptName });
    setError('');
  };

  // Auto-Fill helper: populates demo credentials including email and standard password Demo@12345
  const fillDemoIdentifier = () => {
    const targetEmail = selectedDoctor ? getDoctorEmail(selectedDoctor.full_name) : config.demoEmail;
    setEmail(targetEmail);
    setPassword('Demo@12345');
    setError('');
  };

  // Flatten doctors list for clean grid layout
  const allDoctors = directory.flatMap((dept) =>
    (dept.doctors || []).map((doc) => ({
      ...doc,
      department: dept.department,
    }))
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#f8fafc',
      }}
      className="login-container"
    >
      {/* ============================================================ */}
      {/* LEFT COLUMN: Image-Based Medical Specialist Directory (Doctor) */}
      {/* or Standard Brand Panel for other portals                    */}
      {/* ============================================================ */}
      {effectiveRole === 'DOCTOR' ? (
        <div
          style={{
            flex: '1.25',
            backgroundColor: '#f8fafc',
            borderRight: '1px solid #e2e8f0',
            padding: '36px 40px',
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            overflowY: 'auto',
          }}
          className="login-left-pane"
        >
          {/* SmartCare Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                }}
              >
                <Activity size={24} color="#ffffff" strokeWidth={2.5} />
              </div>
              <div>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Smart<span style={{ color: '#0284c7' }}>Care</span>
                </span>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
                  CLINICAL SPECIALIST DIRECTORY
                </span>
              </div>
            </div>

            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Physician Access
            </span>
          </div>

          {/* Section Introduction */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Credentialed Medical Specialists
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Select your licensed physician profile to automatically load your clinical department and sign-in identifier.
            </p>
          </div>

          {/* Doctors Card Grid */}
          {loadingDirectory ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#0284c7' }}>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>Loading medical specialists...</p>
            </div>
          ) : directoryError ? (
            <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '12px', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '13.5px' }}>
              {directoryError}
            </div>
          ) : allDoctors.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1.5px dashed #cbd5e1' }}>
              <Building2 size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#334155' }}>No Active Doctors Listed</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              {allDoctors.map((doc) => {
                const photo = getDoctorPhoto(doc.full_name);
                const docEmail = getDoctorEmail(doc.full_name);
                const isSelected = email.toLowerCase() === docEmail.toLowerCase();

                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoctor(doc, doc.department)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #0284c7' : '1.5px solid #e2e8f0',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? '0 6px 18px rgba(2, 132, 199, 0.15)' : '0 2px 6px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      {/* Doctor Avatar / Photo & Verification Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                        {photo ? (
                          <img
                            src={photo}
                            alt={doc.full_name}
                            style={{
                              width: '54px',
                              height: '54px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #e0f2fe',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '54px',
                              height: '54px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '18px',
                              flexShrink: 0,
                            }}
                          >
                            {getDoctorInitials(doc.full_name)}
                          </div>
                        )}

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h4
                            style={{
                              fontSize: '15px',
                              fontWeight: 800,
                              color: '#0f172a',
                              margin: '0 0 2px 0',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {doc.full_name}
                          </h4>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#e0f2fe',
                              color: '#0284c7',
                            }}
                          >
                            {doc.department}
                          </span>
                        </div>
                      </div>

                      {/* Hospital & Credentials */}
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={14} color="#94a3b8" />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.hospital_name || 'Healthcare Medical Center'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectDoctor(doc, doc.department);
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        border: 'none',
                        backgroundColor: isSelected ? '#0284c7' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#0f172a',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                      }}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Physician Selected</span>
                        </>
                      ) : (
                        <span>Select Doctor</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Safety Notice */}
          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '11.5px', color: '#64748b' }}>
            Protected Healthcare Exchange: Clinical records and patient data remain isolated and guarded behind role-based authentication.
          </div>
        </div>
      ) : (
        /* Left Column for Patient / Admin / Lab portals */
        <div
          style={{
            flex: '1.1',
            position: 'relative',
            backgroundColor: '#0f172a',
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
      )}

      {/* ============================================================ */}
      {/* RIGHT COLUMN: Authentication Form (Functional & Consistent)  */}
      {/* ============================================================ */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
          backgroundColor: '#ffffff',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Back Link & Header */}
          <div style={{ marginBottom: '28px' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0284c7',
                marginBottom: '16px',
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

          {/* Selected Doctor Indicator (if doctor selected) */}
          {effectiveRole === 'DOCTOR' && selectedDoctor && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '13px', color: '#0369a1', fontWeight: 600 }}>
                Selected: <strong>{selectedDoctor.full_name}</strong> ({selectedDoctor.department})
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
              >
                Clear
              </button>
            </div>
          )}

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

          {/* Login Form */}
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

          {/* Test / Demo Account Identifier Helper Box */}
          <div
            style={{
              marginTop: '28px',
              padding: '16px 18px',
              backgroundColor: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Demo Credentials ({effectiveRole})
              </span>
              <button
                type="button"
                onClick={fillDemoIdentifier}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0284c7',
                  background: '#e0f2fe',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Auto Fill
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0' }}>
              Identifier: <strong>{email || (selectedDoctor ? getDoctorEmail(selectedDoctor.full_name) : config.demoEmail)}</strong>
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0' }}>
              Demo Password: <strong style={{ fontFamily: 'monospace', color: '#0284c7' }}>Demo@12345</strong>
            </p>
            <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.4 }}>
              Click Auto Fill (or select a doctor on the left) to auto-populate credentials.
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
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
