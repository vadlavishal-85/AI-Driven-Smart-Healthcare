import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileText,
  Share2,
  BarChart3,
  Bell,
  Lock,
  Key,
  Database,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Building2,
  TestTubes,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import heroHospitalImg from '../assets/images/hero-hospital.jpg';
import portalPatientImg from '../assets/images/portal-patient.jpg';
import portalDoctorImg from '../assets/images/portal-doctor.jpg';
import portalAdminImg from '../assets/images/portal-admin.jpg';

const LandingPage = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a' }}>
      <Navbar />

      {/* HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '80px 24px 100px 24px',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                marginBottom: '24px',
                border: '1px solid #bae6fd',
              }}
            >
              <Sparkles size={16} />
              <span>SMART HEALTHCARE PLATFORM</span>
            </div>

            <h1 className="heading-hero" style={{ marginBottom: '22px' }}>
              Connected Healthcare.{' '}
              <span style={{ color: '#0284c7', background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Smarter Decisions.
              </span>{' '}
              Better Care.
            </h1>

            <p className="text-lead" style={{ maxWidth: '700px', margin: '0 auto 36px auto' }}>
              An enterprise-grade healthcare data exchange ecosystem combining relational PostgreSQL
              governance and flexible MongoDB medical documents. Manage clinical appointments, authenticated
              data sharing, doctor notes, prescriptions, and operational analytics.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
              <button
                onClick={() => scrollToSection('portals')}
                className="btn btn-primary btn-lg"
              >
                <span>Explore Platform</span>
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="btn btn-secondary btn-lg"
              >
                <span>Learn More</span>
              </button>
            </div>
          </div>

          {/* Hospital Hero Banner Image */}
          <div
            style={{
              marginTop: '56px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
              border: '4px solid #ffffff',
              position: 'relative',
              maxHeight: '480px',
            }}
          >
            <img
              src={heroHospitalImg}
              alt="State-of-the-art Healthcare Medical Center"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0) 60%, rgba(15, 23, 42, 0.45) 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e0f2fe' }}>
                  Smart Medical Facility
                </p>
                <p style={{ fontSize: '20px', fontWeight: 700 }}>
                  Multi-Specialty Integrated Healthcare Infrastructure
                </p>
              </div>
              <div style={{ display: 'flex', gap: '20px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '10px 18px', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontSize: '18px', fontWeight: 800 }}>99.9%</span>
                  <span style={{ display: 'block', fontSize: '11px', color: '#e2e8f0' }}>Uptime SLA</span>
                </div>
                <div>
                  <span style={{ fontSize: '18px', fontWeight: 800 }}>RBAC</span>
                  <span style={{ display: 'block', fontSize: '11px', color: '#e2e8f0' }}>Zero-Trust</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTAL SELECTION SECTION */}
      <section
        id="portals"
        style={{
          padding: '90px 24px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Role-Based Access
            </span>
            <h2 className="heading-section" style={{ marginTop: '8px', marginBottom: '14px' }}>
              Choose Your Healthcare Portal
            </h2>
            <p className="text-lead" style={{ fontSize: '16px' }}>
              Select your role to access the appropriate healthcare portal with verified security credentials.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px',
            }}
          >
            {/* CARD 1 — PATIENT */}
            <div
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '20px',
                overflow: 'hidden',
                padding: 0,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={portalPatientImg}
                  alt="Patient Portal Care"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <HeartPulse size={16} />
                  <span>Patient Care</span>
                </div>
              </div>

              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                  Patient Portal
                </h3>
                <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
                  Manage appointments, view medical records, prescriptions, and securely access shared
                  healthcare information from your authorized doctors.
                </p>
                <Link
                  to="/patient/login"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
                >
                  <span>Enter Patient Portal</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* CARD 2 — DOCTOR */}
            <div
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '20px',
                overflow: 'hidden',
                padding: 0,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={portalDoctorImg}
                  alt="Doctor Clinical Station"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <Stethoscope size={16} />
                  <span>Clinical Suite</span>
                </div>
              </div>

              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                  Doctor Portal
                </h3>
                <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
                  Manage patients, schedule clinical appointments, author medical records and prescriptions,
                  and securely share records with verified consent.
                </p>
                <Link
                  to="/doctor/login"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
                >
                  <span>Enter Doctor Portal</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* CARD 3 — ADMIN */}
            <div
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '20px',
                overflow: 'hidden',
                padding: 0,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={portalAdminImg}
                  alt="Hospital Operations Management"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#7e22ce',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <Building2 size={16} />
                  <span>Administration</span>
                </div>
              </div>

              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                  Admin Portal
                </h3>
                <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
                  Monitor healthcare operations, view user directories, inspect comprehensive analytics,
                  and review system audit access logs.
                </p>
                <Link
                  to="/admin/login"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
                >
                  <span>Enter Admin Portal</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Dedicated Laboratory Staff Portal Option */}
          <div
            style={{
              marginTop: '42px',
              padding: '20px 28px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TestTubes size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Diagnostic Laboratory Services
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Authorized clinical laboratory technicians can upload and manage diagnostic lab reports.
                </p>
              </div>
            </div>
            <Link
              to="/lab/login"
              className="btn btn-secondary"
              style={{ fontWeight: 700, fontSize: '13.5px', color: '#d97706', borderColor: '#fde68a' }}
            >
              <span>Laboratory Staff Login</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY THIS PLATFORM SECTION */}
      <section id="features" style={{ padding: '90px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Core Capabilities
            </span>
            <h2 className="heading-section" style={{ marginTop: '8px', marginBottom: '14px' }}>
              Built for Clinical Precision & Trust
            </h2>
            <p className="text-lead" style={{ fontSize: '16px' }}>
              Modern tools designed to streamline healthcare workflows while enforcing strict compliance and privacy.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                icon: ShieldCheck,
                color: '#0284c7',
                bg: '#e0f2fe',
                title: 'Secure Healthcare Data',
                desc: 'Fine-grained Role-Based Access Control (RBAC) ensuring patient privacy and doctor confidentiality.',
              },
              {
                icon: Calendar,
                color: '#0d9488',
                bg: '#ccfbf1',
                title: 'Smart Appointments',
                desc: 'Frictionless appointment scheduling, status tracking, and cancellation between doctors and patients.',
              },
              {
                icon: FileText,
                color: '#2563eb',
                bg: '#dbeafe',
                title: 'Medical Records & Prescriptions',
                desc: 'MongoDB-backed clinical records, prescriptions, and notes with structured metadata.',
              },
              {
                icon: Share2,
                color: '#7c3aed',
                bg: '#ede9fe',
                title: 'Authorized Data Exchange',
                desc: 'Doctor-to-patient sharing permissions verified in PostgreSQL with full revocation capabilities.',
              },
              {
                icon: BarChart3,
                color: '#059669',
                bg: '#d1fae5',
                title: 'Real-Time Analytics',
                desc: 'Aggregated operational dashboards, appointment volume trends, and utilization metrics.',
              },
              {
                icon: Bell,
                color: '#d97706',
                bg: '#fef3c7',
                title: 'Instant Notifications',
                desc: 'Real-time alert notifications on shared records, revoked permissions, and updates.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="card card-hover"
                  style={{
                    padding: '28px',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: feature.bg,
                      color: feature.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                      {feature.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.55 }}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section
        id="security"
        style={{
          padding: '90px 24px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div className="container">
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '48px',
              boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)',
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Lock size={26} />
              </div>
              <h2 className="heading-section" style={{ marginBottom: '12px' }}>
                Built With Security at the Core
              </h2>
              <p style={{ color: '#64748b', fontSize: '15.5px' }}>
                Protecting healthcare data requires strict authorization and verifiable audit trails.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '24px',
              }}
            >
              {[
                { title: 'JWT Authentication', desc: 'Secure token-based sessions with automatic expiry handling.' },
                { title: 'Role-Based Access Control', desc: 'Strict separation of ADMIN, DOCTOR, PATIENT, and LAB boundaries.' },
                { title: 'Bcrypt Password Hashing', desc: 'Industry-standard one-way cryptographic protection of credentials.' },
                { title: 'Authorized Data Sharing', desc: 'Consent-verified sharing without foreign-key coupling to documents.' },
                { title: 'Comprehensive Access Logging', desc: 'Audit logging of all shared record access and administrative events.' },
                { title: 'Database Isolation', desc: 'PostgreSQL governance paired with schema-less MongoDB document store.' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle2 size={18} color="#0284c7" />
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{item.title}</h4>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 24px 36px 24px', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '24px',
              paddingBottom: '36px',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity size={20} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Smart<span style={{ color: '#0284c7' }}>Care</span>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '14px', color: '#64748b' }}>
              <Link to="/patient/login" style={{ color: '#475569', fontWeight: 500 }}>Patient Portal</Link>
              <Link to="/doctor/login" style={{ color: '#475569', fontWeight: 500 }}>Doctor Portal</Link>
              <Link to="/admin/login" style={{ color: '#475569', fontWeight: 500 }}>Admin Portal</Link>
              <Link to="/lab/login" style={{ color: '#475569', fontWeight: 500 }}>Lab Portal</Link>
            </div>
          </div>

          <div style={{ paddingTop: '28px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
            © {new Date().getFullYear()} AI-Driven Smart Healthcare Data Exchange and Analytics Ecosystem. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
