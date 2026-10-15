import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './routes/RouteGuards';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import CalendarPage from './pages/CalendarPage';

// Placement Preparation & AI Modules
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import JobDecoderPage from './pages/JobDecoderPage';
import SkillGapPage from './pages/SkillGapPage';
import LearningRoadmapPage from './pages/LearningRoadmapPage';
import InterviewCoachPage from './pages/InterviewCoachPage';
import STARBuilderPage from './pages/STARBuilderPage';
import PracticeLabPage from './pages/PracticeLabPage';
import CareerReadinessPage from './pages/CareerReadinessPage';
import PlacementRescuePage from './pages/PlacementRescuePage';
import CompanyComparisonPage from './pages/CompanyComparisonPage';

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Guest Only Routes (Redirects to dashboard if logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Routes (Enclosed in AppLayout) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Job Application Management */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* AI Placement Preparation Modules */}
              <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
              <Route path="/jd-decoder" element={<JobDecoderPage />} />
              <Route path="/skill-gap" element={<SkillGapPage />} />
              <Route path="/learning-plan" element={<LearningRoadmapPage />} />
              <Route path="/interview-coach" element={<InterviewCoachPage />} />
              <Route path="/star-builder" element={<STARBuilderPage />} />
              <Route path="/practice-lab" element={<PracticeLabPage />} />

              {/* Career Insights & Rescue */}
              <Route path="/career-readiness" element={<CareerReadinessPage />} />
              <Route path="/placement-rescue" element={<PlacementRescuePage />} />
              <Route path="/company-comparison" element={<CompanyComparisonPage />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
