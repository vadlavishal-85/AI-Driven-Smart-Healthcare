import React, { useState, useEffect } from 'react';
import { Pill, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { recordService } from '../../services/recordService';
import { patientService } from '../../services/patientService';

const DEMO_PRESCRIPTIONS = [
  {
    id: 'demo-rx-1',
    created_at: '2026-10-10T10:30:00Z',
    medical_record_id: 'DEMO-CARDIO-402',
    medicines: [
      {
        name: 'Amlodipine Besylate',
        dosage: '5 mg',
        frequency: 'Once daily (Morning)',
        duration: '30 days',
        instructions: 'Take with or without food. Monitor blood pressure weekly.',
      },
      {
        name: 'Atorvastatin Calcium',
        dosage: '20 mg',
        frequency: 'Once daily (Bedtime)',
        duration: '30 days',
        instructions: 'Take after dinner. Avoid grapefruit products.',
      },
    ],
    notes: 'Schedule BP re-check after 4 weeks of continuous medication adherence.',
  },
  {
    id: 'demo-rx-2',
    created_at: '2026-10-08T14:15:00Z',
    medical_record_id: 'DEMO-ENDO-108',
    medicines: [
      {
        name: 'Metformin Hydrochloride (Extended Release)',
        dosage: '500 mg',
        frequency: 'Twice daily',
        duration: '60 days',
        instructions: 'Take immediately with meals to minimize gastrointestinal discomfort.',
      },
      {
        name: 'Empagliflozin',
        dosage: '10 mg',
        frequency: 'Once daily (Morning)',
        duration: '30 days',
        instructions: 'Maintain adequate hydration throughout the day.',
      },
    ],
    notes: 'Maintain dietary carbohydrate restriction and self-monitor fasting blood sugars.',
  },
  {
    id: 'demo-rx-3',
    created_at: '2026-10-05T09:45:00Z',
    medical_record_id: 'DEMO-PULM-771',
    medicines: [
      {
        name: 'Budesonide / Formoterol Fumarate Inhaler',
        dosage: '160 mcg / 4.5 mcg',
        frequency: '2 puffs Twice daily',
        duration: '30 days',
        instructions: 'Rinse mouth with water thoroughly after each inhalation.',
      },
      {
        name: 'Montelukast Sodium',
        dosage: '10 mg',
        frequency: 'Once daily at night',
        duration: '30 days',
        instructions: 'Take with a glass of water before bedtime.',
      },
    ],
    notes: 'Carry quick-relief rescue inhaler during seasonal allergen peaks.',
  },
];

const DoctorPrescriptionsPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formPatientId, setFormPatientId] = useState('');
  const [medicalRecordId, setMedicalRecordId] = useState('');
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('500 mg');
  const [frequency, setFrequency] = useState('Twice daily');
  const [duration, setDuration] = useState('7 days');
  const [instructions, setInstructions] = useState('Take after food with water');
  const [notes, setNotes] = useState('Adhere strictly to prescribed dosage');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatientsForDoctor();
      const pats = Array.isArray(data) ? data : [];
      setPatients(pats);
      if (pats.length > 0) {
        setSelectedPatientId(pats[0].id);
        setFormPatientId(pats[0].id);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async (patId) => {
    if (!patId) return;
    try {
      const data = await recordService.getPatientPrescriptions(patId);
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch {
      setPrescriptions([]);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPrescriptions(selectedPatientId);
    }
  }, [selectedPatientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    setSubmitting(true);

    try {
      const created = await recordService.createPrescription({
        patient_id: formPatientId,
        medical_record_id: medicalRecordId.trim(),
        medicines: [
          {
            name: medName,
            dosage,
            frequency,
            duration,
            instructions,
          },
        ],
        notes,
      });

      setMsg({
        text: `Prescription created successfully in MongoDB (ID: ${created.id})!`,
        type: 'success',
      });
      setIsModalOpen(false);
      setMedName('');
      setMedicalRecordId('');
      if (formPatientId === selectedPatientId) {
        fetchPrescriptions(selectedPatientId);
      }
    } catch (err) {
      setMsg({
        text: err.response?.data?.detail || 'Failed to create prescription. Verify medical_record_id.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Clinical Prescriptions"
      subtitle="Prescribe authorized medications linked to patient medical records."
      actions={
        <button
          onClick={() => {
            setIsModalOpen(true);
            setMsg({ text: '', type: '' });
          }}
          className="btn btn-primary"
        >
          <PlusCircle size={16} />
          <span>Write Prescription</span>
        </button>
      }
    >
      {msg.text && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '24px',
            backgroundColor: msg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${msg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: msg.type === 'success' ? '#065f46' : '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
          }}
        >
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Patient Selector */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
          Select Patient to View Prescriptions:
        </span>
        <select
          className="form-select"
          style={{ maxWidth: '340px' }}
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name} ({p.email})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading prescriptions..." />
      ) : prescriptions.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
          <Pill size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
          <p style={{ fontSize: '15px' }}>No prescriptions found for this patient.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {prescriptions.map((rx) => (
            <div key={rx.id} className="card card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="badge badge-primary">Prescription</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {new Date(rx.created_at).toLocaleDateString()}
                </span>
              </div>

              {rx.medicines &&
                rx.medicines.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>{m.name}</strong>
                      <span className="badge badge-secondary">{m.dosage}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      Frequency: <strong>{m.frequency}</strong> • Duration: {m.duration}
                    </p>
                    <p style={{ fontSize: '12px', color: '#0284c7', marginTop: '2px' }}>
                      Instructions: {m.instructions}
                    </p>
                  </div>
                ))}

              {rx.notes && (
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '10px' }}>
                  Doctor's Instructions: <em>{rx.notes}</em>
                </p>
              )}

              <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Ref Record: <code>{rx.medical_record_id}</code>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DEMONSTRATION PRESCRIPTIONS SECTION (UI PREVIEW ONLY) */}
      {prescriptions.length < 3 && (
        <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '2px dashed #cbd5e1' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                UI Demonstration Preview
              </span>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#334155', margin: 0 }}>
                Demonstration Prescription Examples
              </h4>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
              Clearly labeled frontend-only demonstration preview. Separated from clinical workflows and never submitted to database.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {DEMO_PRESCRIPTIONS.map((rx) => (
              <div
                key={rx.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px dashed #f59e0b',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.05)',
                }}
              >
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#fffbeb',
                        color: '#b45309',
                        border: '1px solid #fde68a',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                      }}
                    >
                      ⚠️ DEMO — NOT A REAL PATIENT RECORD
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#0d9488',
                        backgroundColor: '#ccfbf1',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      <Pill size={14} />
                      <span>Prescription Regimen</span>
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(rx.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {rx.medicines?.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '10px',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{m.name}</strong>
                          <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#334155' }}>
                            {m.dosage}
                          </span>
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px', margin: '4px 0 0 0' }}>
                          Frequency: <strong>{m.frequency}</strong> • Duration: {m.duration}
                        </p>
                        <p style={{ fontSize: '12px', color: '#0284c7', marginTop: '2px', margin: '2px 0 0 0' }}>
                          Instructions: {m.instructions}
                        </p>
                      </div>
                    ))}
                  </div>

                  {rx.notes && (
                    <p style={{ fontSize: '12.5px', color: '#475569', marginTop: '10px', margin: '10px 0 0 0' }}>
                      Clinical Advisory: <em>{rx.notes}</em>
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Ref Record: <code>{rx.medical_record_id}</code>
                  </span>
                  <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 600, fontStyle: 'italic' }}>
                    Demonstration Only
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Prescription Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                Write Clinical Prescription
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ fontSize: '20px', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Patient</label>
                <select
                  className="form-select"
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Parent Medical Record ID (MongoDB ObjectId)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 6ac644de632a2bd252207ea6"
                  value={medicalRecordId}
                  onChange={(e) => setMedicalRecordId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medicine Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Amoxicillin / Amlodipine"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Dosage</label>
                  <input
                    type="text"
                    className="form-input"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <input
                    type="text"
                    className="form-input"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Instructions</label>
                  <input
                    type="text"
                    className="form-input"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Prescription Notes</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Submitting...' : 'Save Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorPrescriptionsPage;
