import api from './api';

export const patientService = {
  getProfile: async () => {
    const response = await api.get('/patients/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/patients/me', data);
    return response.data;
  },

  getPatientsForDoctor: async () => {
    const response = await api.get('/patients/for-doctor');
    return response.data;
  },

  getAllPatients: async () => {
    const response = await api.get('/patients');
    return response.data;
  },

  getPatientById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  createPatient: async (data) => {
    const response = await api.post('/patients', data);
    return response.data;
  },

  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
};

