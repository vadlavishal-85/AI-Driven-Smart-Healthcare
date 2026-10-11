import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, Heart, Shield } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { patientService } from '../../services/patientService';

const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await patientService.getPatientsForDoctor();
        setPatients(Array.isArray(data) ? data : []);
      } catch {
        // error handled
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filtered = patients.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      (p.full_name || '').toLowerCase().includes(term) ||
      (p.email || '').toLowerCase().includes(term) ||
      (p.blood_group || '').toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            My Patient Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px', margin: 0 }}>
            Registered patients authorized for clinical care and healthcare workflows
          </p>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, email, blood..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', margin: 0 }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading patient directory..." />
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Users size={48} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '8px' }}>No Patients Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            {searchTerm ? 'No patients matching your search criteria.' : 'No registered patients available.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map(patient => (
            <div key={patient.id} className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}>
                  {patient.full_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {patient.full_name}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Patient ID: {patient.id.slice(0, 8)}...
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: 'var(--text-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <Mail size={15} />
                  <span>{patient.email}</span>
                </div>

                {patient.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Phone size={15} />
                    <span>{patient.phone}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  {patient.blood_group && (
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Heart size={12} /> Blood: {patient.blood_group}
                    </span>
                  )}
                  {patient.gender && (
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--background)',
                      color: 'var(--text-muted)',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {patient.gender}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorPatientsPage;
