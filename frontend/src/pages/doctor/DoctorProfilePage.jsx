import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Award,
  Building,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Stethoscope,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { doctorService } from '../../services/doctorService';

const formatDoctorDisplayName = (name) => {
  if (!name) return 'Physician';
  const trimmed = name.trim();
  if (/^dr\.?\s+/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
};

const getDoctorInitials = (name) => {
  if (!name) return 'DR';
  const clean = name.replace(/^dr\.?\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return clean.slice(0, 2).toUpperCase() || 'DR';
};

const DoctorProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospitalName, setHospitalName] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getProfile();
      setProfile(data);
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
      setSpecialization(data.specialization || '');
      setHospitalName(data.hospital_name || '');
    } catch {
      setMsg({ text: 'Unable to load doctor profile from server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg({ text: '', type: '' });
      const updated = await doctorService.updateProfile({
        full_name: fullName.trim(),
        phone: phone ? phone.trim() : null,
        specialization: specialization ? specialization.trim() : null,
        hospital_name: hospitalName ? hospitalName.trim() : null,
      });
      setProfile(updated);
      setMsg({ text: 'Doctor profile updated and persisted successfully.', type: 'success' });
    } catch (err) {
      const errText = err.response?.data?.detail || 'Failed to update profile in database.';
      setMsg({ text: errText, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Doctor Profile"
      subtitle="Manage your professional clinical credentials, contact information, and hospital affiliation."
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {msg.text && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '24px',
              backgroundColor: msg.type === 'success' ? '#ecfdf5' : '#fef2f2',
              border: `1.5px solid ${msg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              color: msg.type === 'success' ? '#065f46' : '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{msg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMsg({ text: '', type: '' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px' }}
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Loading doctor credentials from PostgreSQL..." />
        ) : profile ? (
          <div>
            {/* 1. POLISHED PROFILE HEADER */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                padding: '24px 28px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                    flexShrink: 0,
                  }}
                >
                  {getDoctorInitials(profile.full_name)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {formatDoctorDisplayName(profile.full_name)}
                    </h2>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ShieldCheck size={12} />
                      Verified Physician
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '13.5px', color: '#64748b', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Stethoscope size={15} color="#0284c7" />
                      <strong>{profile.specialization || 'General Medicine'}</strong>
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Building size={15} color="#64748b" />
                      {profile.hospital_name || 'Healthcare Medical Center'}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
                  Medical License No.
                </span>
                <code style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7' }}>
                  {profile.license_number || 'LIC-VERIFIED'}
                </code>
              </div>
            </div>

            {/* 2. PROFILE EDIT FORM */}
            <form onSubmit={handleSubmit}>
              {/* SECTION A: READ-ONLY SYSTEM CREDENTIALS */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  padding: '24px 28px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Lock size={16} color="#64748b" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#334155', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Verified Account & Licensing Credentials (Read-Only)
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px 0' }}>
                  These protected fields are permanently validated by hospital administrators and cannot be altered directly.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '18px',
                  }}
                >
                  {/* Read-Only Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Registered Healthcare Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="email"
                        value={profile.email || ''}
                        disabled
                        style={{
                          width: '100%',
                          height: '44px',
                          paddingLeft: '42px',
                          paddingRight: '14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontSize: '13.5px',
                          cursor: 'not-allowed',
                        }}
                      />
                    </div>
                  </div>

                  {/* Read-Only License Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Permanent Medical License Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Award size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        value={profile.license_number || ''}
                        disabled
                        style={{
                          width: '100%',
                          height: '44px',
                          paddingLeft: '42px',
                          paddingRight: '14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontSize: '13.5px',
                          fontFamily: 'monospace',
                          cursor: 'not-allowed',
                        }}
                      />
                    </div>
                  </div>

                  {/* Read-Only Role */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      RBAC Security Role
                    </label>
                    <div style={{ position: 'relative' }}>
                      <ShieldCheck size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        value="DOCTOR (Physician Practitioner)"
                        disabled
                        style={{
                          width: '100%',
                          height: '44px',
                          paddingLeft: '42px',
                          paddingRight: '14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontSize: '13.5px',
                          cursor: 'not-allowed',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: EDITABLE PRACTITIONER CONTACT & DETAILS */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  padding: '24px 28px',
                  marginBottom: '28px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <User size={18} color="#0284c7" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Practitioner Contact & Practice Affiliation (Editable)
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
                  Update your display name, contact phone number, clinical department specialization, and affiliated hospital.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {/* Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Practitioner Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Rahul Sharma"
                        required
                        className="form-input"
                        style={{ paddingLeft: '44px', height: '46px', fontSize: '14.5px' }}
                      />
                    </div>
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                      Official name visible to patients and in clinical medical records.
                    </span>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Contact Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="form-input"
                        style={{ paddingLeft: '44px', height: '46px', fontSize: '14.5px' }}
                      />
                    </div>
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                      Direct clinical line or hospital extension for care coordination.
                    </span>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Department Specialization
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Stethoscope size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Cardiology, Neurology, Pediatrics"
                        className="form-input"
                        style={{ paddingLeft: '44px', height: '46px', fontSize: '14.5px' }}
                      />
                    </div>
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                      Primary medical specialty used for appointment routing.
                    </span>
                  </div>

                  {/* Hospital Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Affiliated Hospital / Medical Center
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Building size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="text"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        placeholder="e.g. City General Hospital"
                        className="form-input"
                        style={{ paddingLeft: '44px', height: '46px', fontSize: '14.5px' }}
                      />
                    </div>
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                      Healthcare facility where you practice and examine patients.
                    </span>
                  </div>
                </div>

                {/* ACTION BAR */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '14px',
                    marginTop: '28px',
                    paddingTop: '20px',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 32px',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                    }}
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfilePage;
