import React, { useState, useEffect } from 'react';
import { FlaskConical, Calendar, AlertCircle, FileCheck, Info } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { recordService } from '../../services/recordService';

const PatientLabReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await recordService.getMyLabReports();
        setReports(Array.isArray(data) ? data : []);
      } catch {
        // error handled
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          Diagnostic Laboratory Reports
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px', margin: 0 }}>
          Clinical laboratory test results, biochemistry metrics, and pathologist findings in MongoDB
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving laboratory test panels..." />
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <FlaskConical size={48} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '8px' }}>No Lab Reports Available</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto' }}>
            There are currently no diagnostic laboratory test reports filed for your profile.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reports.map((report) => (
            <div key={report.id || report._id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FlaskConical size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {report.test_name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <Calendar size={13} />
                      Test Date: {new Date(report.test_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  LAB-ID: {(report.id || report._id).slice(-8).toUpperCase()}
                </div>
              </div>

              {/* Results table or formatted key/values */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Laboratory Findings & Diagnostics
                </div>
                {typeof report.results === 'object' && report.results !== null ? (
                  <div className="table-responsive">
                    <table className="table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Parameter / Biomarker</th>
                          <th>Recorded Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(report.results).map(([key, val], idx) => (
                          <tr key={idx}>
                            <td>
                              <strong style={{ color: 'var(--text-main)' }}>{key}</strong>
                            </td>
                            <td>
                              <span style={{
                                padding: '3px 10px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--background)',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                color: 'var(--primary-color)'
                              }}>
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '12px', backgroundColor: 'var(--background)', borderRadius: '8px', fontSize: '0.9rem' }}>
                    {String(report.results)}
                  </div>
                )}
              </div>

              {/* Remarks */}
              {report.remarks && (
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
                      Pathologist / Lab Remarks:
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {report.remarks}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientLabReportsPage;
