const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobDescriptionRoutes = require('./routes/jobDescriptionRoutes');
const skillRoutes = require('./routes/skillRoutes');
const learningPlanRoutes = require('./routes/learningPlanRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const starAnswerRoutes = require('./routes/starAnswerRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const careerReadinessRoutes = require('./routes/careerReadinessRoutes');
const placementRescueRoutes = require('./routes/placementRescueRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Enable CORS for frontend development and production
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware with reasonable size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

const mongoose = require('mongoose');

// Health check endpoint with database connection status
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    message: 'JobPilot REST API is healthy and operational',
    database: {
      status: isConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name || 'jobpilot',
      host: mongoose.connection.host || 'local',
    },
    timestamp: new Date().toISOString(),
  });
});

const path = require('path');

// Primary REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/job-descriptions', jobDescriptionRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/learning-plans', learningPlanRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/star-answers', starAnswerRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/career-readiness', careerReadinessRoutes);
app.use('/api/placement-rescue', placementRescueRoutes);

// In production, serve static frontend assets built from client/dist
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
