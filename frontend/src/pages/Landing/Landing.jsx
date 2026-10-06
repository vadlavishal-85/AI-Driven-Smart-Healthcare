import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HeartPulse,
  ArrowRight,
  Stethoscope,
  UserCheck,
  Shield,
  ShieldCheck,
  Calendar,
  FileText,
  Pill,
  ArrowLeftRight,
  BarChart3,
  Lock,
  CheckCircle2,
  Layers,
  Cpu,
  Sparkles,
  ChevronDown,
  Server,
  Radio,
} from 'lucide-react';
import hospitalHeroImg from '../../assets/images/hospital_hero.jpg';
import doctorRoleImg from '../../assets/images/doctor_role.jpg';
import patientRoleImg from '../../assets/images/patient_role.jpg';
import adminRoleImg from '../../assets/images/admin_role.jpg';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // Auto-cycle ecosystem steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWorkflowStep((prev) => (prev + 1) % 7);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const workflowSteps = [
    {
      id: 'patient',
      title: '1. Patient',
      desc: 'Registers clinical profile and requests consultation',
      icon: UserCheck,
      color: 'blue',
      badge: 'MySQL Identity',
    },
    {
      id: 'doctor',
      title: '2. Doctor',
      desc: 'Assigned specialist reviews intake & opens clinical chart',
      icon: Stethoscope,
      color: 'teal',
      badge: 'Attending Physician',
    },
    {
      id: 'appointments',
      title: '3. Appointments',
      desc: 'Synchronized ACID consultation booking and queue',
      icon: Calendar,
      color: 'cyan',
      badge: 'Real-time Scheduler',
    },
    {
      id: 'records',
      title: '4. Medical Records',
      desc: 'Structured diagnostic records & ICD-10 indexed charts',
      icon: FileText,
      color: 'blue',
      badge: 'MongoDB Store',
    },
    {
      id: 'prescriptions',
      title: '5. Prescriptions',
      desc: 'Authorized e-prescriptions with dispensary tracking',
      icon: Pill,
      color: 'teal',
      badge: 'Digital Rx',
    },
    {
      id: 'exchange',
      title: '6. Data Exchange',
      desc: 'FHIR R4 & HL7 v2 interoperability payload transmission',
      icon: ArrowLeftRight,
      color: 'cyan',
      badge: 'HIE Gateway',
    },
    {
      id: 'analytics',
      title: '7. Analytics',
      desc: 'Hospital telemetry, operational intelligence & census',
      icon: BarChart3,
      color: 'emerald',
      badge: 'Enterprise Telemetry',
    },
  ];

  const networkNodes = [
    { id: 'PAT', title: 'PATIENTS', icon: UserCheck, count: '4 Active', color: 'blue' },
    { id: 'DOC', title: 'DOCTORS', icon: Stethoscope, count: '4 Specialists', color: 'teal' },
    { id: 'APT', title: 'APPOINTMENTS', icon: Calendar, count: '5 Managed', color: 'cyan' },
    { id: 'EMR', title: 'MEDICAL RECORDS', icon: FileText, count: 'MongoDB Core', color: 'blue' },
    { id: 'RX', title: 'PRESCRIPTIONS', icon: Pill, count: 'Digital Dispensary', color: 'teal' },
    { id: 'HIE', title: 'DATA EXCHANGE', icon: ArrowLeftRight, count: 'FHIR R4 / HL7', color: 'cyan' },
    { id: 'OPS', title: 'ANALYTICS', icon: BarChart3, count: 'Dual DB Stream', color: 'emerald' },
  ];

  const capabilities = [
    {
      icon: Calendar,
      title: 'Appointments',
      desc: 'Conflict-free appointment scheduling across hospital departments with dual-database locking.',
      tag: 'ACID Transactions',
      theme: 'blue',
    },
    {
      icon: FileText,
      title: 'Medical Records',
      desc: 'Document-oriented clinical records with ICD-10 diagnostic indexing, vitals, and lab attachments.',
      tag: 'MongoDB Document Core',
      theme: 'teal',
    },
    {
      icon: Layers,
      title: 'Clinical Notes',
      desc: 'Structured SOAP progress documentation (Subjective, Objective, Assessment, Plan) with digital physician signing.',
      tag: 'SOAP Methodology',
      theme: 'cyan',
    },
    {
      icon: Pill,
      title: 'Prescriptions',
      desc: 'End-to-end digital prescription workflow with dosage schedules, refills, and outpatient dispensary status.',
      tag: 'e-Prescribing',
      theme: 'emerald',
    },
    {
      icon: ArrowLeftRight,
      title: 'Healthcare Exchange',
      desc: 'FHIR R4 DiagnosticReport & HL7 v2 ADT_A01 interoperability gateways with cryptographic SHA256 seals.',
      tag: 'FHIR R4 & HL7 v2',
      theme: 'cyan',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Audit',
      desc: 'Real-time hospital operations telemetry, census monitoring, demographic distributions, and immutable audit logs.',
      tag: 'Enterprise Telemetry',
      theme: 'blue',
    },
  ];

  const roles = [
    {
      id: 'DOCTOR',
      title: 'Doctor Portal',
      tagline: 'Clinical Workspace',
      desc: 'Manage clinical queues, author SOAP progress notes, examine diagnostic EMRs, and sign digital prescriptions.',
      image: doctorRoleImg,
      icon: Stethoscope,
      theme: 'teal',
      accent: '#0d9488',
      features: ['Consultation Queue', 'SOAP Note Authoring', 'ICD-10 Diagnostic Charts'],
    },
    {
      id: 'PATIENT',
      title: 'Patient Portal',
      tagline: 'Personal Healthcare',
      desc: 'Access your secure medical charts, book clinical visits, monitor vitals, and track active prescriptions.',
      image: patientRoleImg,
      icon: UserCheck,
      theme: 'blue',
      accent: '#0284c7',
      features: ['Personal Health Chart', 'Doctor Consultations', 'Active Medication Refills'],
    },
    {
      id: 'ADMIN',
      title: 'Admin Console',
      tagline: 'Smart Hospital Operations',
      desc: 'Oversee dual-database persistence engines, practitioner rosters, FHIR telemetry, and institutional audit events.',
      image: adminRoleImg,
      icon: Shield,
      theme: 'cyan',
      accent: '#06b6d4',
      features: ['Dual DB Status (MySQL+Mongo)', 'FHIR Exchange Stream', 'Hospital Telemetry'],
    },
  ];

  return (
    <div className="sh-landing-root">
      {/* 1. HERO VIEWPORT: 100vh FULL-SCREEN HOSPITAL VISUAL */}
      <section className="sh-hero-viewport" id="home">
        {/* Full-bleed Hospital Background Visual */}
        <img
          src={hospitalHeroImg}
          alt="Modern Smart Hospital Facility"
          className="sh-hero-bg-visual"
        />

        {/* Dynamic Dark Gradient & Glass Overlay */}
        <div className="sh-hero-overlay" />

        {/* Subtle Floating Medical Data Particles & Nodes */}
        <div className="sh-hero-particles" aria-hidden="true">
          <div className="sh-particle p1" />
          <div className="sh-particle p2" />
          <div className="sh-particle p3" />
          <div className="sh-particle p4" />
          <div className="sh-particle p5" />
          <svg className="sh-hero-ecg-svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path
              d="M0,50 L200,50 L220,20 L240,80 L260,35 L280,65 L300,50 L600,50 L620,15 L640,85 L660,30 L680,70 L700,50 L1000,50"
              className="sh-ecg-pulse-path"
            />
          </svg>
        </div>

        {/* Top Floating Navigation Header */}
        <header className="sh-landing-nav-header">
          <div className="container-wide sh-landing-nav-inner">
            <Link to="/" className="sh-landing-brand-logo">
              <div className="sh-brand-icon-halo">
                <HeartPulse size={24} className="sh-pulse-icon" />
              </div>
              <div className="sh-brand-text-block">
                <span className="sh-brand-title-main">
                  Smart<span className="sh-cyan-text">Healthcare</span>
                </span>
                <span className="sh-brand-title-tag">Connected Hospital OS</span>
              </div>
            </Link>

            <nav className="sh-landing-links desktop-only">
              <a href="#home" className="sh-landing-nav-link active">Home</a>
              <a href="#ecosystem" className="sh-landing-nav-link">Ecosystem</a>
              <a href="#network" className="sh-landing-nav-link">Network</a>
              <a href="#capabilities" className="sh-landing-nav-link">Capabilities</a>
              <a href="#roles" className="sh-landing-nav-link">Portals</a>
            </nav>

            <div className="sh-landing-nav-cta">
              <button
                type="button"
                onClick={() => navigate('/select-role')}
                className="sh-enter-btn-top"
                id="topbar-enter-btn"
              >
                <span>Enter SmartHealthcare</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Central Content */}
        <div className="container-wide sh-hero-center-content animate-fade-up">
          <div className="sh-hero-badge-pill">
            <span className="pulse-dot-cyan" />
            <span>Next-Gen Connected Hospital Platform</span>
            <span className="sh-badge-sep">•</span>
            <span className="sh-badge-highlight">Dual Engine MySQL & MongoDB</span>
          </div>

          <h1 className="sh-hero-headline">
            SMART <span className="text-gradient-cyan">HEALTHCARE</span>
          </h1>

          <p className="sh-hero-subheadline">
            Connected Care. Intelligent Healthcare.
          </p>

          <p className="sh-hero-description">
            One unified ecosystem connecting patients, clinical practitioners, and smart hospital operations.
            Engineered for synchronized appointments, electronic medical records, and FHIR interoperability.
          </p>

          <div className="sh-hero-actions-row">
            <button
              type="button"
              onClick={() => navigate('/select-role')}
              className="sh-hero-btn-primary"
              id="hero-enter-platform-btn"
            >
              <span>Enter SmartHealthcare</span>
              <ArrowRight size={20} />
            </button>

            <a href="#ecosystem" className="sh-hero-btn-ghost">
              <span>Explore Platform</span>
              <ChevronDown size={18} />
            </a>
          </div>

          {/* Quick Metrics Strip on Hero */}
          <div className="sh-hero-metrics-strip">
            <div className="sh-hero-metric-item">
              <span className="sh-metric-val">100%</span>
              <span className="sh-metric-label">Role-Isolated Security</span>
            </div>
            <div className="sh-hero-metric-sep" />
            <div className="sh-hero-metric-item">
              <span className="sh-metric-val">MySQL + Mongo</span>
              <span className="sh-metric-label">Dual Persistence Architecture</span>
            </div>
            <div className="sh-hero-metric-sep" />
            <div className="sh-hero-metric-item">
              <span className="sh-metric-val">FHIR R4 / HL7</span>
              <span className="sh-metric-label">Interoperability Gateway</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SMART HEALTHCARE ECOSYSTEM SECTION */}
      <section className="sh-section sh-ecosystem-section" id="ecosystem">
        <div className="container-wide">
          <div className="sh-section-header text-center">
            <div className="sh-section-pill">
              <Sparkles size={14} className="text-cyan" />
              <span>End-to-End Clinical Flow</span>
            </div>
            <h2 className="sh-section-title">
              Smart Healthcare <span className="text-gradient-cyan">Ecosystem</span>
            </h2>
            <p className="sh-section-subtitle">
              A synchronized data pipeline that seamlessly orchestrates patient intake, clinical diagnosis, electronic prescriptions, and hospital intelligence.
            </p>
          </div>

          {/* Interactive Pipeline Flow Visualization */}
          <div className="sh-workflow-pipeline">
            <div className="sh-workflow-steps-grid">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = activeWorkflowStep === idx;
                return (
                  <div
                    key={step.id}
                    className={`sh-workflow-step-card ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveWorkflowStep(idx)}
                  >
                    <div className="sh-step-header">
                      <div className={`sh-step-icon-box theme-${step.color}`}>
                        <Icon size={20} />
                      </div>
                      <span className="sh-step-badge">{step.badge}</span>
                    </div>
                    <h3 className="sh-step-title">{step.title}</h3>
                    <p className="sh-step-desc">{step.desc}</p>
                    {idx < workflowSteps.length - 1 && (
                      <div className="sh-step-connector-arrow">
                        <ArrowRight size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONNECTED HEALTHCARE NETWORK SECTION */}
      <section className="sh-section sh-network-section" id="network">
        <div className="container-wide">
          <div className="sh-section-header text-center">
            <div className="sh-section-pill">
              <Radio size={14} className="text-teal" />
              <span>Multi-Node Topology</span>
            </div>
            <h2 className="sh-section-title">
              Connected Healthcare <span className="text-gradient-medical">Network</span>
            </h2>
            <p className="sh-section-subtitle">
              Visualizing the interconnected nodes powering modern digital hospital operations.
            </p>
          </div>

          <div className="sh-network-visual-container">
            <div className="sh-network-hub-center">
              <div className="sh-hub-core">
                <HeartPulse size={36} className="text-cyan sh-pulse-icon" />
                <span className="sh-hub-title">SmartHospital Core Node</span>
                <span className="sh-hub-subtitle">Dual DB & FHIR Broker</span>
              </div>
            </div>

            <div className="sh-network-nodes-ring">
              {networkNodes.map((node) => {
                const Icon = node.icon;
                return (
                  <div key={node.id} className={`sh-net-node-card theme-${node.color}`}>
                    <div className="sh-net-node-icon">
                      <Icon size={22} />
                    </div>
                    <div className="sh-net-node-info">
                      <h4 className="sh-net-node-name">{node.title}</h4>
                      <span className="sh-net-node-count">{node.count}</span>
                    </div>
                    <div className="sh-net-node-pulse" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM CAPABILITIES SECTION */}
      <section className="sh-section sh-capabilities-section" id="capabilities">
        <div className="container-wide">
          <div className="sh-section-header text-center">
            <div className="sh-section-pill">
              <Cpu size={14} className="text-cyan" />
              <span>Comprehensive Healthcare Features</span>
            </div>
            <h2 className="sh-section-title">
              Platform <span className="text-gradient-cyan">Capabilities</span>
            </h2>
            <p className="sh-section-subtitle">
              Engineered to meet the stringent security, clinical fidelity, and operational demands of modern healthcare institutions.
            </p>
          </div>

          <div className="sh-capabilities-grid">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className={`sh-capability-card theme-${cap.theme}`}>
                  <div className="sh-cap-top-row">
                    <div className="sh-cap-icon-box">
                      <Icon size={24} />
                    </div>
                    <span className="sh-cap-tag">{cap.tag}</span>
                  </div>
                  <h3 className="sh-cap-title">{cap.title}</h3>
                  <p className="sh-cap-desc">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. ROLE ENTRY SECTION: DOCTOR, PATIENT, ADMIN */}
      <section className="sh-section sh-roles-section" id="roles">
        <div className="container-wide">
          <div className="sh-section-header text-center">
            <div className="sh-section-pill">
              <ShieldCheck size={14} className="text-success" />
              <span>Tailored Workspaces</span>
            </div>
            <h2 className="sh-section-title">
              Select Your <span className="text-gradient-cyan">Portal Entry</span>
            </h2>
            <p className="sh-section-subtitle">
              Each healthcare stakeholder receives a distinct, specialized workspace tailored to their exact clinical or operational workflow.
            </p>
          </div>

          <div className="sh-role-cards-grid">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.id}
                  className={`sh-role-portal-card theme-${role.theme}`}
                  onClick={() => navigate(`/login?role=${role.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/login?role=${role.id}`);
                    }
                  }}
                  aria-label={`Enter ${role.title}`}
                >
                  <div className="sh-role-photo-wrapper">
                    <img
                      src={role.image}
                      alt={`${role.title} Visual`}
                      className="sh-role-card-photo"
                    />
                    <div className="sh-role-photo-gradient" />
                    <span className="sh-role-photo-tag">{role.tagline}</span>
                  </div>

                  <div className="sh-role-card-body">
                    <div className="sh-role-title-row">
                      <div className="sh-role-icon-box">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 className="sh-role-card-name">{role.title}</h3>
                        <span className="sh-role-card-sub">{role.tagline}</span>
                      </div>
                    </div>

                    <p className="sh-role-card-desc">{role.desc}</p>

                    <ul className="sh-role-feature-list">
                      {role.features.map((feat) => (
                        <li key={feat} className="sh-role-feature-item">
                          <CheckCircle2 size={15} className="text-cyan" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="sh-role-enter-action">
                      <span>Access {role.title}</span>
                      <ArrowRight size={18} className="sh-role-arrow" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA BANNER */}
      <section className="sh-cta-section">
        <div className="container-wide">
          <div className="sh-cta-card">
            <div className="sh-cta-content">
              <div className="sh-cta-badge">
                <HeartPulse size={16} className="text-cyan" />
                <span>Modern Connected Care</span>
              </div>
              <h2 className="sh-cta-title">
                Ready to Experience <span className="text-gradient-cyan">SmartHealthcare</span>?
              </h2>
              <p className="sh-cta-desc">
                Step into the future of connected healthcare delivery, digital medical records, and smart hospital operations.
              </p>
              <button
                type="button"
                onClick={() => navigate('/select-role')}
                className="sh-hero-btn-primary"
                id="final-cta-btn"
              >
                <span>Enter SmartHealthcare Now</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PROFESSIONAL FOOTER */}
      <footer className="sh-landing-footer">
        <div className="container-wide sh-footer-inner">
          <div className="sh-footer-brand-col">
            <div className="sh-footer-brand">
              <div className="sh-brand-icon-halo small">
                <HeartPulse size={20} />
              </div>
              <span className="sh-brand-title-main">
                Smart<span className="sh-cyan-text">Healthcare</span>
              </span>
            </div>
            <p className="sh-footer-desc">
              Next-generation hospital data exchange and clinical analytics platform. Engineered with dual-database persistence and FHIR R4 interoperability.
            </p>
            <div className="sh-compliance-badges">
              <span className="sh-comp-pill"><ShieldCheck size={13} className="text-success" /> HIPAA Aligned</span>
              <span className="sh-comp-pill"><Lock size={13} className="text-cyan" /> JWT / Bcrypt</span>
              <span className="sh-comp-pill"><Server size={13} className="text-teal" /> FHIR R4 & HL7</span>
            </div>
          </div>

          <div className="sh-footer-nav-col">
            <h4 className="sh-footer-heading">Platform</h4>
            <ul className="sh-footer-links">
              <li><a href="#ecosystem">Clinical Ecosystem</a></li>
              <li><a href="#network">Network Topology</a></li>
              <li><a href="#capabilities">Platform Capabilities</a></li>
              <li><Link to="/select-role">Role Portals</Link></li>
            </ul>
          </div>

          <div className="sh-footer-nav-col">
            <h4 className="sh-footer-heading">Portals</h4>
            <ul className="sh-footer-links">
              <li><Link to="/login?role=DOCTOR">Doctor Clinical Workspace</Link></li>
              <li><Link to="/login?role=PATIENT">Patient Healthcare Portal</Link></li>
              <li><Link to="/login?role=ADMIN">Hospital Operations Center</Link></li>
              <li><Link to="/register">Patient Registration</Link></li>
            </ul>
          </div>

          <div className="sh-footer-nav-col">
            <h4 className="sh-footer-heading">Architecture</h4>
            <ul className="sh-footer-links">
              <li><span>MySQL 8.4 InnoDB Core</span></li>
              <li><span>MongoDB 6.0+ Document Core</span></li>
              <li><span>FastAPI REST Subsystem</span></li>
              <li><span>Vite & React 19 Frontend</span></li>
            </ul>
          </div>
        </div>

        <div className="container-wide sh-footer-bottom">
          <p>© 2026 SmartHealthcare Platform. All clinical and operational rights reserved.</p>
          <div className="sh-footer-bottom-badges">
            <span className="pulse-dot-green" />
            <span>Hospital Services Operational (24/7/365)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
