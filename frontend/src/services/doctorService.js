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
};
