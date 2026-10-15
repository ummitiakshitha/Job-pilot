import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  Award,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import applicationService from '../api/applicationService';
import StatCard from '../components/common/StatCard';
import StatusDistributionChart from '../components/dashboard/StatusDistributionChart';
import UpcomingInterviews from '../components/dashboard/UpcomingInterviews';
import FollowUpWidget from '../components/dashboard/FollowUpWidget';
import RecentApplicationsList from '../components/dashboard/RecentApplicationsList';
import ApplicationDetailsModal from '../components/applications/ApplicationDetailsModal';
import ApplicationFormModal from '../components/applications/ApplicationFormModal';
import { StatCardSkeleton, ChartSkeleton } from '../components/common/LoadingSkeleton';

export const DashboardPage = () => {
  const { user } = useAuth();
  const context = useOutletContext();
  const refreshTrigger = context?.refreshTrigger || 0;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await applicationService.getStats();
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err.message || 'Could not fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const handleViewApp = (app) => {
    setSelectedApp(app);
    setIsDetailsOpen(true);
  };

  const handleEditApp = (app) => {
    setSelectedApp(app);
    setIsEditOpen(true);
  };

  const handleModalSuccess = () => {
    fetchStats();
    if (context?.triggerRefresh) {
      context.triggerRefresh();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-sand-200/90"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-100/90 text-forest-800 text-xs font-semibold mb-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
            <span>Live Career Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Pilot'}! 👋
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
            Here is your live job application pipeline and interview status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-sand-200 hover:border-forest-400 text-stone-600 hover:text-forest-900 transition-colors shadow-soft"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsNewOpen(true)}
            className="btn-forest inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft"
          >
            <Plus className="w-4 h-4" />
            <span>Track Application</span>
          </button>
        </div>
      </motion.div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between font-medium">
          <span>{error}</span>
          <button
            onClick={fetchStats}
            className="underline font-bold hover:text-rose-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Applications"
              value={stats?.total ?? 0}
              subtitle="All registered opportunities"
              icon={Briefcase}
            />
            <StatCard
              title="Interviews"
              value={stats?.interview ?? 0}
              subtitle={`${stats?.metrics?.interviewRate || 0}% interview rate`}
              icon={Users}
              trend={
                stats?.total > 0
                  ? `${Math.round(((stats?.interview || 0) / stats.total) * 100)}% active`
                  : undefined
              }
            />
            <StatCard
              title="Offers Extended"
              value={stats?.offer ?? 0}
              subtitle={`${stats?.metrics?.offerRate || 0}% conversion rate`}
              icon={Award}
            />
            <StatCard
              title="Rejections"
              value={stats?.rejected ?? 0}
              subtitle="Closed opportunities"
              icon={XCircle}
            />
          </>
        )}
      </div>

      {/* Analytics & Upcoming Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Chart (2 cols) */}
        <div className="lg:col-span-2">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <StatusDistributionChart
              statusDistribution={stats?.statusDistribution || []}
              monthlyTrends={stats?.monthlyTrends || []}
            />
          )}
        </div>

        {/* Upcoming Interviews (1 col) */}
        <div className="lg:col-span-1">
          <UpcomingInterviews
            interviews={stats?.upcomingInterviews || []}
            onViewApplication={handleViewApp}
          />
        </div>
      </div>

      {/* Follow-up Reminders & Recent Applications Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FollowUpWidget
            followUps={stats?.pendingFollowUps || []}
            dueTodayCount={stats?.followUpsDueToday || 0}
            overdueCount={stats?.overdueFollowUps || 0}
            onViewApplication={handleViewApp}
            onFollowUpToggled={fetchStats}
          />
        </div>
        <div className="lg:col-span-2">
          <RecentApplicationsList
            applications={stats?.recentApplications || []}
            onViewApplication={handleViewApp}
          />
        </div>
      </div>

      {/* Modals */}
      <ApplicationDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        application={selectedApp}
        onEdit={(app) => {
          setSelectedApp(app);
          setIsEditOpen(true);
        }}
        onStatusUpdated={() => {
          fetchStats();
        }}
      />

      <ApplicationFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        applicationToEdit={selectedApp}
        onSuccess={handleModalSuccess}
      />

      <ApplicationFormModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default DashboardPage;
