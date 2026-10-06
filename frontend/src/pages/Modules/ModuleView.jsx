import React, { useState } from 'react';
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
  Clock,
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
  Video,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import './ModuleView.css';

// ============================================================================
// REAL DATA & CLINICAL CATALOGS (Aligned with MySQL & MongoDB Schemas)
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

const DOCTORS_DATA = [
  {
    id: 'DOC-101',
    name: 'Dr. Robert Chen, MD, FACC',
    specialty: 'Cardiovascular Disease & Interventional Cardiology',
    department: 'Cardiology',
    experience: '14 Years Experience',
    education: 'Harvard Medical School • Johns Hopkins Fellow',
    room: 'Clinical Suite 402',
    hours: 'Mon - Thu: 09:00 - 15:30',
    status: 'Available Today',
    email: 'robert.chen@smarthealth.org',
    rating: '4.95 / 5.0 (140+ reviews)',
    activePatients: 28,
  },
  {
    id: 'DOC-102',
    name: 'Dr. Sarah Patel, MD, PhD',
    specialty: 'Clinical Neurology & Neuro-Pathology',
    department: 'Neurology',
    experience: '11 Years Experience',
    education: 'Stanford University School of Medicine',
    room: 'Clinical Suite 308',
    hours: 'Tue - Fri: 08:30 - 16:00',
    status: 'In Consultation',
    email: 'sarah.patel@smarthealth.org',
    rating: '4.92 / 5.0 (98 reviews)',
    activePatients: 22,
  },
  {
    id: 'DOC-103',
    name: 'Dr. Marcus Vance, MD',
    specialty: 'Pediatric Intensive Care & Neonatology',
    department: 'Pediatrics',
    experience: '16 Years Experience',
    education: 'Columbia University Vagelos College',
    room: 'Children Pavilion 201',
    hours: 'Mon - Fri: 08:00 - 14:30',
    status: 'Available Today',
    email: 'marcus.vance@smarthealth.org',
    rating: '4.98 / 5.0 (210+ reviews)',
    activePatients: 34,
  },
  {
    id: 'DOC-104',
    name: 'Dr. Elena Rostova, MD',
    specialty: 'Pulmonology & Critical Care Medicine',
    department: 'Pulmonology',
    experience: '9 Years Experience',
    education: 'UCSF School of Medicine',
    room: 'Pulmonary Suite 512',
    hours: 'Wed - Sat: 10:00 - 18:00',
    status: 'Telehealth Open',
    email: 'elena.rostova@smarthealth.org',
    rating: '4.89 / 5.0 (85 reviews)',
    activePatients: 19,
  },
];

const APPOINTMENTS_DATA = [
  {
    id: 'APT-2026-001',
    date: 'Oct 14, 2026',
    time: '10:30 AM',
    patient: 'John Doe',
    patientId: 'PAT-8801',
    doctor: 'Dr. Robert Chen',
    department: 'Cardiology',
    mode: 'In-Person Consultation',
    status: 'Confirmed',
    reason: 'Follow-up on Stage 2 Essential Hypertension & EKG review',
    room: 'Suite 402',
  },
  {
    id: 'APT-2026-002',
    date: 'Oct 15, 2026',
    time: '11:15 AM',
    patient: 'Emily Davis',
    patientId: 'PAT-8802',
    doctor: 'Dr. Sarah Patel',
    department: 'Neurology',
    mode: 'Encrypted Telehealth',
    status: 'Scheduled',
    reason: 'Review of Brain MRI scan and migraine prophylaxis titration',
    room: 'Virtual Room 3',
  },
  {
    id: 'APT-2026-003',
    date: 'Oct 16, 2026',
    time: '09:00 AM',
    patient: 'Michael Scott',
    patientId: 'PAT-8803',
    doctor: 'Dr. Robert Chen',
    department: 'Cardiology',
    mode: 'In-Person Consultation',
    status: 'Scheduled',
    reason: 'Annual cardiovascular risk assessment & lipid profile check',
    room: 'Suite 402',
  },
  {
    id: 'APT-2026-004',
    date: 'Oct 10, 2026',
    time: '02:00 PM',
    patient: 'Sophia Williams',
    patientId: 'PAT-8804',
    doctor: 'Dr. Elena Rostova',
    department: 'Pulmonology',
    mode: 'In-Person Consultation',
    status: 'Completed',
    reason: 'Spirometry follow-up & peak flow volume analysis',
    room: 'Suite 512',
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

const NOTES_DATA = [
  {
    id: 'NOTE-8821',
    date: 'Oct 05, 2026',
    time: '14:30 EST',
    patient: 'Sophia Williams (PAT-8804)',
    doctor: 'Dr. Elena Rostova, MD',
    type: 'SOAP Daily Progress Note',
    subjective: 'Patient reports improved ease of breathing following nebulizer therapy. Cough is now non-productive.',
    objective: 'RR: 18 bpm, SpO2: 97% on room air. Lungs clear to auscultation bilaterally with minimal end-expiratory wheeze.',
    assessment: 'Acute asthma exacerbation resolving satisfactorily.',
    plan: 'Wean albuterol nebulization to PRN. Discharge planning initiated for tomorrow morning.',
  },
  {
    id: 'NOTE-8822',
    date: 'Oct 02, 2026',
    time: '11:00 EST',
    patient: 'John Doe (PAT-8801)',
    doctor: 'Dr. Robert Chen, MD',
    type: 'Cardiology Consultation Note',
    subjective: 'Patient presents for routine quarterly hypertension follow-up. Complains of mild headaches.',
    objective: 'BP: 142/88 mmHg. Weight: 84 kg. Peripheral pulses 2+ symmetric.',
    assessment: 'Suboptimally controlled Stage 2 Essential Hypertension.',
    plan: 'Increase Amlodipine to 10mg daily. Repeat BMP in 4 weeks. DASH diet counseling provided.',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [appointments, setAppointments] = useState(APPOINTMENTS_DATA);

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
              onClick={() => alert('Exporting encrypted patient demographic roster (CSV/PDF)...')}
            >
              <Download size={14} /> Export Registry
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
    const filtered = DOCTORS_DATA.filter((d) => {
      return (
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="teal" size="sm" dot>
                Physician Credential Registry
              </Badge>
              <span className="module-entity-count">{filtered.length} Specialists</span>
            </div>
            <h1 className="module-title">Medical Staff & Specialists Directory</h1>
            <p className="module-subtitle">
              Board-certified practitioners, consultation rosters, department affiliations, and appointment availability.
            </p>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="doctors-cards-grid">
          {filtered.map((doc) => (
            <Card key={doc.id} className="doctor-profile-card" hoverable>
              <div className="doc-card-top">
                <div className="doc-avatar-large">
                  <Stethoscope size={28} className="text-teal" />
                </div>
                <div className="doc-main-meta">
                  <Badge variant="teal" size="sm">{doc.department}</Badge>
                  <h3 className="doc-full-name">{doc.name}</h3>
                  <span className="doc-specialty-line">{doc.specialty}</span>
                  <span className="doc-rating-badge">★ {doc.rating}</span>
                </div>
              </div>

              <div className="doc-card-details">
                <div className="doc-detail-item">
                  <MapPin size={14} className="text-muted" />
                  <span>{doc.room}</span>
                </div>
                <div className="doc-detail-item">
                  <Clock size={14} className="text-muted" />
                  <span>{doc.hours}</span>
                </div>
                <div className="doc-detail-item">
                  <Mail size={14} className="text-muted" />
                  <span>{doc.email}</span>
                </div>
              </div>

              <div className="doc-card-footer">
                <div className="doc-status-indicator">
                  <span className="pulse-dot-green" />
                  <span>{doc.status}</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/appointments')}
                >
                  Book Consultation
                </Button>
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
    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="cyan" size="sm" dot>
                Real-Time Clinical Schedule
              </Badge>
              <span className="module-entity-count">{appointments.length} Appointments</span>
            </div>
            <h1 className="module-title">Appointment Management</h1>
            <p className="module-subtitle">
              Verified clinical consultations, telemedicine queues, and practitioner calendar synchronization.
            </p>
          </div>

          <div className="module-actions-row">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setNewModalOpen(true)}
            >
              <PlusCircle size={15} /> Book New Consultation
            </Button>
          </div>
        </div>

        {/* Appointment Cards List */}
        <div className="appointments-list-container">
          {appointments.map((apt) => (
            <Card key={apt.id} className="appointment-card-item" hoverable>
              <div className="apt-date-col">
                <span className="apt-date-text">{apt.date}</span>
                <span className="apt-time-text">{apt.time}</span>
                <span className="apt-id-tag">{apt.id}</span>
              </div>

              <div className="apt-info-col">
                <div className="apt-title-row">
                  <h4>{apt.reason}</h4>
                  <Badge
                    variant={apt.status === 'Confirmed' ? 'success' : apt.status === 'Completed' ? 'neutral' : 'primary'}
                    size="sm"
                  >
                    {apt.status}
                  </Badge>
                </div>

                <div className="apt-meta-chips">
                  <span className="apt-meta-chip">
                    <User size={13} className="text-primary" /> Patient: <strong>{apt.patient}</strong> ({apt.patientId})
                  </span>
                  <span className="apt-meta-chip">
                    <Stethoscope size={13} className="text-teal" /> Specialist: <strong>{apt.doctor}</strong>
                  </span>
                  <span className="apt-meta-chip">
                    <MapPin size={13} className="text-cyan" /> {apt.room} • {apt.mode}
                  </span>
                </div>
              </div>

              <div className="apt-actions-col">
                {apt.status === 'Scheduled' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAppointments((items) => items.map((item) => item.id === apt.id ? { ...item, status: 'Confirmed' } : item))}
                  >
                    Confirm
                  </Button>
                )}
                {apt.mode.includes('Telehealth') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert(`Connecting to encrypted telehealth room for ${apt.patient}...`)}
                  >
                    <Video size={14} /> Join Video
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/medical-records')}
                >
                  Open Chart →
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Book Appointment Modal */}
        {newModalOpen && (
          <div className="sh-modal-overlay">
            <div className="sh-modal-content animate-fade-scale">
              <div className="sh-modal-header">
                <div>
                  <h3 className="text-white">Schedule Clinical Consultation</h3>
                  <p className="text-sm text-secondary">Book a synchronized appointment with an attending physician</p>
                </div>
                <button
                  type="button"
                  className="sh-modal-close-btn"
                  onClick={() => setNewModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const patient = PATIENTS_DATA.find((item) => item.id === formData.get('patientId'));
                  const doctor = DOCTORS_DATA.find((item) => item.id === formData.get('doctorId'));
                  const dateValue = String(formData.get('date'));
                  const [year, month, day] = dateValue.split('-').map(Number);
                  const date = new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                  const [hour, minute] = String(formData.get('time')).split(':').map(Number);
                  const time = new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  setAppointments((items) => [{
                    id: `APT-${Date.now()}`,
                    date,
                    time,
                    patient: patient.name,
                    patientId: patient.id,
                    doctor: doctor.name.replace(/, MD.*$/, ''),
                    department: doctor.department,
                    mode: 'In-Person Consultation',
                    status: 'Scheduled',
                    reason: String(formData.get('reason')).trim(),
                    room: doctor.room,
                  }, ...items]);
                  setNewModalOpen(false);
                  window.alert('Appointment added to this demo session. It is not saved to the server.');
                }}
                className="modal-form-body"
              >
                <div className="form-group-field">
                  <label className="form-lbl">Patient Name & MRN</label>
                    <select className="module-select-input" name="patientId" required>
                    <option value="PAT-8801">John Doe (PAT-8801)</option>
                    <option value="PAT-8802">Emily Davis (PAT-8802)</option>
                    <option value="PAT-8803">Michael Scott (PAT-8803)</option>
                    <option value="PAT-8804">Sophia Williams (PAT-8804)</option>
                  </select>
                </div>

                <div className="form-group-field">
                  <label className="form-lbl">Attending Specialist</label>
                    <select className="module-select-input" name="doctorId" required>
                    <option value="DOC-101">Dr. Robert Chen, MD (Cardiology)</option>
                    <option value="DOC-102">Dr. Sarah Patel, MD (Neurology)</option>
                    <option value="DOC-103">Dr. Marcus Vance, MD (Pediatrics)</option>
                    <option value="DOC-104">Dr. Elena Rostova, MD (Pulmonology)</option>
                  </select>
                </div>

                <div className="form-row-2">
                  <div className="form-group-field">
                    <label className="form-lbl">Preferred Date</label>
                    <input type="date" name="date" defaultValue="2026-10-18" className="module-text-input" required />
                  </div>
                  <div className="form-group-field">
                    <label className="form-lbl">Preferred Time</label>
                    <input type="time" name="time" defaultValue="10:30" className="module-text-input" required />
                  </div>
                </div>

                <div className="form-group-field">
                  <label className="form-lbl">Consultation Reason / Clinical Symptoms</label>
                  <textarea
                    rows={3}
                    placeholder="Describe clinical symptoms or required follow-up..."
                    className="module-textarea-input"
                    name="reason"
                    required
                    defaultValue="Quarterly cardiology evaluation & blood pressure review."
                  />
                </div>

                <div className="modal-actions-bar">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Confirm Booking
                  </Button>
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
                    <span
                      key={r}
                      className="attach-pill"
                      onClick={() => alert(`Downloading verified document: ${r}`)}
                    >
                      <Download size={13} /> {r}
                    </span>
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
  // 5. CLINICAL NOTES (SOAP PROGRESS NOTES)
  // --------------------------------------------------------------------------
  const renderClinicalNotesView = () => {
    return (
      <div className="module-subsystem-wrapper animate-fade-up">
        <div className="module-header-card">
          <div className="module-header-info">
            <div className="module-badge-row">
              <Badge variant="cyan" size="sm" dot>
                SOAP Progress Notes
              </Badge>
              <span className="module-entity-count">{NOTES_DATA.length} Sealed Notes</span>
            </div>
            <h1 className="module-title">Clinical Progress & SOAP Notes</h1>
            <p className="module-subtitle">
              Standardized clinical progress notes (Subjective, Objective, Assessment, Plan) authored by attending physicians.
            </p>
          </div>

          <div className="module-actions-row">
            <Button
              variant="primary"
              size="sm"
              onClick={() => alert('Opening SOAP note creation workspace...')}
            >
              <PlusCircle size={15} /> Author SOAP Note
            </Button>
          </div>
        </div>

        <div className="notes-cards-stream">
          {NOTES_DATA.map((note) => (
            <Card key={note.id} className="soap-note-card" hoverable>
              <div className="soap-header-row">
                <div className="soap-title-group">
                  <Badge variant="primary" size="sm">{note.type}</Badge>
                  <strong className="soap-id">{note.id}</strong>
                  <span className="soap-time">{note.date} at {note.time}</span>
                </div>
                <span className="soap-doc-tag">{note.doctor}</span>
              </div>

              <div className="soap-patient-banner">
                <span>Patient Subject: <strong>{note.patient}</strong></span>
              </div>

              <div className="soap-grid">
                <div className="soap-cell soap-s">
                  <span className="soap-letter">S</span>
                  <div>
                    <h5 className="soap-cell-title">Subjective</h5>
                    <p>{note.subjective}</p>
                  </div>
                </div>
                <div className="soap-cell soap-o">
                  <span className="soap-letter">O</span>
                  <div>
                    <h5 className="soap-cell-title">Objective</h5>
                    <p>{note.objective}</p>
                  </div>
                </div>
                <div className="soap-cell soap-a">
                  <span className="soap-letter">A</span>
                  <div>
                    <h5 className="soap-cell-title">Assessment</h5>
                    <p>{note.assessment}</p>
                  </div>
                </div>
                <div className="soap-cell soap-p">
                  <span className="soap-letter">P</span>
                  <div>
                    <h5 className="soap-cell-title">Plan</h5>
                    <p>{note.plan}</p>
                  </div>
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
                  onClick={() => alert(`Downloading PDF receipt for prescription ${rx.id}...`)}
                >
                  <Download size={13} /> Print Rx Slip
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

  return <DashboardLayout>{renderModuleContent()}</DashboardLayout>;
}
