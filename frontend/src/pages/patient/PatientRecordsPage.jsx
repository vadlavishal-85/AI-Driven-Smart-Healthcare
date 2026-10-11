import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Search, Activity, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { recordService } from '../../services/recordService';

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
    </DashboardLayout>
  );
};

export default PatientRecordsPage;
