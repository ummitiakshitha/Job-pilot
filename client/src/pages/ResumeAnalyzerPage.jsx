import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Briefcase,
  Trash2,
  Eye,
} from 'lucide-react';
import prepService from '../api/prepService';
import applicationService from '../api/applicationService';

export const ResumeAnalyzerPage = () => {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [appsRes, histRes] = await Promise.all([
          applicationService.getApplications({ limit: 50 }),
          prepService.getResumeAnalyses(),
        ]);
        if (appsRes?.data) setApplications(appsRes.data);
        if (histRes?.data) setHistory(histRes.data);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    fetchInit();
  }, []);

  const handleApplicationSelect = (e) => {
    const appId = e.target.value;
    setSelectedAppId(appId);
    if (!appId) return;
    const found = applications.find((a) => a._id === appId);
    if (found) {
      setTargetRole(found.role || targetRole);
      if (found.notes) setJobDescription(found.notes);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF document.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume to analyze.');
      return;
    }
    if (!targetRole.trim()) {
      setError('Please specify a target job role.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);
    if (jobDescription) formData.append('jobDescription', jobDescription);
    if (selectedAppId) formData.append('applicationId', selectedAppId);

    try {
      const res = await prepService.uploadAndAnalyzeResume(formData);
      if (res?.data) {
        setResult(res.data);
        // Refresh history
        const updatedHist = await prepService.getResumeAnalyses();
        if (updatedHist?.data) setHistory(updatedHist.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Analysis failed. Ensure PDF is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await prepService.deleteResumeAnalysis(id);
      setHistory(history.filter((h) => h._id !== id));
      if (result?._id === id) setResult(null);
    } catch (err) {
      console.error('Failed to delete history item:', err);
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
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Resume Parsing & Keyword Match</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
          AI Resume Analyzer & ATS Audit
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
          Extract skills, audit section formatting, and benchmark your resume against specific target roles.
        </p>
      </motion.div>

      {/* Main Form & Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column (1 Col) */}
        <div className="lg:col-span-1 space-y-5">
          <form onSubmit={handleAnalyze} className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-forest-950 font-sans flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-forest-700" />
              <span>Resume & Target Role</span>
            </h3>

            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Resume File (PDF only)
              </label>
              <div className="relative border-2 border-dashed border-sand-300 hover:border-forest-500 rounded-xl p-4 text-center transition-colors bg-ivory-50/50 cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileText className="w-8 h-8 text-forest-700 mx-auto mb-1" />
                <p className="text-xs font-semibold text-stone-800 truncate">
                  {file ? file.name : 'Click or drop PDF resume here'}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">Maximum file size 5MB</p>
              </div>
            </div>

            {/* Target Job Role */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Job Role *
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, DevOps Engineer"
                required
                className="w-full px-3 py-2 text-xs rounded-xl clean-input"
              />
            </div>

            {/* Link to existing application (optional) */}
            {applications.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Associate Application (Optional)
                </label>
                <select
                  value={selectedAppId}
                  onChange={handleApplicationSelect}
                  className="w-full px-3 py-2 text-xs rounded-xl clean-input bg-white"
                >
                  <option value="">— Select from tracked applications —</option>
                  {applications.map((app) => (
                    <option key={app._id} value={app._id}>
                      {app.company} — {app.role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Job Description Text */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Job Description / Keywords
              </label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities, required tech stack, or JD text..."
                className="w-full p-2.5 text-xs rounded-xl clean-input leading-relaxed"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-semibold shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Resume Audit</span>
                </>
              )}
            </button>
          </form>

          {/* Past Analyses History */}
          {history.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card space-y-2">
              <h4 className="text-xs font-bold text-forest-950 font-sans mb-2">Previous Analyses</h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setResult(item)}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      result?._id === item._id
                        ? 'bg-forest-50 border-forest-300 font-semibold'
                        : 'bg-ivory-50/50 border-sand-100 hover:bg-sand-50'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <p className="text-stone-900 truncate">{item.targetRole}</p>
                      <p className="text-[10px] text-stone-400">{item.filename}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-forest-800">{item.matchScore}%</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(item._id);
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Column (2 Cols) */}
        <div className="lg:col-span-2">
          {!result ? (
            <div className="p-12 rounded-2xl bg-white border border-sand-200 shadow-card text-center text-stone-400 space-y-3">
              <FileText className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-700 font-sans">Ready for Resume Analysis</h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Upload your PDF resume on the left to extract skills, review section completeness, calculate target keyword coverage, and generate actionable bullet-point improvements.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Score Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card">
                  <span className="text-xs font-semibold text-stone-500">Job-Match Score</span>
                  <div className="text-3xl font-black text-forest-950 mt-1 font-sans">
                    {result.matchScore}%
                  </div>
                  <p className="text-[11px] text-forest-700 font-medium mt-1">
                    Weighted heuristic match
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card">
                  <span className="text-xs font-semibold text-stone-500">Keyword Coverage</span>
                  <div className="text-3xl font-black text-emerald-800 mt-1 font-sans">
                    {result.keywordCoverage}%
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {result.matchedSkills?.length || 0} matched / {result.missingSkills?.length || 0} missing
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card">
                  <span className="text-xs font-semibold text-stone-500">Reading Time</span>
                  <div className="text-3xl font-black text-stone-800 mt-1 font-sans">
                    ~{result.formattingAudit?.readingTimeMinutes || 1} min
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {result.formattingAudit?.wordCount || 0} extracted words
                  </p>
                </div>
              </div>

              {/* Skills Match vs Missing */}
              <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
                <h3 className="text-sm font-bold text-forest-950 font-sans">Skill Breakdown & Keyword Coverage</h3>
                <div>
                  <span className="text-xs font-semibold text-emerald-800 block mb-2">
                    ✅ Matched Skills Detected ({result.matchedSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedSkills && result.matchedSkills.length > 0 ? (
                      result.matchedSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-400">None detected.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-rose-800 block mb-2">
                    ⚠️ Missing or Recommended Target Skills ({result.missingSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills && result.missingSkills.length > 0 ? (
                      result.missingSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-400">All target skills matched!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actionable Bullet-Point Improvements */}
              <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
                <h3 className="text-sm font-bold text-forest-950 font-sans flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-forest-700" />
                  <span>Actionable Bullet-Point Improvements (XYZ Framework)</span>
                </h3>
                <div className="space-y-3">
                  {result.bulletSuggestions?.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-ivory-50 border border-sand-200 space-y-2">
                      <div className="text-xs text-stone-500 line-through">
                        <span className="font-semibold text-rose-700 mr-1.5">Before:</span>
                        {item.original}
                      </div>
                      <div className="text-xs font-medium text-forest-950 bg-white p-2.5 rounded-lg border border-sand-200 shadow-sm">
                        <span className="font-bold text-forest-800 mr-1.5">Recommended:</span>
                        {item.improved}
                      </div>
                      <p className="text-[11px] text-stone-500 italic">
                        💡 {item.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prioritized Improvement Checklist */}
              <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
                <h3 className="text-sm font-bold text-forest-950 font-sans">Prioritized Improvement Checklist</h3>
                <div className="space-y-2">
                  {result.improvementChecklist?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory-50/70 border border-sand-200 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                        item.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : item.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {item.priority}
                      </span>
                      <div>
                        <span className="font-bold text-stone-900 block">{item.category}</span>
                        <span className="text-stone-600">{item.suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanatory Disclaimer */}
              <div className="p-4 rounded-xl bg-sand-100/60 border border-sand-200 text-[11px] text-stone-600 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-stone-500 flex-shrink-0" />
                <span>
                  {result.calculationNotes?.formula || 'Calculated via weighted heuristic evaluation'}. Scores represent structured rubric feedback and not guaranteed recruiter hiring selection.
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzerPage;
