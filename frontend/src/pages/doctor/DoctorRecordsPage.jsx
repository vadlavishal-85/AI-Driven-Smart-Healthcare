import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  PlusCircle,
  User,
  CheckCircle2,
  AlertCircle,
  Search,
  Share2,
  Pill,
  Eye,
  Clock,
  Stethoscope,
  X,
  Building2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { recordService } from '../../services/recordService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { dataSharingService } from '../../services/dataSharingService';

const getDoctorDepartment = (spec) => {
  if (!spec) return 'General Medicine';
  const s = spec.toLowerCase();
  if (s.includes('cardio')) return 'Cardiology';
  if (s.includes('derma')) return 'Dermatology';
  if (s.includes('neuro')) return 'Neurology';
  if (s.includes('pediat')) return 'Pediatrics';
  if (s.includes('ortho')) return 'Orthopedics';
  return spec;
};

const DoctorRecordsPage = () => {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState('');

  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Notifications
  const [bannerMsg, setBannerMsg] = useState({ text: '', type: '' });

  // Modals
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [shareRecordModal, setShareRecordModal] = useState({ isOpen: false, record: null });
  const [shareRxModal, setShareRxModal] = useState({ isOpen: false, prescription: null });
  const [detailModal, setDetailModal] = useState({ isOpen: false, record: null });

  // Sharing progress state
  const [isSharing, setIsSharing] = useState(false);

  // New Record Form state
  const [formPatientId, setFormPatientId] = useState('');
  const [recordType, setRecordType] = useState('CONSULTATION');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formSymptoms, setFormSymptoms] = useState('');
  const [formTreatment, setFormTreatment] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // 1. Initial Load: Doctor Profile, All Doctors, and Patients
  useEffect(() => {
    const initializeData = async () => {
      try {
        setPatientsLoading(true);
        setPatientsError('');

        const [profData, docsData, patsData] = await Promise.all([
          doctorService.getProfile().catch(() => null),
          doctorService.getAllDoctors().catch(() => []),
          patientService.getPatientsForDoctor().catch(() => []),
        ]);

        setDoctorProfile(profData);
        setAllDoctors(Array.isArray(docsData) ? docsData : []);

        const patsList = Array.isArray(patsData) ? patsData : [];
        setPatients(patsList);

        if (patsList.length > 0) {
          setSelectedPatientId(patsList[0].id);
          setFormPatientId(patsList[0].id);
        }
      } catch {
        setPatientsError('Unable to load patients. Please try again.');
      } finally {
        setPatientsLoading(false);
      }
    };

    initializeData();
  }, []);

  // 2. Fetch Records & Prescriptions when selected patient changes
  const fetchPatientData = async (patId) => {
    if (!patId) {
      setRecords([]);
      setPrescriptions([]);
      return;
    }

    try {
      setRecordsLoading(true);
      const [recsData, rxData] = await Promise.all([
        recordService.getPatientMedicalRecords(patId).catch(() => []),
        recordService.getPatientPrescriptions(patId).catch(() => []),
      ]);
      setRecords(Array.isArray(recsData) ? recsData : []);
      setPrescriptions(Array.isArray(rxData) ? rxData : []);
    } catch {
      setRecords([]);
      setPrescriptions([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientData(selectedPatientId);
    }
  }, [selectedPatientId]);

  // Find currently selected patient object
  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Filter patients by search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase().trim();
    return patients.filter((p) => {
      const nameMatch = (p.full_name || '').toLowerCase().includes(q);
      const idMatch = (p.id || '').toLowerCase().includes(q);
      const emailMatch = (p.email || '').toLowerCase().includes(q);
      const bloodMatch = (p.blood_group || '').toLowerCase().includes(q);
      return nameMatch || idMatch || emailMatch || bloodMatch;
    });
  }, [patients, searchQuery]);

  // Clean and deduplicate records to prevent duplicate rendering of identical test records
  const uniqueRecords = useMemo(() => {
    const list = [];
    const seen = new Set();
    for (const r of records) {
      const compositeKey = `${r.patient_id}-${(r.title || '').trim()}-${(r.diagnosis || '').trim()}-${(r.treatment || '').trim()}`;
      if (!seen.has(compositeKey)) {
        seen.add(compositeKey);
        list.push(r);
      }
    }
    return list;
  }, [records]);

  // Helper to resolve doctor details for a record
  const getDoctorForRecord = (recordDoctorId) => {
    if (!recordDoctorId) {
      return {
        name: doctorProfile?.full_name ? (doctorProfile.full_name.startsWith('Dr. ') ? doctorProfile.full_name : `Dr. ${doctorProfile.full_name}`) : 'Attending Physician',
        department: getDoctorDepartment(doctorProfile?.specialization),
        specialization: doctorProfile?.specialization || 'Clinical Specialist',
      };
    }

    const matchedDoc = allDoctors.find(
      (d) => d.id === recordDoctorId || d.user_id === recordDoctorId
    );

    if (matchedDoc) {
      const docName = matchedDoc.full_name || 'Physician';
      return {
        name: docName.startsWith('Dr. ') ? docName : `Dr. ${docName}`,
        department: getDoctorDepartment(matchedDoc.specialization),
        specialization: matchedDoc.specialization || 'Clinical Specialist',
      };
    }

    if (doctorProfile && (doctorProfile.id === recordDoctorId || doctorProfile.user_id === recordDoctorId)) {
      const raw = doctorProfile.full_name || 'Physician';
      return {
        name: raw.startsWith('Dr. ') ? raw : `Dr. ${raw}`,
        department: getDoctorDepartment(doctorProfile.specialization),
        specialization: doctorProfile.specialization || 'Clinical Specialist',
      };
    }

    return {
      name: doctorProfile?.full_name ? (doctorProfile.full_name.startsWith('Dr. ') ? doctorProfile.full_name : `Dr. ${doctorProfile.full_name}`) : 'Attending Physician',
      department: getDoctorDepartment(doctorProfile?.specialization),
      specialization: doctorProfile?.specialization || 'Clinical Specialist',
    };
  };

  // Helper to resolve patient name for a record
  const getPatientForRecord = (recordPatientId) => {
    const matched = patients.find((p) => p.id === recordPatientId);
    if (matched) return matched;
    if (selectedPatient && selectedPatient.id === recordPatientId) return selectedPatient;
    return { full_name: 'Registered Patient', blood_group: 'N/A' };
  };

  // Handle Share Medical Record
  const handleConfirmShareRecord = async () => {
    if (!shareRecordModal.record || !selectedPatientId) return;

    try {
      setIsSharing(true);
      await dataSharingService.shareRecord({
        patient_id: selectedPatientId,
        record_id: shareRecordModal.record.id,
        record_type: 'medical_record',
      });

      setBannerMsg({
        text: 'Medical record shared successfully with patient!',
        type: 'success',
      });
      setShareRecordModal({ isOpen: false, record: null });
    } catch (err) {
      if (err.response?.status === 409) {
        setBannerMsg({
          text: 'Medical record is already shared with this patient.',
          type: 'success',
        });
        setShareRecordModal({ isOpen: false, record: null });
      } else {
        const errorDetail = err.response?.data?.detail || 'Failed to share medical record.';
        setBannerMsg({
          text: errorDetail,
          type: 'error',
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Handle Share Prescription
  const handleConfirmSharePrescription = async () => {
    if (!shareRxModal.prescription || !selectedPatientId) return;

    try {
      setIsSharing(true);
      await dataSharingService.shareRecord({
        patient_id: selectedPatientId,
        record_id: shareRxModal.prescription.id,
        record_type: 'prescription',
      });

      setBannerMsg({
        text: 'Prescription shared successfully with patient!',
        type: 'success',
      });
      setShareRxModal({ isOpen: false, prescription: null });
    } catch (err) {
      if (err.response?.status === 409) {
        setBannerMsg({
          text: 'Prescription is already shared with this patient.',
          type: 'success',
        });
        setShareRxModal({ isOpen: false, prescription: null });
      } else {
        const errorDetail = err.response?.data?.detail || 'Failed to share prescription.';
        setBannerMsg({
          text: errorDetail,
          type: 'error',
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Handle New Record Submission
  const handleCreateRecordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setBannerMsg({ text: '', type: '' });
    setFormSubmitting(true);

    try {
      const symptomsList = formSymptoms
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const targetPatient = formPatientId || selectedPatientId;
      await recordService.createMedicalRecord({
        patient_id: targetPatient,
        record_type: recordType,
        title: formTitle.trim(),
        description: formDescription.trim(),
        diagnosis: formDiagnosis.trim(),
        symptoms: symptomsList,
        treatment: formTreatment.trim(),
      });

      setBannerMsg({
        text: 'Clinical medical record authored and saved successfully!',
        type: 'success',
      });
      setIsNewRecordModalOpen(false);

      // Reset form
      setFormTitle('');
      setFormDescription('');
      setFormDiagnosis('');
      setFormSymptoms('');
      setFormTreatment('');

      if (targetPatient === selectedPatientId) {
        fetchPatientData(selectedPatientId);
      } else {
        setSelectedPatientId(targetPatient);
      }
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create medical record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Doctor display info
  const rawDoctorName = doctorProfile?.full_name || user?.full_name || 'Physician';
  const doctorDisplayName = rawDoctorName.startsWith('Dr. ') ? rawDoctorName : `Dr. ${rawDoctorName}`;
  const doctorSpec = doctorProfile?.specialization || 'Clinical Specialist';
  const doctorDept = getDoctorDepartment(doctorSpec);
  const doctorHospital = doctorProfile?.hospital_name || 'Healthcare Medical Center';

  return (
    <DashboardLayout
      title="Clinical Medical Records"
      subtitle="Review and manage medical records for your registered patients."
      actions={
        <button
          onClick={() => {
            setIsNewRecordModalOpen(true);
            setFormPatientId(selectedPatientId || (patients[0]?.id || ''));
            setFormError('');
          }}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
        >
          <PlusCircle size={18} />
          <span>New Medical Record</span>
        </button>
      }
    >
      {/* 1. DOCTOR IDENTITY HEADER BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          borderRadius: '16px',
          padding: '20px 24px',
          color: '#ffffff',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <Stethoscope size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#bae6fd', fontWeight: 700 }}>
              Attending Physician
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 0', color: '#ffffff' }}>
              {doctorDisplayName}
            </h2>
            <div style={{ fontSize: '13px', color: '#e0f2fe', marginTop: '2px' }}>
              {doctorHospital}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '8px 16px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#bae6fd', display: 'block', fontWeight: 700 }}>
              Department
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
              {doctorDept}
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '8px 16px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#bae6fd', display: 'block', fontWeight: 700 }}>
              Specialization
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
              {doctorSpec}
            </span>
          </div>
        </div>
      </div>

      {/* Global Status Banner */}
      {bannerMsg.text && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '24px',
            backgroundColor: bannerMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1.5px solid ${bannerMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: bannerMsg.type === 'success' ? '#065f46' : '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '14px',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {bannerMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{bannerMsg.text}</span>
          </div>
          <button
            onClick={() => setBannerMsg({ text: '', type: '' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. PATIENT SEARCH SECTION */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Registered Patient Search
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            Search and select an active registered patient to inspect clinical medical records
          </p>
        </div>

        {/* Large Search Bar */}
        <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
          <Search
            size={20}
            color="#64748b"
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="patient-search-input"
            placeholder="Search patients by name or patient ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '50px',
              paddingLeft: '48px',
              paddingRight: searchQuery ? '40px' : '16px',
              fontSize: '15px',
              fontWeight: 500,
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Patient Selection Cards Grid */}
        {patientsLoading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <LoadingSpinner message="Searching patients..." />
          </div>
        ) : patientsError ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#b91c1c', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <AlertCircle size={28} style={{ margin: '0 auto 8px auto' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>{patientsError}</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #cbd5e1' }}>
            <User size={36} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#334155' }}>No patients found</h4>
            <p style={{ margin: 0, fontSize: '13px' }}>Try searching with a different name or patient ID.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '14px',
            }}
          >
            {filteredPatients.map((pat) => {
              const isSelected = pat.id === selectedPatientId;
              const cleanId = pat.id ? String(pat.id).slice(0, 8).toUpperCase() : 'PT-VERIFIED';

              return (
                <div
                  key={pat.id}
                  onClick={() => setSelectedPatientId(pat.id)}
                  className={`patient-card-item ${isSelected ? 'patient-card-selected' : ''}`}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                    border: `1.5px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.12)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#0284c7' : '#e0f2fe',
                        color: isSelected ? '#ffffff' : '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      {pat.full_name ? pat.full_name.charAt(0) : 'P'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4
                          style={{
                            fontSize: '14.5px',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 2px 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          👤 {pat.full_name || 'Patient'}
                        </h4>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Patient ID: <code style={{ color: '#0284c7', fontWeight: 600 }}>{cleanId}</code>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                        Blood Group: <strong>{pat.blood_group || 'O+'}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPatientId(pat.id);
                    }}
                    style={{
                      marginTop: '14px',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      border: 'none',
                      backgroundColor: isSelected ? '#0284c7' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      width: '100%',
                    }}
                  >
                    {isSelected ? '✓ Viewing Records' : 'View Medical Records'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. SELECTED PATIENT OVERVIEW */}
      {selectedPatient && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0284c7', letterSpacing: '0.06em' }}>
              Patient Overview
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
              {selectedPatient.full_name}
            </h3>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              ID: <code>{String(selectedPatient.id).slice(0, 8).toUpperCase()}</code> • Email: {selectedPatient.email || 'N/A'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>
                Blood Group
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                {selectedPatient.blood_group || 'O+'}
              </span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>
                Total Records
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7' }}>
                {uniqueRecords.length}
              </span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>
                Prescriptions
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0d9488' }}>
                {prescriptions.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. CLINICAL MEDICAL RECORDS LIST */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Medical Records
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
              Authoritative clinical documentation for {selectedPatient ? selectedPatient.full_name : 'patient'}
            </p>
          </div>
        </div>

        {recordsLoading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <LoadingSpinner message="Loading clinical records..." />
          </div>
        ) : uniqueRecords.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <FileText size={44} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', margin: '0 0 6px 0' }}>
              No Medical Records Found
            </h4>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 16px 0' }}>
              No clinical medical records have been authored for this patient yet.
            </p>
            <button
              onClick={() => {
                setIsNewRecordModalOpen(true);
                setFormPatientId(selectedPatientId);
              }}
              className="btn btn-secondary"
              style={{ fontSize: '13px' }}
            >
              + Author First Clinical Record
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '22px' }}>
            {uniqueRecords.map((rec) => {
              const docInfo = getDoctorForRecord(rec.doctor_id);
              const patInfo = getPatientForRecord(rec.patient_id);
              const dateStr = new Date(rec.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={rec.id}
                  className="clinical-record-card"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1.5px solid #e2e8f0',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top Bar: Record Type and Date */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #f1f5f9',
                      paddingBottom: '12px',
                      marginBottom: '14px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                      }}
                    >
                      {rec.record_type || 'CONSULTATION'}
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>
                      {dateStr}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>
                    {rec.title}
                  </h3>

                  {/* Patient Info Block */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                      Patient
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>
                      {patInfo.full_name || 'Patient'}
                    </div>
                  </div>

                  {/* Attending Doctor Block */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                      Attending Doctor
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>
                      {docInfo.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700 }}>
                      {docInfo.department} • {docInfo.specialization}
                    </div>
                  </div>

                  {/* Clinical Sections */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '14px',
                      border: '1px solid #f1f5f9',
                      marginBottom: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#475569', fontWeight: 700 }}>
                        Diagnosis
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                        {rec.diagnosis || 'General Clinical Review'}
                      </div>
                    </div>

                    {rec.symptoms && rec.symptoms.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                          Symptoms
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {rec.symptoms.map((sym, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '11.5px',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                color: '#334155',
                                fontWeight: 600,
                              }}
                            >
                              {sym}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#475569', fontWeight: 700 }}>
                        Treatment
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155', marginTop: '2px', lineHeight: 1.4 }}>
                        {rec.treatment || 'Standard clinical maintenance'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '12px',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '8px',
                    }}
                  >
                    <button
                      onClick={() => setDetailModal({ isOpen: true, record: rec })}
                      className="btn btn-secondary"
                      style={{ fontSize: '12.5px', padding: '6px 12px' }}
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>

                    <button
                      onClick={() => setShareRecordModal({ isOpen: true, record: rec })}
                      className="btn btn-primary"
                      style={{ fontSize: '12.5px', padding: '6px 14px', backgroundColor: '#0284c7' }}
                    >
                      <Share2 size={14} />
                      <span>Share Record</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. PATIENT PRESCRIPTIONS & SHARE PRESCRIPTION */}
      {prescriptions.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Patient Prescriptions
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                Active medication orders and prescription records
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
            {prescriptions.map((rx) => {
              const rxDate = new Date(rx.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={rx.id}
                  className="card"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#0d9488',
                          backgroundColor: '#ccfbf1',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        <Pill size={14} />
                        <span>Prescription</span>
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{rxDate}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      {rx.medicines?.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '10px 12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{m.name}</strong>
                          <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>
                            {m.dosage} • {m.frequency} • {m.duration}
                          </div>
                          {m.instructions && (
                            <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                              {m.instructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {rx.notes && (
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px' }}>
                        Clinical Notes: {rx.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => setShareRxModal({ isOpen: true, prescription: rx })}
                      className="btn btn-secondary"
                      style={{ fontSize: '12.5px', padding: '6px 14px', color: '#0d9488', borderColor: '#a7f3d0' }}
                    >
                      <Share2 size={14} />
                      <span>Share Prescription</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: SHARE MEDICAL RECORD */}
      {shareRecordModal.isOpen && shareRecordModal.record && (
        <div className="modal-overlay" onClick={() => setShareRecordModal({ isOpen: false, record: null })}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', borderRadius: '16px', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={20} color="#0284c7" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Share Medical Record
                </h3>
              </div>
              <button
                onClick={() => setShareRecordModal({ isOpen: false, record: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>
                  Patient
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedPatient ? selectedPatient.full_name : 'Registered Patient'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>
                  Record
                </span>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#0284c7' }}>
                  {shareRecordModal.record.title}
                </span>
                <span style={{ fontSize: '12.5px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                  {shareRecordModal.record.record_type} — {new Date(shareRecordModal.record.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#334155', fontWeight: 600, marginBottom: '20px' }}>
              Share this medical record with the patient? The patient will be notified and granted access through the verified data-sharing registry.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShareRecordModal({ isOpen: false, record: null })}
                className="btn btn-secondary"
                disabled={isSharing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmShareRecord}
                className="btn btn-primary"
                disabled={isSharing}
                style={{ backgroundColor: '#0284c7' }}
              >
                {isSharing ? 'Sharing...' : 'Share Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SHARE PRESCRIPTION */}
      {shareRxModal.isOpen && shareRxModal.prescription && (
        <div className="modal-overlay" onClick={() => setShareRxModal({ isOpen: false, prescription: null })}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', borderRadius: '16px', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={20} color="#0d9488" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Share Prescription
                </h3>
              </div>
              <button
                onClick={() => setShareRxModal({ isOpen: false, prescription: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>
                  Patient
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedPatient ? selectedPatient.full_name : 'Registered Patient'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>
                  Prescription Details
                </span>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#0d9488' }}>
                  {shareRxModal.prescription.medicines?.map((m) => `${m.name} (${m.dosage})`).join(', ') || 'Prescription Order'}
                </span>
                <span style={{ fontSize: '12.5px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                  Issued on {new Date(shareRxModal.prescription.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#334155', fontWeight: 600, marginBottom: '20px' }}>
              Share this prescription with the patient? The patient will be granted secure access to view dosage and pharmacy directions.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShareRxModal({ isOpen: false, prescription: null })}
                className="btn btn-secondary"
                disabled={isSharing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSharePrescription}
                className="btn btn-primary"
                disabled={isSharing}
                style={{ backgroundColor: '#0d9488' }}
              >
                {isSharing ? 'Sharing...' : 'Share Prescription'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW CLINICAL DETAILS */}
      {detailModal.isOpen && detailModal.record && (
        <div className="modal-overlay" onClick={() => setDetailModal({ isOpen: false, record: null })}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', borderRadius: '16px', padding: '28px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {detailModal.record.record_type}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '6px 0 0' }}>
                  {detailModal.record.title}
                </h3>
              </div>
              <button
                onClick={() => setDetailModal({ isOpen: false, record: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>
                    Patient
                  </span>
                  <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                    {getPatientForRecord(detailModal.record.patient_id).full_name}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>
                    Attending Physician
                  </span>
                  <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                    {getDoctorForRecord(detailModal.record.doctor_id).name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, display: 'block' }}>
                    {getDoctorForRecord(detailModal.record.doctor_id).department}
                  </span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 4px' }}>
                  Clinical Diagnosis
                </h4>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0284c7' }}>
                  {detailModal.record.diagnosis}
                </div>
              </div>

              {detailModal.record.description && (
                <div>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 4px' }}>
                    Clinical Findings & Description
                  </h4>
                  <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5, backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {detailModal.record.description}
                  </div>
                </div>
              )}

              {detailModal.record.symptoms && detailModal.record.symptoms.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 6px' }}>
                    Reported Symptoms
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {detailModal.record.symptoms.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '12px',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          color: '#1e293b',
                          fontWeight: 600,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 4px' }}>
                  Treatment Plan
                </h4>
                <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5, backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {detailModal.record.treatment}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                Recorded on {new Date(detailModal.record.created_at).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setDetailModal({ isOpen: false, record: null })}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: NEW MEDICAL RECORD FORM */}
      {isNewRecordModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewRecordModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', borderRadius: '16px', padding: '28px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Author New Clinical Record
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                  Document new patient evaluation and clinical treatment plan
                </p>
              </div>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#fef2f2',
                  color: '#b91c1c',
                  borderRadius: '10px',
                  border: '1px solid #fecaca',
                  fontSize: '13.5px',
                  marginBottom: '16px',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRecordSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px' }}>Patient</label>
                <select
                  className="form-select"
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.blood_group || 'O+'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px' }}>Record Type</label>
                <select
                  className="form-select"
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  required
                >
                  <option value="CONSULTATION">Consultation</option>
                  <option value="FOLLOW_UP">Follow-Up Consultation</option>
                  <option value="DIAGNOSIS">Diagnostic Evaluation</option>
                  <option value="ROUTINE_CHECKUP">Routine Clinical Checkup</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px' }}>Record Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Neurological Consultation & Follow-Up"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px' }}>Clinical Findings / Description</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Describe patient examination findings..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px' }}>Diagnosis</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Migraine with Aura"
                  value={formDiagnosis}
                  onChange={(e) => setFormDiagnosis(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px' }}>Symptoms (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. throbbing headache, photophobia, nausea"
                  value={formSymptoms}
                  onChange={(e) => setFormSymptoms(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '22px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px' }}>Treatment Plan</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sumatriptan 50mg PRN, hydration protocol"
                  value={formTreatment}
                  onChange={(e) => setFormTreatment(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#0284c7' }}
                >
                  {formSubmitting ? 'Creating...' : 'Create Clinical Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scoped CSS Styles for Clinical Records Page */}
      <style>{`
        .patient-search-input:focus {
          border-color: #0284c7 !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15) !important;
        }

        .patient-card-item:hover {
          border-color: #93c5fd !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px -2px rgba(2, 132, 199, 0.1) !important;
        }

        .patient-card-selected {
          border-color: #0284c7 !important;
          background-color: #f0f9ff !important;
        }

        .clinical-record-card:hover {
          border-color: #bae6fd;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(2, 132, 199, 0.08);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default DoctorRecordsPage;
