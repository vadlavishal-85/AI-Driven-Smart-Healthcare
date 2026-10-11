import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { appointmentService } from '../../services/appointmentService';

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await appointmentService.getAllAppointments();
        setAppointments(Array.isArray(data) ? data : []);
      } catch {
        setError('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filtered = appointments.filter((app) => {
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  return (
    <DashboardLayout
      title="Hospital Appointment Schedules"
      subtitle="System-wide clinical appointments between patients and physicians."
    >
      {/* Filter Tabs */}
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
        <LoadingSpinner message="Loading appointment records..." />
      ) : error ? (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '12px' }}>{error}</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Appointment Date & Time</th>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Reason / Chief Complaint</th>
                <th>Clinical Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No appointments match the selected status filter.
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#0284c7" />
                        <strong>
                          {new Date(appt.appointment_date).toLocaleDateString()}{' '}
                          <span style={{ color: '#64748b', fontWeight: 500 }}>
                            {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </strong>
                      </div>
                    </td>
                    <td>
                      <strong>Dr. {appt.doctor?.full_name || 'Assigned Doctor'}</strong>
                      <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                        {appt.doctor?.specialization || 'General'}
                      </span>
                    </td>
                    <td>
                      <strong>{appt.patient?.full_name || 'Patient'}</strong>
                    </td>
                    <td>{appt.reason || 'Routine Consultation'}</td>
                    <td>
                      <span style={{ color: appt.notes ? '#0f172a' : '#94a3b8', fontSize: '13px' }}>
                        {appt.notes || 'No notes added'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={appt.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAppointmentsPage;
