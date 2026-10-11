import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  FileText,
  Share2,
  Clock,
  ArrowRight,
  PlusCircle,
  Pill,
  ClipboardEdit,
  Stethoscope,
  Building2,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { dataSharingService } from '../../services/dataSharingService';
import { analyticsService } from '../../services/analyticsService';

const getDoctorDepartment = (spec) => {
  if (!spec) return 'General Medicine';
  const s = spec.toLowerCase();
  if (s.includes('cardio')) return 'Cardiology';
  if (s.includes('derma')) return 'Dermatology';
  if (s.includes('neuro')) return 'Neurology';
  if (s.includes('pediat')) return 'Pediatrics';
  if (s.includes('ortho')) return 'Orthopedics';
  return spec;
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const [profData, apptData, shareData, docMetrics] = await Promise.all([
          doctorService.getProfile().catch(() => null),
          appointmentService.getDoctorAppointments().catch(() => []),
          dataSharingService.getDoctorShares().catch(() => []),
          analyticsService.getHealthcareDocuments().catch(() => null),
        ]);
        setProfile(profData);
        setAppointments(Array.isArray(apptData) ? apptData : []);
        setShares(Array.isArray(shareData) ? shareData : []);
        setAnalytics(docMetrics);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Clinical Workstation">
        <LoadingSpinner message="Loading physician workstation & patient appointments..." />
      </DashboardLayout>
    );
  }

  const rawName = profile?.full_name || user?.full_name || 'Physician';
  const doctorDisplayName = rawName.startsWith('Dr. ') ? rawName : `Dr. ${rawName}`;
  const specialization = profile?.specialization || 'Clinical Specialist';
  const department = getDoctorDepartment(profile?.specialization);
  const hospital = profile?.hospital_name || 'Hospital Medical Center';

  // Strictly ensure appointments belong to this doctor
  const doctorFilteredAppointments = appointments.filter((appt) => {
    if (profile?.id && appt.doctor_id) {
      return appt.doctor_id === profile.id || appt.doctor_id === profile.user_id;
    }
    return true;
  });

  const scheduledCount = doctorFilteredAppointments.filter((a) => a.status === 'SCHEDULED').length;
  const completedCount = doctorFilteredAppointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <DashboardLayout
      title={`Welcome, ${doctorDisplayName}`}
      subtitle={`Department: ${department} • Specialization: ${specialization} • ${hospital}`}
    >
      {/* Doctor Department & Specialization Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bae6fd', marginBottom: '4px' }}>
            Doctor Portal
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
            Welcome, {doctorDisplayName}
          </h2>
          <div style={{ fontSize: '14px', color: '#e0f2fe' }}>
            {hospital}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              padding: '12px 22px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              minWidth: '150px',
            }}
          >
            <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#bae6fd', fontWeight: 700 }}>
              Department
            </div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              {department}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              padding: '12px 22px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              minWidth: '150px',
            }}
          >
            <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#bae6fd', fontWeight: 700 }}>
              Specialization
            </div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              {specialization}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <StatCard
          title="Scheduled Appointments"
          value={scheduledCount}
          icon={Calendar}
          color="blue"
          subtitle={`${doctorFilteredAppointments.length} total consultations`}
        />
        <StatCard
          title="Clinical Consultations"
          value={completedCount}
          icon={Users}
          color="teal"
          subtitle="Successfully completed"
        />
        <StatCard
          title="Authored Documents"
          value={analytics?.total || 0}
          icon={FileText}
          color="emerald"
          subtitle={`${analytics?.medical_records || 0} Records • ${analytics?.prescriptions || 0} Rx`}
        />
        <StatCard
          title="Shared Permissions"
          value={shares.length}
          icon={Share2}
          color="purple"
          subtitle={`${shares.filter((s) => s.status === 'APPROVED').length} active exchanges`}
        />
      </div>

      {/* Quick Action Navigation Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            Clinical Quick Actions
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Author new healthcare documentation and exchange records with patients
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/doctor/medical-records" className="btn btn-primary" style={{ fontSize: '13px' }}>
            <PlusCircle size={16} />
            <span>New Medical Record</span>
          </Link>
          <Link to="/doctor/prescriptions" className="btn btn-secondary" style={{ fontSize: '13px' }}>
            <Pill size={16} color="#0284c7" />
            <span>Write Prescription</span>
          </Link>
          <Link to="/doctor/data-sharing" className="btn btn-secondary" style={{ fontSize: '13px' }}>
            <Share2 size={16} color="#0d9488" />
            <span>Share Document</span>
          </Link>
        </div>
      </div>

      {/* Grid: Upcoming Appointments & Recent Shared Records */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Appointments Section */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Appointments
                </h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
                  <span>Department:</span>
                  <span style={{ color: '#0284c7', fontWeight: 800 }}>{department}</span>
                </div>
              </div>

              <Link to="/doctor/appointments" className="btn btn-secondary" style={{ fontSize: '13px', padding: '6px 14px' }}>
                View All Appointments →
              </Link>
            </div>

            <div style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginTop: '16px' }}>
              Upcoming Appointments
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {doctorFilteredAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '36px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <Calendar size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>No appointments currently scheduled.</p>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>Patient consultations for Department: {department} will appear here.</p>
              </div>
            ) : (
              doctorFilteredAppointments.slice(0, 5).map((appt) => {
                const dateObj = new Date(appt.appointment_date);
                const formattedDate = dateObj.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                });

                return (
                  <div
                    key={appt.id}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '15px', color: '#0f172a' }}>
                        <span style={{ color: '#64748b', fontWeight: 600, marginRight: '6px' }}>Patient:</span>
                        <strong style={{ fontWeight: 800 }}>{appt.patient?.full_name || 'Patient'}</strong>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '13.5px', marginTop: '2px' }}>
                      <div style={{ color: '#334155' }}>
                        <span style={{ color: '#64748b', fontWeight: 600, marginRight: '6px' }}>Date:</span>
                        <strong style={{ color: '#0f172a' }}>{formattedDate}</strong>
                      </div>
                      <div style={{ color: '#334155' }}>
                        <span style={{ color: '#64748b', fontWeight: 600, marginRight: '6px' }}>Time:</span>
                        <strong style={{ color: '#0284c7' }}>{formattedTime}</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: '13.5px', color: '#334155', borderTop: '1px dashed #e2e8f0', paddingTop: '8px', marginTop: '2px' }}>
                      <span style={{ color: '#64748b', fontWeight: 600, marginRight: '6px' }}>Reason:</span>
                      <span style={{ color: '#1e293b' }}>{appt.reason || 'General Consultation'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Shared Records Feed */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Authorized Data Exchange Feed</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Records you shared with patients</p>
            </div>
            <Link to="/doctor/data-sharing" style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7' }}>
              Manage →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shares.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                No records have been shared yet.
              </p>
            ) : (
              shares.slice(0, 5).map((share) => (
                <div
                  key={share.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      Document: <code style={{ color: '#0284c7' }}>{share.record_id ? String(share.record_id).slice(-6) : ''}</code>
                    </span>
                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      Type: <strong>{share.record_type || 'medical_record'}</strong> • Shared on {new Date(share.shared_at).toLocaleDateString()}
                    </span>
                  </div>
                  <StatusBadge status={share.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
