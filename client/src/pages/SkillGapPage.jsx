import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Trash2,
  Star,
  BookOpen,
} from 'lucide-react';
import prepService from '../api/prepService';

export const SkillGapPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('React, Node.js, Express, MongoDB, Docker, TypeScript, Git');
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // New Skill Modal / Inline Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');
  const [newSkillConfidence, setNewSkillConfidence] = useState(3);
  const [newSkillStatus, setNewSkillStatus] = useState('Proficient');

  const navigate = useNavigate();

  const loadSkills = async () => {
    try {
      const res = await prepService.getSkills();
      if (res?.data) {
        setSkills(res.data);
      }
    } catch (err) {
      console.error('Failed to load user skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      await prepService.addSkill({
        name: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: newSkillProficiency,
        confidenceScore: Number(newSkillConfidence),
        status: newSkillStatus,
      });
      setNewSkillName('');
      setShowAddModal(false);
      await loadSkills();
      if (gapAnalysis) handleRunGapAnalysis();
    } catch (err) {
      console.error('Failed to add skill', err);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await prepService.deleteSkill(id);
      setSkills(skills.filter((s) => s._id !== id));
      if (gapAnalysis) handleRunGapAnalysis();
    } catch (err) {
      console.error('Failed to delete skill', err);
    }
  };

  const handleRunGapAnalysis = async (e) => {
    if (e) e.preventDefault();
    setAnalyzing(true);
    const reqList = requiredSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await prepService.analyzeSkillGap({
        targetRole,
        requiredSkills: reqList,
      });
      if (res?.data) {
        setGapAnalysis(res.data);
      }
    } catch (err) {
      console.error('Failed to run gap analysis', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200/90"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-forest-800 text-xs font-semibold mb-2 shadow-sm">
            <Layers className="w-3.5 h-3.5" />
            <span>Curriculum Skills & Coverage Metric</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
            Skill Gap Analyzer
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
            Benchmark your declared engineering skills against industry requirements and calculate coverage.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-forest inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-soft"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </motion.div>

      {/* Gap Analysis Simulator Form */}
      <form onSubmit={handleRunGapAnalysis} className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-forest-950 font-sans flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-forest-700" />
          <span>Benchmark Configuration</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl clean-input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Required Skills (comma-separated)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={requiredSkillsInput}
                onChange={(e) => setRequiredSkillsInput(e.target.value)}
                placeholder="e.g. React, Node.js, Express, MongoDB, Docker, AWS"
                className="flex-1 px-3 py-2 text-xs rounded-xl clean-input"
              />
              <button
                type="submit"
                disabled={analyzing}
                className="btn-forest px-4 py-2 rounded-xl text-xs font-semibold shadow-soft whitespace-nowrap"
              >
                {analyzing ? 'Calculating...' : 'Run Gap Check'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Analysis Results Display */}
      {gapAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card">
              <span className="text-xs font-semibold text-stone-500">Curriculum Coverage</span>
              <div className="text-3xl font-black text-forest-950 mt-1 font-sans">
                {gapAnalysis.coveragePercentage}%
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {gapAnalysis.matchedSkillsCount} of {gapAnalysis.totalRequired} matched
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card">
              <span className="text-xs font-semibold text-stone-500">Fully Matched</span>
              <div className="text-3xl font-black text-emerald-800 mt-1 font-sans">
                {gapAnalysis.matchedSkillsCount}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">Intermediate or higher</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card">
              <span className="text-xs font-semibold text-stone-500">Partially Developed</span>
              <div className="text-3xl font-black text-amber-700 mt-1 font-sans">
                {gapAnalysis.partialSkillsCount}
              </div>
              <p className="text-[11px] text-amber-800 mt-1">Beginner level / needs practice</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card">
              <span className="text-xs font-semibold text-stone-500">Missing Gaps</span>
              <div className="text-3xl font-black text-rose-700 mt-1 font-sans">
                {gapAnalysis.missingSkillsCount}
              </div>
              <p className="text-[11px] text-rose-800 mt-1">Not in your active inventory</p>
            </div>
          </div>

          {/* Actionable Next Step: Generate Learning Roadmap */}
          {gapAnalysis.missingSkillsCount > 0 && (
            <div className="p-4 rounded-xl bg-forest-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft">
              <div>
                <h4 className="text-sm font-bold font-sans">Turn Missing Gaps into a Structured Learning Plan</h4>
                <p className="text-xs text-forest-200 mt-0.5">
                  Convert these {gapAnalysis.missingSkillsCount} skill gaps into weekly milestones with verified docs and practice tasks.
                </p>
              </div>
              <button
                onClick={() => navigate('/learning-plan')}
                className="px-4 py-2 rounded-xl bg-white text-forest-900 hover:bg-forest-50 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Build Learning Roadmap</span>
              </button>
            </div>
          )}

          {/* Details Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Missing Skills & Learning Actions */}
            <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
              <h4 className="text-sm font-bold text-rose-800 font-sans flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Missing Skills & Recommended Actions</span>
              </h4>
              <div className="space-y-2">
                {gapAnalysis.missing?.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs">
                    <span className="font-bold text-rose-950 block">{item.name}</span>
                    <span className="text-stone-600 mt-0.5 block">{item.recommendedAction}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Matched Skills */}
            <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
              <h4 className="text-sm font-bold text-emerald-800 font-sans flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Matched Skills in Profile</span>
              </h4>
              <div className="space-y-2">
                {gapAnalysis.matched?.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-950 block">{item.name}</span>
                      <span className="text-stone-500 text-[11px]">{item.evidence}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {item.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* User Skills Inventory Grid */}
      <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-forest-950 font-sans flex items-center justify-between">
          <span>Your Skills Inventory ({skills.length})</span>
          <span className="text-xs text-stone-400 font-normal">Persisted in MongoDB</span>
        </h3>

        {skills.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs">
            <Layers className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-stone-600">No skills registered yet</p>
            <p className="text-stone-400 mt-0.5">Click "Add Skill" above to build your engineering inventory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {skills.map((skill) => (
              <div
                key={skill._id}
                className="p-3.5 rounded-xl bg-ivory-50 border border-sand-200 flex items-center justify-between gap-2 group hover:border-forest-300 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-stone-900 font-sans">{skill.name}</h4>
                  <p className="text-[10px] text-stone-500">{skill.category} • {skill.proficiency}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-2.5 h-2.5 ${
                          idx < (skill.confidenceScore || 3)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSkill(skill._id)}
                  className="text-stone-300 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-sand-200 shadow-modal p-6 space-y-4">
            <h3 className="text-base font-bold text-forest-950 font-sans">Add Skill to Profile</h3>

            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Skill Name *</label>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. React, Docker, Redis, SQL"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl clean-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl clean-input bg-white"
                >
                  <option value="Programming Languages">Programming Languages</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Databases">Databases</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Core CS Fundamentals">Core CS Fundamentals</option>
                  <option value="Soft Skills">Soft Skills</option>
                  <option value="Tools & Others">Tools & Others</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Proficiency</label>
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl clean-input bg-white"
                >
                  <option value="Beginner">Beginner (Foundational)</option>
                  <option value="Intermediate">Intermediate (Independent)</option>
                  <option value="Advanced">Advanced (Production Experience)</option>
                  <option value="Expert">Expert (Architectural Mastery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Confidence Rating (1 to 5 Stars)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newSkillConfidence}
                  onChange={(e) => setNewSkillConfidence(e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                  <span>1 - Novice</span>
                  <span>{newSkillConfidence} Stars</span>
                  <span>5 - Confident</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-sand-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl btn-forest text-xs font-semibold shadow-soft"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapPage;
