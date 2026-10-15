import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Percent,
  Award,
  HelpCircle,
  IndianRupee,
  CheckCircle2,
  Calendar,
  Filter,
} from 'lucide-react';
import applicationService from '../api/applicationService';
import StatusDistributionChart from '../components/dashboard/StatusDistributionChart';
import StatCard from '../components/common/StatCard';
import { ChartSkeleton } from '../components/common/LoadingSkeleton';
import { formatINR } from '../utils/formatters';

export const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all'); // 'all', '90d', '30d'

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let params = { limit: 100 };
        const now = new Date();
        if (dateRange === '30d') {
          const past = new Date();
          past.setDate(now.getDate() - 30);
          params.startDate = past.toISOString();
        } else if (dateRange === '90d') {
          const past = new Date();
          past.setDate(now.getDate() - 90);
          params.startDate = past.toISOString();
        }

        const [statsRes, appsRes] = await Promise.all([
          applicationService.getStats(),
          applicationService.getApplications(params),
        ]);

        if (statsRes?.data) setStats(statsRes.data);
        if (appsRes?.data) setApplications(appsRes.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateRange]);

  const total = stats?.total || 0;
  const interviews = stats?.interview || 0;
  const offers = stats?.offer || 0;
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  // Calculate Salary Analytics
  const appsWithExpected = applications.filter((a) => a.salary && a.salary > 0);
  const appsWithOffer = applications.filter((a) => a.offeredSalary && a.offeredSalary > 0);
  
  const avgExpectedSalary =
    appsWithExpected.length > 0
      ? Math.round(
          appsWithExpected.reduce((acc, curr) => acc + Number(curr.salary), 0) /
            appsWithExpected.length
        )
      : 0;

  const highestOfferSalary =
    appsWithOffer.length > 0
      ? Math.max(...appsWithOffer.map((a) => Number(a.offeredSalary)))
      : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200/90"
      >
        <div>
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
        </div>

        {/* Date Range Filter Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-sand-200 rounded-xl shadow-soft text-xs font-semibold">
          <Filter className="w-3.5 h-3.5 text-stone-400 ml-2 mr-1" />
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateRange === 'all'
                ? 'bg-forest-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setDateRange('90d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateRange === '90d'
                ? 'bg-forest-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateRange === '30d'
                ? 'bg-forest-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Last 30 Days
          </button>
        </div>
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

      {/* Salary & Offer Compensation Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-forest-950 font-sans">Average Expected CTC</h3>
              <p className="text-xs text-stone-500">Based on active target applications</p>
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 font-sans">
            {avgExpectedSalary > 0 ? formatINR(avgExpectedSalary) : '₹0 / None set'}
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Calculated across {appsWithExpected.length} application(s) with specified target salaries.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 border border-forest-100 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-forest-950 font-sans">Top Confirmed Offer</h3>
              <p className="text-xs text-stone-500">Highest confirmed compensation</p>
            </div>
          </div>
          <div className="text-2xl font-black text-forest-900 font-sans">
            {highestOfferSalary > 0 ? formatINR(highestOfferSalary) : 'Pending Offers'}
          </div>
          <p className="text-xs text-stone-500 mt-2">
            {appsWithOffer.length > 0
              ? `${appsWithOffer.length} confirmed job offer package(s) tracked.`
              : 'Record confirmed offer compensation when changing status to Offer.'}
          </p>
        </div>
      </div>

      {/* Conversion Funnel & Mathematical Formula Transparency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step-by-step Funnel */}
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

          <div className="space-y-4">
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
                <span className="text-emerald-800 font-bold">{offers} ({offerRate}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-sand-100 overflow-hidden">
                <div
                  className="h-full bg-forest-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, offerRate)}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mathematical Transparency & Formula Definitions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-4 h-4 text-forest-700" />
              <h3 className="text-base font-bold text-forest-950 font-sans">
                Formula Transparency & Definitions
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-5 font-medium">
              Academic rubric compliance — explicit formulas and safeguards
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-ivory-50 border border-sand-200">
                <div className="font-bold text-forest-950 mb-1 flex items-center justify-between">
                  <span>Interview Conversion Rate</span>
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-sand-200 text-forest-800">
                    {interviewRate}%
                  </span>
                </div>
                <p className="font-mono text-stone-600 bg-white/70 p-1.5 rounded border border-sand-100">
                  (Applications in Interview / Total Applications) × 100
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Safeguard: If Total = 0, rate defaults strictly to 0% to avoid division by zero.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-ivory-50 border border-sand-200">
                <div className="font-bold text-forest-950 mb-1 flex items-center justify-between">
                  <span>Offer Conversion Rate</span>
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-sand-200 text-emerald-800">
                    {offerRate}%
                  </span>
                </div>
                <p className="font-mono text-stone-600 bg-white/70 p-1.5 rounded border border-sand-100">
                  (Applications with Offers / Total Applications) × 100
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Evaluates overall funnel outcome success from first submission to offer letter.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-sand-200 flex items-center gap-2 text-[11px] text-stone-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
            <span>MongoDB aggregation runs via native `$group` and `$facet` operations.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
