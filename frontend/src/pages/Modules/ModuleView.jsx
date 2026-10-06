import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Users,
  Stethoscope,
  Calendar,
  ArrowLeftRight,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Search,
  MapPin,
  Mail,
  Lock,
  Download,
  PlusCircle,
  X,
  FileCode,
  Pill,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import './ModuleView.css';
import { useAuth } from '../../context/useAuth';
import { apiFetch } from '../../services/api';

function downloadTextFile(fileName, contents, mimeType = 'text/plain;charset=utf-8') {
  const file = new Blob([contents], { type: mimeType });
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

function toCsvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

// ============================================================================
// Sample content used only by the preview-only modules below.
// ============================================================================
const AUDIT_EVENTS_DATA = [
  {
    id: 'EVT-1009',
    time: '2026-10-06 05:45:12 UTC',
    type: 'PATIENT_AUTHENTICATION',
    actor: 'doctor.demo@smarthealthcare.local (Dr. Ananya Rao)',
    action: 'JWT Session Authorized (Role: DOCTOR)',
    status: 'SUCCESS',
  },
  {
    id: 'EVT-1008',
    time: '2026-10-06 05:22:18 UTC',
    type: 'DATA_EXCHANGE_DISPATCH',
    actor: 'HIE Interoperability Gateway Service',
    action: 'FHIR R4 DiagnosticReport (TX-FHIR-77291) transmitted',
    status: 'SUCCESS',
  },
  {
    id: 'EVT-1007',
    time: '2026-10-06 04:30:00 UTC',
    type: 'PRESCRIPTION_ISSUED',
    actor: 'Dr. Robert Chen, MD',
    action: 'Prescription RX-94821-NY signed for PAT-8801',
    status: 'SUCCESS',
  },
  {
    id: 'EVT-1006',
    time: '2026-10-06 03:15:22 UTC',
    type: 'EMR_DOCUMENT_SEALED',
    actor: 'Dr. Sarah Patel, MD',
    action: 'Electronic Record EMR-2026-0942 indexed in MongoDB',
    status: 'SUCCESS',
  },
];

// ============================================================================
// MAIN MODULE VIEW COMPONENT
// ============================================================================

export default function ModuleView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionCreateOpen, setPrescriptionCreateOpen] = useState(false);
  const [prescriptionCreateSaving, setPrescriptionCreateSaving] = useState(false);
  const [prescriptionCreateError, setPrescriptionCreateError] = useState('');
  const [selectedPrescriptionToShare, setSelectedPrescriptionToShare] = useState(null);
  const [preparedFHIRShare, setPreparedFHIRShare] = useState(null);
  const [hospitalShareSaving, setHospitalShareSaving] = useState(false);
  const [dataExchangeEvents, setDataExchangeEvents] = useState([]);
  const [dataExchangeLoading, setDataExchangeLoading] = useState(false);
  const [dataExchangeError, setDataExchangeError] = useState('');
  const [dataExchangeSuccess, setDataExchangeSuccess] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState('');
  const [patientsSuccess, setPatientsSuccess] = useState('');
  const [patientActionId, setPatientActionId] = useState(null);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [adminAccountModal, setAdminAccountModal] = useState(null);
  const [adminAccountSaving, setAdminAccountSaving] = useState(false);
  const [adminAppointmentPatient, setAdminAppointmentPatient] = useState(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState({});
  const [prescriptionDrafts, setPrescriptionDrafts] = useState({});
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionNotesLoading, setPrescriptionNotesLoading] = useState(false);
  const [prescriptionNotesError, setPrescriptionNotesError] = useState('');
  const [prescriptionSaving, setPrescriptionSaving] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState('');
  const [prescriptionSuccess, setPrescriptionSuccess] = useState('');
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentError, setAppointmentError] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState('');
  const [appointmentSaving, setAppointmentSaving] = useState(false);
  const [editingClinicalId, setEditingClinicalId] = useState(null);
  const [clinicalDrafts, setClinicalDrafts] = useState({});
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [appointmentDrafts, setAppointmentDrafts] = useState({});
  const [minimumAppointmentDate] = useState(() => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().slice(0, 10);
  });
  const isPatient = currentUser?.role === 'PATIENT';
  const isDoctor = currentUser?.role === 'DOCTOR';
  const isAdmin = currentUser?.role === 'ADMIN';
  const requestedDoctorId = new URLSearchParams(location.search).get('doctorId') || '';

  const loadAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    setAppointmentError('');
    try {
      const [appointmentData, doctorData] = await Promise.all([
        apiFetch('/appointments'),
        apiFetch('/appointments/doctors'),
      ]);
      setAppointments(appointmentData);
      setDoctors(doctorData);
    } catch (error) {
      setAppointmentError(error.message || 'Unable to load appointments.');
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  const loadPatients = useCallback(async () => {
    setPatientsLoading(true);
    setPatientsError('');
    try {
      setPatients(await apiFetch('/patients'));
    } catch (error) {
      setPatientsError(error.message || 'Unable to load patient accounts.');
    } finally {
      setPatientsLoading(false);
    }
  }, []);

  const loadAdminDoctors = useCallback(async () => {
    setDoctorsLoading(true);
    try {
      setDoctors(await apiFetch('/appointments/doctors'));
    } catch (error) {
      setPatientsError(error.message || 'Unable to load doctors for appointment assignment.');
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  const loadPrescriptions = useCallback(async () => {
    setPrescriptionLoading(true);
    setPrescriptionError('');
    try {
      setPrescriptions(await apiFetch('/prescriptions'));
    } catch (error) {
      setPrescriptionError(error.message || 'Unable to load prescriptions from the clinical data store.');
    } finally {
      setPrescriptionLoading(false);
    }
  }, []);

  const loadDataExchangeEvents = useCallback(async () => {
    setDataExchangeLoading(true);
    setDataExchangeError('');
    try {
      setDataExchangeEvents(await apiFetch('/data-exchange'));
    } catch (error) {
      setDataExchangeError(error.message || 'Unable to load data exchange history.');
    } finally {
      setDataExchangeLoading(false);
    }
  }, []);

  const loadPrescriptionNotes = useCallback(async () => {
    setPrescriptionNotesLoading(true);
    setPrescriptionNotesError('');
    try {
      const savedNotes = await apiFetch('/prescription-notes');
      const notesByCode = Object.fromEntries(savedNotes.map(({ prescription_code: code, note }) => [code, note]));
      setPrescriptionNotes(notesByCode);
      setPrescriptionDrafts(notesByCode);
    } catch (error) {
      setPrescriptionNotesError(error.message || 'Unable to load prescription notes.');
    } finally {
      setPrescriptionNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (['/appointments', '/doctors', '/medical-records', '/clinical-notes'].includes(location.pathname)
      || (location.pathname === '/prescriptions' && isDoctor)) {
      void Promise.resolve().then(loadAppointments);
    }
    if (location.pathname === '/patients') {
      void Promise.resolve().then(loadPatients);
      if (isAdmin) void Promise.resolve().then(loadAdminDoctors);
    }
    if (location.pathname === '/prescriptions') {
      void Promise.resolve().then(loadPrescriptions);
      if (!isPatient) void Promise.resolve().then(loadPrescriptionNotes);
    }
    if (location.pathname === '/data-exchange') {
      void Promise.resolve().then(loadDataExchangeEvents);
    }
    if (location.pathname === '/appointments' && requestedDoctorId && isPatient) {
      const timer = window.setTimeout(() => setNewModalOpen(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, [location.pathname, location.search, requestedDoctorId, isPatient, isDoctor, isAdmin, loadAppointments, loadPatients, loadAdminDoctors, loadPrescriptionNotes, loadPrescriptions, loadDataExchangeEvents]);

  const deactivatePatient = async (patient) => {
    const patientName = `${patient.first_name} ${patient.last_name}`.trim();
    if (!window.confirm(`Deactivate ${patientName}'s account? They will lose sign-in access; appointments and clinical history will be retained.`)) return;
    setPatientsError('');
    setPatientsSuccess('');
    setPatientActionId(patient.id);
    try {
      const result = await apiFetch(`/patients/${patient.id}`, { method: 'DELETE' });
      setPatients((items) => items.filter((item) => item.id !== patient.id));
      setPatientsSuccess(result.message || `${patientName}'s account was deactivated.`);
    } catch (error) {
      setPatientsError(error.message || 'Unable to remove this patient.');
    } finally {
      setPatientActionId(null);
    }
  };

  const createAdminAccount = async (event) => {
    event.preventDefault();
    if (!adminAccountModal) return;
    const formData = new FormData(event.currentTarget);
    const accountType = adminAccountModal;
    setPatientsError('');
    setPatientsSuccess('');
    setAdminAccountSaving(true);
    try {
      if (accountType === 'PATIENT') {
        const created = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            first_name: String(formData.get('first_name')).trim(),
            last_name: String(formData.get('last_name')).trim(),
            email: String(formData.get('email')).trim().toLowerCase(),
            password: String(formData.get('password')),
            phone: String(formData.get('phone') || '').trim() || undefined,
            role: 'PATIENT',
          }),
        });
        await loadPatients();
        setPatientsSuccess(`Patient account created for ${created.first_name} ${created.last_name}.`);
      } else {
        const created = await apiFetch('/admin/doctors', {
          method: 'POST',
          body: JSON.stringify({
            first_name: String(formData.get('first_name')).trim(),
            last_name: String(formData.get('last_name')).trim(),
            email: String(formData.get('email')).trim().toLowerCase(),
            password: String(formData.get('password')),
            department: String(formData.get('department')).trim(),
            specialty: String(formData.get('specialty')).trim(),
          }),
        });
        await loadAdminDoctors();
        setPatientsSuccess(`Doctor account created for Dr. ${created.first_name} ${created.last_name}.`);
      }
      setAdminAccountModal(null);
    } catch (error) {
      setPatientsError(error.message || `Unable to create the ${accountType.toLowerCase()} account.`);
    } finally {
      setAdminAccountSaving(false);
    }
  };

  const scheduleAppointmentForPatient = async (event) => {
    event.preventDefault();
    if (!adminAppointmentPatient) return;
    const formData = new FormData(event.currentTarget);
    setAppointmentError('');
    setAppointmentSuccess('');
    setAppointmentSaving(true);
    try {
      const appointment = await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: adminAppointmentPatient.id,
          doctor_id: Number(formData.get('doctor_id')),
          appointment_date: formData.get('appointment_date'),
          appointment_time: formData.get('appointment_time'),
          reason: String(formData.get('reason')).trim(),
        }),
      });
      setPatients((items) => items.map((item) => item.id === adminAppointmentPatient.id
        ? { ...item, appointment_count: (item.appointment_count || 0) + 1 }
        : item));
      setAppointmentSuccess(`Appointment scheduled for ${adminAppointmentPatient.first_name} ${adminAppointmentPatient.last_name} with ${appointment.doctor_name}.`);
      setAdminAppointmentPatient(null);
    } catch (error) {
      setAppointmentError(error.message || 'Unable to schedule this patient appointment.');
    } finally {
      setAppointmentSaving(false);
    }
  };

  const createPrescription = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPrescriptionCreateError('');
    setPrescriptionError('');
    setPrescriptionSuccess('');
    setPrescriptionCreateSaving(true);
    try {
      const created = await apiFetch('/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          appointment_id: Number(formData.get('appointment_id')),
          medication: String(formData.get('medication')).trim(),
          strength: String(formData.get('strength')).trim(),
          dosage: String(formData.get('dosage')).trim(),
          quantity: String(formData.get('quantity')).trim(),
          refills: Number(formData.get('refills')),
          pharmacy: String(formData.get('pharmacy') || '').trim() || undefined,
          clinical_note: String(formData.get('clinical_note') || '').trim() || undefined,
        }),
      });
      setPrescriptionCreateOpen(false);
      setPrescriptionSuccess(`Prescription ${created.prescription_id} was saved and is now visible in the patient's portal and to administrators.`);
      await loadPrescriptions();
    } catch (error) {
      setPrescriptionCreateError(error.message || 'Unable to save this prescription.');
    } finally {
      setPrescriptionCreateSaving(false);
    }
  };

  const prepareHospitalShare = async (event) => {
    event.preventDefault();
    if (!selectedPrescriptionToShare) return;
    const formData = new FormData(event.currentTarget);
    setDataExchangeError('');
    setDataExchangeSuccess('');
    setHospitalShareSaving(true);
    try {
      const share = await apiFetch('/data-exchange/hospital-shares', {
        method: 'POST',
        body: JSON.stringify({
          prescription_id: selectedPrescriptionToShare.prescription_id,
          destination_hospital: String(formData.get('destination_hospital')).trim(),
          patient_consent: formData.get('patient_consent') === 'on',
          include_visit_notes: formData.get('include_visit_notes') === 'on',
        }),
      });
      setPreparedFHIRShare(share);
      setDataExchangeSuccess(`FHIR share package prepared for ${share.destination_hospital}. Download the package to send it through an approved hospital channel; this app has not transmitted it.`);
    } catch (error) {
      setDataExchangeError(error.message || 'Unable to prepare this hospital share.');
    } finally {
      setHospitalShareSaving(false);
    }
  };

  const inspectExchangePayload = async (eventRecord) => {
    setDataExchangeError('');
    try {
      const share = await apiFetch(`/data-exchange/${eventRecord.share_id}`);
      setSelectedTx({
        txId: eventRecord.share_id,
        protocol: eventRecord.protocol,
        source: eventRecord.doctor_name,
        destination: eventRecord.destination_hospital,
        status: eventRecord.status,
        hash: `SHA256: ${eventRecord.payload_digest}`,
        remarks: `Patient consent was confirmed by account #${share.consent_confirmed_by}. This package is ready for export; it was not transmitted to an external hospital.`,
        payloadSample: share.payload,
      });
    } catch (error) {
      setDataExchangeError(error.message || 'Unable to open the FHIR package.');
    }
  };

  const pathname = location.pathname;

  const renderPatientModuleNotice = (title, message, actionLabel = 'View Clinical Notes', actionPath = '/clinical-notes') => (
    <div className="module-subsystem-wrapper animate-fade-up">
      <div className="module-header-card">
        <div className="module-header-info">
          <div className="module-badge-row">
            <Badge variant="primary" size="sm" dot>Patient workspace</Badge>
          </div>
          <h1 className="module-title">{title}</h1>
          <p className="module-subtitle">{message}</p>
        </div>
      </div>
      <Card>
        <p className="module-subtitle" role="note">
          This preview is not connected to patient-specific stored data. Sample information for other profiles is hidden from patient accounts.
        </p>
        <Button variant="primary" onClick={() => navigate(actionPath)}>{actionLabel}</Button>
      </Card>
    </div>
  );

  // Render appropriate view based on current route
  const renderModuleContent = () => {
    switch (pathname) {
      case '/patients':
        return isPatient
          ? renderPatientModuleNotice('Patient Directory', 'The clinical staff directory is not available to patient accounts.', 'View Care Team', '/doctors')
          : renderPatientsView();
      case '/doctors':
        return renderDoctorsView();
      case '/appointments':
        return renderAppointmentsView();
      case '/medical-records':
        return renderMedicalRecordsView();
      case '/clinical-notes':
        return renderClinicalNotesView();
      case '/prescriptions':
        return renderPrescriptionsView();
      case '/data-exchange':
        return renderDataExchangeView();
      case '/analytics':
        return isPatient
          ? renderPatientModuleNotice('Analytics', 'System analytics are not available to patient accounts.', 'Return to Dashboard', '/dashboard')
          : renderAnalyticsView();
      case '/settings':
        return renderSettingsView();
      default:
        return renderPatientsView();
    }
  };

  // --------------------------------------------------------------------------
  // 1. PATIENTS WORKSPACE
  // --------------------------------------------------------------------------
  const renderPatientsView = () => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filtered = patients.filter((patient) => (
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(normalizedSearch)
      || patient.email.toLowerCase().includes(normalizedSearch)
      || String(patient.id).includes(normalizedSearch)
      || (patient.phone || '').toLowerCase().includes(normalizedSearch)
    ));

    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="primary" size="sm" dot>Connected Patient Accounts</Badge>
              <span className="module-entity-count">{patients.length} Active Accounts</span>
            </div>
            <h1 className="module-title">Patient Accounts</h1>
            <p className="module-subtitle">
              {isDoctor
                ? 'Review patient accounts connected to appointments assigned to you.'
                : isAdmin
                  ? 'Register patients and doctors, assign appointments, and manage patient account access. Deactivated accounts keep their appointment history.'
                  : 'Review active patient accounts and remove access when required. Deactivated accounts keep their appointment history.'}
            </p>
          </div>

          <div className="module-actions-row">
            {isAdmin && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => { setPatientsError(''); setPatientsSuccess(''); setAdminAccountModal('PATIENT'); }}
                >
                  <PlusCircle size={14} /> Register Patient
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPatientsError(''); setPatientsSuccess(''); setAdminAccountModal('DOCTOR'); }}
                >
                  <Stethoscope size={14} /> Register Doctor
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const columns = [
                  ['id', 'Account ID'], ['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'],
                  ['appointment_count', 'Appointments'], ['created_at', 'Registered'],
                ];
                const rows = [
                  columns.map(([, label]) => label),
                  ...filtered.map((patient) => columns.map(([key]) => (
                    key === 'name' ? `${patient.first_name} ${patient.last_name}` : patient[key]
                  ))),
                ];
                const csv = rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n');
                downloadTextFile('patient-accounts.csv', `\uFEFF${csv}`, 'text/csv;charset=utf-8');
              }}
              disabled={filtered.length === 0}
            >
              <Download size={14} /> Export Patient Accounts
            </Button>
          </div>
        </div>

        {patientsError && <p className="module-subtitle" role="alert">{patientsError}</p>}
        {patientsSuccess && <p className="module-subtitle" role="status">{patientsSuccess}</p>}
        {appointmentError && <p className="module-subtitle" role="alert">{appointmentError}</p>}
        {appointmentSuccess && <p className="module-subtitle" role="status">{appointmentSuccess}</p>}

        <div className="module-filter-bar">
          <div className="module-search-wrap">
            <Search size={18} className="module-search-icon" />
            <input
              type="text"
              placeholder="Search by patient name, email, phone, or account ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="module-search-input"
              aria-label="Search patient accounts"
            />
          </div>
        </div>

        <div className="patients-cards-grid">
          {patientsLoading && <Card>Loading active patient accounts…</Card>}
          {!patientsLoading && !patientsError && filtered.length === 0 && (
            <Card>{patients.length ? 'No patient accounts match your search.' : 'No active patient accounts are available.'}</Card>
          )}
          {filtered.map((patient) => (
            <Card key={patient.id} className="patient-record-card" hoverable>
              <div className="patient-card-header">
                <div className="patient-identity-block">
                  <div className="patient-avatar-box">
                    <span>{`${patient.first_name[0] || ''}${patient.last_name[0] || ''}`.toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="patient-name">{patient.first_name} {patient.last_name}</h3>
                    <span className="patient-mrn">Patient account #{patient.id}</span>
                  </div>
                </div>
                <Badge variant="success" size="sm">Active</Badge>
              </div>

              <div className="patient-card-body">
                <div className="patient-field-row">
                  <span className="field-lbl">Email:</span>
                  <span className="field-val">{patient.email}</span>
                </div>
                <div className="patient-field-row">
                  <span className="field-lbl">Phone:</span>
                  <span className="field-val">{patient.phone || 'Not provided'}</span>
                </div>
                <div className="patient-field-row">
                  <span className="field-lbl">Appointments:</span>
                  <span className="field-val">{patient.appointment_count}</span>
                </div>
              </div>

              <div className="patient-card-footer">
                {isAdmin && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setAppointmentError('');
                      setAppointmentSuccess('');
                      setAdminAppointmentPatient(patient);
                    }}
                    disabled={doctorsLoading || doctors.length === 0}
                    title={doctors.length === 0 ? 'Register a doctor before scheduling an appointment.' : undefined}
                  >
                    <Calendar size={14} /> Assign Doctor
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-danger"
                  loading={patientActionId === patient.id}
                  onClick={() => deactivatePatient(patient)}
                >
                  <Trash2 size={14} /> Remove Patient
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // 2. DOCTORS DIRECTORY
  // --------------------------------------------------------------------------
  const renderDoctorsView = () => {
    const filtered = doctors.filter((doctor) => (
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
      || doctor.department.toLowerCase().includes(searchQuery.toLowerCase())
      || doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    ));

    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="teal" size="sm" dot>Bookable Doctor Directory</Badge>
              <span className="module-entity-count">{filtered.length} Doctors</span>
            </div>
            <h1 className="module-title">Medical Staff & Specialists Directory</h1>
            <p className="module-subtitle">
              Doctors listed here have active accounts and can receive appointment requests.
            </p>
          </div>
        </div>

        {appointmentError && <p className="module-subtitle" role="alert">{appointmentError}</p>}
        <div className="doctors-cards-grid">
          {appointmentsLoading && <Card>Loading doctors…</Card>}
          {!appointmentsLoading && filtered.length === 0 && !appointmentError && (
            <Card>No active doctors are available yet. An administrator must provision a doctor account.</Card>
          )}
          {!appointmentsLoading && filtered.map((doctor) => (
            <Card key={doctor.id} className="doctor-profile-card" hoverable>
              <div className="doc-card-top">
                <div className="doc-avatar-large"><Stethoscope size={28} className="text-teal" /></div>
                <div className="doc-main-meta">
                  <Badge variant="teal" size="sm">{doctor.department}</Badge>
                  <h3 className="doc-full-name">{doctor.name}</h3>
                  <span className="doc-specialty-line">{doctor.specialty}</span>
                </div>
              </div>

              <div className="doc-card-details">
                <div className="doc-detail-item"><Mail size={14} className="text-muted" /><span>{doctor.email}</span></div>
              </div>

              <div className="doc-card-footer">
                <div className="doc-status-indicator"><span className="pulse-dot-green" /><span>Accepting appointment requests</span></div>
                {isPatient && (
                  <Button variant="primary" size="sm" onClick={() => navigate(`/appointments?doctorId=${doctor.id}`)}>
                    Book Consultation
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // 3. APPOINTMENTS WORKSPACE
  // --------------------------------------------------------------------------
  const renderAppointmentsView = () => {
    const minDate = minimumAppointmentDate;
    const labelStatus = (status) => status.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric',
    });
    const formatTime = (value) => new Date(`1970-01-01T${value}`).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });

    const updateStatus = async (appointment, status) => {
      if (status === 'CANCELLED' && !window.confirm('Cancel this appointment?')) return;
      setAppointmentError('');
      setAppointmentSuccess('');
      setAppointmentSaving(true);
      try {
        const updated = await apiFetch(`/appointments/${appointment.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
        setAppointments((items) => items.map((item) => item.id === updated.id ? updated : item));
        setAppointmentSuccess(`Appointment ${labelStatus(status).toLowerCase()}.`);
      } catch (error) {
        setAppointmentError(error.message || 'Unable to update appointment status.');
      } finally {
        setAppointmentSaving(false);
      }
    };

    const saveAppointmentDetails = async (appointment) => {
      const draft = appointmentDrafts[appointment.id] || {};
      setAppointmentError('');
      setAppointmentSuccess('');
      setAppointmentSaving(true);
      try {
        const updated = await apiFetch(`/appointments/${appointment.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            appointment_date: draft.appointment_date,
            appointment_time: draft.appointment_time,
            reason: draft.reason?.trim(),
          }),
        });
        setAppointments((items) => items.map((item) => item.id === updated.id ? updated : item));
        setEditingAppointmentId(null);
        setAppointmentSuccess('Appointment details updated.');
      } catch (error) {
        setAppointmentError(error.message || 'Unable to update appointment details.');
      } finally {
        setAppointmentSaving(false);
      }
    };

    const saveClinicalInfo = async (appointment) => {
      const draft = clinicalDrafts[appointment.id] || {};
      setAppointmentError('');
      setAppointmentSuccess('');
      setAppointmentSaving(true);
      try {
        const updated = await apiFetch(`/appointments/${appointment.id}/clinical-info`, {
          method: 'PATCH',
          body: JSON.stringify({
            diagnosis: draft.diagnosis ?? appointment.diagnosis ?? '',
            treatment_plan: draft.treatment_plan ?? appointment.treatment_plan ?? '',
            clinical_notes: draft.clinical_notes ?? appointment.clinical_notes ?? '',
          }),
        });
        setAppointments((items) => items.map((item) => item.id === updated.id ? updated : item));
        setEditingClinicalId(null);
        setAppointmentSuccess('Clinical information saved.');
      } catch (error) {
        setAppointmentError(error.message || 'Unable to save clinical information.');
      } finally {
        setAppointmentSaving(false);
      }
    };

    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="cyan" size="sm" dot>
                Appointment Schedule
              </Badge>
              <span className="module-entity-count">{appointments.length} Appointments</span>
            </div>
            <h1 className="module-title">Appointment Management</h1>
            <p className="module-subtitle">
              View appointments, track status, and keep visit information connected to the patient and attending doctor.
            </p>
          </div>

          {isPatient && (
            <div className="module-actions-row">
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setAppointmentError(''); setAppointmentSuccess(''); setNewModalOpen(true); }}
                disabled={doctors.length === 0}
              >
                <PlusCircle size={15} /> Book New Consultation
              </Button>
            </div>
          )}
        </div>

        {appointmentError && <p className="module-subtitle" role="alert">{appointmentError}</p>}
        {appointmentSuccess && <p className="module-subtitle" role="status">{appointmentSuccess}</p>}
        {isPatient && doctors.length === 0 && !appointmentsLoading && (
          <p className="module-subtitle" role="status">There are no doctor accounts available yet. An administrator must add doctors before appointments can be booked.</p>
        )}

        <div className="appointments-list-container" aria-live="polite">
          {appointmentsLoading && <Card>Loading appointments…</Card>}
          {!appointmentsLoading && appointments.length === 0 && !appointmentError && (
            <Card>{isDoctor ? 'No appointments are assigned to your account yet.' : 'No appointments to show yet.'}</Card>
          )}
          {!appointmentsLoading && appointments.map((apt) => {
            const isClosed = ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(apt.status);
            const draft = clinicalDrafts[apt.id] || {};
            const appointmentDraft = appointmentDrafts[apt.id] || {};
            const setDraftField = (field, value) => setClinicalDrafts((current) => ({
              ...current,
              [apt.id]: { ...current[apt.id], [field]: value },
            }));
            return (
              <Card key={apt.id} className="appointment-card-item" hoverable>
                <div className="apt-date-col">
                  <span className="apt-date-text">{formatDate(apt.appointment_date)}</span>
                  <span className="apt-time-text">{formatTime(apt.appointment_time)}</span>
                  <span className="apt-id-tag">Appointment #{apt.id}</span>
                </div>

                <div className="apt-info-col">
                  <div className="apt-title-row">
                    <h4>{apt.reason}</h4>
                    <Badge
                      variant={apt.status === 'CONFIRMED' ? 'success' : apt.status === 'COMPLETED' ? 'neutral' : apt.status === 'CANCELLED' || apt.status === 'NO_SHOW' ? 'warning' : 'primary'}
                      size="sm"
                    >
                      {labelStatus(apt.status)}
                    </Badge>
                  </div>

                  <div className="apt-meta-chips">
                    {isDoctor && <span className="apt-meta-chip"><User size={13} className="text-primary" /> Patient: <strong>{apt.patient_name}</strong> (account #{apt.patient_id})</span>}
                    {!isDoctor && <span className="apt-meta-chip"><User size={13} className="text-primary" /> Patient: <strong>{apt.patient_name}</strong></span>}
                    <span className="apt-meta-chip"><Stethoscope size={13} className="text-teal" /> Specialist: <strong>{apt.doctor_name}</strong></span>
                    <span className="apt-meta-chip"><MapPin size={13} className="text-cyan" /> {apt.department} · {apt.specialty}</span>
                  </div>

                  {(apt.diagnosis || apt.treatment_plan || apt.clinical_notes) && (
                    <div className="module-subtitle" aria-label="Visit clinical information">
                      {apt.diagnosis && <p><strong>Diagnosis:</strong> {apt.diagnosis}</p>}
                      {apt.treatment_plan && <p><strong>Treatment plan:</strong> {apt.treatment_plan}</p>}
                      {apt.clinical_notes && <p><strong>Clinical notes:</strong> {apt.clinical_notes}</p>}
                    </div>
                  )}

                  {editingAppointmentId === apt.id && (
                    <div className="modal-form-body" aria-label={`Update appointment ${apt.id}`}>
                      <div className="form-row-2">
                        <div className="form-group-field">
                          <label className="form-lbl" htmlFor={`appointment-update-date-${apt.id}`}>Date</label>
                          <input
                            id={`appointment-update-date-${apt.id}`}
                            className="module-text-input"
                            type="date"
                            min={minDate}
                            value={appointmentDraft.appointment_date ?? apt.appointment_date}
                            onChange={(event) => setAppointmentDrafts((items) => ({
                              ...items,
                              [apt.id]: { ...items[apt.id], appointment_date: event.target.value },
                            }))}
                          />
                        </div>
                        <div className="form-group-field">
                          <label className="form-lbl" htmlFor={`appointment-update-time-${apt.id}`}>Time</label>
                          <input
                            id={`appointment-update-time-${apt.id}`}
                            className="module-text-input"
                            type="time"
                            value={appointmentDraft.appointment_time ?? apt.appointment_time.slice(0, 5)}
                            onChange={(event) => setAppointmentDrafts((items) => ({
                              ...items,
                              [apt.id]: { ...items[apt.id], appointment_time: event.target.value },
                            }))}
                          />
                        </div>
                      </div>
                      <div className="form-group-field">
                        <label className="form-lbl" htmlFor={`appointment-update-reason-${apt.id}`}>Reason</label>
                        <textarea
                          id={`appointment-update-reason-${apt.id}`}
                          className="module-textarea-input"
                          rows={2}
                          minLength={3}
                          maxLength={1000}
                          value={appointmentDraft.reason ?? apt.reason}
                          onChange={(event) => setAppointmentDrafts((items) => ({
                            ...items,
                            [apt.id]: { ...items[apt.id], reason: event.target.value },
                          }))}
                        />
                      </div>
                      <div className="apt-actions-col">
                        <Button variant="primary" size="sm" onClick={() => saveAppointmentDetails(apt)} loading={appointmentSaving}>Save Appointment</Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingAppointmentId(null)}>Discard</Button>
                      </div>
                    </div>
                  )}

                  {isDoctor && editingClinicalId === apt.id && (
                    <div className="modal-form-body">
                      <div className="form-group-field">
                        <label className="form-lbl" htmlFor={`diagnosis-${apt.id}`}>Diagnosis</label>
                        <input id={`diagnosis-${apt.id}`} className="module-text-input" maxLength={500} value={draft.diagnosis ?? apt.diagnosis ?? ''} onChange={(event) => setDraftField('diagnosis', event.target.value)} />
                      </div>
                      <div className="form-group-field">
                        <label className="form-lbl" htmlFor={`treatment-${apt.id}`}>Treatment plan</label>
                        <textarea id={`treatment-${apt.id}`} rows={2} className="module-textarea-input" maxLength={5000} value={draft.treatment_plan ?? apt.treatment_plan ?? ''} onChange={(event) => setDraftField('treatment_plan', event.target.value)} />
                      </div>
                      <div className="form-group-field">
                        <label className="form-lbl" htmlFor={`notes-${apt.id}`}>Clinical notes</label>
                        <textarea id={`notes-${apt.id}`} rows={3} className="module-textarea-input" maxLength={10000} value={draft.clinical_notes ?? apt.clinical_notes ?? ''} onChange={(event) => setDraftField('clinical_notes', event.target.value)} />
                      </div>
                      <div className="apt-actions-col">
                        <Button variant="primary" size="sm" onClick={() => saveClinicalInfo(apt)} loading={appointmentSaving}>Save Clinical Information</Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingClinicalId(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="apt-actions-col">
                  {isPatient && !isClosed && (
                    <>
                      {apt.status === 'SCHEDULED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAppointmentDrafts((items) => ({
                              ...items,
                              [apt.id]: {
                                appointment_date: apt.appointment_date,
                                appointment_time: apt.appointment_time.slice(0, 5),
                                reason: apt.reason,
                              },
                            }));
                            setEditingAppointmentId(editingAppointmentId === apt.id ? null : apt.id);
                          }}
                        >
                          {editingAppointmentId === apt.id ? 'Close Editor' : 'Update Appointment'}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => updateStatus(apt, 'CANCELLED')} loading={appointmentSaving}>Cancel</Button>
                    </>
                  )}
                  {(isDoctor || isAdmin) && !isClosed && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAppointmentDrafts((items) => ({
                            ...items,
                            [apt.id]: {
                              appointment_date: apt.appointment_date,
                              appointment_time: apt.appointment_time.slice(0, 5),
                              reason: apt.reason,
                            },
                          }));
                          setEditingAppointmentId(editingAppointmentId === apt.id ? null : apt.id);
                        }}
                      >
                        {editingAppointmentId === apt.id ? 'Close Editor' : 'Update Appointment'}
                      </Button>
                      {apt.status === 'SCHEDULED' && <Button variant="primary" size="sm" onClick={() => updateStatus(apt, 'CONFIRMED')} loading={appointmentSaving}>Accept Appointment</Button>}
                      {apt.status === 'CONFIRMED' && <Button variant="primary" size="sm" onClick={() => updateStatus(apt, 'COMPLETED')} loading={appointmentSaving}>Complete</Button>}
                      {apt.status === 'CONFIRMED' && <Button variant="outline" size="sm" onClick={() => updateStatus(apt, 'NO_SHOW')} loading={appointmentSaving}>No-show</Button>}
                      <Button variant="outline" size="sm" onClick={() => updateStatus(apt, 'CANCELLED')} loading={appointmentSaving}>Cancel Appointment</Button>
                    </>
                  )}
                  {isDoctor && !isClosed && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => { setClinicalDrafts((current) => ({ ...current, [apt.id]: { diagnosis: apt.diagnosis || '', treatment_plan: apt.treatment_plan || '', clinical_notes: apt.clinical_notes || '' } })); setEditingClinicalId(editingClinicalId === apt.id ? null : apt.id); }}>
                        {editingClinicalId === apt.id ? 'Close Clinical Editor' : 'Update Clinical Info'}
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {newModalOpen && isPatient && (
          <div className="sh-modal-overlay">
            <div className="sh-modal-content animate-fade-scale">
              <div className="sh-modal-header">
                <div>
                  <h3 className="text-white">Schedule Clinical Consultation</h3>
                  <p className="text-sm text-secondary">Choose a doctor, date, time, and reason for your visit.</p>
                </div>
                <button type="button" className="sh-modal-close-btn" onClick={() => setNewModalOpen(false)} aria-label="Close booking form">
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  setAppointmentError('');
                  setAppointmentSuccess('');
                  setAppointmentSaving(true);
                  try {
                    await apiFetch('/appointments', {
                      method: 'POST',
                      body: JSON.stringify({
                        doctor_id: Number(formData.get('doctorId')),
                        appointment_date: formData.get('date'),
                        appointment_time: formData.get('time'),
                        reason: String(formData.get('reason')).trim(),
                      }),
                    });
                    setNewModalOpen(false);
                    setAppointmentSuccess('Your appointment request was saved.');
                    await loadAppointments();
                  } catch (error) {
                    setAppointmentError(error.message || 'Unable to book this appointment.');
                  } finally {
                    setAppointmentSaving(false);
                  }
                }}
                className="modal-form-body"
              >
                <div className="form-group-field">
                  <label className="form-lbl" htmlFor="appointment-doctor">Attending Specialist</label>
                  <select id="appointment-doctor" className="module-select-input" name="doctorId" required defaultValue="">
                    <option value="" disabled>Select a doctor</option>
                    {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} · {doctor.department}</option>)}
                  </select>
                </div>

                <div className="form-row-2">
                  <div className="form-group-field">
                    <label className="form-lbl" htmlFor="appointment-date">Preferred Date</label>
                    <input id="appointment-date" type="date" name="date" min={minDate} defaultValue={minDate} className="module-text-input" required />
                  </div>
                  <div className="form-group-field">
                    <label className="form-lbl" htmlFor="appointment-time">Preferred Time</label>
                    <input id="appointment-time" type="time" name="time" className="module-text-input" required />
                  </div>
                </div>

                <div className="form-group-field">
                  <label className="form-lbl" htmlFor="appointment-reason">Consultation Reason / Symptoms</label>
                  <textarea id="appointment-reason" rows={3} placeholder="Describe symptoms or follow-up needs…" className="module-textarea-input" name="reason" minLength={3} maxLength={1000} required />
                </div>

                <div className="modal-actions-bar">
                  <Button type="button" variant="outline" onClick={() => setNewModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={appointmentSaving}>Confirm Booking</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // CLINICAL NOTES: saved notes linked to real appointments
  // --------------------------------------------------------------------------
  const renderClinicalNotesView = () => {
    const notes = appointments.filter((appointment) => (
      appointment.diagnosis || appointment.treatment_plan || appointment.clinical_notes
    ));
    const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric',
    });
    const labelStatus = (status) => status.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="cyan" size="sm" dot>Appointment-linked notes</Badge>
              <span className="module-entity-count">{notes.length} Saved Notes</span>
            </div>
            <h1 className="module-title">Clinical Notes</h1>
            <p className="module-subtitle">
              {isDoctor
                ? 'Review notes saved for appointments assigned to your account.'
                : isPatient
                  ? 'View clinical information your doctor saved for your appointments.'
                  : 'Review clinical information saved for appointments in the system.'}
            </p>
          </div>
        </div>

        {appointmentError && <p className="module-subtitle" role="alert">{appointmentError}</p>}

        <div className="appointments-list-container" aria-live="polite">
          {appointmentsLoading && <Card>Loading clinical notes…</Card>}
          {!appointmentsLoading && !appointmentError && notes.length === 0 && (
            <Card>No clinical notes have been saved for your appointments yet.</Card>
          )}
          {!appointmentsLoading && notes.map((appointment) => (
            <Card key={appointment.id} className="appointment-card-item">
              <div className="apt-date-col">
                <span className="apt-date-text">{formatDate(appointment.appointment_date)}</span>
                <span className="apt-id-tag">Appointment #{appointment.id}</span>
              </div>
              <div className="apt-info-col">
                <div className="apt-title-row">
                  <h4>{appointment.reason}</h4>
                  <Badge
                    variant={appointment.status === 'CONFIRMED' ? 'success' : appointment.status === 'COMPLETED' ? 'neutral' : appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW' ? 'warning' : 'primary'}
                    size="sm"
                  >
                    {labelStatus(appointment.status)}
                  </Badge>
                </div>
                <div className="apt-meta-chips">
                  {isDoctor && <span className="apt-meta-chip"><User size={13} className="text-primary" /> Patient: <strong>{appointment.patient_name}</strong></span>}
                  {!isDoctor && <span className="apt-meta-chip"><Stethoscope size={13} className="text-teal" /> Doctor: <strong>{appointment.doctor_name}</strong></span>}
                </div>
                {appointment.diagnosis && <p className="module-subtitle"><strong>Diagnosis:</strong> {appointment.diagnosis}</p>}
                {appointment.treatment_plan && <p className="module-subtitle"><strong>Treatment plan:</strong> {appointment.treatment_plan}</p>}
                {appointment.clinical_notes && <p className="module-subtitle"><strong>Clinical notes:</strong> {appointment.clinical_notes}</p>}
              </div>
            </Card>
          ))}
        </div>

        {adminAccountModal && isAdmin && (
          <div className="sh-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !adminAccountSaving) setAdminAccountModal(null); }}>
            <div className="sh-modal-content animate-fade-scale" role="dialog" aria-modal="true" aria-labelledby="admin-account-modal-title">
              <div className="sh-modal-header">
                <div>
                  <h3 id="admin-account-modal-title" className="text-white">
                    {adminAccountModal === 'PATIENT' ? 'Register New Patient' : 'Register New Doctor'}
                  </h3>
                  <p className="text-sm text-secondary">
                    {adminAccountModal === 'PATIENT'
                      ? 'Create a patient sign-in account for this healthcare system.'
                      : 'Create an active doctor account and specialist profile.'}
                  </p>
                </div>
                <button type="button" className="sh-modal-close-btn" onClick={() => setAdminAccountModal(null)} aria-label="Close account form" disabled={adminAccountSaving}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={createAdminAccount} className="modal-form-body">
                <div className="form-row-2">
                  <div className="form-group-field">
                    <label className="form-lbl" htmlFor="admin-account-first-name">First name</label>
                    <input id="admin-account-first-name" className="module-text-input" name="first_name" autoComplete="given-name" maxLength={100} required />
                  </div>
                  <div className="form-group-field">
                    <label className="form-lbl" htmlFor="admin-account-last-name">Last name</label>
                    <input id="admin-account-last-name" className="module-text-input" name="last_name" autoComplete="family-name" maxLength={100} required />
                  </div>
                </div>

                <div className="form-group-field">
                  <label className="form-lbl" htmlFor="admin-account-email">Email address</label>
                  <input id="admin-account-email" className="module-text-input" name="email" type="email" autoComplete="email" maxLength={255} required />
                </div>

                {adminAccountModal === 'PATIENT' ? (
                  <div className="form-group-field">
                    <label className="form-lbl" htmlFor="admin-account-phone">Phone (optional)</label>
                    <input id="admin-account-phone" className="module-text-input" name="phone" type="tel" autoComplete="tel" maxLength={20} />
                  </div>
                ) : (
                  <div className="form-row-2">
                    <div className="form-group-field">
                      <label className="form-lbl" htmlFor="admin-account-department">Department</label>
                      <input id="admin-account-department" className="module-text-input" name="department" maxLength={120} minLength={2} placeholder="e.g. Cardiology" required />
                    </div>
                    <div className="form-group-field">
                      <label className="form-lbl" htmlFor="admin-account-specialty">Specialty</label>
                      <input id="admin-account-specialty" className="module-text-input" name="specialty" maxLength={180} minLength={2} placeholder="e.g. Interventional cardiology" required />
                    </div>
                  </div>
                )}

                <div className="form-group-field">
                  <label className="form-lbl" htmlFor="admin-account-password">Initial password</label>
                  <input id="admin-account-password" className="module-text-input" name="password" type="password" autoComplete="new-password" minLength={adminAccountModal === 'DOCTOR' ? 12 : 8} maxLength={128} required />
                  <span className="text-sm text-secondary">
                    {adminAccountModal === 'DOCTOR'
                      ? 'Use at least 12 characters. Share this initial password with the doctor securely.'
                      : 'Use at least 8 characters and share the sign-in details with the patient.'}
                  </span>
                </div>

                {patientsError && <p className="module-subtitle" role="alert">{patientsError}</p>}
                <div className="modal-actions-bar">
                  <Button type="button" variant="outline" onClick={() => setAdminAccountModal(null)} disabled={adminAccountSaving}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={adminAccountSaving}>
                    {adminAccountModal === 'PATIENT' ? 'Create Patient Account' : 'Create Doctor Account'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {adminAppointmentPatient && isAdmin && (
          <div className="sh-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !appointmentSaving) setAdminAppointmentPatient(null); }}>
            <div className="sh-modal-content animate-fade-scale" role="dialog" aria-modal="true" aria-labelledby="admin-appointment-modal-title">
              <div className="sh-modal-header">
                <div>
                  <h3 id="admin-appointment-modal-title" className="text-white">Schedule Patient Appointment</h3>
                  <p className="text-sm text-secondary">
                    Assign a doctor to {adminAppointmentPatient.first_name} {adminAppointmentPatient.last_name}.
                  </p>
                </div>
                <button type="button" className="sh-modal-close-btn" onClick={() => setAdminAppointmentPatient(null)} aria-label="Close appointment form" disabled={appointmentSaving}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={scheduleAppointmentForPatient} className="modal-form-body">
                <div className="form-group-field">
                  <label className="form-lbl" htmlFor="admin-appointment-doctor">Attending doctor</label>
                  <select id="admin-appointment-doctor" className="module-select-input" name="doctor_id" required defaultValue="" disabled={doctorsLoading || doctors.length === 0}>
                    <option value="" disabled>{doctorsLoading ? 'Loading doctors…' : 'Select a doctor'}</option>
                    {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} · {doctor.department} · {doctor.specialty}</option>)}
                  </select>
                </div>

                <div className="form-row-2">
                  <div className="form-group-field">
                    <label className="form-lbl" htmlFor="admin-appointment-date">Date</label>
                    <input id="admin-appointment-date" className="module-text-input" type="date" name="appointment_date" min={minimumAppointmentDate} defaultValue={minimumAppointmentDate} required />
                  </div>
                  <div className="form-group-field">
                    <label className="form-lbl" htmlFor="admin-appointment-time">Time</label>
                    <input id="admin-appointment-time" className="module-text-input" type="time" name="appointment_time" required />
                  </div>
                </div>

                <div className="form-group-field">
                  <label className="form-lbl" htmlFor="admin-appointment-reason">Reason for visit</label>
                  <textarea id="admin-appointment-reason" className="module-textarea-input" name="reason" rows={3} minLength={3} maxLength={1000} placeholder="Describe the reason for this appointment…" required />
                </div>

                {doctors.length === 0 && !doctorsLoading && <p className="module-subtitle" role="status">No active doctors are available. Register a doctor account before scheduling.</p>}
                {appointmentError && <p className="module-subtitle" role="alert">{appointmentError}</p>}
                <div className="modal-actions-bar">
                  <Button type="button" variant="outline" onClick={() => setAdminAppointmentPatient(null)} disabled={appointmentSaving}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={appointmentSaving} disabled={doctorsLoading || doctors.length === 0}>Schedule Appointment</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // 4. MEDICAL RECORDS (EMR)
  // --------------------------------------------------------------------------
  const renderMedicalRecordsView = () => {
    const records = appointments.filter((appointment) => (
      appointment.diagnosis || appointment.treatment_plan || appointment.clinical_notes
    ));
    const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric',
    });

    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="teal" size="sm" dot>Appointment Clinical Records</Badge>
              <span className="module-entity-count">{records.length} Saved Records</span>
            </div>
            <h1 className="module-title">Electronic Medical Records (EMR)</h1>
            <p className="module-subtitle">
              Clinical information saved by the assigned doctor is stored with the visit and shown to its patient, care team, and administrators.
            </p>
          </div>
        </div>

        {appointmentsLoading && <Card>Loading medical records…</Card>}
        {appointmentError && <p className="module-subtitle" role="alert">{appointmentError}</p>}
        {!appointmentsLoading && !appointmentError && records.length === 0 && (
          <Card>No clinical records have been saved for your appointments yet.</Card>
        )}
        <div className="emr-records-stream">
          {!appointmentsLoading && records.map((record) => (
            <Card key={record.id} className="emr-record-card" hoverable>
              <div className="emr-record-top">
                <div className="emr-id-badge">
                  <strong>Appointment #{record.id}</strong>
                  <span className="emr-date-tag">• {formatDate(record.appointment_date)}</span>
                </div>
                <div className="emr-sig-badge">
                  <ShieldCheck size={15} className="text-success" />
                  <span>Assigned care team</span>
                </div>
              </div>

              <div className="emr-patient-row">
                <div className="emr-patient-info">
                  <span className="emr-lbl">Patient:</span>
                  <span className="emr-patient-name">{record.patient_name}</span>
                </div>
                <div className="emr-doc-info">
                  <span className="emr-lbl">Attending Physician:</span>
                  <span className="emr-doc-name">{record.doctor_name}</span>
                </div>
              </div>

              {record.diagnosis && <div className="emr-diagnosis-box">
                <span className="diag-label">Clinical Diagnosis:</span>
                <p className="diag-text">{record.diagnosis}</p>
              </div>}

              <div className="emr-sections-grid">
                {record.reason && <div className="emr-sec-block">
                  <span className="sec-title">Reason for visit:</span>
                  <p className="sec-body">{record.reason}</p>
                </div>}
                {record.treatment_plan && <div className="emr-sec-block">
                  <span className="sec-title">Treatment plan:</span>
                  <p className="sec-body text-teal font-semibold">{record.treatment_plan}</p>
                </div>}
                {record.clinical_notes && <div className="emr-sec-block">
                  <span className="sec-title">Clinical notes:</span>
                  <p className="sec-body">{record.clinical_notes}</p>
                </div>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // 6. PRESCRIPTIONS
  // --------------------------------------------------------------------------
  const renderPrescriptionsView = () => {
    const eligibleAppointments = appointments.filter((appointment) => ['CONFIRMED', 'COMPLETED'].includes(appointment.status));
    const savePrescriptionNote = async (prescriptionCode) => {
      const note = (prescriptionDrafts[prescriptionCode] || '').trim();
      if (!note) {
        setPrescriptionError('Enter a note before saving.');
        setPrescriptionSuccess('');
        return;
      }
      setPrescriptionError('');
      setPrescriptionSuccess('');
      setPrescriptionSaving(true);
      try {
        const saved = await apiFetch(`/prescription-notes/${prescriptionCode}`, {
          method: 'PUT',
          body: JSON.stringify({ note }),
        });
        setPrescriptionNotes((items) => ({ ...items, [prescriptionCode]: saved.note }));
        setPrescriptionDrafts((items) => ({ ...items, [prescriptionCode]: saved.note }));
        setPrescriptionSuccess(`Notes saved for ${prescriptionCode}.`);
      } catch (error) {
        setPrescriptionError(error.message || 'Unable to save prescription notes.');
      } finally {
        setPrescriptionSaving(false);
      }
    };

    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="teal" size="sm" dot>
                MongoDB Prescription Records
              </Badge>
              <span className="module-entity-count">{prescriptions.length} Prescriptions</span>
            </div>
            <h1 className="module-title">e-Prescriptions & Pharmacy Dispensary</h1>
            <p className="module-subtitle">
              {isPatient
                ? 'Prescriptions shared by your care team are stored securely and shown only to you, your treating doctor, and administrators.'
                : 'Doctors can write prescriptions for their confirmed visits. Patients and administrators can view the saved prescription; clinician notes stay private to their author.'}
            </p>
          </div>
          {isDoctor && (
            <div className="module-actions-row">
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setPrescriptionCreateError(''); setPrescriptionCreateOpen(true); }}
                disabled={appointmentsLoading || eligibleAppointments.length === 0}
              >
                <PlusCircle size={15} /> Write Prescription
              </Button>
            </div>
          )}
        </div>

        {prescriptionError && <p className="module-subtitle" role="alert">{prescriptionError}</p>}
        {prescriptionNotesError && <p className="module-subtitle" role="alert">{prescriptionNotesError}</p>}
        {prescriptionSuccess && <p className="module-subtitle" role="status">{prescriptionSuccess}</p>}
        {dataExchangeError && <p className="module-subtitle" role="alert">{dataExchangeError}</p>}
        {dataExchangeSuccess && <p className="module-subtitle" role="status">{dataExchangeSuccess}</p>}
        {prescriptionLoading && <Card>Loading prescriptions from MongoDB…</Card>}
        {isDoctor && !appointmentsLoading && !appointmentError && appointments.length === 0 && (
          <Card>There are no appointments assigned to you yet. A confirmed or completed visit is required before you can write a prescription.</Card>
        )}
        {isDoctor && !appointmentsLoading && appointments.length > 0 && eligibleAppointments.length === 0 && (
          <Card>Your visits need to be confirmed or completed before you can write a prescription.</Card>
        )}
        {isDoctor && appointmentError && <p className="module-subtitle" role="alert">{appointmentError}</p>}

        <div className="prescriptions-grid">
          {!prescriptionLoading && !prescriptionError && prescriptions.length === 0 && (
            <Card>{isPatient ? 'Your care team has not shared a prescription with you yet.' : 'No prescription records are available for this account.'}</Card>
          )}
          {!prescriptionLoading && prescriptions.map((rx) => (
            <Card key={rx.prescription_id} className="prescription-card-item" hoverable>
              <div className="rx-card-top">
                <div className="rx-badge-box">
                  <Pill size={22} className="text-teal" />
                  <div>
                    <h3 className="rx-med-name">{rx.medication}</h3>
                    <span className="rx-strength-tag">{rx.strength}</span>
                  </div>
                </div>
                <Badge variant="success" size="sm">{rx.status}</Badge>
              </div>

              <div className="rx-card-body">
                <div className="rx-sig-box">
                  <span className="rx-sig-lbl">Dosage Instructions (Sig):</span>
                  <p className="rx-sig-desc">{rx.dosage}</p>
                </div>

                <div className="rx-meta-grid">
                  <div className="rx-meta-cell">
                    <span className="rx-lbl">Quantity Dispensed:</span>
                    <span className="rx-val">{rx.quantity}</span>
                  </div>
                  <div className="rx-meta-cell">
                    <span className="rx-lbl">Refills:</span>
                    <span className="rx-val text-teal font-bold">{rx.refills}</span>
                  </div>
                  <div className="rx-meta-cell">
                    <span className="rx-lbl">Prescribed For:</span>
                    <span className="rx-val">{rx.patient_name}</span>
                  </div>
                  <div className="rx-meta-cell">
                    <span className="rx-lbl">Authorizing Physician:</span>
                    <span className="rx-val">{rx.doctor_name}</span>
                  </div>
                </div>

                <div className="rx-pharmacy-status">
                  <CheckCircle2 size={15} className="text-success" />
                  <span>{rx.pharmacy || 'No pharmacy selected'}</span>
                </div>

                {rx.clinical_note && <div className="payload-meta-box"><strong>Doctor's note:</strong> {rx.clinical_note}</div>}

                {!isPatient && (
                  <div className="form-group-field rx-notes-field">
                    <label className="form-lbl" htmlFor={`prescription-note-${rx.prescription_id}`}>Private clinician note</label>
                    <textarea
                      id={`prescription-note-${rx.prescription_id}`}
                      rows={3}
                      maxLength={5000}
                      className="module-textarea-input"
                      placeholder="Write a private note for your own account…"
                      value={prescriptionDrafts[rx.prescription_id] ?? prescriptionNotes[rx.prescription_id] ?? ''}
                      onChange={(event) => setPrescriptionDrafts((items) => ({ ...items, [rx.prescription_id]: event.target.value }))}
                      disabled={prescriptionNotesLoading}
                    />
                    <span className="rx-note-privacy-hint">Only your signed-in clinician account can view this private note.</span>
                  </div>
                )}
              </div>

              <div className="rx-card-footer">
                <span className="rx-id-code">{rx.prescription_id} · {new Date(rx.created_at).toLocaleDateString()}</span>
                {!isPatient && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={prescriptionNotesLoading || prescriptionSaving}
                    onClick={() => savePrescriptionNote(rx.prescription_id)}
                  >
                    Save Private Note
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const slip = [
                      'SmartHealthcare prescription details',
                      `Prescription: ${rx.prescription_id}`,
                      `Date: ${new Date(rx.created_at).toLocaleDateString()}`,
                      `Patient: ${rx.patient_name}`,
                      `Prescribing doctor: ${rx.doctor_name}`,
                      `Medication: ${rx.medication}`,
                      `Strength: ${rx.strength}`,
                      `Dosage: ${rx.dosage}`,
                      `Quantity: ${rx.quantity}`,
                      `Refills authorized: ${rx.refills}`,
                      `Pharmacy: ${rx.pharmacy || 'Not selected'}`,
                      rx.clinical_note ? `Doctor's note: ${rx.clinical_note}` : '',
                    ].join('\n');
                    downloadTextFile(`prescription-${rx.prescription_id}.txt`, slip);
                  }}
                >
                  <Download size={13} /> Download Rx Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setDataExchangeError(''); setDataExchangeSuccess(''); setPreparedFHIRShare(null); setSelectedPrescriptionToShare(rx); }}
                >
                  <ArrowLeftRight size={14} /> Prepare Hospital Share
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {prescriptionCreateOpen && isDoctor && (
          <div className="sh-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !prescriptionCreateSaving) setPrescriptionCreateOpen(false); }}>
            <div className="sh-modal-content animate-fade-scale" role="dialog" aria-modal="true" aria-labelledby="prescription-create-title">
              <div className="sh-modal-header">
                <div>
                  <h3 id="prescription-create-title" className="text-white">Write Patient Prescription</h3>
                  <p className="text-sm text-secondary">Saved clinical data is visible to the selected patient and care administrators.</p>
                </div>
                <button type="button" className="sh-modal-close-btn" onClick={() => setPrescriptionCreateOpen(false)} aria-label="Close prescription form" disabled={prescriptionCreateSaving}><X size={18} /></button>
              </div>

              <form onSubmit={createPrescription} className="modal-form-body">
                <div className="form-group-field">
                  <label className="form-lbl" htmlFor="prescription-appointment">Appointment / patient</label>
                  <select id="prescription-appointment" className="module-select-input" name="appointment_id" defaultValue="" required>
                    <option value="" disabled>Select a confirmed or completed visit</option>
                    {appointments.filter((appointment) => ['CONFIRMED', 'COMPLETED'].includes(appointment.status)).map((appointment) => (
                      <option key={appointment.id} value={appointment.id}>#{appointment.id} · {appointment.patient_name} · {appointment.appointment_date}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row-2">
                  <div className="form-group-field">
                    <label className="form-lbl" htmlFor="prescription-medication">Medication</label>
                    <input id="prescription-medication" name="medication" className="module-text-input" maxLength={240} required />
                  </div>
                  <div className="form-group-field">
                    <label className="form-lbl" htmlFor="prescription-strength">Strength</label>
                    <input id="prescription-strength" name="strength" className="module-text-input" maxLength={100} placeholder="e.g. 10 mg" required />
                  </div>
                </div>
                <div className="form-group-field">
                  <label className="form-lbl" htmlFor="prescription-dosage">Dosage instructions</label>
                  <textarea id="prescription-dosage" name="dosage" className="module-textarea-input" rows={3} minLength={3} maxLength={2000} required />
                </div>
                <div className="form-row-2">
                  <div className="form-group-field">
                    <label className="form-lbl" htmlFor="prescription-quantity">Quantity</label>
                    <input id="prescription-quantity" name="quantity" className="module-text-input" maxLength={100} placeholder="e.g. 30 tablets" required />
                  </div>
                  <div className="form-group-field">
                    <label className="form-lbl" htmlFor="prescription-refills">Refills</label>
                    <input id="prescription-refills" name="refills" type="number" className="module-text-input" min={0} max={20} defaultValue={0} required />
                  </div>
                </div>
                <div className="form-group-field">
                  <label className="form-lbl" htmlFor="prescription-pharmacy">Preferred pharmacy (optional)</label>
                  <input id="prescription-pharmacy" name="pharmacy" className="module-text-input" maxLength={240} />
                </div>
                <div className="form-group-field">
                  <label className="form-lbl" htmlFor="prescription-clinical-note">Note for the patient (optional)</label>
                  <textarea id="prescription-clinical-note" name="clinical_note" className="module-textarea-input" rows={2} maxLength={3000} />
                </div>
                {prescriptionCreateError && <p className="module-subtitle" role="alert">{prescriptionCreateError}</p>}
                <div className="modal-actions-bar">
                  <Button type="button" variant="outline" onClick={() => setPrescriptionCreateOpen(false)} disabled={prescriptionCreateSaving}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={prescriptionCreateSaving}>Save & Share with Patient</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedPrescriptionToShare && (
          <div className="sh-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !hospitalShareSaving) { setSelectedPrescriptionToShare(null); setPreparedFHIRShare(null); } }}>
            <div className="sh-modal-content animate-fade-scale" role="dialog" aria-modal="true" aria-labelledby="prescription-share-title">
              <div className="sh-modal-header">
                <div>
                  <h3 id="prescription-share-title" className="text-white">Prepare Hospital Share</h3>
                  <p className="text-sm text-secondary">{selectedPrescriptionToShare.medication} · {selectedPrescriptionToShare.patient_name}</p>
                </div>
                <button type="button" className="sh-modal-close-btn" onClick={() => { setSelectedPrescriptionToShare(null); setPreparedFHIRShare(null); }} aria-label="Close hospital sharing form" disabled={hospitalShareSaving}><X size={18} /></button>
              </div>

              <form onSubmit={prepareHospitalShare} className="modal-form-body">
                {preparedFHIRShare ? (
                  <>
                    <p className="module-subtitle" role="status">A consent-logged FHIR package is stored in MongoDB. This application has not sent it to the hospital; use your organization's approved secure exchange channel.</p>
                    <div className="modal-actions-bar">
                      <Button type="button" variant="outline" onClick={() => downloadTextFile(`fhir-prescription-${preparedFHIRShare.prescription_id}.json`, JSON.stringify(preparedFHIRShare.payload, null, 2), 'application/fhir+json;charset=utf-8')}>
                        <Download size={14} /> Download FHIR JSON
                      </Button>
                      <Button type="button" variant="primary" onClick={() => { setSelectedPrescriptionToShare(null); setPreparedFHIRShare(null); }}>Done</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="module-subtitle" role="note">This creates a consent-logged FHIR R4 export package in MongoDB. It does not send patient data to another hospital because no partner API is connected yet.</p>
                    <div className="form-group-field">
                      <label className="form-lbl" htmlFor="share-destination-hospital">Destination hospital</label>
                      <input id="share-destination-hospital" name="destination_hospital" className="module-text-input" minLength={2} maxLength={200} placeholder="Enter the receiving hospital" required />
                    </div>
                    <label className="share-consent-row">
                      <input type="checkbox" name="patient_consent" required />
                      <span>{isPatient ? 'I authorize sharing this prescription with the named hospital.' : 'The patient has explicitly consented to share this prescription with the named hospital.'}</span>
                    </label>
                    <label className="share-consent-row">
                      <input type="checkbox" name="include_visit_notes" />
                      <span>Include diagnosis, treatment plan, and visit notes in the FHIR export.</span>
                    </label>
                    {dataExchangeError && <p className="module-subtitle" role="alert">{dataExchangeError}</p>}
                    <div className="modal-actions-bar">
                      <Button type="button" variant="outline" onClick={() => { setSelectedPrescriptionToShare(null); setPreparedFHIRShare(null); }} disabled={hospitalShareSaving}>Cancel</Button>
                      <Button type="submit" variant="primary" loading={hospitalShareSaving}>Prepare FHIR Export</Button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // 7. DATA EXCHANGE (FHIR R4 / HL7)
  // --------------------------------------------------------------------------
  const renderDataExchangeView = () => {
    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="cyan" size="sm" dot>
                Consent-Logged FHIR R4 Exchange
              </Badge>
              <span className="module-entity-count">{dataExchangeEvents.length} Share Records</span>
            </div>
            <h1 className="module-title">Health Information Exchange</h1>
            <p className="module-subtitle">
              Review patient-approved prescription shares. FHIR packages are stored in MongoDB and ready to export; direct delivery requires a configured partner hospital endpoint.
            </p>
          </div>
          <div className="module-actions-row">
            <Button variant="primary" size="sm" onClick={() => navigate('/prescriptions')}>
              <Pill size={14} /> View Prescriptions to Share
            </Button>
          </div>
        </div>

        {dataExchangeError && <p className="module-subtitle" role="alert">{dataExchangeError}</p>}
        {dataExchangeSuccess && <p className="module-subtitle" role="status">{dataExchangeSuccess}</p>}
        <div className="data-exchange-stream-list">
          {dataExchangeLoading && <Card>Loading MongoDB exchange records…</Card>}
          {!dataExchangeLoading && !dataExchangeError && dataExchangeEvents.length === 0 && (
            <Card>No hospital share packages have been prepared from this account yet.</Card>
          )}
          {!dataExchangeLoading && dataExchangeEvents.map((tx) => (
            <Card key={tx.share_id} className="exchange-tx-card" hoverable>
              <div className="exchange-card-top">
                <div className="exchange-protocol-group">
                  <ArrowLeftRight size={18} className="text-cyan" />
                  <strong>Share {tx.share_id.slice(0, 10)}</strong>
                  <Badge variant="cyan" size="sm">{tx.protocol}</Badge>
                </div>
                <Badge variant={tx.status === 'READY_FOR_EXPORT' ? 'warning' : 'success'} size="sm">
                  {tx.status.replaceAll('_', ' ')}
                </Badge>
              </div>

              <div className="exchange-flow-visual">
                <div className="flow-node flow-source">
                  <span className="node-lbl">Patient / Care Team</span>
                  <span className="node-name">{tx.patient_name} · {tx.doctor_name}</span>
                </div>
                <div className="flow-arrow-beam">
                  <div className="beam-line" />
                  <ArrowRight size={16} className="text-cyan" />
                </div>
                <div className="flow-node flow-dest">
                  <span className="node-lbl">Receiving Hospital</span>
                  <span className="node-name">{tx.destination_hospital}</span>
                </div>
              </div>

              <div className="exchange-card-footer">
                <div className="exchange-hash">
                  <Lock size={13} className="text-success" />
                  <span>SHA256: <code>{tx.payload_digest.slice(0, 20)}…</code></span>
                </div>
                <div className="exchange-time-actions">
                  <span className="tx-time">{new Date(tx.created_at).toLocaleString()}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inspectExchangePayload(tx)}
                  >
                    <FileCode size={13} /> Inspect FHIR Package
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Payload Inspect Modal */}
        {selectedTx && (
          <div className="sh-modal-overlay">
            <div className="sh-modal-content animate-fade-scale">
              <div className="sh-modal-header">
                <div>
                  <h3 className="text-white">FHIR Export Package</h3>
                  <p className="text-sm text-secondary">{selectedTx.txId} • {selectedTx.protocol}</p>
                </div>
                <button
                  type="button"
                  className="sh-modal-close-btn"
                  onClick={() => setSelectedTx(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="payload-inspect-body">
                <div className="payload-meta-box">
                  <p><strong>Remarks:</strong> {selectedTx.remarks}</p>
                  <p><strong>Cryptographic Seal:</strong> {selectedTx.hash}</p>
                </div>

                <div className="code-box-wrapper">
                  <span className="code-box-lang">JSON Payload (FHIR R4 Standard)</span>
                  <pre className="code-box-content">
                    {JSON.stringify(selectedTx.payloadSample, null, 2)}
                  </pre>
                </div>

                <div className="modal-actions-bar">
                  <Button
                    variant="outline"
                    onClick={() => downloadTextFile(`fhir-share-${selectedTx.txId}.json`, JSON.stringify(selectedTx.payloadSample, null, 2), 'application/fhir+json;charset=utf-8')}
                  >
                    <Download size={14} /> Download FHIR JSON
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setSelectedTx(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // 8. HOSPITAL ANALYTICS & TELEMETRY
  // --------------------------------------------------------------------------
  const renderAnalyticsView = () => {
    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="primary" size="sm" dot>
                Clinical Intelligence Center
              </Badge>
              <span className="module-entity-count">Dual Engine Telemetry</span>
            </div>
            <h1 className="module-title">Hospital Analytics & Operational Telemetry</h1>
            <p className="module-subtitle">
              Real-time inpatient census, appointment throughput, demographic distributions, and database performance statistics.
            </p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="dash-kpi-grid">
          <Card className="dash-kpi-card">
            <div className="kpi-icon-box bg-blue-soft text-primary"><Users size={22} /></div>
            <div className="kpi-num">4 Registered</div>
            <div className="kpi-label">Active Patients</div>
            <div className="kpi-sub text-primary">100% Inpatient Identity Synchronized</div>
          </Card>
          <Card className="dash-kpi-card">
            <div className="kpi-icon-box bg-teal-soft text-teal"><Stethoscope size={22} /></div>
            <div className="kpi-num">4 Specialists</div>
            <div className="kpi-label">Attending Medical Staff</div>
            <div className="kpi-sub text-teal">Cardiology, Neuro, Pulmonology, Peds</div>
          </Card>
          <Card className="dash-kpi-card">
            <div className="kpi-icon-box bg-cyan-soft text-cyan"><Calendar size={22} /></div>
            <div className="kpi-num">5 Managed</div>
            <div className="kpi-label">Appointment Bookings</div>
            <div className="kpi-sub text-cyan">80% In-Person • 20% Telehealth</div>
          </Card>
          <Card className="dash-kpi-card">
            <div className="kpi-icon-box bg-emerald-soft text-success"><ArrowLeftRight size={22} /></div>
            <div className="kpi-num">99.98%</div>
            <div className="kpi-label">FHIR R4 / HL7 Uptime</div>
            <div className="kpi-sub text-success">0 Packet Loss Recorded</div>
          </Card>
        </div>

        {/* Charts & Graphs Grid */}
        <div className="analytics-charts-grid">
          {/* Chart 1: Appointment Status Breakdown */}
          <Card className="analytics-chart-card">
            <div className="panel-header">
              <div>
                <h3>Appointment Distribution by Status</h3>
                <p>ACID Scheduled vs Confirmed vs Completed</p>
              </div>
            </div>
            <div className="chart-bar-container">
              <div className="chart-bar-row">
                <span className="chart-bar-lbl">Scheduled (Upcoming)</span>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill bg-cyan" style={{ width: '40%' }} />
                </div>
                <span className="chart-bar-val">2 (40%)</span>
              </div>
              <div className="chart-bar-row">
                <span className="chart-bar-lbl">Confirmed (Active)</span>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill bg-success" style={{ width: '40%' }} />
                </div>
                <span className="chart-bar-val">2 (40%)</span>
              </div>
              <div className="chart-bar-row">
                <span className="chart-bar-lbl">Completed (Discharged)</span>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill bg-primary" style={{ width: '20%' }} />
                </div>
                <span className="chart-bar-val">1 (20%)</span>
              </div>
            </div>
          </Card>

          {/* Chart 2: Department Inpatient Distribution */}
          <Card className="analytics-chart-card">
            <div className="panel-header">
              <div>
                <h3>Clinical Inpatient Census by Specialty</h3>
                <p>Current patient admissions per department</p>
              </div>
            </div>
            <div className="chart-bar-container">
              <div className="chart-bar-row">
                <span className="chart-bar-lbl">Cardiology & Internal Med</span>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill bg-primary" style={{ width: '50%' }} />
                </div>
                <span className="chart-bar-val">2 Patients (50%)</span>
              </div>
              <div className="chart-bar-row">
                <span className="chart-bar-lbl">Neurology & Diagnostics</span>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill bg-teal" style={{ width: '25%' }} />
                </div>
                <span className="chart-bar-val">1 Patient (25%)</span>
              </div>
              <div className="chart-bar-row">
                <span className="chart-bar-lbl">Pulmonology & ICU</span>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill bg-cyan" style={{ width: '25%' }} />
                </div>
                <span className="chart-bar-val">1 Patient (25%)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // 9. SYSTEM ACTIVITY & AUDIT EVENTS (SETTINGS)
  // --------------------------------------------------------------------------
  const renderSettingsView = () => {
    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="cyan" size="sm" dot>
                HIPAA / Institutional Governance
              </Badge>
              <span className="module-entity-count">Immutable Audit Trail</span>
            </div>
            <h1 className="module-title">Hospital System Activity & Audit Trail</h1>
            <p className="module-subtitle">
              Cryptographically verified event stream capturing authentications, EMR updates, prescription issuances, and FHIR transactions.
            </p>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="audit-timeline-container">
          {AUDIT_EVENTS_DATA.map((evt) => (
            <Card key={evt.id} className="audit-event-item" hoverable>
              <div className="audit-evt-icon">
                <ShieldCheck size={20} className="text-success" />
              </div>
              <div className="audit-evt-body">
                <div className="audit-evt-top">
                  <strong className="evt-id">{evt.id}</strong>
                  <Badge variant="primary" size="sm">{evt.type}</Badge>
                  <span className="evt-time">{evt.time}</span>
                </div>
                <p className="evt-action">{evt.action}</p>
                <span className="evt-actor">Actor: <strong>{evt.actor}</strong></span>
              </div>
              <Badge variant="success" size="sm">{evt.status}</Badge>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const previewOnlyPaths = new Set(['/analytics', '/settings']);

  return (
    <DashboardLayout>
      {previewOnlyPaths.has(pathname) && (
        <div className="auth-alert-info" role="note">
          Sample preview only. This page is not connected to stored clinical data. Use Appointments for saved visit information. Do not enter real patient data.
        </div>
      )}
      {renderModuleContent()}
    </DashboardLayout>
  );
}
