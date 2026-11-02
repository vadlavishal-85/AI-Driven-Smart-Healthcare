import api from './api';

export const doctorService = {
  getProfile: async () => {
    const response = await api.get('/doctors/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/doctors/me', data);
    return response.data;
  },

  getAllDoctors: async () => {
    const response = await api.get('/doctors');
    return response.data;
  },

  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  getPublicDirectory: async () => {
    const response = await api.get('/doctors/directory');
    return response.data;
  },

  createDoctor: async (data) => {
    const response = await api.post('/doctors', data);
    return response.data;
  },

  deleteDoctor: async (id) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },
};

