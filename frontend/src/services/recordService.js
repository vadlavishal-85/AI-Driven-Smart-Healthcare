import api from './api';

export const recordService = {
  // Medical Records
  createMedicalRecord: async (data) => {
    const response = await api.post('/medical-records', data);
    return response.data;
  },

  getMyMedicalRecords: async () => {
    const response = await api.get('/medical-records/my');
    return response.data;
  },

  getPatientMedicalRecords: async (patientId) => {
    const response = await api.get(`/medical-records/patient/${patientId}`);
    return response.data;
  },

  getMedicalRecordById: async (id) => {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  },

  updateMedicalRecord: async (id, data) => {
    const response = await api.put(`/medical-records/${id}`, data);
    return response.data;
  },

  // Prescriptions
  createPrescription: async (data) => {
    const response = await api.post('/prescriptions', data);
    return response.data;
  },

  getMyPrescriptions: async () => {
    const response = await api.get('/prescriptions/my');
    return response.data;
  },

  getPatientPrescriptions: async (patientId) => {
    const response = await api.get(`/prescriptions/patient/${patientId}`);
    return response.data;
  },

  getPrescriptionById: async (id) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },

  // Doctor Notes
  createDoctorNote: async (data) => {
    const response = await api.post('/doctor-notes', data);
    return response.data;
  },

  getMyDoctorNotes: async () => {
    const response = await api.get('/doctor-notes/my');
    return response.data;
  },

  getPatientDoctorNotes: async (patientId) => {
    const response = await api.get(`/doctor-notes/patient/${patientId}`);
    return response.data;
  },

  // Lab Reports
  createLabReport: async (data) => {
    const response = await api.post('/lab-reports', data);
    return response.data;
  },

  getMyLabReports: async () => {
    const response = await api.get('/lab-reports/my');
    return response.data;
  },

  getPatientLabReports: async (patientId) => {
    const response = await api.get(`/lab-reports/patient/${patientId}`);
    return response.data;
  },

  getLabReportById: async (id) => {
    const response = await api.get(`/lab-reports/${id}`);
    return response.data;
  },
};
