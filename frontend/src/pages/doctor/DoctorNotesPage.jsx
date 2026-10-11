import React, { useState, useEffect } from 'react';
import { StickyNote, PlusCircle, User, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { recordService } from '../../services/recordService';
import { patientService } from '../../services/patientService';

const DoctorNotesPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formPatientId, setFormPatientId] = useState('');
  const [noteText, setNoteText] = useState('');
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
      // error handled
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (patId) => {
    if (!patId) return;
    try {
      const data = await recordService.getPatientDoctorNotes(patId);
      setNotes(Array.isArray(data) ? data : []);
    } catch {
      setNotes([]);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchNotes(selectedPatientId);
    }
  }, [selectedPatientId]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setSubmitting(true);
      setMsg({ text: '', type: '' });
      await recordService.createDoctorNote({
        patient_id: formPatientId,
        note: noteText.trim(),
      });

      setMsg({ text: 'Clinical progress note saved to secure record.', type: 'success' });
      setNoteText('');
      setIsModalOpen(false);
      if (selectedPatientId === formPatientId) {
        fetchNotes(formPatientId);
      } else {
        setSelectedPatientId(formPatientId);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to save clinical note.';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Clinical Progress Notes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px', margin: 0 }}>
            Confidential physician observations and progress annotations in MongoDB
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <PlusCircle size={18} />
          New Clinical Note
        </button>
      </div>

      {msg.text && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          backgroundColor: msg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
          color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Patient Filter */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 600 }}>
          <User size={20} />
          <span>Select Patient:</span>
        </div>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="input-field"
          style={{ maxWidth: '360px' }}
          disabled={loading || patients.length === 0}
        >
          {patients.length === 0 ? (
            <option value="">No patients available</option>
          ) : (
            patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.full_name} ({p.email})
              </option>
            ))
          )}
        </select>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {notes.length} note{notes.length === 1 ? '' : 's'} recorded
        </span>
      </div>

      {/* Notes List */}
      {loading ? (
        <LoadingSpinner message="Loading patient notes..." />
      ) : notes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <StickyNote size={48} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '8px' }}>No Notes Recorded</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 18px' }}>
            There are no clinical progress notes logged for this patient yet. Add a new observation using the button above.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {notes.map(note => (
            <div key={note.id || note._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.92rem' }}>
                  <StickyNote size={18} />
                  <span>Clinical Observation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <Calendar size={14} />
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ flex: 1, whiteSpace: 'pre-wrap', color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: '1.6', background: 'var(--background)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {note.note}
              </div>

              {note.medical_record_id && (
                <div style={{ marginTop: '12px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Ref Record: <span style={{ fontFamily: 'monospace' }}>{note.medical_record_id}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal New Note */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              Create Clinical Note
            </h2>

            <form onSubmit={handleCreateNote}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Patient
                </label>
                <select
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  className="input-field"
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Physician Observation Note
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="input-field"
                  placeholder="Enter detailed clinical findings, patient responses, or care remarks..."
                  rows={6}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || !noteText.trim()}
                >
                  {submitting ? 'Saving Note...' : 'Save Clinical Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorNotesPage;
