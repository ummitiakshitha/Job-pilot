import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import prepService from '../api/prepService';

export const LearningRoadmapPage = () => {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generator form
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [missingSkillsInput, setMissingSkillsInput] = useState('Docker, System Design, MongoDB, Node.js');
  const [dailyHours, setDailyHours] = useState(2);
  const [generating, setGenerating] = useState(false);

  const loadPlans = async () => {
    try {
      const res = await prepService.getLearningPlans();
      if (res?.data && res.data.length > 0) {
        setPlans(res.data);
        setActivePlan(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setGenerating(true);

    const skills = missingSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await prepService.generateLearningPlan({
        targetRole,
        missingSkills: skills,
        dailyHours: Number(dailyHours),
      });

      if (res?.data) {
        setPlans([res.data, ...plans]);
        setActivePlan(res.data);
      }
    } catch (err) {
      console.error('Failed to generate plan', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (planId, taskId) => {
    try {
      const res = await prepService.toggleTaskCompletion(planId, taskId);
      if (res?.data && activePlan) {
        const updatedModules = activePlan.modules.map((m) => ({
          ...m,
          tasks: m.tasks.map((t) => (t._id === taskId ? res.data.task : t)),
        }));
        setActivePlan({
          ...activePlan,
          modules: updatedModules,
          overallProgress: res.data.overallProgress,
        });
      }
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      await prepService.deleteLearningPlan(planId);
      const remaining = plans.filter((p) => p._id !== planId);
      setPlans(remaining);
      setActivePlan(remaining.length > 0 ? remaining[0] : null);
    } catch (err) {
      console.error('Failed to delete plan', err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-4 border-b border-sand-200/90"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-forest-800 text-xs font-semibold mb-2 shadow-sm">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curriculum Roadmaps & Milestone Tracking</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
          Personalized Skill Improver & Roadmap
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
          Convert skill gaps into weekly modules, practical coding tasks, and milestone check-ins with verified documentation links.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator & Plan Selector (1 Col) */}
        <div className="lg:col-span-1 space-y-5">
          <form onSubmit={handleGeneratePlan} className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-forest-950 font-sans flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest-700" />
              <span>Generate Roadmap</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl clean-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Missing Skills
              </label>
              <input
                type="text"
                value={missingSkillsInput}
                onChange={(e) => setMissingSkillsInput(e.target.value)}
                placeholder="e.g. Docker, TypeScript, Microservices"
                required
                className="w-full px-3 py-2 text-xs rounded-xl clean-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Daily Study Commitment ({dailyHours} hrs/day)
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={dailyHours}
                onChange={(e) => setDailyHours(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>1 hr/day</span>
                <span>3 hrs/day</span>
                <span>6 hrs/day</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-semibold shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Building Plan...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Build Learning Plan</span>
                </>
              )}
            </button>
          </form>

          {/* Saved Roadmaps */}
          {plans.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card space-y-2">
              <h4 className="text-xs font-bold text-forest-950 font-sans mb-2">Saved Roadmaps ({plans.length})</h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {plans.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => setActivePlan(p)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      activePlan?._id === p._id
                        ? 'bg-forest-50 border-forest-300 font-semibold'
                        : 'bg-ivory-50/50 border-sand-100 hover:bg-sand-50'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <p className="text-stone-900 truncate">{p.title}</p>
                      <p className="text-[10px] text-stone-400">Progress: {p.overallProgress || 0}%</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(p._id);
                      }}
                      className="text-stone-300 hover:text-rose-600 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Roadmap Display (2 Cols) */}
        <div className="lg:col-span-2">
          {!activePlan ? (
            <div className="p-12 rounded-2xl bg-white border border-sand-200 shadow-card text-center text-stone-400 space-y-3">
              <Compass className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-700 font-sans">No Active Roadmap Selected</h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Generate a learning roadmap on the left to structure your skill gap preparation into weekly milestones and hands-on coding tasks.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Overall Progress Banner */}
              <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-forest-950 font-sans">{activePlan.title}</h2>
                    <p className="text-xs text-stone-500">
                      Target Role: <span className="font-semibold text-stone-800">{activePlan.targetRole}</span> • {activePlan.dailyHoursCommitment}h per day
                    </p>
                  </div>
                  <span className="text-2xl font-black text-forest-900 font-sans">
                    {activePlan.overallProgress || 0}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full bg-sand-100 overflow-hidden">
                  <div
                    className="h-full bg-forest-600 rounded-full transition-all duration-500"
                    style={{ width: `${activePlan.overallProgress || 0}%` }}
                  />
                </div>
              </div>

              {/* Weekly Modules */}
              <div className="space-y-4">
                {activePlan.modules?.map((mod, modIdx) => (
                  <div key={modIdx} className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
                    <div className="border-b border-sand-100 pb-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-forest-800 uppercase tracking-wider bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                          Week {mod.weekNumber}
                        </span>
                        <h3 className="text-sm font-bold text-forest-950 mt-1 font-sans">{mod.title}</h3>
                        <p className="text-xs text-stone-500">{mod.goal}</p>
                      </div>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-3">
                      {mod.tasks?.map((task) => (
                        <div
                          key={task._id}
                          className={`p-4 rounded-xl border transition-all ${
                            task.completed
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-ivory-50/70 border-sand-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={!!task.completed}
                              onChange={() => handleToggleTask(activePlan._id, task._id)}
                              className="w-4 h-4 mt-0.5 rounded text-forest-800 focus:ring-forest-600 cursor-pointer"
                            />
                            <div className="flex-1">
                              <h4 className={`text-xs font-bold font-sans ${task.completed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                                {task.title}
                              </h4>
                              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                                {task.description}
                              </p>

                              {/* Documentation resource link */}
                              {task.resourceUrl && (
                                <a
                                  href={task.resourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 hover:text-forest-900 hover:underline mt-2"
                                >
                                  <span>{task.resourceTitle || 'Official Documentation Guide'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}

                              {/* Self assessment */}
                              {task.selfAssessmentQuestion && (
                                <div className="p-2.5 rounded-lg bg-white/80 border border-sand-200 text-[11px] text-stone-700 mt-2.5">
                                  <span className="font-bold text-forest-900 block mb-0.5">Self-Assessment Check:</span>
                                  {task.selfAssessmentQuestion}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningRoadmapPage;
