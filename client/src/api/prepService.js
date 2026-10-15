import apiClient from './apiClient';

export const prepService = {
  // 1. Resume Analyzer
  uploadAndAnalyzeResume: (formData) => {
    return apiClient.post('/resume/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getResumeAnalyses: () => apiClient.get('/resume/analyses'),
  getResumeAnalysis: (id) => apiClient.get(`/resume/analyses/${id}`),
  deleteResumeAnalysis: (id) => apiClient.delete(`/resume/analyses/${id}`),

  // 2. Job Description Decoder
  decodeJobDescription: (data) => apiClient.post('/job-descriptions/decode', data),
  getJobDescriptions: () => apiClient.get('/job-descriptions'),
  getJobDescription: (id) => apiClient.get(`/job-descriptions/${id}`),
  deleteJobDescription: (id) => apiClient.delete(`/job-descriptions/${id}`),

  // 3. Skill Gap Analyzer
  getSkills: () => apiClient.get('/skills'),
  addSkill: (data) => apiClient.post('/skills', data),
  updateSkill: (id, data) => apiClient.put(`/skills/${id}`, data),
  deleteSkill: (id) => apiClient.delete(`/skills/${id}`),
  analyzeSkillGap: (data) => apiClient.post('/skills/gap-analysis', data),

  // 4. Learning Plan & Roadmap
  generateLearningPlan: (data) => apiClient.post('/learning-plans/generate', data),
  getLearningPlans: () => apiClient.get('/learning-plans'),
  toggleTaskCompletion: (planId, taskId, notes) =>
    apiClient.patch(`/learning-plans/${planId}/tasks/${taskId}`, { notes }),
  deleteLearningPlan: (id) => apiClient.delete(`/learning-plans/${id}`),

  // 5. AI Interview Coach
  startInterview: (data) => apiClient.post('/interviews/start', data),
  submitAnswer: (sessionId, data) => apiClient.post(`/interviews/${sessionId}/answer`, data),
  completeInterview: (sessionId) => apiClient.post(`/interviews/${sessionId}/complete`),
  getInterviews: () => apiClient.get('/interviews'),
  getInterview: (sessionId) => apiClient.get(`/interviews/${sessionId}`),

  // 6. STAR Answer Builder
  createSTARAnswer: (data) => apiClient.post('/star-answers', data),
  getSTARAnswers: () => apiClient.get('/star-answers'),
  updateSTARAnswer: (id, data) => apiClient.put(`/star-answers/${id}`, data),
  deleteSTARAnswer: (id) => apiClient.delete(`/star-answers/${id}`),

  // 7. Technical Interview Practice Lab
  getPracticeQuestions: (params) => apiClient.get('/practice/questions', { params }),
  recordPracticeAttempt: (data) => apiClient.post('/practice/attempt', data),
  getPracticeStats: () => apiClient.get('/practice/stats'),

  // 8. Career Readiness Dashboard
  getCareerReadiness: () => apiClient.get('/career-readiness'),

  // 9. Placement Rescue Mode
  getPlacementRescuePlan: (applicationId) =>
    apiClient.post('/placement-rescue/plan', { applicationId }),
};

export default prepService;
