import React, { useState } from 'react';
import { FlaskConical, PlusCircle, Search, CheckCircle2, AlertCircle, FileCheck, Layers } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { recordService } from '../../services/recordService';

const LabReportsPage = () => {
  // Creator form state
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [testName, setTestName] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [resultPairs, setResultPairs] = useState([
    { key: 'Hemoglobin', value: '14.2 g/dL' },
    { key: 'WBC Count', value: '6,800 /uL' },
    { key: 'Platelet Count', value: '250,000 /uL' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [createMsg, setCreateMsg] = useState({ text: '', type: '' });

  // Lookup state
  const [searchReportId, setSearchReportId] = useState('');
  const [lookedUpReport, setLookedUpReport] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupMsg, setLookupMsg] = useState({ text: '', type: '' });

  const addResultRow = () => {
    setResultPairs([...resultPairs, { key: '', value: '' }]);
  };

  const removeResultRow = (index) => {
    setResultPairs(resultPairs.filter((_, idx) => idx !== index));
  };

  const updateResultPair = (index, field, val) => {
    const updated = [...resultPairs];
    updated[index][field] = val;
    setResultPairs(updated);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!patientId.trim() || !doctorId.trim() || !testName.trim()) return;

    // Convert result pairs into dictionary
    const resultsObj = {};
    resultPairs.forEach(pair => {
      if (pair.key.trim()) {
        resultsObj[pair.key.trim()] = pair.value.trim();
      }
    });

    try {
      setSubmitting(true);
      setCreateMsg({ text: '', type: '' });
      const created = await recordService.createLabReport({
        patient_id: patientId.trim(),
        doctor_id: doctorId.trim(),
        test_name: testName.trim(),
        test_date: new Date(testDate).toISOString(),
        results: resultsObj,
        remarks: remarks.trim() || null,
      });

      setCreateMsg({
        text: `Lab report filed successfully in MongoDB! Document ID: ${created.id || created._id}`,
        type: 'success'
      });
      // Reset form
      setTestName('');
      setRemarks('');
    } catch (err) {
      const errDetail = err.response?.data?.detail || 'Failed to file lab report. Ensure Patient and Doctor UUIDs are valid.';
      setCreateMsg({ text: errDetail, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupReport = async (e) => {
    e.preventDefault();
    if (!searchReportId.trim()) return;

    try {
      setLookingUp(true);
      setLookupMsg({ text: '', type: '' });
      setLookedUpReport(null);
      const rep = await recordService.getLabReportById(searchReportId.trim());
      setLookedUpReport(rep);
    } catch (err) {
      const errDetail = err.response?.data?.detail || 'Lab report not found or access unauthorized.';
      setLookupMsg({ text: errDetail, type: 'error' });
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          Diagnostic Laboratory Management
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px', margin: 0 }}>
          File clinical diagnostic panels, pathology findings, and verify stored MongoDB lab documents
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Create Lab Report Form */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <PlusCircle size={22} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              File New Diagnostic Test Report
            </h2>
          </div>

          {createMsg.text && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '18px',
              backgroundColor: createMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: createMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.88rem',
              fontWeight: 600
            }}>
              {createMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {createMsg.text}
            </div>
          )}

          <form onSubmit={handleCreateReport}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Patient UUID
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                className="input-field"
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Ordering Doctor UUID
              </label>
              <input
                type="text"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Diagnostic Test Name
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC)"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Test Date
                </label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Structured Results Table */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Test Results & Biomarkers
                </label>
                <button
                  type="button"
                  onClick={addResultRow}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  + Add Parameter
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {resultPairs.map((pair, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Parameter (e.g. Glucose)"
                      value={pair.key}
                      onChange={(e) => updateResultPair(idx, 'key', e.target.value)}
                      className="input-field"
                      style={{ margin: 0, flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 95 mg/dL)"
                      value={pair.value}
                      onChange={(e) => updateResultPair(idx, 'value', e.target.value)}
                      className="input-field"
                      style={{ margin: 0, flex: 1 }}
                    />
                    {resultPairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeResultRow(idx)}
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Pathologist Remarks / Clinical Impressions
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Diagnostic impressions or reference notes..."
                className="input-field"
                rows={2}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ width: '100%', padding: '12px' }}
            >
              {submitting ? 'Submitting to MongoDB...' : 'Save & Publish Lab Report'}
            </button>
          </form>
        </div>

        {/* Lookup Existing Lab Report */}
        <div>
          <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Search size={20} color="var(--primary-color)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Lookup Report by ID
              </h2>
            </div>

            <form onSubmit={handleLookupReport} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Enter 24-character MongoDB ID"
                value={searchReportId}
                onChange={(e) => setSearchReportId(e.target.value)}
                className="input-field"
                style={{ margin: 0, flex: 1 }}
                required
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={lookingUp}
                style={{ padding: '10px 18px' }}
              >
                {lookingUp ? 'Searching...' : 'Lookup'}
              </button>
            </form>

            {lookupMsg.text && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                {lookupMsg.text}
              </div>
            )}
          </div>

          {/* Looked up Report details */}
          {lookedUpReport && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <FlaskConical size={20} color="var(--primary-color)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {lookedUpReport.test_name}
                </h3>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Test Date: <strong>{new Date(lookedUpReport.test_date).toLocaleDateString()}</strong>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Biomarker Results:
                </div>
                {typeof lookedUpReport.results === 'object' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Object.entries(lookedUpReport.results).map(([k, v], idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--background)', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <span>{k}</span>
                        <strong style={{ color: 'var(--primary-color)' }}>{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {lookedUpReport.remarks && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  Remarks: {lookedUpReport.remarks}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LabReportsPage;
