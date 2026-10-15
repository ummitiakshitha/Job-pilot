import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Percent,
  Award,
} from 'lucide-react';
import applicationService from '../api/applicationService';
import StatusDistributionChart from '../components/dashboard/StatusDistributionChart';
import StatCard from '../components/common/StatCard';
import { ChartSkeleton } from '../components/common/LoadingSkeleton';

export const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await applicationService.getStats();
        if (res?.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = stats?.total || 0;
  const interviews = stats?.interview || 0;
  const offers = stats?.offer || 0;
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
  const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : total > 0 ? Math.round((offers / total) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pb-4 border-b border-sand-200/90"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-forest-800 text-xs font-semibold mb-2 shadow-sm">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>MongoDB Pipeline Aggregation</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
          Recruitment Analytics & Insights
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
          Detailed metrics calculated via native server-side database aggregation
        </p>
      </motion.div>

      {/* Conversion Rate Funnel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Interview Conversion"
          value={`${interviewRate}%`}
          subtitle={`${interviews} interviews out of ${total} applications`}
          icon={Percent}
        />
        <StatCard
          title="Offer Conversion Rate"
          value={`${offerRate}%`}
          subtitle={`${offers} offers achieved`}
          icon={Award}
        />
        <StatCard
          title="Active Search Velocity"
          value={total}
          subtitle="Total lifecycle applications logged"
          icon={TrendingUp}
        />
      </div>

      {/* Main Charts */}
      <div>
        {loading ? (
          <ChartSkeleton />
        ) : (
          <StatusDistributionChart
            statusDistribution={stats?.statusDistribution || []}
            monthlyTrends={stats?.monthlyTrends || []}
          />
        )}
      </div>

      {/* Conversion Funnel Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card"
      >
        <h3 className="text-base font-bold text-forest-950 mb-1 font-sans">
          Application Funnel Breakdown
        </h3>
        <p className="text-xs text-stone-500 mb-6 font-medium">
          Step-by-step attrition across recruitment stages
        </p>

        <div className="space-y-4 max-w-2xl">
          {/* Step 1: Total Applied */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-700">1. Total Submitted</span>
              <span className="text-forest-950 font-bold">{total} (100%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-sand-100 overflow-hidden">
              <div className="h-full bg-teal-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Step 2: Reached Interview */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-700">2. Reached Interview Stage</span>
              <span className="text-amber-900 font-bold">{interviews} ({interviewRate}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-sand-100 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, interviewRate)}%` }}
              />
            </div>
          </div>

          {/* Step 3: Reached Offer */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-700">3. Final Job Offers</span>
              <span className="text-emerald-800 font-bold">{offers} ({total > 0 ? Math.round((offers / total) * 100) : 0}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-sand-100 overflow-hidden">
              <div
                className="h-full bg-forest-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, total > 0 ? Math.round((offers / total) * 100) : 0)}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
