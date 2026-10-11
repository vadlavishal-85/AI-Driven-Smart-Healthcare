import api from './api';

export const appointmentService = {
  createAppointment: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await api.get('/appointments/my');
    return response.data;
  },

  getDoctorAppointments: async () => {
    const response = await api.get('/appointments/doctor');
    return response.data;
  },

  getAllAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data;
  },

  updateAppointmentStatus: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },
};
