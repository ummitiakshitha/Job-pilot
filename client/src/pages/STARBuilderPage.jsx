import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';
import prepService from '../api/prepService';

export const STARBuilderPage = () => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [competency, setCompetency] = useState('Problem Solving & Debugging');
  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');
  const [tagsInput, setTagsInput] = useState('Full Stack, Performance');
  const [submitting, setSubmitting] = useState(false);

  const loadAnswers = async () => {
    try {
      const res = await prepService.getSTARAnswers();
      if (res?.data) setAnswers(res.data);
    } catch (err) {
      console.error('Failed to load STAR answers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnswers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await prepService.createSTARAnswer({
        title,
        competency,
        situation,
        task,
        action,
        result,
        tags,
      });

      if (res?.data) {
        setAnswers([res.data, ...answers]);
        setTitle('');
        setSituation('');
        setTask('');
        setAction('');
        setResult('');
      }
    } catch (err) {
      console.error('Failed to create STAR story', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await prepService.deleteSTARAnswer(id);
      setAnswers(answers.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Failed to delete STAR story', err);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Live preview metrics check
  const hasNumbers = /\b\d+(?:\.\d+)?%?|\b(?:doubled|halved|reduced|increased)\b/i.test(`${action} ${result}`);

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
          <span>Behavioral Framework & Metric Quantification</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
          STAR Answer Story Builder
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
          Draft compelling behavioral interview narratives with clear Situation, Task, Action, and Result structures.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form Column */}
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-forest-950 font-sans">New Behavioral Story</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Story Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Debugged Production Query Latency"
                required
                className="w-full px-3 py-2 text-xs rounded-xl clean-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Target Competency</label>
              <select
                value={competency}
                onChange={(e) => setCompetency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl clean-input bg-white"
              >
                <option value="Problem Solving & Debugging">Problem Solving & Debugging</option>
                <option value="Leadership & Mentorship">Leadership & Mentorship</option>
                <option value="Conflict Resolution & Compromise">Conflict Resolution & Compromise</option>
                <option value="System Scalability & Performance">System Scalability & Performance</option>
                <option value="Deadline & Critical Delivery">Deadline & Critical Delivery</option>
              </select>
            </div>
          </div>

          {/* S - Situation */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-stone-800">[S] Situation — Context & Challenge</span>
              <span className="text-[10px] text-stone-400">Where were you? What was the problem?</span>
            </div>
            <textarea
              rows={2}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="e.g. During our college capstone project, our backend started timing out under concurrent users..."
              required
              className="w-full p-2.5 text-xs rounded-xl clean-input"
            />
          </div>

          {/* T - Task */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-stone-800">[T] Task — Your Responsibility</span>
              <span className="text-[10px] text-stone-400">What were you specifically responsible for?</span>
            </div>
            <textarea
              rows={2}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. As the backend lead, I was tasked with diagnosing the database bottlenecks without downtime..."
              required
              className="w-full p-2.5 text-xs rounded-xl clean-input"
            />
          </div>

          {/* A - Action */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-stone-800">[A] Action — Steps You Took</span>
              <span className="text-[10px] text-stone-400">What tools, techniques, and steps did you take?</span>
            </div>
            <textarea
              rows={3}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. I analyzed query profiles using explain(), implemented compound indexes, and introduced Redis caching..."
              required
              className="w-full p-2.5 text-xs rounded-xl clean-input"
            />
          </div>

          {/* R - Result */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-stone-800">[R] Result — Outcome & Measurement</span>
              <span className="text-[10px] text-stone-400">What was the quantifiable impact and lesson?</span>
            </div>
            <textarea
              rows={2}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="e.g. Reduced API latency by 65%, successfully sustained 1,000 active sessions, and documented the indexing pattern..."
              required
              className="w-full p-2.5 text-xs rounded-xl clean-input"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. MongoDB, Redis, Optimization"
              className="w-full px-3 py-2 text-xs rounded-xl clean-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl btn-forest text-xs font-semibold shadow-soft flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save STAR Story</span>
          </button>
        </form>

        {/* Live Preview & Saved Stories */}
        <div className="space-y-6">
          {/* Live Preview Card */}
          <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-sand-100 pb-2">
              <h4 className="text-xs font-bold text-forest-950 font-sans">Live Combined Preview</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                hasNumbers ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {hasNumbers ? '✓ Quantifiable Metric Detected' : '⚠️ Add numbers/percentages'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-ivory-50 border border-sand-200 text-xs text-stone-800 leading-relaxed space-y-2">
              <p><strong className="text-forest-900">[Situation]:</strong> {situation || 'Context description...'}</p>
              <p><strong className="text-forest-900">[Task]:</strong> {task || 'Your objective...'}</p>
              <p><strong className="text-forest-900">[Action]:</strong> {action || 'Execution steps taken...'}</p>
              <p><strong className="text-forest-900">[Result]:</strong> {result || 'Outcome and business impact...'}</p>
            </div>
          </div>

          {/* Saved Stories List */}
          <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
            <h4 className="text-xs font-bold text-forest-950 font-sans">Saved Behavioral Stories ({answers.length})</h4>
            {answers.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No stories saved yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {answers.map((item) => (
                  <div key={item._id} className="p-4 rounded-xl bg-ivory-50/70 border border-sand-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-forest-950 font-sans">{item.title}</h5>
                        <span className="text-[10px] text-stone-500">{item.competency}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(item._id, item.combinedAnswer)}
                          className="p-1 rounded text-stone-400 hover:text-forest-800 hover:bg-sand-100"
                          title="Copy Full Story"
                        >
                          {copiedId === item._id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-700 whitespace-pre-line leading-relaxed bg-white p-2.5 rounded-lg border border-sand-200">
                      {item.combinedAnswer}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                      <span>Score: <strong className="text-forest-800">{item.completenessScore || 0}%</strong></span>
                      <div className="flex gap-1">
                        {item.tags?.map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-sand-100 text-stone-600">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default STARBuilderPage;
