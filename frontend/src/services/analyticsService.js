import api from './api';

export const analyticsService = {
  getOverview: async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/analytics/users');
    return response.data;
  },
  getUserAnalytics: async () => {
    const response = await api.get('/analytics/users');
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/analytics/appointments');
    return response.data;
  },
  getAppointmentAnalytics: async () => {
    const response = await api.get('/analytics/appointments');
    return response.data;
  },

  getAppointmentTrend: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get('/analytics/appointments/trend', { params });
    return response.data;
  },

  getHealthcareDocuments: async () => {
    const response = await api.get('/analytics/healthcare-documents');
    return response.data;
  },
  getHealthcareDocumentAnalytics: async () => {
    const response = await api.get('/analytics/healthcare-documents');
    return response.data;
  },

  getDataSharing: async () => {
    const response = await api.get('/analytics/data-sharing');
    return response.data;
  },
  getDataSharingAnalytics: async () => {
    const response = await api.get('/analytics/data-sharing');
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/analytics/notifications');
    return response.data;
  },
  getNotificationAnalytics: async () => {
    const response = await api.get('/analytics/notifications');
    return response.data;
  },

  getAccessLogs: async () => {
    const response = await api.get('/analytics/access-logs');
    return response.data;
  },
  getAccessLogAnalytics: async () => {
    const response = await api.get('/analytics/access-logs');
    return response.data;
  },

  getRecentActivity: async (limit = 10) => {
    const response = await api.get('/analytics/recent-activity', { params: { limit } });
    return response.data;
  },

  getTopDoctors: async (limit = 10) => {
    const response = await api.get('/analytics/top-doctors', { params: { limit } });
    return response.data;
  },
};
