import React, { useState, useEffect } from 'react';
import { Stethoscope, Search, Mail, Phone, Building } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { doctorService } from '../../services/doctorService';

const AdminDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchDoctors();
  }, []);

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
      {/* Search Bar */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', maxWidth: '480px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
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
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
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
                            backgroundColor: '#e0f2fe',
                            color: '#0284c7',
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
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{doc.full_name}</strong>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDoctorsPage;
