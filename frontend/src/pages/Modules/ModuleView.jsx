import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  ArrowLeftRight,
  ShieldCheck,
  ArrowRight,
  Zap,
  CheckCircle2,
  Search,
  MapPin,
  Mail,
  Lock,
  HeartPulse,
  Activity,
  Download,
  PlusCircle,
  X,
  FileCode,
  Pill,
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

const PATIENTS_DATA = [
  {
    id: 'PAT-8801',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+1 (555) 234-5678',
    email: 'john.doe@smarthealth.org',
    condition: 'Stage II Essential Hypertension',
    doctor: 'Dr. Robert Chen',
    department: 'Cardiology',
    status: 'Active Inpatient',
    room: 'Ward 3B - Bed 12',
    admissionDate: 'Oct 02, 2026',
    vitals: { bp: '138/86 mmHg', hr: '72 bpm', spo2: '99%' },
  },
  {
    id: 'PAT-8802',
    name: 'Emily Davis',
    age: 34,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '+1 (555) 876-5432',
    email: 'emily.davis@smarthealth.org',
    condition: 'Intractable Migraine with Visual Aura',
    doctor: 'Dr. Sarah Patel',
    department: 'Neurology',
    status: 'Stable Outpatient',
    room: 'Outpatient Clinic',
    admissionDate: 'Oct 04, 2026',
    vitals: { bp: '118/76 mmHg', hr: '68 bpm', spo2: '98%' },
  },
  {
    id: 'PAT-8803',
    name: 'Michael Scott',
    age: 52,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+1 (555) 432-1098',
    email: 'michael.scott@smarthealth.org',
    condition: 'Type 2 Diabetes Mellitus & Neuropathy',
    doctor: 'Dr. Robert Chen',
    department: 'Cardiology',
    status: 'Scheduled Review',
    room: 'Room 402 Consult',
    admissionDate: 'Sep 28, 2026',
    vitals: { bp: '132/84 mmHg', hr: '76 bpm', spo2: '97%' },
  },
  {
    id: 'PAT-8804',
    name: 'Sophia Williams',
    age: 29,
    gender: 'Female',
    bloodGroup: 'O-',
    phone: '+1 (555) 654-3210',
    email: 'sophia.williams@smarthealth.org',
    condition: 'Acute Bronchial Asthma Exacerbation',
    doctor: 'Dr. Elena Rostova',
    department: 'Pulmonology',
    status: 'Active Inpatient',
    room: 'ICU Stepdown - Bed 4',
    admissionDate: 'Oct 05, 2026',
    vitals: { bp: '122/80 mmHg', hr: '84 bpm', spo2: '95%' },
  },
];

const RECORDS_DATA = [
  {
    id: 'EMR-2026-0941',
    date: 'Oct 02, 2026',
    patient: 'John Doe',
    patientId: 'PAT-8801',
    doctor: 'Dr. Robert Chen, MD',
    diagnosis: 'Stage 2 Essential Hypertension (ICD-10: I10)',
    symptoms: 'Occasional morning occipital headache, mild exertional fatigue.',
    observations: 'BP: 142/88 mmHg right arm sitting. Resting HR 74 bpm. S1/S2 normal without murmur.',
    treatment: 'Titrate Amlodipine to 10mg daily. Restrict dietary sodium < 2g/day. Follow-up 4 weeks.',
    reports: ['12-Lead-ECG-Tracing.pdf', 'Renal-Function-Panel.pdf'],
  },
  {
    id: 'EMR-2026-0942',
    date: 'Oct 04, 2026',
    patient: 'Emily Davis',
    patientId: 'PAT-8802',
    doctor: 'Dr. Sarah Patel, MD',
    diagnosis: 'Intractable Migraine without Aura (ICD-10: G43.0)',
    symptoms: 'Throbbing unilateral hemicranial headache, photophobia, nausea.',
    observations: 'Cranial nerves II-XII grossly intact. Fundoscopic exam reveals sharp disc margins.',
    treatment: 'Prescribe Sumatriptan 50mg PRN at onset. Initiate Topiramate 25mg nightly prophylaxis.',
    reports: ['Brain-MRI-T2-Axial.dcm', 'Neurological-Exam-Summary.pdf'],
  },
  {
    id: 'EMR-2026-0943',
    date: 'Sep 28, 2026',
    patient: 'Michael Scott',
    patientId: 'PAT-8803',
    doctor: 'Dr. Robert Chen, MD',
    diagnosis: 'Type 2 Diabetes Mellitus with Mild Polyneuropathy (ICD-10: E11.40)',
    symptoms: 'Bilateral tingling in lower extremities, polydipsia, fatigue.',
    observations: 'HbA1c: 7.8%. Monofilament sensory testing reveals decreased vibration in great toes.',
    treatment: 'Continue Metformin 500mg BID. Prescribe Pregabalin 75mg QHS. Nutrition consult.',
    reports: ['Comprehensive-Metabolic-Panel.pdf', 'HbA1c-Glycemic-Report.pdf'],
  },
];

const PRESCRIPTIONS_DATA = [
  {
    id: 'RX-94821-NY',
    date: 'Oct 02, 2026',
    patient: 'John Doe (Age: 45)',
    doctor: 'Dr. Robert Chen, MD',
    medication: 'Amlodipine Besylate Oral Tablet',
    strength: '10 mg',
    dosage: 'Take 1 tablet orally once daily in the morning after food',
    quantity: '30 Tablets (30 Days Supply)',
    refills: '2 Refills Authorized',
    pharmacy: 'Metro General Hospital Outpatient Pharmacy • Ready for Dispensation',
    status: 'Active',
  },
  {
    id: 'RX-94822-NY',
    date: 'Oct 04, 2026',
    patient: 'Emily Davis (Age: 34)',
    doctor: 'Dr. Sarah Patel, MD',
    medication: 'Sumatriptan Succinate Oral Tablet',
    strength: '50 mg',
    dosage: 'Take 1 tablet orally at onset of acute migraine; repeat in 2 hours if needed (Max 200mg/24h)',
    quantity: '9 Tablets',
    refills: '1 Refill Authorized',
    pharmacy: 'St. Jude Community Pharmacy • Dispensed',
    status: 'Active',
  },
  {
    id: 'RX-94823-NY',
    date: 'Sep 28, 2026',
    patient: 'Michael Scott (Age: 52)',
    doctor: 'Dr. Robert Chen, MD',
    medication: 'Metformin HCl Extended Release Tablet',
    strength: '500 mg',
    dosage: 'Take 1 tablet orally twice daily with morning and evening meals',
    quantity: '60 Tablets (30 Days Supply)',
    refills: '3 Refills Authorized',
    pharmacy: 'Central Care Express Pharmacy • Dispensed',
    status: 'Active',
  },
];

const DATA_EXCHANGE_DATA = [
  {
    txId: 'TX-FHIR-77291',
    timestamp: '2026-10-06 05:22:18 UTC',
    protocol: 'FHIR R4 (DiagnosticReport)',
    source: 'SmartHealthcare Core EMR Node',
    destination: 'Regional Health Information Exchange (HIE)',
    status: 'Completed',
    hash: 'SHA256: 8f3c4e912a...77b1',
    remarks: 'Interoperable FHIR bundle serialized and cryptographically acknowledged.',
    payloadSample: {
      resourceType: 'DiagnosticReport',
      id: 'dr-8801-ecg',
      status: 'final',
      category: [{ coding: [{ system: 'http://loinc.org', code: '11524-6', display: 'EKG Study' }] }],
      subject: { reference: 'Patient/PAT-8801', display: 'John Doe' },
      effectiveDateTime: '2026-10-02T10:30:00Z',
    },
  },
  {
    txId: 'TX-HL7-88402',
    timestamp: '2026-10-06 04:51:03 UTC',
    protocol: 'HL7 v2.5.1 (ADT_A01)',
    source: 'Hospital Admission Subsystem',
    destination: 'State Health Department Surveillance',
    status: 'Completed',
    hash: 'SHA256: 4a9d1c778e...33f9',
    remarks: 'Admission, Discharge & Transfer event broadcast validated.',
    payloadSample: {
      messageType: 'ADT^A01^ADT_A01',
      sendingApplication: 'SmartHealthcare-ADT',
      receivingApplication: 'State-Health-Surveillance',
      patientIdentifier: 'PAT-8804',
      eventReason: 'Acute Respiratory Intake',
    },
  },
  {
    txId: 'TX-CCDA-99103',
    timestamp: '2026-10-06 03:15:45 UTC',
    protocol: 'C-CDA R2.1 (Continuity of Care)',
    source: 'Outpatient Cardiology Center',
    destination: 'National Veteran Care Gateway',
    status: 'Pending',
    hash: 'SHA256: e921bc448a...12aa',
    remarks: 'TLS 1.3 encrypted payload in transit with mutual TLS certificate.',
    payloadSample: {
      documentType: 'ClinicalDocument',
      code: '34133-9',
      displayName: 'Summarization of Episode Note',
      confidentialityCode: 'N',
    },
  },
];

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
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentError, setAppointmentError] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState('');
  const [appointmentSaving, setAppointmentSaving] = useState(false);
  const [editingClinicalId, setEditingClinicalId] = useState(null);
  const [clinicalDrafts, setClinicalDrafts] = useState({});
  const [minimumAppointmentDate] = useState(() => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().slice(0, 10);
  });
  const isPatient = currentUser?.role === 'PATIENT';
  const isDoctor = currentUser?.role === 'DOCTOR';
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

  useEffect(() => {
    if (['/appointments', '/doctors', '/clinical-notes'].includes(location.pathname)) {
      void Promise.resolve().then(loadAppointments);
    }
    if (location.pathname === '/appointments' && requestedDoctorId && isPatient) {
      const timer = window.setTimeout(() => setNewModalOpen(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, [location.pathname, location.search, requestedDoctorId, isPatient, loadAppointments]);

  const pathname = location.pathname;

  // Render appropriate view based on current route
  const renderModuleContent = () => {
    switch (pathname) {
      case '/patients':
        return renderPatientsView();
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
        return renderAnalyticsView();
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
    const filtered = PATIENTS_DATA.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.doctor.toLowerCase().includes(searchQuery.toLowerCase());
      if (filterStatus === 'ALL') return matchesSearch;
      return matchesSearch && p.status.toUpperCase().includes(filterStatus);
    });

    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        {/* Module Header */}
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="primary" size="sm" dot>
                MySQL 8.4 Relational Storage
              </Badge>
              <span className="module-entity-count">{filtered.length} Active Records</span>
            </div>
            <h1 className="module-title">Patient Clinical Registry</h1>
            <p className="module-subtitle">
              Comprehensive patient health charts, demographics, attending physicians, and real-time vital telemetry.
            </p>
          </div>

          <div className="module-actions-row">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const columns = [
                  ['id', 'ID'], ['name', 'Name'], ['age', 'Age'], ['gender', 'Gender'],
                  ['bloodGroup', 'Blood group'], ['phone', 'Phone'], ['email', 'Email'],
                  ['condition', 'Condition'], ['doctor', 'Doctor'], ['department', 'Department'],
                  ['status', 'Status'], ['room', 'Location'], ['admissionDate', 'Admission date'],
                ];
                const rows = [
                  columns.map(([, label]) => label),
                  ...filtered.map((patient) => columns.map(([key]) => patient[key])),
                ];
                const csv = rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n');
                downloadTextFile('sample-patient-registry.csv', `\uFEFF${csv}`, 'text/csv;charset=utf-8');
              }}
            >
              <Download size={14} /> Export Registry CSV
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="module-filter-bar">
          <div className="module-search-wrap">
            <Search size={18} className="module-search-icon" />
            <input
              type="text"
              placeholder="Search by Patient Name, MRN ID, Diagnosis, or Attending Physician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="module-search-input"
            />
          </div>

          <div className="module-filter-pills">
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterStatus('ALL')}
            >
              All Census
            </button>
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'INPATIENT' ? 'active' : ''}`}
              onClick={() => setFilterStatus('INPATIENT')}
            >
              Active Inpatients
            </button>
            <button
              type="button"
              className={`filter-pill ${filterStatus === 'OUTPATIENT' ? 'active' : ''}`}
              onClick={() => setFilterStatus('OUTPATIENT')}
            >
              Outpatients
            </button>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="patients-cards-grid">
          {filtered.map((patient) => (
            <Card key={patient.id} className="patient-record-card" hoverable>
              <div className="patient-card-header">
                <div className="patient-identity-block">
                  <div className="patient-avatar-box">
                    <span>{patient.name.split(' ').map((n) => n[0]).join('')}</span>
                  </div>
                  <div>
                    <h3 className="patient-name">{patient.name}</h3>
                    <span className="patient-mrn">{patient.id} • {patient.gender}, Age {patient.age}</span>
                  </div>
                </div>
                <Badge
                  variant={patient.status.includes('Inpatient') ? 'primary' : 'success'}
                  size="sm"
                >
                  {patient.status}
                </Badge>
              </div>

              <div className="patient-card-body">
                <div className="patient-field-row">
                  <span className="field-lbl">Clinical Condition:</span>
                  <span className="field-val font-semibold text-primary">{patient.condition}</span>
                </div>
                <div className="patient-field-row">
                  <span className="field-lbl">Attending Doctor:</span>
                  <span className="field-val">{patient.doctor} ({patient.department})</span>
                </div>
                <div className="patient-field-row">
                  <span className="field-lbl">Location / Bed:</span>
                  <span className="field-val">{patient.room}</span>
                </div>

                <div className="patient-vitals-strip">
                  <div className="vital-pill">
                    <HeartPulse size={13} className="text-teal" />
                    <span>BP: {patient.vitals.bp}</span>
                  </div>
                  <div className="vital-pill">
                    <Activity size={13} className="text-success" />
                    <span>HR: {patient.vitals.hr}</span>
                  </div>
                  <div className="vital-pill">
                    <Zap size={13} className="text-cyan" />
                    <span>SpO2: {patient.vitals.spo2}</span>
                  </div>
                </div>
              </div>

              <div className="patient-card-footer">
                <span className="admit-date">Admitted: {patient.admissionDate}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/medical-records')}
                >
                  View EMR Chart →
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
                    <Button variant="outline" size="sm" onClick={() => updateStatus(apt, 'CANCELLED')} loading={appointmentSaving}>Cancel</Button>
                  )}
                  {isDoctor && !isClosed && (
                    <>
                      {apt.status === 'SCHEDULED' && <Button variant="primary" size="sm" onClick={() => updateStatus(apt, 'CONFIRMED')} loading={appointmentSaving}>Confirm</Button>}
                      {apt.status === 'CONFIRMED' && <Button variant="primary" size="sm" onClick={() => updateStatus(apt, 'COMPLETED')} loading={appointmentSaving}>Complete</Button>}
                      {apt.status === 'CONFIRMED' && <Button variant="outline" size="sm" onClick={() => updateStatus(apt, 'NO_SHOW')} loading={appointmentSaving}>No-show</Button>}
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
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // 4. MEDICAL RECORDS (EMR)
  // --------------------------------------------------------------------------
  const renderMedicalRecordsView = () => {
    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="teal" size="sm" dot>
                MongoDB Document Collection
              </Badge>
              <span className="module-entity-count">{RECORDS_DATA.length} Verified Records</span>
            </div>
            <h1 className="module-title">Electronic Medical Records (EMR)</h1>
            <p className="module-subtitle">
              Diagnostic clinical documents, ICD-10 indexed pathologies, lab observations, and physician treatment plans.
            </p>
          </div>
        </div>

        <div className="emr-records-stream">
          {RECORDS_DATA.map((rec) => (
            <Card key={rec.id} className="emr-record-card" hoverable>
              <div className="emr-record-top">
                <div className="emr-id-badge">
                  <FileText size={18} className="text-teal" />
                  <strong>{rec.id}</strong>
                  <span className="emr-date-tag">• {rec.date}</span>
                </div>
                <div className="emr-sig-badge">
                  <ShieldCheck size={15} className="text-success" />
                  <span>Physician Signed & Sealed</span>
                </div>
              </div>

              <div className="emr-patient-row">
                <div className="emr-patient-info">
                  <span className="emr-lbl">Patient:</span>
                  <span className="emr-patient-name">{rec.patient} ({rec.patientId})</span>
                </div>
                <div className="emr-doc-info">
                  <span className="emr-lbl">Attending Physician:</span>
                  <span className="emr-doc-name">{rec.doctor}</span>
                </div>
              </div>

              <div className="emr-diagnosis-box">
                <span className="diag-label">Clinical Diagnosis (ICD-10):</span>
                <p className="diag-text">{rec.diagnosis}</p>
              </div>

              <div className="emr-sections-grid">
                <div className="emr-sec-block">
                  <span className="sec-title">Presenting Symptoms:</span>
                  <p className="sec-body">{rec.symptoms}</p>
                </div>
                <div className="emr-sec-block">
                  <span className="sec-title">Clinical Observations & Vitals:</span>
                  <p className="sec-body">{rec.observations}</p>
                </div>
                <div className="emr-sec-block">
                  <span className="sec-title">Prescribed Treatment & Titration Plan:</span>
                  <p className="sec-body text-teal font-semibold">{rec.treatment}</p>
                </div>
              </div>

              <div className="emr-attachments-row">
                <span className="attach-lbl">Diagnostic Attachments:</span>
                <div className="attach-pills-list">
                  {rec.reports.map((r) => (
                    <button
                      type="button"
                      key={r}
                      className="attach-pill"
                      aria-label={`Download sample summary for ${r}`}
                      onClick={() => {
                        const summary = [
                          'SmartHealthcare generated sample attachment summary',
                          `Attachment listed in demo data: ${r}`,
                          'This text summary is generated from the sample record. The source diagnostic file is not included.',
                          `Patient: ${rec.patient} (${rec.patientId})`,
                          `Date: ${rec.date}`,
                          `Attending physician: ${rec.doctor}`,
                          `Diagnosis: ${rec.diagnosis}`,
                          `Presenting symptoms: ${rec.symptoms}`,
                          `Clinical observations: ${rec.observations}`,
                          `Treatment plan: ${rec.treatment}`,
                        ].join('\n');
                        downloadTextFile(r.replace(/\.pdf$/i, '-demo-summary.txt'), summary);
                      }}
                    >
                      <Download size={13} /> {r}
                    </button>
                  ))}
                </div>
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
    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="teal" size="sm" dot>
                Electronic Prescribing Subsystem
              </Badge>
              <span className="module-entity-count">{PRESCRIPTIONS_DATA.length} Authorized Rx</span>
            </div>
            <h1 className="module-title">e-Prescriptions & Pharmacy Dispensary</h1>
            <p className="module-subtitle">
              Legally binding digital prescriptions with dosage regimens, authorized refills, and pharmacy fulfillment status.
            </p>
          </div>
        </div>

        <div className="prescriptions-grid">
          {PRESCRIPTIONS_DATA.map((rx) => (
            <Card key={rx.id} className="prescription-card-item" hoverable>
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
                    <span className="rx-val">{rx.patient}</span>
                  </div>
                  <div className="rx-meta-cell">
                    <span className="rx-lbl">Authorizing Physician:</span>
                    <span className="rx-val">{rx.doctor}</span>
                  </div>
                </div>

                <div className="rx-pharmacy-status">
                  <CheckCircle2 size={15} className="text-success" />
                  <span>{rx.pharmacy}</span>
                </div>
              </div>

              <div className="rx-card-footer">
                <span className="rx-id-code">{rx.id} • Authorized on {rx.date}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const slip = [
                      'SmartHealthcare sample prescription details',
                      `Prescription: ${rx.id}`,
                      `Date: ${rx.date}`,
                      `Patient: ${rx.patient}`,
                      `Prescribing doctor: ${rx.doctor}`,
                      `Medication: ${rx.medication}`,
                      `Strength: ${rx.strength}`,
                      `Dosage: ${rx.dosage}`,
                      `Quantity: ${rx.quantity}`,
                      `Refills: ${rx.refills}`,
                      `Pharmacy: ${rx.pharmacy}`,
                      'This file contains fictional sample data for demonstration only.',
                    ].join('\n');
                    downloadTextFile(`sample-prescription-${rx.id}.txt`, slip);
                  }}
                >
                  <Download size={13} /> Download Rx Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
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
                FHIR R4 / HL7 Interoperability Gateway
              </Badge>
              <span className="module-entity-count">{DATA_EXCHANGE_DATA.length} Transactions</span>
            </div>
            <h1 className="module-title">Health Information Exchange (HIE) Stream</h1>
            <p className="module-subtitle">
              Cross-network clinical data exchange router supporting FHIR R4 JSON bundles, HL7 v2 ADT feeds, and C-CDA continuity documents.
            </p>
          </div>
        </div>

        {/* Data Exchange Flow Representation */}
        <div className="data-exchange-stream-list">
          {DATA_EXCHANGE_DATA.map((tx) => (
            <Card key={tx.txId} className="exchange-tx-card" hoverable>
              <div className="exchange-card-top">
                <div className="exchange-protocol-group">
                  <ArrowLeftRight size={18} className="text-cyan" />
                  <strong>{tx.txId}</strong>
                  <Badge variant="cyan" size="sm">{tx.protocol}</Badge>
                </div>
                <Badge
                  variant={tx.status === 'Completed' ? 'success' : 'warning'}
                  size="sm"
                >
                  {tx.status}
                </Badge>
              </div>

              {/* Visual Flow Representation */}
              <div className="exchange-flow-visual">
                <div className="flow-node flow-source">
                  <span className="node-lbl">Source Node</span>
                  <span className="node-name">{tx.source}</span>
                </div>
                <div className="flow-arrow-beam">
                  <div className="beam-line" />
                  <ArrowRight size={16} className="text-cyan" />
                </div>
                <div className="flow-node flow-dest">
                  <span className="node-lbl">Destination Gateway</span>
                  <span className="node-name">{tx.destination}</span>
                </div>
              </div>

              <div className="exchange-card-footer">
                <div className="exchange-hash">
                  <Lock size={13} className="text-success" />
                  <span>Hash: <code>{tx.hash}</code></span>
                </div>
                <div className="exchange-time-actions">
                  <span className="tx-time">{tx.timestamp}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTx(tx)}
                  >
                    <FileCode size={13} /> Inspect Payload
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
                  <h3 className="text-white">Serialized Payload Inspector</h3>
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
                    variant="primary"
                    onClick={() => setSelectedTx(null)}
                  >
                    Close Inspector
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

  const previewOnlyPaths = new Set([
    '/patients',
    '/medical-records',
    '/prescriptions',
    '/data-exchange',
    '/analytics',
    '/settings',
  ]);

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
