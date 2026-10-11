import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Stethoscope, Building2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';

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

const DoctorAppointmentsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDoctorAppointmentsData = async () => {
    try {
      setLoading(true);
      const [profData, apptsData] = await Promise.all([
        doctorService.getProfile().catch(() => null),
        appointmentService.getDoctorAppointments().catch(() => []),
      ]);
      setProfile(profData);
      setAppointments(Array.isArray(apptsData) ? apptsData : []);
    } catch {
      setErrorMsg('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointmentsData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await appointmentService.updateAppointmentStatus(id, { status: newStatus });
      setSuccessMsg(`Appointment marked as ${newStatus}.`);
      fetchDoctorAppointmentsData();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to update appointment status.';
      setErrorMsg(detail);
    }
  };

  const rawName = profile?.full_name || user?.full_name || 'Physician';
  const doctorDisplayName = rawName.startsWith('Dr. ') ? rawName : `Dr. ${rawName}`;
  const specialization = profile?.specialization || 'Clinical Specialist';
  const department = getDoctorDepartment(profile?.specialization);

  // Filter strictly by doctor profile
  const doctorFiltered = appointments.filter((appt) => {
    if (profile?.id && appt.doctor_id) {
      if (appt.doctor_id !== profile.id && appt.doctor_id !== profile.user_id) {
        return false;
      }
    }
    if (filterStatus === 'ALL') return true;
    return appt.status === filterStatus;
  });

  return (
    <DashboardLayout
      title="Clinical Appointments Schedule"
      subtitle={`Physician: ${doctorDisplayName} • Department: ${department} • Specialization: ${specialization}`}
    >
      {/* Department & Specialty Info Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f0f9ff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0369a1', letterSpacing: '0.05em' }}>
              Clinical Schedule
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              {doctorDisplayName}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>
              Department
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}>
              {department}
            </span>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>
              Specialization
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              {specialization}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '10px', marginBottom: '20px', fontSize: '13.5px' }}>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '10px', marginBottom: '20px', fontSize: '13.5px' }}>
          {errorMsg}
        </div>
      )}

      {/* Status Filter Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`btn ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {st} ({st === 'ALL' ? appointments.length : appointments.filter((a) => a.status === st).length})
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading appointments..." />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient Name</th>
                <th>Reason / Complaint</th>
                <th>Clinical Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctorFiltered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No appointments match the filter criteria for Department: {department}.
                  </td>
                </tr>
              ) : (
                doctorFiltered.map((appt) => {
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
                    <tr key={appt.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a' }}>
                            <Calendar size={14} color="#0284c7" />
                            <span>{formattedDate}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#0284c7', fontWeight: 600 }}>
                            <Clock size={13} />
                            <span>{formattedTime}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>
                          {appt.patient?.full_name || 'Patient'}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '13.5px', color: '#334155' }}>
                          {appt.reason || 'General Consultation'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: appt.notes ? '#0f172a' : '#94a3b8' }}>
                          {appt.notes || '--'}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={appt.status} />
                      </td>
                      <td>
                        {appt.status === 'SCHEDULED' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '12px', color: '#059669', borderColor: '#a7f3d0' }}
                              title="Mark Completed"
                            >
                              <CheckCircle2 size={14} />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '12px', color: '#ef4444', borderColor: '#fecaca' }}
                              title="Cancel Appointment"
                            >
                              <XCircle size={14} />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;
