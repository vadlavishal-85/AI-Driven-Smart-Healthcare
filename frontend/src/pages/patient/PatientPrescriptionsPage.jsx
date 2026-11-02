import React, { useState, useEffect } from 'react';
import { Pill, Calendar, AlertCircle, Info, Stethoscope } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { recordService } from '../../services/recordService';

const DEMO_PRESCRIPTIONS = [
  {
    id: 'demo-rx-1',
    created_at: '2026-10-10T10:30:00Z',
    doctor_name: 'Dr. Rahul Sharma (Cardiology)',
    instructions: 'Take antihypertensive in morning. Maintain regular salt-restricted hydration.',
    medications: [
      { name: 'Amlodipine Besylate', dosage: '5 mg', frequency: 'Once daily (Morning)', duration: '30 days', instructions: 'Take with or without food' },
      { name: 'Atorvastatin Calcium', dosage: '20 mg', frequency: 'Once daily (Bedtime)', duration: '30 days', instructions: 'Take after dinner' },
    ],
  },
  {
    id: 'demo-rx-2',
    created_at: '2026-10-08T14:15:00Z',
    doctor_name: 'Dr. Priya Reddy (Internal Medicine)',
    instructions: 'Take medications with meals. Self-monitor fasting plasma glucose weekly.',
    medications: [
      { name: 'Metformin HCl (XR)', dosage: '500 mg', frequency: 'Twice daily', duration: '60 days', instructions: 'Take with breakfast and dinner' },
      { name: 'Empagliflozin', dosage: '10 mg', frequency: 'Once daily (Morning)', duration: '30 days', instructions: 'Maintain adequate daytime fluids' },
    ],
  },
  {
    id: 'demo-rx-3',
    created_at: '2026-10-05T09:45:00Z',
    doctor_name: 'Dr. Arjun Kumar (Pulmonology)',
    instructions: 'Rinse mouth after steroid inhaler use. Avoid cold air triggers.',
    medications: [
      { name: 'Budesonide / Formoterol Inhaler', dosage: '160/4.5 mcg', frequency: '2 puffs Twice daily', duration: '30 days', instructions: 'Rinse mouth with water after use' },
      { name: 'Montelukast Sodium', dosage: '10 mg', frequency: 'Once daily at night', duration: '30 days', instructions: 'Take before sleep' },
    ],
  },
];

const PatientPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const data = await recordService.getMyPrescriptions();
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch {
        // error handled
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          My Prescriptions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px', margin: 0 }}>
          Active therapies, dosages, schedules, and clinical doctor instructions
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving your medical prescriptions..." />
      ) : prescriptions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Pill size={48} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '8px' }}>No Prescriptions Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto' }}>
            There are currently no active medication regimens or prescriptions in your profile.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {prescriptions.map((rx) => (
            <div key={rx.id || rx._id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#ede9fe',
                    color: '#6d28d9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Pill size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Prescription Regimen
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <Calendar size={13} />
                      Issued on {new Date(rx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  RX-ID: {(rx.id || rx._id).slice(-8).toUpperCase()}
                </div>
              </div>

              {/* Medications Table */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Prescribed Medications ({rx.medications?.length || 0})
                </div>
                <div className="table-responsive">
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Medication Name</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rx.medications?.map((m, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong style={{ color: 'var(--primary-color)' }}>{m.name}</strong>
                          </td>
                          <td>{m.dosage}</td>
                          <td>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--background)',
                              fontSize: '0.82rem',
                              fontWeight: 600
                            }}>
                              {m.frequency}
                            </span>
                          </td>
                          <td>{m.duration}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {m.instructions || 'As directed'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* General Instructions */}
              {rx.instructions && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <Info size={16} color="var(--primary-color)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                      Doctor's Advisory Notes:
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {rx.instructions}
                    </div>
                  </div>
                </div>
              )}
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', margin: 0 }}>
                Demonstration Prescription Regimens
              </h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
              Clearly labeled frontend-only demonstration preview. Separated from clinical workflows and never submitted to database.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {DEMO_PRESCRIPTIONS.map((rx) => (
              <div
                key={rx.id}
                className="card"
                style={{
                  padding: '24px',
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Pill size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {rx.doctor_name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <Calendar size={13} />
                        Issued on {new Date(rx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 600, fontStyle: 'italic' }}>
                    Demonstration Only
                  </span>
                </div>

                {/* Medications Table */}
                <div style={{ marginBottom: '14px' }}>
                  <div className="table-responsive">
                    <table className="table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Medication Name</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rx.medications.map((m, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong style={{ color: 'var(--primary-color)' }}>{m.name}</strong>
                            </td>
                            <td>{m.dosage}</td>
                            <td>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#f1f5f9',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                              }}>
                                {m.frequency}
                              </span>
                            </td>
                            <td>{m.duration}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              {m.instructions}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {rx.instructions && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.85rem',
                    color: '#475569',
                  }}>
                    <strong>Clinical Note:</strong> {rx.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientPrescriptionsPage;
