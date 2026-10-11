import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { getDoctorImage, getDoctorDepartment } from '../../utils/doctorImages';

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
];

// Helper to convert 12h time string and date to ISO datetime
const formatToISO = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const [timePart, modifier] = timeStr.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const pad = (n) => String(n).padStart(2, '0');
  const localIsoStr = `${dateStr}T${pad(hours)}:${pad(minutes)}:00`;
  return new Date(localIsoStr).toISOString();
};

// Default date to tomorrow
const getTomorrowDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const BookAppointmentModal = ({ isOpen, onClose, onAppointmentCreated, preselectedDoctorId }) => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorFetchError, setDoctorFetchError] = useState('');

  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId || '');
  const [selectedDate, setSelectedDate] = useState(getTomorrowDateString());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      setDoctorFetchError('');
      const data = await doctorService.getAllDoctors();
      const list = Array.isArray(data) ? data.filter((d) => d.is_active !== false) : [];
      setDoctors(list);
      if (list.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(list[0].id);
      }
    } catch (err) {
      setDoctorFetchError('Unable to load doctors. Please try again.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      setSubmitError('');
      setSubmitSuccess('');
      if (preselectedDoctorId) {
        setSelectedDoctorId(preselectedDoctorId);
      }
    }
  }, [isOpen, preselectedDoctorId]);

  if (!isOpen) return null;

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setSubmitError('Please select a doctor for your appointment.');
      return;
    }
    if (!selectedDate) {
      setSubmitError('Please select an appointment date.');
      return;
    }
    if (!selectedTime) {
      setSubmitError('Please select an available time slot.');
      return;
    }
    if (!reason.trim()) {
      setSubmitError('Please provide a reason for the consultation.');
      return;
    }

    const isoDate = formatToISO(selectedDate, selectedTime);
    if (!isoDate) {
      setSubmitError('Invalid appointment date or time.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');
      const res = await appointmentService.createAppointment({
        doctor_id: selectedDoctorId,
        appointment_date: isoDate,
        reason: reason.trim(),
      });

      setSubmitSuccess('Appointment scheduled successfully!');
      setTimeout(() => {
        if (onAppointmentCreated) {
          onAppointmentCreated(res);
        }
        onClose();
      }, 900);
    } catch (err) {
      const detail =
        err.response?.data?.detail || 'Failed to book appointment. Please try again.';
      setSubmitError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="appt-modal-overlay" onClick={onClose}>
      <div className="appt-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="appt-modal-header">
          <div className="appt-modal-header-info">
            <div className="appt-badge">
              <HeartPulse size={14} />
              <span>Clinical Scheduling</span>
            </div>
            <h2 className="appt-modal-title">Book an Appointment</h2>
            <p className="appt-modal-subtitle">
              Select an authorized healthcare specialist, date, and preferred time slot.
            </p>
          </div>
          <button
            onClick={onClose}
            className="appt-modal-close-btn"
            aria-label="Close appointment modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="appt-modal-body">
          {/* Success Banner */}
          {submitSuccess && (
            <div className="appt-alert appt-alert-success">
              <CheckCircle2 size={20} />
              <span>{submitSuccess}</span>
            </div>
          )}

          {/* Error Banner */}
          {submitError && (
            <div className="appt-alert appt-alert-error">
              <AlertCircle size={20} />
              <span>{submitError}</span>
            </div>
          )}

          {/* SECTION 1: DOCTOR SELECTION */}
          <div className="appt-section">
            <div className="appt-section-header">
              <div className="appt-step-num">1</div>
              <div>
                <h3 className="appt-section-title">Choose Doctor</h3>
                <p className="appt-section-desc">
                  Select from our licensed healthcare physicians and specialists
                </p>
              </div>
            </div>

            {/* Empty States Handling */}
            {loadingDoctors ? (
              <div className="appt-state-box">
                <div className="appt-spinner" />
                <p className="appt-state-text">Loading available doctors...</p>
              </div>
            ) : doctorFetchError ? (
              <div className="appt-state-box appt-state-box-error">
                <AlertCircle size={32} color="#dc2626" />
                <p className="appt-state-text">{doctorFetchError}</p>
                <button
                  type="button"
                  onClick={fetchDoctors}
                  className="appt-retry-btn"
                >
                  Retry Loading Doctors
                </button>
              </div>
            ) : doctors.length === 0 ? (
              <div className="appt-state-box">
                <Stethoscope size={36} color="#94a3b8" />
                <p className="appt-state-text">
                  No doctors are currently available for appointment booking.
                </p>
              </div>
            ) : (
              <div className="appt-doctor-grid">
                {doctors.map((doc) => {
                  const isSelected = doc.id === selectedDoctorId;
                  const docImg = getDoctorImage(doc);
                  const dept = getDoctorDepartment(doc);

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`appt-doctor-card ${isSelected ? 'appt-doctor-card-selected' : ''}`}
                    >
                      <div className="appt-doctor-img-wrap">
                        <img
                          src={docImg}
                          alt={doc.full_name}
                          className="appt-doctor-img"
                        />
                        {isSelected && (
                          <div className="appt-selected-badge">
                            <CheckCircle2 size={16} />
                            <span>Selected</span>
                          </div>
                        )}
                      </div>

                      <div className="appt-doctor-details">
                        <h4 className="appt-doctor-name">{doc.full_name}</h4>
                        <div className="appt-dept-badge">{dept}</div>
                        <p className="appt-doctor-spec">{doc.specialization}</p>

                        <div className="appt-hospital-row">
                          <Building2 size={14} className="appt-hospital-icon" />
                          <span>{doc.hospital_name || 'SmartCare Medical Center'}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoctorId(doc.id);
                        }}
                        className={`appt-select-doc-btn ${isSelected ? 'appt-select-doc-btn-active' : ''}`}
                      >
                        {isSelected ? 'Selected Physician' : 'Select Doctor'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: DATE & TIME SELECTION */}
          <div className="appt-section">
            <div className="appt-section-header">
              <div className="appt-step-num">2</div>
              <div>
                <h3 className="appt-section-title">Select Date & Time</h3>
                <p className="appt-section-desc">Choose your preferred clinical appointment slot</p>
              </div>
            </div>

            <div className="appt-datetime-grid">
              {/* Date Input */}
              <div className="appt-field-group">
                <label className="appt-field-label">
                  <Calendar size={16} />
                  <span>Appointment Date</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="appt-input"
                  required
                />
              </div>

              {/* Time Slots */}
              <div className="appt-field-group">
                <label className="appt-field-label">
                  <Clock size={16} />
                  <span>Available Time Slot</span>
                </label>
                <div className="appt-time-slots">
                  {TIME_SLOTS.map((slot) => {
                    const isTimeSelected = selectedTime === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`appt-time-slot-btn ${isTimeSelected ? 'appt-time-slot-btn-selected' : ''}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: REASON FOR VISIT */}
          <div className="appt-section">
            <div className="appt-section-header">
              <div className="appt-step-num">3</div>
              <div>
                <h3 className="appt-section-title">Reason for Visit</h3>
                <p className="appt-section-desc">
                  Briefly describe your medical concerns, symptoms, or consultation goals
                </p>
              </div>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Annual cardiology checkup, consultation for skin rash, chronic migraines follow-up..."
              rows={3}
              className="appt-textarea"
              required
            />
          </div>

          {/* Selected Doctor Summary Card */}
          {selectedDoctor && (
            <div className="appt-summary-card">
              <div className="appt-summary-left">
                <img
                  src={getDoctorImage(selectedDoctor)}
                  alt={selectedDoctor.full_name}
                  className="appt-summary-img"
                />
                <div>
                  <div className="appt-summary-label">Selected Physician</div>
                  <div className="appt-summary-doctor">{selectedDoctor.full_name}</div>
                  <div className="appt-summary-sub">
                    {getDoctorDepartment(selectedDoctor)} • {selectedDoctor.hospital_name}
                  </div>
                </div>
              </div>

              <div className="appt-summary-right">
                <div className="appt-summary-datetime">
                  <Calendar size={15} />
                  <span>{new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                </div>
                <div className="appt-summary-datetime">
                  <Clock size={15} />
                  <span>{selectedTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="appt-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="appt-cancel-btn"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="appt-confirm-btn"
              disabled={submitting || !selectedDoctorId || !selectedDate || !selectedTime || !reason.trim()}
            >
              {submitting ? 'Confirming Appointment...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>

        {/* Scoped CSS Styles for Appointment Modal */}
        <style>{`
          .appt-modal-overlay {
            position: fixed;
            inset: 0;
            background-color: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
            overflow-y: auto;
          }

          .appt-modal-card {
            background-color: #ffffff;
            border-radius: 20px;
            width: 100%;
            max-width: 860px;
            max-height: 92vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
            border: 1px solid #e2e8f0;
            overflow: hidden;
            animation: apptModalPop 0.22s ease-out;
          }

          @keyframes apptModalPop {
            from { opacity: 0; transform: scale(0.97) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }

          .appt-modal-header {
            padding: 24px 28px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          }

          .appt-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 9999px;
            background-color: #e0f2fe;
            color: #0284c7;
            font-size: 11.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
          }

          .appt-modal-title {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            letter-spacing: -0.02em;
          }

          .appt-modal-subtitle {
            font-size: 14.5px;
            color: #64748b;
            margin-top: 4px;
            line-height: 1.4;
          }

          .appt-modal-close-btn {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .appt-modal-close-btn:hover {
            background-color: #f1f5f9;
            color: #0f172a;
          }

          .appt-modal-body {
            padding: 24px 28px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .appt-alert {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
          }

          .appt-alert-success {
            background-color: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
          }

          .appt-alert-error {
            background-color: #fef2f2;
            color: #991b1b;
            border: 1px solid #fecaca;
          }

          .appt-section {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .appt-section-header {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .appt-step-num {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #0284c7;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 800;
            flex-shrink: 0;
          }

          .appt-section-title {
            font-size: 17px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
          }

          .appt-section-desc {
            font-size: 13px;
            color: #64748b;
            margin: 2px 0 0;
          }

          /* State Boxes */
          .appt-state-box {
            padding: 36px 20px;
            border-radius: 14px;
            border: 1.5px dashed #cbd5e1;
            background-color: #f8fafc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            text-align: center;
          }

          .appt-state-box-error {
            border-color: #fca5a5;
            background-color: #fff1f2;
          }

          .appt-state-text {
            font-size: 14.5px;
            font-weight: 600;
            color: #475569;
            margin: 0;
          }

          .appt-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e2e8f0;
            border-top-color: #0284c7;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .appt-retry-btn {
            padding: 8px 16px;
            border-radius: 8px;
            background: #0284c7;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          }

          /* Doctor Cards Grid */
          .appt-doctor-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
          }

          .appt-doctor-card {
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 16px;
            background-color: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
          }

          .appt-doctor-card:hover {
            border-color: #93c5fd;
            transform: translateY(-2px);
            box-shadow: 0 8px 16px -4px rgba(2, 132, 199, 0.12);
          }

          .appt-doctor-card-selected {
            border-color: #0284c7 !important;
            background-color: #f0f9ff !important;
            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15) !important;
          }

          .appt-doctor-img-wrap {
            position: relative;
            width: 100px;
            height: 100px;
            margin-bottom: 12px;
          }

          .appt-doctor-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
          }

          .appt-selected-badge {
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background-color: #0284c7;
            color: #ffffff;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 10.5px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          }

          .appt-doctor-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
          }

          .appt-doctor-name {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 4px;
          }

          .appt-dept-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            color: #0d9488;
            background-color: #ccfbf1;
            padding: 2px 8px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 4px;
          }

          .appt-doctor-spec {
            font-size: 13px;
            color: #475569;
            font-weight: 600;
            margin: 0 0 8px;
          }

          .appt-hospital-row {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 14px;
          }

          .appt-hospital-icon {
            color: #0284c7;
            flex-shrink: 0;
          }

          .appt-select-doc-btn {
            width: 100%;
            padding: 8px 12px;
            border-radius: 10px;
            font-size: 13.5px;
            font-weight: 700;
            cursor: pointer;
            border: 1px solid #cbd5e1;
            background-color: #ffffff;
            color: #334155;
            transition: all 0.15s ease;
          }

          .appt-doctor-card:hover .appt-select-doc-btn {
            border-color: #0284c7;
            color: #0284c7;
          }

          .appt-select-doc-btn-active {
            background-color: #0284c7 !important;
            border-color: #0284c7 !important;
            color: #ffffff !important;
          }

          /* Date & Time */
          .appt-datetime-grid {
            display: grid;
            grid-template-columns: 1fr 1.8fr;
            gap: 20px;
          }

          .appt-field-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .appt-field-label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13.5px;
            font-weight: 700;
            color: #334155;
          }

          .appt-input {
            width: 100%;
            padding: 10px 14px;
            border-radius: 10px;
            border: 1.5px solid #cbd5e1;
            font-size: 14.5px;
            color: #0f172a;
            outline: none;
            transition: border-color 0.15s ease;
          }

          .appt-input:focus {
            border-color: #0284c7;
            box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
          }

          .appt-time-slots {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .appt-time-slot-btn {
            padding: 9px 8px;
            border-radius: 8px;
            border: 1.5px solid #cbd5e1;
            background: #ffffff;
            color: #334155;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .appt-time-slot-btn:hover {
            border-color: #0284c7;
            color: #0284c7;
            background-color: #f0f9ff;
          }

          .appt-time-slot-btn-selected {
            background-color: #0284c7 !important;
            border-color: #0284c7 !important;
            color: #ffffff !important;
            box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);
          }

          .appt-textarea {
            width: 100%;
            padding: 12px 14px;
            border-radius: 10px;
            border: 1.5px solid #cbd5e1;
            font-size: 14.5px;
            color: #0f172a;
            outline: none;
            resize: vertical;
            transition: border-color 0.15s ease;
          }

          .appt-textarea:focus {
            border-color: #0284c7;
            box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
          }

          /* Summary Card */
          .appt-summary-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 14px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
          }

          .appt-summary-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .appt-summary-img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #ffffff;
          }

          .appt-summary-label {
            font-size: 11px;
            font-weight: 700;
            color: #0d9488;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .appt-summary-doctor {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
          }

          .appt-summary-sub {
            font-size: 12.5px;
            color: #64748b;
          }

          .appt-summary-right {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .appt-summary-datetime {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
          }

          /* Footer */
          .appt-modal-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
          }

          .appt-cancel-btn {
            padding: 11px 20px;
            border-radius: 10px;
            font-size: 14.5px;
            font-weight: 700;
            color: #475569;
            background-color: #f1f5f9;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .appt-cancel-btn:hover {
            background-color: #e2e8f0;
            color: #0f172a;
          }

          .appt-confirm-btn {
            padding: 11px 24px;
            border-radius: 10px;
            font-size: 14.5px;
            font-weight: 700;
            color: #ffffff;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);
            transition: all 0.15s ease;
          }

          .appt-confirm-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 14px rgba(2, 132, 199, 0.32);
          }

          .appt-confirm-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: none;
          }

          @media (max-width: 768px) {
            .appt-modal-card {
              max-height: 96vh;
            }
            .appt-datetime-grid {
              grid-template-columns: 1fr;
            }
            .appt-doctor-grid {
              grid-template-columns: 1fr;
            }
            .appt-time-slots {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
