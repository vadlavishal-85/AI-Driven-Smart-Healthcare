import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  Stethoscope,
  FileText,
  HeartPulse,
  Pill,
  CheckCircle2,
  Activity,
  Database,
  ArrowLeftRight,
  Video,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { API_BASE_URL } from '../../services/api';
import doctorRoleImg from '../../assets/images/doctor_role.jpg';
import patientRoleImg from '../../assets/images/patient_role.jpg';
import adminRoleImg from '../../assets/images/admin_role.jpg';
import './Dashboard.css';

function getGreetingTime() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const userRole = currentUser?.role || 'DOCTOR';

  if (userRole === 'DOCTOR') {
    return (
      <DashboardLayout>
        <DoctorDashboard currentUser={currentUser} navigate={navigate} />
      </DashboardLayout>
    );
  }

  if (userRole === 'PATIENT') {
    return (
      <DashboardLayout>
        <PatientDashboard currentUser={currentUser} navigate={navigate} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AdminDashboard currentUser={currentUser} navigate={navigate} />
    </DashboardLayout>
  );
}

// ============================================================================
// 1. DOCTOR CLINICAL WORKSPACE
// ============================================================================
function DoctorDashboard({ currentUser, navigate }) {
  const greeting = getGreetingTime();
  const doctorName = currentUser
    ? `Dr. ${currentUser.first_name || 'Physician'} ${currentUser.last_name || ''}`
    : 'Dr. Ananya Rao';


  const todayAppointments = [
    {
      id: 'APT-2026-001',
      time: '10:30 AM',
      patient: 'John Doe',
      patientId: 'PAT-8801',
      type: 'In-Person Consultation',
      room: 'Suite 402',
      reason: 'Follow-up on Stage II Essential Hypertension & EKG review',
      status: 'Confirmed',
      vitals: 'BP 138/86 • HR 72',
    },
    {
      id: 'APT-2026-002',
      time: '11:15 AM',
      patient: 'Emily Davis',
      patientId: 'PAT-8802',
      type: 'Encrypted Telehealth',
      room: 'Virtual Room 3',
      reason: 'Review of Brain MRI scan and migraine prophylaxis titration',
      status: 'Scheduled',
      vitals: 'BP 118/76 • HR 68',
    },
    {
      id: 'APT-2026-003',
      time: '02:00 PM',
      patient: 'Michael Scott',
      patientId: 'PAT-8803',
      type: 'In-Person Consultation',
      room: 'Suite 402',
      reason: 'Annual cardiovascular risk assessment & lipid profile evaluation',
      status: 'Scheduled',
      vitals: 'BP 132/84 • HR 76',
    },
  ];

  const clinicalActivities = [
    {
      id: 'ACT-1',
      time: '09:15 AM',
      title: 'Prescription Dispatched',
      desc: 'Amlodipine Besylate 10mg authorized for John Doe (PAT-8801)',
      icon: Pill,
      color: 'teal',
    },
    {
      id: 'ACT-2',
      time: '08:40 AM',
      title: 'SOAP Note Sealed',
      desc: 'Progress documentation signed for Emily Davis (PAT-8802)',
      icon: FileText,
      color: 'cyan',
    },
    {
      id: 'ACT-3',
      time: 'Yesterday',
      title: 'FHIR DiagnosticReport Ingested',
      desc: '12-Lead ECG study bundle verified from regional cardiology node',
      icon: ArrowLeftRight,
      color: 'blue',
    },
  ];

  return (
    <div className="doctor-workspace animate-fade-up">
      {/* Clinical Workspace Header Banner */}
      <div className="dash-hero-banner doc-theme">
        <div className="dash-hero-bg-accent">
          <img src={doctorRoleImg} alt="Clinical Environment" className="dash-hero-photo" />
          <div className="dash-hero-photo-fade" />
        </div>

        <div className="dash-hero-info">
          <div className="dash-badge-row">
            <span className="doc-hero-badge">
              <Stethoscope size={14} /> Clinical Workspace
            </span>
            <span className="live-status-pill">
              <span className="pulse-dot-green" /> On-Duty Clinical Session
            </span>
          </div>
          <h1 className="dash-hero-title">
            {greeting}, <span className="text-teal">{doctorName}</span>
          </h1>
          <p className="dash-hero-subtitle">
            Today's Clinical Overview • Department of Cardiology & Internal Medicine • Clinical Suite 402
          </p>
        </div>

        <div className="dash-hero-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/appointments')}
          >
            <Calendar size={15} /> Consultation Roster
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/clinical-notes')}
          >
            <PlusCircle size={15} /> New Clinical Note
          </Button>
        </div>
      </div>

      {/* Doctor Metric Strip */}
      <div className="dash-kpi-grid">
        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-teal-soft text-teal">
            <Calendar size={22} />
          </div>
          <div className="kpi-num">3 Consultations</div>
          <div className="kpi-label">Today's Appointment Queue</div>
          <div className="kpi-sub text-teal">2 In-Person • 1 Telehealth</div>
        </Card>

        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-blue-soft text-primary">
            <Users size={22} />
          </div>
          <div className="kpi-num">4 Inpatients</div>
          <div className="kpi-label">Assigned Clinical Census</div>
          <div className="kpi-sub text-primary">Ward 3B & Stepdown ICU</div>
        </Card>

        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-cyan-soft text-cyan">
            <FileText size={22} />
          </div>
          <div className="kpi-num">2 Pending</div>
          <div className="kpi-label">SOAP Progress Notes</div>
          <div className="kpi-sub text-cyan">Discharge Clearance Required</div>
        </Card>

        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-emerald-soft text-success">
            <Pill size={22} />
          </div>
          <div className="kpi-num">1 Pending</div>
          <div className="kpi-label">Prescription Refill Request</div>
          <div className="kpi-sub text-success">Awaiting Physician Sig</div>
        </Card>
      </div>

      {/* 2-Column Clinical Layout */}
      <div className="dash-two-column-grid">
        {/* Left Column: Today's Clinical Schedule */}
        <Card className="dash-panel-card">
          <div className="panel-header">
            <div>
              <h3>Today's Clinical Appointment Queue</h3>
              <p>Synchronized consultation schedule with verified EMR links</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/appointments')}
            >
              Full Schedule →
            </Button>
          </div>

          <div className="doc-schedule-timeline">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="doc-timeline-item">
                <div className="doc-time-badge">
                  <Clock size={14} className="text-teal" />
                  <span className="time-text">{apt.time}</span>
                  <span className="mode-text">{apt.type}</span>
                </div>

                <div className="doc-patient-block">
                  <div className="doc-patient-top">
                    <h4>{apt.patient} <span className="doc-patient-id">({apt.patientId})</span></h4>
                    <span className="doc-location-tag">{apt.room}</span>
                  </div>
                  <p className="doc-apt-reason">{apt.reason}</p>
                  <div className="doc-apt-vitals">
                    <HeartPulse size={13} className="text-teal" />
                    <span>Latest Recorded Vitals: <strong>{apt.vitals}</strong></span>
                  </div>
                </div>

                <div className="doc-apt-actions">
                  {apt.type.includes('Telehealth') ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Initiating encrypted telehealth session for ${apt.patient}...`)}
                    >
                      <Video size={14} /> Start Video
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/medical-records')}
                    >
                      Open Chart
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Clinical Activity & Tools */}
        <div className="dash-right-stack">
          {/* Clinical Activity Timeline */}
          <Card className="dash-panel-card">
            <div className="panel-header">
              <div>
                <h3>Clinical Activity Stream</h3>
                <p>Recent physician authorizations & notes</p>
              </div>
              <span className="live-pill-sm">
                <span className="pulse-dot-cyan" /> Real-time
              </span>
            </div>

            <div className="doc-activity-list">
              {clinicalActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="doc-activity-item">
                    <div className={`activity-icon-circle theme-${act.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title-row">
                        <strong>{act.title}</strong>
                        <span className="activity-time">{act.time}</span>
                      </div>
                      <p className="activity-desc">{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Physician Actions */}
          <Card className="dash-panel-card bg-surface-soft">
            <h3 className="quick-tools-title">Physician Clinical Tools</h3>
            <div className="quick-tools-grid">
              <button
                type="button"
                className="quick-tool-btn"
                onClick={() => navigate('/clinical-notes')}
              >
                <FileText size={20} className="text-teal" />
                <span>Author SOAP Note</span>
              </button>

              <button
                type="button"
                className="quick-tool-btn"
                onClick={() => navigate('/prescriptions')}
              >
                <Pill size={20} className="text-primary" />
                <span>Issue e-Prescription</span>
              </button>

              <button
                type="button"
                className="quick-tool-btn"
                onClick={() => navigate('/data-exchange')}
              >
                <ArrowLeftRight size={20} className="text-cyan" />
                <span>FHIR Gateway Transfer</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. PATIENT PERSONAL HEALTHCARE PORTAL
// ============================================================================
function PatientDashboard({ currentUser, navigate }) {
  const greeting = getGreetingTime();
  const patientName = currentUser
    ? `${currentUser.first_name || 'Member'} ${currentUser.last_name || ''}`
    : 'Rahul Mehta';

  return (
    <div className="patient-portal animate-fade-up">
      {/* Patient Welcome Banner */}
      <div className="dash-hero-banner pat-theme">
        <div className="dash-hero-bg-accent">
          <img src={patientRoleImg} alt="Patient Wellness" className="dash-hero-photo" />
          <div className="dash-hero-photo-fade" />
        </div>

        <div className="dash-hero-info">
          <div className="dash-badge-row">
            <span className="pat-hero-badge">Personal Healthcare Portal</span>
            <span className="pat-id-pill">MRN: PAT-8801 • Blood: O+</span>
          </div>
          <h1 className="dash-hero-title">
            {greeting}, <span className="text-primary">{patientName}</span>
          </h1>
          <p className="dash-hero-subtitle">
            Your healthcare, connected. Access your medical records, upcoming consultations, and prescriptions securely.
          </p>
        </div>

        <div className="dash-hero-actions">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/appointments')}
          >
            <Calendar size={15} /> Book Appointment
          </Button>
        </div>
      </div>

      {/* Patient Health Summary Strip */}
      <div className="dash-kpi-grid">
        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-blue-soft text-primary">
            <Calendar size={22} />
          </div>
          <div className="kpi-num">Oct 14, 2026</div>
          <div className="kpi-label">Upcoming Consultation</div>
          <div className="kpi-sub text-primary">10:30 AM with Dr. Robert Chen</div>
        </Card>

        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-teal-soft text-teal">
            <Pill size={22} />
          </div>
          <div className="kpi-num">1 Active Rx</div>
          <div className="kpi-label">Active Prescriptions</div>
          <div className="kpi-sub text-teal">Amlodipine Besylate 10mg</div>
        </Card>

        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-cyan-soft text-cyan">
            <FileText size={22} />
          </div>
          <div className="kpi-num">3 Records</div>
          <div className="kpi-label">Verified Medical Records</div>
          <div className="kpi-sub text-cyan">Latest EKG & Lab Panel</div>
        </Card>

        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-emerald-soft text-success">
            <Stethoscope size={22} />
          </div>
          <div className="kpi-num">Dr. Robert Chen</div>
          <div className="kpi-label">Primary Care Specialist</div>
          <div className="kpi-sub text-success">Chief of Cardiology</div>
        </Card>
      </div>

      {/* 2-Column Patient Portal Layout */}
      <div className="dash-two-column-grid">
        {/* Left Column: Upcoming Visit & Vitals History */}
        <div className="dash-left-stack">
          {/* Upcoming Appointment Card */}
          <Card className="dash-panel-card">
            <div className="panel-header">
              <div>
                <h3>My Upcoming Clinical Appointment</h3>
                <p>Confirmed consultation at Metro General Hospital</p>
              </div>
              <Badge variant="success" size="sm">
                Confirmed Visit
              </Badge>
            </div>

            <div className="pat-next-apt-box">
              <div className="pat-apt-date-badge">
                <span className="pat-apt-day">14</span>
                <span className="pat-apt-month">OCT</span>
              </div>
              <div className="pat-apt-details">
                <h4>Cardiovascular Follow-up Consultation</h4>
                <p>
                  <strong>Specialist:</strong> Dr. Robert Chen, MD, FACC (Cardiology)
                </p>
                <p>
                  <strong>Location:</strong> Clinical Suite 402 • 10:30 AM EST
                </p>
                <div className="pat-apt-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => alert('Attendance confirmed for Oct 14 consultation.')}
                  >
                    Confirm Attendance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/appointments')}
                  >
                    Reschedule
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Vitals Telemetry History */}
          <Card className="dash-panel-card">
            <div className="panel-header">
              <div>
                <h3>Latest Clinical Vitals</h3>
                <p>Recorded during latest clinical examination</p>
              </div>
              <span className="vitals-date-badge">Recorded Oct 02, 2026</span>
            </div>

            <div className="pat-vitals-grid">
              <div className="vital-metric-card">
                <span className="vital-metric-lbl">Blood Pressure</span>
                <span className="vital-metric-val text-primary">138 / 86</span>
                <span className="vital-metric-unit">mmHg (Optimal)</span>
              </div>
              <div className="vital-metric-card">
                <span className="vital-metric-lbl">Heart Rate</span>
                <span className="vital-metric-val text-success">72</span>
                <span className="vital-metric-unit">bpm (Normal Sinus)</span>
              </div>
              <div className="vital-metric-card">
                <span className="vital-metric-lbl">Oxygen Saturation</span>
                <span className="vital-metric-val text-teal">99%</span>
                <span className="vital-metric-unit">SpO2 (Room Air)</span>
              </div>
              <div className="vital-metric-card">
                <span className="vital-metric-lbl">Fasting Blood Glucose</span>
                <span className="vital-metric-val text-cyan">94</span>
                <span className="vital-metric-unit">mg/dL (Normal)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Active Medications & Care Team */}
        <div className="dash-right-stack">
          {/* Active Prescriptions */}
          <Card className="dash-panel-card">
            <div className="panel-header">
              <div>
                <h3>Active e-Prescriptions</h3>
                <p>Digital prescriptions authorized by your physician</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/prescriptions')}
              >
                View All →
              </Button>
            </div>

            <div className="pat-rx-item">
              <div className="pat-rx-top">
                <strong>Amlodipine Besylate Oral Tablet</strong>
                <Badge variant="success" size="sm">Active (30 Days)</Badge>
              </div>
              <p className="pat-rx-sig">Take 1 tablet (10mg) orally once daily in the morning after food.</p>
              <div className="pat-rx-pharmacy">
                <CheckCircle2 size={14} className="text-success" />
                <span>Ready for pickup at Metro General Outpatient Pharmacy</span>
              </div>
            </div>
          </Card>

          {/* Attending Care Team */}
          <Card className="dash-panel-card">
            <div className="panel-header">
              <div>
                <h3>My Attending Care Team</h3>
                <p>Specialists managing your health chart</p>
              </div>
            </div>

            <div className="pat-doctor-item">
              <div className="pat-doc-avatar">
                <Stethoscope size={20} className="text-primary" />
              </div>
              <div className="pat-doc-info">
                <h4>Dr. Robert Chen, MD</h4>
                <p>Chief of Cardiology • Clinical Suite 402</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/appointments')}
              >
                Book
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. ADMIN SMART HOSPITAL OPERATIONS
// ============================================================================
function AdminDashboard({ currentUser, navigate }) {
  const adminName = currentUser
    ? `${currentUser.first_name || 'Admin'} ${currentUser.last_name || ''}`
    : 'Hospital Administrator';


  return (
    <div className="admin-operations animate-fade-up">
      {/* Admin Operations Banner */}
      <div className="dash-hero-banner adm-theme">
        <div className="dash-hero-bg-accent">
          <img src={adminRoleImg} alt="Hospital Operations Center" className="dash-hero-photo" />
          <div className="dash-hero-photo-fade" />
        </div>

        <div className="dash-hero-info">
          <div className="dash-badge-row">
            <span className="adm-hero-badge">Smart Hospital Operations</span>
            <span className="live-status-pill">
              <span className="pulse-dot-green" /> Dual Database Online (MySQL + MongoDB)
            </span>
          </div>
          <h1 className="dash-hero-title">
            Hospital Operations — <span className="text-cyan">{adminName}</span>
          </h1>
          <p className="dash-hero-subtitle">
            Enterprise clinical telemetry, practitioner directories, database sync metrics, and FHIR interoperability gateways.
          </p>
        </div>

        <div className="dash-hero-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${API_BASE_URL}/database/health`, '_blank', 'noopener,noreferrer')}
          >
            <RefreshCw size={14} /> Verify Dual DB
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/analytics')}
          >
            <Activity size={14} /> System Analytics
          </Button>
        </div>
      </div>

      {/* Admin Enterprise Metrics */}
      <div className="dash-kpi-grid">
        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-blue-soft text-primary">
            <Users size={22} />
          </div>
          <div className="kpi-num">4 Registered</div>
          <div className="kpi-label">Total Patients</div>
          <div className="kpi-sub text-primary">MySQL Relational Core</div>
        </Card>

        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-teal-soft text-teal">
            <Stethoscope size={22} />
          </div>
          <div className="kpi-num">4 Doctors</div>
          <div className="kpi-label">Total Specialists</div>
          <div className="kpi-sub text-teal">Cardiology, Neuro, Peds</div>
        </Card>

        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-cyan-soft text-cyan">
            <Calendar size={22} />
          </div>
          <div className="kpi-num">5 Bookings</div>
          <div className="kpi-label">Appointments Managed</div>
          <div className="kpi-sub text-cyan">1 Completed • 4 Active</div>
        </Card>

        <Card className="dash-kpi-card" hoverable>
          <div className="kpi-icon-box bg-emerald-soft text-success">
            <ArrowLeftRight size={22} />
          </div>
          <div className="kpi-num">99.98%</div>
          <div className="kpi-label">FHIR R4 / HL7 Sync</div>
          <div className="kpi-sub text-success">0 Packet Dropouts</div>
        </Card>
      </div>

      {/* 2-Column Admin Grid */}
      <div className="dash-two-column-grid">
        {/* Left Column: Dual Database Telemetry */}
        <Card className="dash-panel-card">
          <div className="panel-header">
            <div>
              <h3>Dual-Database Persistence Engine Status</h3>
              <p>Real-time relational & document storage operational telemetry</p>
            </div>
            <Badge variant="success" size="sm" dot>
              All Engines Connected
            </Badge>
          </div>

          <div className="adm-db-status-grid">
            <div className="adm-db-card">
              <div className="adm-db-header">
                <Database size={20} className="text-primary" />
                <h4>MySQL 8.4 Community Server</h4>
                <Badge variant="primary" size="sm">InnoDB ACID</Badge>
              </div>
              <ul className="adm-db-specs">
                <li>• Managed Tables: users, roles, patients, doctors, appointments</li>
                <li>• Foreign Key Integrity: Enforced across all relational entities</li>
                <li>• Query Latency: 2.4 ms average response</li>
              </ul>
            </div>

            <div className="adm-db-card">
              <div className="adm-db-header">
                <Database size={20} className="text-teal" />
                <h4>MongoDB 6.0+ Cluster</h4>
                <Badge variant="teal" size="sm">Document Core</Badge>
              </div>
              <ul className="adm-db-specs">
                <li>• Collections: medical_records, clinical_notes, prescriptions, exchange</li>
                <li>• Schema Flexibility: Rich JSON & nested diagnostic arrays</li>
                <li>• Query Latency: 3.1 ms on indexed fields</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Right Column: Interoperability Gateway Stream */}
        <Card className="dash-panel-card">
          <div className="panel-header">
            <div>
              <h3>Recent Interoperability Transactions</h3>
              <p>Cross-network FHIR R4 and HL7 v2 payloads</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/data-exchange')}
            >
              Full Stream →
            </Button>
          </div>

          <div className="adm-tx-feed">
            <div className="adm-tx-item">
              <div className="adm-tx-badge">
                <ArrowLeftRight size={14} className="text-secondary" />
                <strong>TX-FHIR-77291</strong>
              </div>
              <div className="adm-tx-desc">
                <span>FHIR R4 DiagnosticReport (EKG Study)</span>
                <span className="adm-tx-status text-success">Completed & Sealed</span>
              </div>
            </div>

            <div className="adm-tx-item">
              <div className="adm-tx-badge">
                <ArrowLeftRight size={14} className="text-secondary" />
                <strong>TX-HL7-88402</strong>
              </div>
              <div className="adm-tx-desc">
                <span>HL7 v2.5.1 Admission / Discharge (ADT_A01)</span>
                <span className="adm-tx-status text-success">Validated</span>
              </div>
            </div>

            <div className="adm-tx-item">
              <div className="adm-tx-badge">
                <ArrowLeftRight size={14} className="text-secondary" />
                <strong>TX-CCDA-99103</strong>
              </div>
              <div className="adm-tx-desc">
                <span>C-CDA Continuity of Care Document</span>
                <span className="adm-tx-status text-teal">Encrypted In-Flight</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
