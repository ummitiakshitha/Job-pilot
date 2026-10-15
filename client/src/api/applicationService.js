import apiClient from './apiClient';

export const applicationService = {
  getApplications: (params = {}) =>
    apiClient.get('/applications', { params }),

  getApplicationById: (id) =>
    apiClient.get(`/applications/${id}`),

  createApplication: (applicationData) =>
    apiClient.post('/applications', applicationData),

  updateApplication: (id, applicationData) =>
    apiClient.put(`/applications/${id}`, applicationData),

  updateStatus: (id, status) =>
    apiClient.patch(`/applications/${id}/status`, { status }),

  deleteApplication: (id) =>
    apiClient.delete(`/applications/${id}`),

  getStats: () =>
    apiClient.get('/applications/stats'),
};

export default applicationService;
