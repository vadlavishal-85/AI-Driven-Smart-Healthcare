import React, { useState, useEffect } from 'react';
import { Stethoscope, Search, Mail, Phone, Building, UserX, AlertCircle, CheckCircle2, ShieldAlert, UserPlus, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { doctorService } from '../../services/doctorService';

const AdminDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ text: '', type: '' });

  // Confirmation modal state
  const [selectedDoctorForDelete, setSelectedDoctorForDelete] = useState(null);
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
    specialization: 'Cardiology',
    license_number: '',
    hospital_name: '',
  });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getAllDoctors();
      setDoctors(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load doctors directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedDoctorForDelete) return;
    try {
      setDeleting(true);
      setNotification({ text: '', type: '' });
      const res = await doctorService.deleteDoctor(selectedDoctorForDelete.id);
      setNotification({
        text: res.message || `Doctor ${selectedDoctorForDelete.full_name} deactivated safely without corrupting clinical data.`,
        type: 'success',
      });
      setSelectedDoctorForDelete(null);
      await fetchDoctors();
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to deactivate doctor account.';
      setNotification({ text: errMsg, type: 'error' });
      setSelectedDoctorForDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleRegisterDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.specialization.trim() || !formData.license_number.trim()) {
      setFormError('Please fill in all required fields (Name, Email, Password, Specialization, License Number).');
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
        specialization: formData.specialization.trim(),
        license_number: formData.license_number.trim(),
        hospital_name: formData.hospital_name.trim() || null,
      };

      const created = await doctorService.createDoctor(payload);
      setNotification({
        text: `Dr. ${created.full_name} registered successfully in PostgreSQL!`,
        type: 'success',
      });
      setIsRegisterModalOpen(false);
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        specialization: 'Cardiology',
        license_number: '',
        hospital_name: '',
      });
      await fetchDoctors();
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to register physician account. Please check inputs.';
      setFormError(errMsg);
    } finally {
      setRegistering(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const term = searchTerm.toLowerCase();
    return (
      (doc.full_name && doc.full_name.toLowerCase().includes(term)) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(term)) ||
      (doc.hospital_name && doc.hospital_name.toLowerCase().includes(term)) ||
      (doc.email && doc.email.toLowerCase().includes(term))
    );
  });

  return (
    <DashboardLayout
      title="Doctor Directory"
      subtitle="Complete registry of credentialed physicians and specialists in PostgreSQL."
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

      {/* Action and Search Bar */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by doctor name, specialization, or hospital..."
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
          <span>Register New Doctor</span>
        </button>
      </div>


      {loading ? (
        <LoadingSpinner message="Loading doctors..." />
      ) : error ? (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '12px' }}>{error}</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Physician Name</th>
                <th>Specialization</th>
                <th>Hospital / Clinic</th>
                <th>License Number</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No doctors match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: doc.is_active ? '#e0f2fe' : '#f1f5f9',
                            color: doc.is_active ? '#0284c7' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                          }}
                        >
                          Dr
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: doc.is_active ? '#0f172a' : '#64748b' }}>
                            {doc.full_name}
                          </strong>
                          <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>{doc.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{doc.specialization || 'General'}</span>
                    </td>
                    <td>{doc.hospital_name || '--'}</td>
                    <td><code>{doc.license_number || '--'}</code></td>
                    <td>{doc.phone || '--'}</td>
                    <td>
                      <StatusBadge status={doc.is_active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td>
                      {doc.is_active ? (
                        <button
                          type="button"
                          onClick={() => setSelectedDoctorForDelete(doc)}
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
      {selectedDoctorForDelete && (
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
                  Confirm Physician Deactivation
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
                Target Physician: <strong style={{ color: '#0f172a' }}>{selectedDoctorForDelete.full_name}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                Department: <strong>{selectedDoctorForDelete.specialization}</strong> • License: <code>{selectedDoctorForDelete.license_number}</code>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                Email: <code>{selectedDoctorForDelete.email}</code>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Doctor ID: <code>{selectedDoctorForDelete.id}</code>
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
              <strong>Clinical Integrity Protection:</strong> Deactivating this physician account revokes their login rights immediately.
              All patient appointments, consultations, prescriptions, and data-sharing permissions remain completely preserved in the database.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setSelectedDoctorForDelete(null)}
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
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Register New Doctor</h3>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>Provision physician account and clinical credential profile in PostgreSQL</span>
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

            <form onSubmit={handleRegisterDoctorSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Priya Nair"
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
                    placeholder="doctor@example.com"
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
                    Contact Phone
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Specialization *
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="form-input"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                    <option value="Radiology">Radiology</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Medical License Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MCI-2026-98765"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Hospital / Department Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Multi-Speciality Hospital"
                  value={formData.hospital_name}
                  onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
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
                  <span>{registering ? 'Registering Physician...' : 'Register Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDoctorsPage;
