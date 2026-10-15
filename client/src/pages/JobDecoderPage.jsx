import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileCode,
  Sparkles,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Send,
  Trash2,
  AlertCircle,
  Building,
  GraduationCap,
  Clock,
  Code2,
} from 'lucide-react';
import prepService from '../api/prepService';
import applicationService from '../api/applicationService';

export const JobDecoderPage = () => {
  const [rawText, setRawText] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [loading, setLoading] = useState(false);
  const [decoded, setDecoded] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [appsRes, jdsRes] = await Promise.all([
          applicationService.getApplications({ limit: 50 }),
          prepService.getJobDescriptions(),
        ]);
        if (appsRes?.data) setApplications(appsRes.data);
        if (jdsRes?.data) setHistory(jdsRes.data);
      } catch (err) {
        console.error('Failed to load decoded JDs', err);
      }
    };
    load();
  }, []);

  const handleSelectApp = (e) => {
    const id = e.target.value;
    setSelectedAppId(id);
    if (!id) return;
    const found = applications.find((a) => a._id === id);
    if (found) {
      setTitle(found.role || '');
      setCompany(found.company || '');
      if (found.notes) setRawText(found.notes);
    }
  };

  const handleDecode = async (e) => {
    e.preventDefault();
    if (!rawText.trim() || rawText.trim().length < 20) {
      setError('Please provide at least 20 characters of job description text.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await prepService.decodeJobDescription({
        rawText,
        title: title || 'Software Engineer',
        company: company || 'Target Company',
        applicationId: selectedAppId || null,
      });

      if (res?.data) {
        setDecoded(res.data);
        const updated = await prepService.getJobDescriptions();
        if (updated?.data) setHistory(updated.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to decode job description.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await prepService.deleteJobDescription(id);
      setHistory(history.filter((h) => h._id !== id));
      if (decoded?._id === id) setDecoded(null);
    } catch (err) {
      console.error('Failed to delete decoded JD', err);
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
          <FileCode className="w-3.5 h-3.5" />
          <span>Job Description Parser & Requirement Categorization</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
          Job Description Decoder
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
          Extract required skills, technical concepts, and responsibilities directly into actionable preparation tracks.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column (1 Col) */}
        <div className="lg:col-span-1 space-y-5">
          <form onSubmit={handleDecode} className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-forest-950 font-sans flex items-center gap-2">
              <Code2 className="w-4 h-4 text-forest-700" />
              <span>Input Job Details</span>
            </h3>

            {/* Associate with application */}
            {applications.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Load from Application (Optional)
                </label>
                <select
                  value={selectedAppId}
                  onChange={handleSelectApp}
                  className="w-full px-3 py-2 text-xs rounded-xl clean-input bg-white"
                >
                  <option value="">— Choose tracked application —</option>
                  {applications.map((app) => (
                    <option key={app._id} value={app._id}>
                      {app.company} — {app.role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 text-xs rounded-xl clean-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Razorpay"
                className="w-full px-3 py-2 text-xs rounded-xl clean-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Raw Job Description Text *
              </label>
              <textarea
                rows={7}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the full job posting, bullet requirements, tech qualifications, or role description..."
                required
                className="w-full p-3 text-xs rounded-xl clean-input leading-relaxed"
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
              disabled={loading || !rawText.trim()}
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-semibold shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Decoding Requirements...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Decode Job Description</span>
                </>
              )}
            </button>
          </form>

          {/* Decoded History */}
          {history.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card space-y-2">
              <h4 className="text-xs font-bold text-forest-950 font-sans mb-2">Saved JDs ({history.length})</h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setDecoded(item)}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      decoded?._id === item._id
                        ? 'bg-forest-50 border-forest-300 font-semibold'
                        : 'bg-ivory-50/50 border-sand-100 hover:bg-sand-50'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <p className="text-stone-900 truncate">{item.title}</p>
                      <p className="text-[10px] text-stone-400">{item.company}</p>
                    </div>
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
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Decoded Output (2 Cols) */}
        <div className="lg:col-span-2">
          {!decoded ? (
            <div className="p-12 rounded-2xl bg-white border border-sand-200 shadow-card text-center text-stone-400 space-y-3">
              <FileCode className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-700 font-sans">No Decoded Job Description Loaded</h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Paste any job description on the left to extract required skills, experience thresholds, technical concepts, and connect them directly to your learning roadmap.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Top Banner & Quick Actions */}
              <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                    {decoded.company || 'Target Company'}
                  </span>
                  <h2 className="text-xl font-bold text-forest-950 mt-1 font-sans">
                    {decoded.title || decoded.extracted?.jobTitle}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => navigate('/skill-gap')}
                    className="px-3 py-1.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-semibold border border-forest-200 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Check Skill Gap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate('/interview-coach')}
                    className="px-3 py-1.5 rounded-xl btn-forest text-xs font-semibold shadow-soft inline-flex items-center gap-1.5"
                  >
                    <span>Mock Interview</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Skills Extraction Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
                  <h4 className="text-xs font-bold text-forest-950 font-sans flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Required Technical Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {decoded.extracted?.requiredSkills?.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
                  <h4 className="text-xs font-bold text-forest-950 font-sans flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Preferred / Bonus Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {decoded.extracted?.preferredSkills?.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experience & Education Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-sand-200 shadow-card flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-stone-500 uppercase">Experience Requirement</span>
                    <p className="text-xs font-semibold text-forest-950 mt-0.5">
                      {decoded.extracted?.experienceRequirements || 'Not explicitly specified'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-sand-200 shadow-card flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-stone-500 uppercase">Education Threshold</span>
                    <p className="text-xs font-semibold text-forest-950 mt-0.5">
                      {decoded.extracted?.educationRequirements || 'Bachelor’s degree or equivalent experience'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Responsibilities */}
              <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
                <h4 className="text-xs font-bold text-forest-950 font-sans">Core Role Responsibilities</h4>
                <ul className="space-y-2">
                  {decoded.extracted?.responsibilities?.map((item, i) => (
                    <li key={i} className="text-xs text-stone-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-600 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDecoderPage;
