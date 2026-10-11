import React, { useState, useEffect } from 'react';
import {
  Calendar,
  PlusCircle,
  XCircle,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  Filter,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';
import { appointmentService } from '../../services/appointmentService';
import { getDoctorImage, getDoctorDepartment } from '../../utils/doctorImages';

const PatientAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const apptsData = await appointmentService.getMyAppointments();
      setAppointments(Array.isArray(apptsData) ? apptsData : []);
    } catch {
      // error handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancelAppointment(apptId);
      setMsg({ text: 'Appointment cancelled successfully.', type: 'success' });
      fetchData();
    } catch (err) {
      const errDetail = err.response?.data?.detail || 'Failed to cancel appointment.';
      setMsg({ text: errDetail, type: 'error' });
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'ALL') return true;
    return a.status === filter;
  });

  return (
    <DashboardLayout>
      {/* Header Banner */}
      <div className="appt-page-header-row">
        <div>
          <div className="appt-page-pill">
            <Stethoscope size={14} />
            <span>Outpatient Consultations</span>
          </div>
          <h1 className="appt-page-title">My Healthcare Appointments</h1>
          <p className="appt-page-subtitle">
            Schedule, manage, and review clinical consultations with your medical providers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="appt-page-book-btn"
        >
          <PlusCircle size={18} />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Alert Messages */}
      {msg.text && (
        <div
          className={`appt-status-alert ${
            msg.type === 'success' ? 'appt-status-alert-success' : 'appt-status-alert-error'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="appt-tabs-bar">
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`appt-tab-btn ${filter === tab ? 'appt-tab-btn-active' : ''}`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className="appt-tab-count">
              {tab === 'ALL'
                ? appointments.length
                : appointments.filter((a) => a.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Appointment Content */}
      {loading ? (
        <LoadingSpinner message="Loading your appointments..." />
      ) : filteredAppointments.length === 0 ? (
        <div className="appt-empty-card">
          <div className="appt-empty-icon-wrap">
            <Calendar size={42} />
          </div>
          <h3 className="appt-empty-title">No Appointments Found</h3>
          <p className="appt-empty-desc">
            You do not have any {filter !== 'ALL' ? filter.toLowerCase() : ''} appointments recorded.
            Book a consultation with our experienced physicians today.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="appt-page-book-btn"
            style={{ margin: '0 auto' }}
          >
            <PlusCircle size={18} />
            <span>Book an Appointment</span>
          </button>
        </div>
      ) : (
        <div className="appt-table-card">
          <div className="table-responsive">
            <table className="appt-custom-table">
              <thead>
                <tr>
                  <th>Physician & Specialty</th>
                  <th>Appointment Time</th>
                  <th>Reason / Medical Concern</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appt) => {
                  const docObj = appt.doctor || {
                    full_name: appt.doctor_name,
                    specialization: appt.specialization,
                    hospital_name: appt.hospital_name,
                  };
                  const docImg = getDoctorImage(docObj);
                  const docName = docObj.full_name || appt.doctor_name || 'Physician';
                  const docSpec = docObj.specialization || appt.specialization || 'General Specialist';
                  const hospital = docObj.hospital_name || 'SmartCare Hospital';

                  return (
                    <tr key={appt.id}>
                      {/* Doctor Column */}
                      <td>
                        <div className="appt-doc-cell">
                          <img
                            src={docImg}
                            alt={docName}
                            className="appt-doc-cell-avatar"
                          />
                          <div>
                            <div className="appt-doc-cell-name">{docName}</div>
                            <div className="appt-doc-cell-spec">{docSpec}</div>
                            <div className="appt-doc-cell-hosp">
                              <Building2 size={12} />
                              <span>{hospital}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Time Column */}
                      <td>
                        <div className="appt-time-cell">
                          <Clock size={16} className="appt-time-icon" />
                          <div>
                            <div className="appt-time-date">
                              {new Date(appt.appointment_date).toLocaleDateString(undefined, {
                                dateStyle: 'medium',
                              })}
                            </div>
                            <div className="appt-time-hour">
                              {new Date(appt.appointment_date).toLocaleTimeString(undefined, {
                                timeStyle: 'short',
                              })}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reason Column */}
                      <td>
                        <span className="appt-reason-text">{appt.reason || 'General Consultation'}</span>
                      </td>

                      {/* Status Column */}
                      <td>
                        <StatusBadge status={appt.status} />
                      </td>

                      {/* Actions Column */}
                      <td style={{ textAlign: 'right' }}>
                        {appt.status === 'SCHEDULED' ? (
                          <button
                            onClick={() => handleCancelAppointment(appt.id)}
                            className="appt-cancel-action-btn"
                          >
                            <XCircle size={15} />
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <span className="appt-no-action">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAppointmentCreated={() => {
          fetchData();
          setMsg({ text: 'Appointment booked successfully with physician!', type: 'success' });
        }}
      />

      {/* Scoped CSS Styles for Appointments Page */}
      <style>{`
        .appt-page-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 28px;
        }

        .appt-page-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 9999px;
          background-color: #e0f2fe;
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .appt-page-title {
          font-size: 30px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .appt-page-subtitle {
          font-size: 15px;
          color: #64748b;
          margin-top: 6px;
          line-height: 1.5;
        }

        .appt-page-book-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.28);
          transition: all 0.18s ease;
        }

        .appt-page-book-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
        }

        .appt-status-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .appt-status-alert-success {
          background-color: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .appt-status-alert-error {
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .appt-tabs-bar {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 14px;
          overflow-x: auto;
        }

        .appt-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          background: transparent;
          color: #64748b;
          transition: all 0.15s ease;
        }

        .appt-tab-btn:hover {
          color: #0284c7;
          background-color: #f0f9ff;
        }

        .appt-tab-btn-active {
          background-color: #0284c7 !important;
          color: #ffffff !important;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
        }

        .appt-tab-count {
          font-size: 12px;
          padding: 2px 7px;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.25);
          color: inherit;
        }

        .appt-tab-btn:not(.appt-tab-btn-active) .appt-tab-count {
          background-color: #e2e8f0;
          color: #475569;
        }

        /* Empty State */
        .appt-empty-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 56px 24px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
        }

        .appt-empty-icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background-color: #f1f5f9;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
        }

        .appt-empty-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .appt-empty-desc {
          font-size: 15px;
          color: #64748b;
          max-width: 440px;
          margin: 0 auto 24px;
          line-height: 1.5;
        }

        /* Table Card */
        .appt-table-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
        }

        .appt-custom-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .appt-custom-table thead th {
          background-color: #f8fafc;
          padding: 16px 22px;
          font-size: 13px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
        }

        .appt-custom-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.15s ease;
        }

        .appt-custom-table tbody tr:hover {
          background-color: #f8fafc;
        }

        .appt-custom-table tbody td {
          padding: 18px 22px;
          vertical-align: middle;
        }

        .appt-doc-cell {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .appt-doc-cell-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e0f2fe;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          flex-shrink: 0;
        }

        .appt-doc-cell-name {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .appt-doc-cell-spec {
          font-size: 13.5px;
          color: #0d9488;
          font-weight: 600;
        }

        .appt-doc-cell-hosp {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .appt-time-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .appt-time-icon {
          color: #0284c7;
          flex-shrink: 0;
        }

        .appt-time-date {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        .appt-time-hour {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .appt-reason-text {
          font-size: 14.5px;
          color: #334155;
          font-weight: 500;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .appt-cancel-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid #fecaca;
          background-color: #fff1f2;
          color: #b91c1c;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .appt-cancel-action-btn:hover {
          background-color: #fee2e2;
          border-color: #fca5a5;
        }

        .appt-no-action {
          color: #94a3b8;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .appt-page-title {
            font-size: 24px;
          }
          .appt-page-book-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default PatientAppointmentsPage;
