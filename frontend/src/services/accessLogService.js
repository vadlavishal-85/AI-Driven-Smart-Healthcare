import api from './api';

export const accessLogService = {
  getAccessLogs: async (limit = 100, offset = 0, search = null) => {
    const params = { limit, offset };
    if (search && search.trim()) params.search = search.trim();
    const response = await api.get('/access-logs', { params });
    return response.data;
  },
};
