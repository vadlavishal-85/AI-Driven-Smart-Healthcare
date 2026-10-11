import React, { useState, useEffect } from 'react';
import { Share2, PlusCircle, ShieldAlert, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { dataSharingService } from '../../services/dataSharingService';
import { patientService } from '../../services/patientService';
import { recordService } from '../../services/recordService';

const DoctorDataSharingPage = () => {
  const [shares, setShares] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [recordId, setRecordId] = useState('');
  const [recordType, setRecordType] = useState('medical_record');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sharesData, patientsData] = await Promise.all([
        dataSharingService.getDoctorShares(),
        patientService.getPatientsForDoctor(),
      ]);
      setShares(Array.isArray(sharesData) ? sharesData : []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      if (patientsData && patientsData.length > 0) {
        setSelectedPatientId(patientsData[0].id);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      await dataSharingService.shareRecord({
        patient_id: selectedPatientId,
        record_id: recordId.trim(),
        record_type: recordType,
      });
      setSuccessMsg('Healthcare record successfully shared with patient! Permission verified in PostgreSQL.');
      setIsModalOpen(false);
      setRecordId('');
      fetchData();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setFormError(err.response.data.detail);
      } else {
        setFormError('Failed to share record. Please verify that the record exists and belongs to you.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (sharingId) => {
    if (!window.confirm('Are you sure you want to revoke patient access to this healthcare document?')) return;

    try {
      await dataSharingService.revokeShare(sharingId);
      setSuccessMsg('Sharing permission successfully revoked. Document access has been terminated.');
      fetchData();
    } catch (err) {
      alert('Failed to revoke sharing permission.');
    }
  };

  return (
    <DashboardLayout
      title="Secure Healthcare Data Exchange"
      subtitle="Permission-based sharing: clinical documents remain in MongoDB while access rights are verified in PostgreSQL."
      actions={
        <button
          onClick={() => {
            setIsModalOpen(true);
            setFormError('');
          }}
          className="btn btn-primary"
        >
          <PlusCircle size={17} />
          <span>Authorize & Share Document</span>
        </button>
      }
    >
      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading shared permissions from PostgreSQL..." />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sharing Permission ID</th>
                <th>Patient Name</th>
                <th>Target MongoDB Document ID</th>
                <th>Record Classification</th>
                <th>Shared Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shares.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                    No documents have been shared yet. Click "Authorize & Share Document" to grant a patient access.
                  </td>
                </tr>
              ) : (
                shares.map((share) => {
                  const pat = patients.find((p) => p.id === share.patient_id);
                  return (
                    <tr key={share.id}>
                      <td>
                        <code style={{ fontSize: '12px', color: '#475569' }}>
                          {String(share.id).slice(0, 8)}...
                        </code>
                      </td>
                      <td>
                        <strong>{pat ? pat.full_name : 'Registered Patient'}</strong>
                      </td>
                      <td>
                        <code style={{ fontSize: '12.5px', color: '#0284c7', fontWeight: 600 }}>
                          {share.record_id}
                        </code>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {share.record_type || 'medical_record'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: '#475569' }}>
                          {new Date(share.shared_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={share.status} />
                      </td>
                      <td>
                        {share.status === 'APPROVED' ? (
                          <button
                            onClick={() => handleRevoke(share.id)}
                            className="btn btn-secondary"
                            style={{
                              padding: '5px 12px',
                              fontSize: '12px',
                              borderRadius: '6px',
                              color: '#ef4444',
                              borderColor: '#fecaca',
                            }}
                          >
                            <XCircle size={14} />
                            <span>Revoke Access</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Access Terminated</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Share Document Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                  Authorize Healthcare Document Sharing
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  The patient will receive a notification and verified permission to view this record.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  fontSize: '13px',
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleShareSubmit}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select
                  className="form-select"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                >
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.full_name} ({pat.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Document Classification Type</label>
                <select
                  className="form-select"
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  required
                >
                  <option value="medical_record">Medical Consultation Record</option>
                  <option value="prescription">Prescription</option>
                  <option value="doctor_note">Clinical Doctor Note</option>
                  <option value="lab_report">Diagnostic Lab Report</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">MongoDB Document ObjectId (24 hex characters)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 6ac644de632a2bd252207ea6"
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  required
                />
                <span style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                  Must be a record authored or ordered by you in MongoDB for the selected patient.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Verifying Permission...' : 'Grant & Share Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorDataSharingPage;
