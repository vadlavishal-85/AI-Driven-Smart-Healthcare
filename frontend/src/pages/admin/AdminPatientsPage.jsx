import React, { useState, useEffect } from 'react';
import { HeartPulse, Search, Trash2, UserX, AlertCircle, CheckCircle2, ShieldAlert, UserPlus, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { patientService } from '../../services/patientService';

const AdminPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ text: '', type: '' });

  // Confirmation modal state
  const [selectedPatientForDelete, setSelectedPatientForDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Registration modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: 'O+',
    address: '',
    emergency_contact: '',
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAllPatients();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load patients directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedPatientForDelete) return;
    try {
      setDeleting(true);
      setNotification({ text: '', type: '' });
      const res = await patientService.deletePatient(selectedPatientForDelete.id);
      setNotification({
        text: res.message || `Patient ${selectedPatientForDelete.full_name} deactivated safely without corrupting clinical history.`,
        type: 'success',
      });
      setSelectedPatientForDelete(null);
      await fetchPatients();
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to deactivate patient account.';
      setNotification({ text: errMsg, type: 'error' });
      setSelectedPatientForDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleRegisterPatientSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError('Please fill in all required fields (Name, Email, Password).');
      return;
    }
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setRegistering(true);
      setFormError('');
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        blood_group: formData.blood_group || null,
        address: formData.address.trim() || null,
        emergency_contact: formData.emergency_contact.trim() || null,
      };

      const created = await patientService.createPatient(payload);
      setNotification({
        text: `Patient ${created.full_name} registered successfully in PostgreSQL!`,
        type: 'success',
      });
      setIsRegisterModalOpen(false);
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        date_of_birth: '',
        gender: 'Male',
        blood_group: 'O+',
        address: '',
        emergency_contact: '',
      });
      await fetchPatients();
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to register patient account. Please check inputs.';
      setFormError(errMsg);
    } finally {
      setRegistering(false);
    }
  };

  const filteredPatients = patients.filter((pat) => {
    const term = searchTerm.toLowerCase();
    return (
      (pat.full_name && pat.full_name.toLowerCase().includes(term)) ||
      (pat.email && pat.email.toLowerCase().includes(term)) ||
      (pat.blood_group && pat.blood_group.toLowerCase().includes(term)) ||
      (pat.phone && pat.phone.toLowerCase().includes(term))
    );
  });

  return (
    <DashboardLayout
      title="Patient Directory"
      subtitle="Complete list of registered healthcare patients stored in PostgreSQL."
    >
      {notification.text && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            backgroundColor: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1.5px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: notification.type === 'success' ? '#065f46' : '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.text}</span>
        </div>
      )}

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by patient name, email, or blood group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { setIsRegisterModalOpen(true); setFormError(''); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
        >
          <UserPlus size={18} />
          <span>Register New Patient</span>
        </button>
      </div>


      {loading ? (
        <LoadingSpinner message="Loading patients..." />
      ) : error ? (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '12px' }}>{error}</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Date of Birth</th>
                <th>Contact</th>
                <th>Emergency Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No patients match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => (
                  <tr key={pat.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: pat.is_active ? '#ccfbf1' : '#f1f5f9',
                            color: pat.is_active ? '#0f766e' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                          }}
                        >
                          {pat.full_name ? pat.full_name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: pat.is_active ? '#0f172a' : '#64748b' }}>
                            {pat.full_name}
                          </strong>
                          <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>{pat.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{pat.gender || '--'}</td>
                    <td>
                      {pat.blood_group ? (
                        <span className="badge badge-primary">{pat.blood_group}</span>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td>{pat.date_of_birth || '--'}</td>
                    <td>{pat.phone || '--'}</td>
                    <td>{pat.emergency_contact || '--'}</td>
                    <td>
                      <StatusBadge status={pat.is_active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td>
                      {pat.is_active ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPatientForDelete(pat)}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#b91c1c',
                            borderColor: '#fecaca',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <UserX size={14} />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Deactivated
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {selectedPatientForDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Confirm Account Deactivation
                </h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Admin Authorization Required
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '13.5px', marginBottom: '6px' }}>
                Target Patient: <strong style={{ color: '#0f172a' }}>{selectedPatientForDelete.full_name}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                Email: <code>{selectedPatientForDelete.email}</code>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Patient ID: <code>{selectedPatientForDelete.id}</code>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: '#92400e',
                lineHeight: 1.5,
                marginBottom: '20px',
              }}
            >
              <strong>Data Protection Guarantee:</strong> Deactivating this account revokes authentication access immediately.
              All existing clinical appointments, medical records, and audit history remain safely preserved in the database.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setSelectedPatientForDelete(null)}
                disabled={deleting}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="btn btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              >
                {deleting ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Dialog Modal */}
      {isRegisterModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Register New Patient</h3>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>Provision authentication and clinical profile in PostgreSQL</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterPatientSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="patient@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Temporary Password * (min 8 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="form-input"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Blood Group
                  </label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="form-input"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="Street, City, State, PIN"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Emergency Contact
                </label>
                <input
                  type="text"
                  placeholder="Contact Name & Relationship (+91 ...)"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  disabled={registering}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <UserPlus size={16} />
                  <span>{registering ? 'Creating Account...' : 'Register Patient'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminPatientsPage;
