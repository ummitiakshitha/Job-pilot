import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Briefcase,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedHeroBackground from '../components/3d/AnimatedHeroBackground';
import DashboardPreviewMockup from '../components/landing/DashboardPreviewMockup';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-ivory-100 text-stone-800 flex flex-col selection:bg-forest-100 selection:text-forest-900 relative overflow-hidden">
      {/* 1. Visible, Elegant Continuously Animated 3D Background */}
      <AnimatedHeroBackground />

      {/* 2. Public Top Navigation Header */}
      <nav className="relative z-20 max-w-7xl w-full mx-auto px-6 h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center text-ivory-50 shadow-soft transition-transform group-hover:scale-105">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-forest-950 font-sans">
            Job<span className="text-forest-600">Pilot</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-600">
          <a href="#features" className="hover:text-forest-900 transition-colors">
            Features
          </a>
          <Link to="/applications" className="hover:text-forest-900 transition-colors">
            Pipelines
          </Link>
          <Link to="/analytics" className="hover:text-forest-900 transition-colors">
            Analytics
          </Link>
        </div>

        {/* Right Action Buttons: Always provide Sign In & Get Started, plus Dashboard if active */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-50 border border-forest-200/80 text-forest-800 text-sm font-semibold hover:bg-forest-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          )}

          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:text-forest-900 hover:bg-sand-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="btn-forest px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* 3. Hero Section with 3D Background & Floating Perspective Mockup */}
      <section className="relative z-10 max-w-7xl w-full mx-auto px-6 pt-6 sm:pt-10 pb-20 flex-1 flex flex-col items-center text-center">
        {/* Animated Capsule Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-sand-200/90 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse-subtle" />
          <span>Full-Stack MERN Mini-Project</span>
          <span className="text-stone-400">&bull;</span>
          <span className="text-stone-500 font-medium normal-case">Smart Career Flightpath</span>
        </motion.div>

        {/* Original Hero Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-forest-950 leading-[1.08] max-w-4xl mb-6 font-sans"
        >
          Your Job Search,{' '}
          <span className="text-forest-700 underline decoration-forest-200/80 underline-offset-8">
            Finally Organized.
          </span>
        </motion.h1>

        {/* Original Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-stone-600 max-w-2xl leading-relaxed mb-8 font-normal"
        >
          Take command of your career journey with JobPilot. Track every
          application, manage upcoming interview dates, explore Kanban pipelines,
          and visualize recruitment analytics with deep MongoDB persistence.
        </motion.p>

        {/* Original CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 w-full sm:w-auto"
        >
          <Link
            to="/register"
            className="btn-forest w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold shadow-soft group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#features"
            className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold shadow-sm"
          >
            Explore Features
          </a>
        </motion.div>

        {/* Original Checklist Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-600 font-medium mb-12"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest-600" />
            <span>JWT Authentication & Isolation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest-600" />
            <span>Table & Kanban Views</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest-600" />
            <span>MongoDB Aggregation Metrics</span>
          </div>
        </motion.div>

        {/* 3D Floating Perspective Dashboard Preview (Matching reference image) */}
        <div className="w-full relative mt-2 mb-10 z-10">
          <DashboardPreviewMockup />
        </div>
      </section>

      {/* 4. Original Features Grid Section */}
      <section id="features" className="relative z-10 max-w-7xl w-full mx-auto px-6 py-24 border-t border-sand-200/90 bg-white/60 backdrop-blur-sm">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-forest-700 uppercase tracking-wider">
            Engineered for Academic & Production Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 mt-2 font-sans">
            Comprehensive Full-Stack Features
          </h2>
          <p className="text-sm text-stone-600 mt-3 font-normal">
            Every feature is backed by real MongoDB database persistence, robust REST
            APIs, and responsive modern user interface architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center mb-4 shadow-soft">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-forest-950 mb-2 font-sans">
              Lifecycle Tracking
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Record job applications across 4 core statuses: Applied, Interview,
              Offer, and Rejected with salary expectations and job URLs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center mb-4 shadow-soft">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-forest-950 mb-2 font-sans">
              Interactive Kanban & Tables
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Toggle effortlessly between detailed data tables and a drag-and-click
              Kanban pipeline board for visual stage advancement.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center mb-4 shadow-soft">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-forest-950 mb-2 font-sans">
              Interview Management
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Never miss a technical round or recruiter screening with scheduled
              interview dates, countdowns, and preparation notes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center mb-4 shadow-soft">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-forest-950 mb-2 font-sans">
              Aggregation Analytics
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Calculates live status distributions and conversion rates using native
              MongoDB aggregation pipelines scoped strictly to your account.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Original Clean Footer */}
      <footer className="relative z-10 border-t border-sand-200/80 py-10 px-6 bg-white/70 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-forest-700" />
            <span className="font-bold text-stone-800">JobPilot Tracker</span>
            <span>&bull; Full-Stack MERN Mini-Project</span>
          </div>
          <div>
            Built with React, Vite, Tailwind CSS, Express, and MongoDB.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
