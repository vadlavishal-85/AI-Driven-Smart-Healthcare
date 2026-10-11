import React, { useState, useEffect } from 'react';
import { HeartPulse, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { patientService } from '../../services/patientService';

const AdminPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchPatients();
  }, []);

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
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', maxWidth: '480px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
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
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
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
                            backgroundColor: '#ccfbf1',
                            color: '#0f766e',
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
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{pat.full_name}</strong>
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

export default AdminPatientsPage;
