import api from './api';

export const accessLogService = {
  getAccessLogs: async (limit = 100, offset = 0) => {
    const response = await api.get('/access-logs', { params: { limit, offset } });
    return response.data;
  },
};
