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

  // Feature 4: Interview Preparation Checklist
  toggleChecklistTask: (id, taskId, completed) =>
    apiClient.patch(`/applications/${id}/checklist/${taskId}`, { completed }),

  addChecklistTask: (id, text) =>
    apiClient.post(`/applications/${id}/checklist`, { text }),

  deleteChecklistTask: (id, taskId) =>
    apiClient.delete(`/applications/${id}/checklist/${taskId}`),

  // Feature 5: Follow-Up Reminders
  updateFollowUp: (id, { followUpDate, followUpCompleted }) =>
    apiClient.patch(`/applications/${id}/follow-up`, { followUpDate, followUpCompleted }),

  // Feature 9: Bookmarking & Favorites
  toggleFavorite: (id) =>
    apiClient.patch(`/applications/${id}/favorite`),
};

export default applicationService;
