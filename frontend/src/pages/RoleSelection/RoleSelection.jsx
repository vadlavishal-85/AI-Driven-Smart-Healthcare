import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HeartPulse,
  Stethoscope,
  UserCheck,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import doctorRoleImg from '../../assets/images/doctor_role.jpg';
import patientRoleImg from '../../assets/images/patient_role.jpg';
import adminRoleImg from '../../assets/images/admin_role.jpg';
import './RoleSelection.css';

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'DOCTOR',
      title: 'Doctor',
      workspaceTitle: 'Clinical Workspace',
      tagline: 'Physician Clinical Suite',
      description:
        'Manage patient consultation queues, review electronic medical records, author structured SOAP notes, and issue digital prescriptions.',
      image: doctorRoleImg,
      icon: Stethoscope,
      theme: 'teal',
      badgeColor: 'badge-teal',
      btnText: 'Enter Doctor Workspace',
      demoUser: 'Dr. Ananya Rao (doctor.demo@smarthealthcare.local)',
      capabilities: ['Consultation Queue', 'SOAP Notes', 'e-Prescribing', 'ICD-10 Diagnostics'],
    },
    {
      id: 'PATIENT',
      title: 'Patient',
      workspaceTitle: 'Personal Healthcare',
      tagline: 'Personal Health Portal',
      description:
        'Access your verified medical records, schedule doctor appointments, review vital telemetry, and manage active prescriptions.',
      image: patientRoleImg,
      icon: UserCheck,
      theme: 'blue',
      badgeColor: 'badge-blue',
      btnText: 'Enter Patient Portal',
      demoUser: 'Rahul Mehta (patient.demo@smarthealthcare.local)',
      capabilities: ['Health Charts', 'Appointment Booking', 'Active Prescriptions', 'Vitals Telemetry'],
    },
    {
      id: 'ADMIN',
      title: 'Admin',
      workspaceTitle: 'Smart Hospital Operations',
      tagline: 'Operations Center',
      description:
        'Oversee dual-database persistence telemetry (MySQL + MongoDB), manage clinical directories, and monitor FHIR interoperability streams.',
      image: adminRoleImg,
      icon: Shield,
      theme: 'cyan',
      badgeColor: 'badge-cyan',
      btnText: 'Enter Operations Center',
      demoUser: 'SmartCare Admin (admin.demo@smarthealthcare.local)',
      capabilities: ['Dual DB Telemetry', 'Practitioner Directory', 'FHIR Interoperability', 'Audit Events'],
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    // Smooth transition into login after prominent focus animation
    setTimeout(() => {
      navigate(`/login?role=${roleId}`);
    }, 350);
  };

  return (
    <div className="role-selection-page">
      {/* Top Header Bar */}
      <header className="role-selection-header">
        <div className="container-wide role-header-inner">
          <Link to="/" className="role-brand-link">
            <div className="role-brand-icon">
              <HeartPulse size={22} className="sh-pulse-icon" />
            </div>
            <span className="role-brand-title">
              Smart<span className="text-cyan">Healthcare</span>
            </span>
          </Link>

          <Link to="/" className="role-back-home-link">
            <ArrowLeft size={16} />
            <span>Back to Hospital Overview</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="role-selection-main animate-fade-up">
        <div className="container-wide">
          <div className="role-section-intro text-center">
            <div className="role-selection-pill">
              <Sparkles size={14} className="text-cyan" />
              <span>Dedicated Role-Based Portals</span>
            </div>
            <h1 className="role-main-heading">
              Select Your <span className="text-gradient-cyan">Healthcare Portal</span>
            </h1>
            <p className="role-main-subheading">
              Choose your institutional role to enter your specialized clinical or operational workspace.
            </p>
          </div>

          {/* 3 Large Visual Role Cards */}
          <div className="role-cards-container">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              const isOtherSelected = selectedRole !== null && selectedRole !== role.id;

              return (
                <div
                  key={role.id}
                  className={`role-visual-card theme-${role.theme} ${isSelected ? 'is-selected' : ''} ${isOtherSelected ? 'is-receded' : ''}`}
                  onClick={() => handleRoleSelect(role.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRoleSelect(role.id);
                    }
                  }}
                  aria-label={`Select ${role.title} Role`}
                >
                  {/* Photo Container */}
                  <div className="role-card-photo-box">
                    <img
                      src={role.image}
                      alt={`${role.title} Portal Visual`}
                      className="role-card-img"
                    />
                    <div className="role-card-photo-overlay" />
                    <span className={`role-photo-badge ${role.badgeColor}`}>
                      {role.tagline}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="role-card-content">
                    <div className="role-card-title-row">
                      <div className="role-card-icon-circle">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h2 className="role-card-title">{role.title}</h2>
                        <span className="role-card-tagline">{role.workspaceTitle}</span>
                      </div>
                    </div>

                    <p className="role-card-description">{role.description}</p>

                    <div className="role-card-caps-tags">
                      {role.capabilities.map((cap) => (
                        <span key={cap} className="role-cap-chip">
                          {cap}
                        </span>
                      ))}
                    </div>

                    <div className="role-card-action-bar">
                      <span className="role-action-text">{role.btnText}</span>
                      <div className="role-action-arrow">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Trust & Verification Strip */}
          <div className="role-trust-strip">
            <div className="role-trust-item">
              <CheckCircle2 size={16} className="text-success" />
              <span>Real Database Synchronization (MySQL 8.4 + MongoDB 6.0+)</span>
            </div>
            <div className="role-trust-item">
              <Lock size={16} className="text-cyan" />
              <span>Bcrypt Password Encryption & JWT Role Verification</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
