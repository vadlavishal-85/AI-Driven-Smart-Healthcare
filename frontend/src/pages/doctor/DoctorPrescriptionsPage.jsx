import React, { useState, useEffect } from 'react';
import { Pill, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { recordService } from '../../services/recordService';
import { patientService } from '../../services/patientService';

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
