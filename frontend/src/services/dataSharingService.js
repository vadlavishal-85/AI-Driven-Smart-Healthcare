import api from './api';

export const dataSharingService = {
  shareRecord: async (data) => {
    const response = await api.post('/data-sharing', data);
    return response.data;
  },

  getDoctorShares: async () => {
    const response = await api.get('/data-sharing/doctor');
    return response.data;
  },

  getMyShares: async () => {
    const response = await api.get('/data-sharing/my');
    return response.data;
  },

  getMySharedRecords: async () => {
    const response = await api.get('/data-sharing/my');
    return response.data;
  },

  getSharedRecordById: async (id) => {
    const response = await api.get(`/data-sharing/${id}`);
    return response.data;
  },

  revokeShare: async (id) => {
    const response = await api.put(`/data-sharing/${id}/revoke`);
    return response.data;
  },
};
