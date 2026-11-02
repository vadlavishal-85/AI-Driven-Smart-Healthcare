import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Search, Activity, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { recordService } from '../../services/recordService';

const DEMO_MEDICAL_RECORDS = [
  {
    id: 'demo-rec-1',
    record_type: 'CONSULTATION',
    title: 'Comprehensive Cardiovascular Assessment',
    description: 'Routine quarterly cardiac assessment following stage-2 hypertension management and mild exertional fatigue.',
    diagnosis: 'Essential Hypertension (Stage 2) with Controlled Dyslipidemia',
    symptoms: ['Mild exertional dyspnea', 'Occasional morning headaches', 'Elevated resting BP (142/92 mmHg)'],
    treatment: 'Initiated Amlodipine 5mg daily; lifestyle sodium restriction and aerobic regimen prescribed.',
    doctor: 'Dr. Rahul Sharma (Cardiology)',
    created_at: '2026-10-10T10:00:00Z',
  },
  {
    id: 'demo-rec-2',
    record_type: 'LAB_RESULT',
    title: 'Comprehensive Metabolic Panel & Glycemic Review',
    description: 'Endocrine diagnostic follow-up evaluating fasting plasma glucose, HbA1c, and renal function markers.',
    diagnosis: 'Type 2 Diabetes Mellitus with Stable Glycemic Index',
    symptoms: ['Postprandial lethargy', 'Occasional polydipsia', 'Fasting BG 134 mg/dL'],
    treatment: 'Titrated Metformin HCl 500mg BID; dietary fiber increase recommended; recheck HbA1c in 90 days.',
    doctor: 'Dr. Priya Reddy (Internal Medicine)',
    created_at: '2026-10-08T11:30:00Z',
  },
  {
    id: 'demo-rec-3',
    record_type: 'DIAGNOSTIC_REPORT',
    title: 'Pulmonary Function Assessment & Spirometry',
    description: 'Clinical evaluation of seasonal bronchial hypersensitivity and post-infectious bronchial twitching.',
    diagnosis: 'Mild Persistent Asthma with Allergic Rhinitis Trigger',
    symptoms: ['Nocturnal dry cough', 'Mild expiratory wheeze', 'Peak expiratory flow rate at 82%'],
    treatment: 'Budesonide/Formoterol 160/4.5 mcg inhaler BID; oral Montelukast 10mg nocte for 30 days.',
    doctor: 'Dr. Arjun Kumar (Pulmonology)',
    created_at: '2026-10-05T09:15:00Z',
  },
];

const PatientRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const data = await recordService.getMyMedicalRecords();
        setRecords(Array.isArray(data) ? data : []);
      } catch {
        // error handled
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(r => {
    const matchTitle = (r.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchDiag = (r.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = (r.record_type || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchTitle || matchDiag || matchType;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            My Medical Records
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px', margin: 0 }}>
            Complete electronic medical history and diagnostic summaries in MongoDB
          </p>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search records, diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', margin: 0 }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving your medical records..." />
      ) : filteredRecords.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <FileText size={48} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '8px' }}>No Medical Records Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto' }}>
            {searchTerm ? 'No medical records match your search criteria.' : 'You do not have any clinical consultation records logged in your file yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredRecords.map((record) => {
            const isExpanded = expandedId === (record.id || record._id);
            return (
              <div
                key={record.id || record._id}
                className="card"
                style={{
                  padding: '20px 24px',
                  transition: 'all 0.2s ease',
                  border: isExpanded ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Stethoscope size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                          {record.title}
                        </h3>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          {record.record_type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                        {record.diagnosis && (
                          <span>
                            Primary Diagnosis: <strong style={{ color: 'var(--text-main)' }}>{record.diagnosis}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(record.id || record._id)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isExpanded ? (
                      <>Hide Details <ChevronUp size={16} /></>
                    ) : (
                      <>View Details <ChevronDown size={16} /></>
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                    {record.description && (
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Clinical Description
                        </div>
                        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, backgroundColor: 'var(--background)', padding: '12px', borderRadius: '8px' }}>
                          {record.description}
                        </p>
                      </div>
                    )}

                    {record.symptoms && record.symptoms.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Reported Symptoms
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {record.symptoms.map((s, idx) => (
                            <span key={idx} style={{
                              fontSize: '0.8rem',
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              fontWeight: 600
                            }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.treatment && (
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Prescribed Treatment & Recommendations
                        </div>
                        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                          {record.treatment}
                        </p>
                      </div>
                    )}

                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      Document ID: {record.id || record._id}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DEMONSTRATION MEDICAL RECORDS SECTION (UI PREVIEW ONLY) */}
      {records.length < 3 && (
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', margin: 0 }}>
                Demonstration Clinical Consultation Records
              </h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
              Clearly labeled frontend-only demonstration preview. Separated from clinical workflows and never submitted to database.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {DEMO_MEDICAL_RECORDS.map((demo) => (
              <div
                key={demo.id}
                className="card"
                style={{
                  padding: '20px 24px',
                  border: '1.5px dashed #f59e0b',
                  backgroundColor: '#ffffff',
                }}
              >
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#e0f2fe',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Stethoscope size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {demo.title}
                        </h4>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}>
                          {demo.record_type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          {new Date(demo.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          Attending Physician: <strong style={{ color: '#0f172a' }}>{demo.doctor}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 600, fontStyle: 'italic' }}>
                    Demonstration Only
                  </span>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                    {demo.description}
                  </p>

                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                      <strong style={{ color: '#334155' }}>Primary Diagnosis:</strong> <span style={{ color: '#0284c7', fontWeight: 600 }}>{demo.diagnosis}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '4px' }}>
                      <strong>Documented Symptoms:</strong> {demo.symptoms.join(', ')}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#059669' }}>
                      <strong>Prescribed Treatment:</strong> {demo.treatment}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientRecordsPage;
