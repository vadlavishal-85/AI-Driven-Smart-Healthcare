import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Pill,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  HeartPulse,
  Stethoscope,
  Building2,
  PlusCircle,
  ShieldCheck,
  Activity,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { recordService } from '../../services/recordService';
import { dataSharingService } from '../../services/dataSharingService';
import { doctorService } from '../../services/doctorService';
import { getDoctorImage, getDoctorDepartment } from '../../utils/doctorImages';
import portalPatientImg from '../../assets/images/portal-patient.jpg';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [sharedRecords, setSharedRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [preselectedDoctorId, setPreselectedDoctorId] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [apptsData, recsData, rxData, sharedData, docsData] = await Promise.all([
        appointmentService.getMyAppointments().catch(() => []),
        recordService.getMyMedicalRecords().catch(() => []),
        recordService.getMyPrescriptions().catch(() => []),
        dataSharingService.getMySharedRecords().catch(() => []),
        doctorService.getAllDoctors().catch(() => []),
      ]);

      setAppointments(Array.isArray(apptsData) ? apptsData : []);
      setRecords(Array.isArray(recsData) ? recsData : []);
      setPrescriptions(Array.isArray(rxData) ? rxData : []);
      setSharedRecords(Array.isArray(sharedData) ? sharedData : []);
      setDoctors(Array.isArray(docsData) ? docsData.filter((d) => d.is_active !== false) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBookWithDoctor = (docId) => {
    setPreselectedDoctorId(docId);
    setIsBookModalOpen(true);
  };

  const handleAppointmentCreated = () => {
    fetchDashboardData();
    setToastMsg('Your appointment has been successfully scheduled!');
    setTimeout(() => setToastMsg(''), 5000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading patient health portal..." />
      </DashboardLayout>
    );
  }

  const upcomingAppts = appointments.filter((a) => a.status === 'SCHEDULED');

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="dash-toast">
          <CheckCircle2 size={20} color="#059669" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Welcome Banner with Healthcare Visual */}
      <div className="dash-hero-card">
        <div className="dash-hero-content">
          <div className="dash-hero-pill">
            <HeartPulse size={15} />
            <span>SmartCare Health Portal</span>
          </div>

          <h1 className="dash-hero-title">
            Welcome back, {user?.full_name || 'Patient'}
          </h1>

          <p className="dash-hero-desc">
            Your centralized clinical hub for managing doctor consultations, active prescriptions,
            and encrypted medical health records.
          </p>

          <div className="dash-hero-actions">
            <button
              onClick={() => {
                setPreselectedDoctorId('');
                setIsBookModalOpen(true);
              }}
              className="dash-hero-primary-btn"
            >
              <Calendar size={18} />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={() => navigate('/patient/appointments')}
              className="dash-hero-secondary-btn"
            >
              <span>View My Schedule</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Healthcare Visual in Hero */}
        <div className="dash-hero-visual-pane">
          <img
            src={portalPatientImg}
            alt="Healthcare Patient Consultation"
            className="dash-hero-img"
          />
          <div className="dash-hero-overlay" />
          <div className="dash-hero-tag">
            <ShieldCheck size={16} color="#0284c7" />
            <span>HIPAA-Compliant Care</span>
          </div>
        </div>
      </div>

      {/* Key Health Metrics */}
      <div className="dash-metrics-grid">
        <StatCard
          icon={Calendar}
          label="Upcoming Visits"
          value={upcomingAppts.length}
          trend={`${appointments.length} total appointments`}
          color="#0284c7"
        />
        <StatCard
          icon={FileText}
          label="Medical Records"
          value={records.length}
          trend="Secure diagnostic history"
          color="#0d9488"
        />
        <StatCard
          icon={Pill}
          label="Active Prescriptions"
          value={prescriptions.length}
          trend="Physician-guided therapies"
          color="#7c3aed"
        />
        <StatCard
          icon={Share2}
          label="Shared Records"
          value={sharedRecords.length}
          trend="Physician-shared documents"
          color="#f59e0b"
        />
      </div>

      {/* Available Doctors / Specialists Section */}
      <div className="dash-specialists-section">
        <div className="dash-section-header">
          <div>
            <div className="dash-section-pill">
              <Stethoscope size={14} />
              <span>Medical Care Team</span>
            </div>
            <h2 className="dash-section-title">Available Doctors & Specialists</h2>
            <p className="dash-section-subtitle">
              Book consultations directly with certified hospital specialists
            </p>
          </div>

          <button
            onClick={() => {
              setPreselectedDoctorId('');
              setIsBookModalOpen(true);
            }}
            className="dash-view-all-link"
          >
            <span>Book Visit</span>
            <PlusCircle size={16} />
          </button>
        </div>

        <div className="dash-doctors-grid">
          {doctors.slice(0, 5).map((doc) => {
            const docImg = getDoctorImage(doc);
            const dept = getDoctorDepartment(doc);

            return (
              <div key={doc.id} className="dash-doctor-card">
                <div className="dash-doctor-img-container">
                  <img
                    src={docImg}
                    alt={doc.full_name}
                    className="dash-doctor-img"
                  />
                  <span className="dash-doctor-dept-chip">{dept}</span>
                </div>

                <div className="dash-doctor-info">
                  <h3 className="dash-doctor-name">{doc.full_name}</h3>
                  <div className="dash-doctor-spec">{doc.specialization}</div>

                  <div className="dash-doctor-hospital">
                    <Building2 size={13} className="dash-hosp-icon" />
                    <span>{doc.hospital_name || 'SmartCare Hospital'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookWithDoctor(doc.id)}
                  className="dash-doctor-book-btn"
                >
                  <Calendar size={15} />
                  <span>Select & Book</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Upcoming Consultations & Active Prescriptions */}
      <div className="dash-twocol-grid">
        {/* Left Column: Upcoming Consultations */}
        <div className="dash-panel-card">
          <div className="dash-panel-header">
            <div>
              <h2 className="dash-panel-title">Upcoming Appointments</h2>
              <p className="dash-panel-subtitle">Your next clinical consultations</p>
            </div>
            <button
              onClick={() => navigate('/patient/appointments')}
              className="dash-panel-link"
            >
              <span>View All</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {upcomingAppts.length === 0 ? (
            <div className="dash-empty-box">
              <Clock size={40} className="dash-empty-icon" />
              <h4 className="dash-empty-heading">No Scheduled Visits</h4>
              <p className="dash-empty-text">You have no upcoming consultations right now.</p>
              <button
                onClick={() => {
                  setPreselectedDoctorId('');
                  setIsBookModalOpen(true);
                }}
                className="dash-empty-btn"
              >
                Schedule Appointment
              </button>
            </div>
          ) : (
            <div className="dash-appt-list">
              {upcomingAppts.slice(0, 3).map((appt) => {
                const docObj = appt.doctor || {
                  full_name: appt.doctor_name,
                  specialization: appt.specialization,
                  hospital_name: appt.hospital_name,
                };
                const docImg = getDoctorImage(docObj);

                return (
                  <div key={appt.id} className="dash-appt-item">
                    <img
                      src={docImg}
                      alt={docObj.full_name || 'Doctor'}
                      className="dash-appt-avatar"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="dash-appt-doc-name">
                        {docObj.full_name || 'Physician'}
                      </div>
                      <div className="dash-appt-reason">
                        {appt.reason || 'General Follow-up'}
                      </div>
                      <div className="dash-appt-time">
                        <Clock size={13} />
                        <span>
                          {new Date(appt.appointment_date).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent Prescriptions */}
        <div className="dash-panel-card">
          <div className="dash-panel-header">
            <div>
              <h2 className="dash-panel-title">Recent Prescriptions</h2>
              <p className="dash-panel-subtitle">Current medications and therapies</p>
            </div>
            <button
              onClick={() => navigate('/patient/prescriptions')}
              className="dash-panel-link"
            >
              <span>View All</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {prescriptions.length === 0 ? (
            <div className="dash-empty-box">
              <Pill size={40} className="dash-empty-icon" />
              <h4 className="dash-empty-heading">No Active Prescriptions</h4>
              <p className="dash-empty-text">No medications currently prescribed by your doctor.</p>
            </div>
          ) : (
            <div className="dash-appt-list">
              {prescriptions.slice(0, 3).map((rx) => (
                <div key={rx.id || rx._id} className="dash-rx-item">
                  <div className="dash-rx-meta">
                    <div className="dash-rx-title">
                      Clinical Prescription •{' '}
                      {new Date(rx.created_at).toLocaleDateString([], { dateStyle: 'medium' })}
                    </div>
                    <span className="dash-rx-pill-count">
                      {rx.medications?.length || 0} Meds
                    </span>
                  </div>
                  <div className="dash-rx-tags">
                    {rx.medications?.map((m, idx) => (
                      <span key={idx} className="dash-rx-tag">
                        {m.name} ({m.dosage})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shared Records Bottom Banner */}
      <div className="dash-sharing-banner">
        <div className="dash-sharing-info">
          <div className="dash-sharing-icon-box">
            <Share2 size={24} />
          </div>
          <div>
            <h3 className="dash-sharing-title">
              Doctor-Shared Clinical Records & Diagnostic Data
            </h3>
            <p className="dash-sharing-desc">
              You have {sharedRecords.length} secure document{sharedRecords.length === 1 ? '' : 's'} shared
              with you by authorized hospital physicians for collaborative care.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/patient/shared-records')}
          className="dash-sharing-btn"
        >
          <span>View Shared Documents</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        preselectedDoctorId={preselectedDoctorId}
        onAppointmentCreated={handleAppointmentCreated}
      />

      {/* Scoped CSS Styles for Patient Dashboard */}
      <style>{`
        .dash-toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          background-color: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.12);
        }

        /* Hero Card */
        .dash-hero-card {
          background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%);
          border: 1px solid #bae6fd;
          border-radius: 20px;
          padding: 36px 40px;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          box-shadow: 0 8px 24px -6px rgba(2, 132, 199, 0.12);
          position: relative;
          overflow: hidden;
        }

        .dash-hero-content {
          flex: 1.2;
          max-width: 650px;
          z-index: 2;
        }

        .dash-hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 9999px;
          background-color: #ffffff;
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          margin-bottom: 12px;
        }

        .dash-hero-title {
          font-size: 32px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin: 0 0 10px;
        }

        .dash-hero-desc {
          font-size: 15.5px;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 24px;
        }

        .dash-hero-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .dash-hero-primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.32);
          transition: all 0.18s ease;
        }

        .dash-hero-primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(2, 132, 199, 0.4);
        }

        .dash-hero-secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 12px;
          background-color: #ffffff;
          color: #0f172a;
          font-size: 14.5px;
          font-weight: 700;
          border: 1px solid #cbd5e1;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .dash-hero-secondary-btn:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
        }

        .dash-hero-visual-pane {
          position: relative;
          width: 280px;
          height: 190px;
          border-radius: 16px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15);
        }

        .dash-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .dash-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(2, 132, 199, 0.1) 0%, rgba(15, 23, 42, 0.35) 100%);
        }

        .dash-hero-tag {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          padding: 5px 10px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: #0f172a;
        }

        /* Metrics */
        .dash-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 20px;
          margin-bottom: 36px;
        }

        /* Specialists Section */
        .dash-specialists-section {
          margin-bottom: 36px;
        }

        .dash-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .dash-section-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 9999px;
          background-color: #ccfbf1;
          color: #0d9488;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .dash-section-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .dash-section-subtitle {
          font-size: 14.5px;
          color: #64748b;
          margin: 4px 0 0;
        }

        .dash-view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          background-color: #e0f2fe;
          color: #0284c7;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.15s ease;
        }

        .dash-view-all-link:hover {
          background-color: #bae6fd;
        }

        .dash-doctors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        .dash-doctor-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.03);
          transition: all 0.2s ease;
        }

        .dash-doctor-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px -4px rgba(2, 132, 199, 0.15);
          border-color: #93c5fd;
        }

        .dash-doctor-img-container {
          position: relative;
          width: 96px;
          height: 96px;
          margin-bottom: 14px;
        }

        .dash-doctor-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #e0f2fe;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
        }

        .dash-doctor-dept-chip {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #0d9488;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
          letter-spacing: 0.04em;
        }

        .dash-doctor-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .dash-doctor-name {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 3px;
        }

        .dash-doctor-spec {
          font-size: 13.5px;
          color: #0284c7;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .dash-doctor-hospital {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          color: #64748b;
          margin-bottom: 16px;
        }

        .dash-hosp-icon {
          color: #64748b;
          flex-shrink: 0;
        }

        .dash-doctor-book-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 14px;
          border-radius: 10px;
          background-color: #f0fdfa;
          color: #0d9488;
          border: 1px solid #99f6e4;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dash-doctor-book-btn:hover {
          background-color: #0d9488;
          color: #ffffff;
          border-color: #0d9488;
        }

        /* Two-Column Grid */
        .dash-twocol-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        .dash-panel-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 24px 26px;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
        }

        .dash-panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .dash-panel-title {
          font-size: 19px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .dash-panel-subtitle {
          font-size: 13.5px;
          color: #64748b;
          margin: 3px 0 0;
        }

        .dash-panel-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #0284c7;
          font-size: 13.5px;
          font-weight: 700;
          border: none;
          background: none;
          cursor: pointer;
        }

        .dash-panel-link:hover {
          text-decoration: underline;
        }

        .dash-appt-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dash-appt-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          transition: background-color 0.15s ease;
        }

        .dash-appt-item:hover {
          background-color: #f1f5f9;
        }

        .dash-appt-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        }

        .dash-appt-doc-name {
          font-size: 15.5px;
          font-weight: 800;
          color: #0f172a;
        }

        .dash-appt-reason {
          font-size: 13.5px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dash-appt-time {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 600;
          color: #0284c7;
          margin-top: 2px;
        }

        .dash-empty-box {
          text-align: center;
          padding: 36px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .dash-empty-icon {
          color: #cbd5e1;
        }

        .dash-empty-heading {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .dash-empty-text {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .dash-empty-btn {
          margin-top: 10px;
          padding: 8px 16px;
          border-radius: 8px;
          background-color: #0284c7;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        /* Prescription Item */
        .dash-rx-item {
          padding: 14px 16px;
          border-radius: 12px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .dash-rx-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .dash-rx-title {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
        }

        .dash-rx-pill-count {
          font-size: 12px;
          font-weight: 700;
          color: #7c3aed;
          background-color: #ede9fe;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .dash-rx-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .dash-rx-tag {
          font-size: 12.5px;
          font-weight: 600;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 3px 8px;
          border-radius: 6px;
          color: #334155;
        }

        /* Sharing Banner */
        .dash-sharing-banner {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.03);
        }

        .dash-sharing-info {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .dash-sharing-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background-color: #fef3c7;
          color: #b45309;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dash-sharing-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .dash-sharing-desc {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0;
          max-width: 650px;
        }

        .dash-sharing-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 10px;
          background-color: #ffffff;
          color: #0f172a;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dash-sharing-btn:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
        }

        @media (max-width: 980px) {
          .dash-hero-visual-pane {
            display: none;
          }
          .dash-twocol-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default PatientDashboard;
