import React, { useState, useEffect } from 'react';
import { Share2, Lock, Unlock, Eye, Calendar, User, FileText, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { dataSharingService } from '../../services/dataSharingService';

const PatientSharedRecordsPage = () => {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [fetchingRecord, setFetchingRecord] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchShares = async () => {
    try {
      setLoading(true);
      const data = await dataSharingService.getMySharedRecords();
      setShares(Array.isArray(data) ? data : []);
    } catch {
      // error handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  const handleAccessRecord = async (shareId) => {
    try {
      setFetchingRecord(true);
      setMsg({ text: '', type: '' });
      const recordData = await dataSharingService.getSharedRecordById(shareId);
      setSelectedRecord(recordData);
    } catch (err) {
      const errorDetail = err.response?.data?.detail || 'Unable to access shared healthcare document. Access may have been revoked.';
      setMsg({ text: errorDetail, type: 'error' });
    } finally {
      setFetchingRecord(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          Shared Healthcare Records
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px', margin: 0 }}>
          Secure, cryptographic doctor-to-patient data exchange records authorized by your physicians
        </p>
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

      {/* Security Assurance Badge */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        <ShieldCheck size={28} color="#15803d" />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#166534' }}>
            Zero-Trust Authorized Data Exchange Protocol
          </div>
          <div style={{ fontSize: '0.84rem', color: '#15803d', marginTop: '2px' }}>
            Every document access is validated against PostgreSQL authorization grants before streaming from MongoDB.
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Querying authorized document access grants..." />
      ) : shares.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Share2 size={48} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '8px' }}>No Shared Documents Available</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto' }}>
            Your physicians have not shared any medical consultation records with your portal at this time.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Authorizing Doctor</th>
                  <th>Document Reference</th>
                  <th>Access Granted</th>
                  <th>Expires On</th>
                  <th>Permission Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shares.map((share) => {
                  const isRevoked = share.status === 'REVOKED';
                  return (
                    <tr key={share.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} color="var(--primary-color)" />
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            Dr. {share.doctor_name || 'Physician'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={15} color="var(--text-muted)" />
                          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {share.medical_record_id ? share.medical_record_id.slice(-8).toUpperCase() : 'DOC-REF'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(share.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: share.expires_at ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {share.expires_at ? new Date(share.expires_at).toLocaleDateString() : 'Permanent'}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={share.status} />
                      </td>
                      <td>
                        <button
                          onClick={() => handleAccessRecord(share.id)}
                          disabled={isRevoked || fetchingRecord}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: isRevoked ? '1px solid var(--border-color)' : '1px solid var(--primary-color)',
                            backgroundColor: isRevoked ? 'var(--background)' : '#ffffff',
                            color: isRevoked ? 'var(--text-muted)' : 'var(--primary-color)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: isRevoked ? 'not-allowed' : 'pointer',
                            opacity: isRevoked ? 0.6 : 1
                          }}
                        >
                          {isRevoked ? <Lock size={14} /> : <Eye size={14} />}
                          {isRevoked ? 'Access Revoked' : 'Access Document'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {selectedRecord && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AUTHORIZED SECURE DOCUMENT STREAM
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', margin: 0 }}>
                  {selectedRecord.medical_record?.title || 'Shared Medical Consultation'}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', backgroundColor: 'var(--background)', padding: '12px 16px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Type</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {selectedRecord.medical_record?.record_type || 'CONSULTATION'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Date</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {selectedRecord.medical_record?.created_at ? new Date(selectedRecord.medical_record.created_at).toLocaleDateString() : 'N/A'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Authorization Status</span>
                  <StatusBadge status={selectedRecord.status} />
                </div>
              </div>

              {selectedRecord.medical_record?.diagnosis && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Clinical Diagnosis
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    {selectedRecord.medical_record.diagnosis}
                  </div>
                </div>
              )}

              {selectedRecord.medical_record?.description && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Consultation Summary
                  </div>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {selectedRecord.medical_record.description}
                  </p>
                </div>
              )}

              {selectedRecord.medical_record?.symptoms && selectedRecord.medical_record.symptoms.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Documented Symptoms
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedRecord.medical_record.symptoms.map((s, idx) => (
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

              {selectedRecord.medical_record?.treatment && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Physician Prescribed Regimen
                  </div>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    {selectedRecord.medical_record.treatment}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button
                onClick={() => setSelectedRecord(null)}
                className="btn-primary"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientSharedRecordsPage;
