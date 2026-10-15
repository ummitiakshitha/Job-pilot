import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Layers,
  BookOpen,
  Code2,
  Calendar,
} from 'lucide-react';
import prepService from '../api/prepService';

export const CareerReadinessPage = () => {
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const res = await prepService.getCareerReadiness();
        if (res?.data) {
          setReadiness(res.data);
        }
      } catch (err) {
        console.error('Failed to load career readiness', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReadiness();
  }, []);

  const compositeScore = readiness?.compositeScore || 0;
  const metrics = readiness?.metrics || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-4 border-b border-sand-200/90"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-forest-800 text-xs font-semibold mb-2 shadow-sm">
          <Compass className="w-3.5 h-3.5" />
          <span>Cross-Module Preparation Index</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
          Career Readiness Dashboard
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
          Holistic view combining your tracked job applications, resume audits, skill gap metrics, mock interview scores, and coding practice.
        </p>
      </motion.div>

      {/* Main Readiness Hero Banner */}
      <div className="p-8 rounded-3xl bg-forest-950 text-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900 border border-forest-800 text-forest-200 text-xs font-semibold">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Composite Preparation Index</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
            Placement Readiness: {compositeScore}%
          </h2>
          <p className="text-xs md:text-sm text-forest-200/80 leading-relaxed">
            Calculated across your active resume match, verified skills inventory, completed roadmap milestones, simulated interview drills, and solved practice questions.
          </p>
        </div>

        {/* Ring / Circular Gauge representation */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-forest-900/60 border border-forest-800 text-center flex-shrink-0 min-w-[180px]">
          <span className="text-4xl font-black font-sans text-emerald-400">{compositeScore}%</span>
          <span className="text-xs font-bold text-forest-300 mt-1 uppercase tracking-wider">
            {compositeScore >= 75 ? 'Strong Readiness' : compositeScore >= 50 ? 'Moderate Progress' : 'Early Stage'}
          </span>
        </div>
      </div>

      {/* 5 Core Contributing Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Pillar 1: Resume */}
        <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                25% Weight
              </span>
              <FileText className="w-4 h-4 text-forest-700" />
            </div>
            <span className="text-xs font-bold text-stone-600 block">Resume Audit</span>
            <div className="text-2xl font-black text-forest-950 mt-1 font-sans">
              {metrics.resumeScore || 0}%
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            {metrics.resumeCount > 0 ? `${metrics.resumeCount} audit(s) completed` : 'No resume uploaded'}
          </p>
        </div>

        {/* Pillar 2: Skill Coverage */}
        <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                25% Weight
              </span>
              <Layers className="w-4 h-4 text-forest-700" />
            </div>
            <span className="text-xs font-bold text-stone-600 block">Skill Coverage</span>
            <div className="text-2xl font-black text-forest-950 mt-1 font-sans">
              {metrics.skillCoverage || 0}%
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            {metrics.totalSkills || 0} skills registered
          </p>
        </div>

        {/* Pillar 3: Learning Roadmap */}
        <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                20% Weight
              </span>
              <BookOpen className="w-4 h-4 text-forest-700" />
            </div>
            <span className="text-xs font-bold text-stone-600 block">Learning Roadmap</span>
            <div className="text-2xl font-black text-forest-950 mt-1 font-sans">
              {metrics.learningPlanProgress || 0}%
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            {metrics.hasActivePlan ? 'Active plan in progress' : 'No plan created'}
          </p>
        </div>

        {/* Pillar 4: Mock Interviews */}
        <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                15% Weight
              </span>
              <Award className="w-4 h-4 text-forest-700" />
            </div>
            <span className="text-xs font-bold text-stone-600 block">Mock Interviews</span>
            <div className="text-2xl font-black text-forest-950 mt-1 font-sans">
              {metrics.averageInterviewScore || 0}%
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            {metrics.interviewCount || 0} session(s) completed
          </p>
        </div>

        {/* Pillar 5: Practice Lab */}
        <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                15% Weight
              </span>
              <Code2 className="w-4 h-4 text-forest-700" />
            </div>
            <span className="text-xs font-bold text-stone-600 block">Practice Solved</span>
            <div className="text-2xl font-black text-forest-950 mt-1 font-sans">
              {metrics.practiceProgress || 0}%
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            {metrics.solvedQuestions || 0} question(s) mastered
          </p>
        </div>
      </div>

      {/* Recommended Next Actions */}
      <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
        <h3 className="text-base font-bold text-forest-950 font-sans flex items-center justify-between">
          <span>Personalized Priority Action Plan</span>
          <span className="text-xs text-stone-500 font-normal">Derived from identified gaps</span>
        </h3>

        <div className="space-y-3">
          {readiness?.recommendedActions && readiness.recommendedActions.length > 0 ? (
            readiness.recommendedActions.map((action, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-ivory-50 border border-sand-200 hover:border-forest-300 flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 mt-0.5 ${
                    action.priority === 'Urgent'
                      ? 'bg-rose-100 text-rose-800'
                      : action.priority === 'High'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-forest-100 text-forest-800'
                  }`}>
                    {action.priority}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 font-sans">{action.title}</h4>
                    <span className="text-[11px] text-stone-500">{action.module}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(action.path)}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-sand-200 hover:border-forest-400 text-xs font-semibold text-forest-800 inline-flex items-center gap-1 shadow-soft"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-400 py-4 text-center">All recommended actions completed!</p>
          )}
        </div>
      </div>

      {/* Academic Rubric Disclaimer */}
      <div className="p-4 rounded-xl bg-sand-100/60 border border-sand-200 text-[11px] text-stone-600 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-stone-500 flex-shrink-0" />
        <span>
          {readiness?.disclaimer || 'Composite readiness measures tangible preparation progress across modules. It is an index of curriculum completeness and effort, not a guaranteed predictor of hiring selection.'}
        </span>
      </div>
    </div>
  );
};

export default CareerReadinessPage;
