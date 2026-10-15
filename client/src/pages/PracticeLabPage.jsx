import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  CheckCircle2,
  Bookmark,
  Star,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
} from 'lucide-react';
import prepService from '../api/prepService';

export const PracticeLabPage = () => {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [notes, setNotes] = useState({});

  const topics = [
    'All',
    'Data Structures & Algorithms',
    'DBMS & SQL',
    'Operating Systems',
    'Computer Networks',
    'Object-Oriented Programming',
    'Full Stack & Web Dev',
    'JavaScript & React',
    'System Design',
  ];

  const loadData = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        prepService.getPracticeQuestions({
          topic: selectedTopic !== 'All' ? selectedTopic : undefined,
          difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
        }),
        prepService.getPracticeStats(),
      ]);

      if (qRes?.data) setQuestions(qRes.data);
      if (sRes?.data) setStats(sRes.data);
    } catch (err) {
      console.error('Failed to load practice questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTopic, selectedDifficulty]);

  const handleMarkStatus = async (question, status) => {
    try {
      await prepService.recordPracticeAttempt({
        questionId: question.id,
        topic: question.topic,
        difficulty: question.difficulty,
        status,
        userNotes: notes[question.id] || question.userNotes || '',
      });

      // Optimistic update
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? { ...q, userStatus: status } : q))
      );
      // Reload stats
      const sRes = await prepService.getPracticeStats();
      if (sRes?.data) setStats(sRes.data);
    } catch (err) {
      console.error('Failed to update attempt', err);
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
          <Code2 className="w-3.5 h-3.5" />
          <span>Curated Engineering Drills & Solved Tracking</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
          Technical Interview Practice Lab
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
          Master high-yield core CS fundamentals, algorithms, database mechanisms, and architecture patterns.
        </p>
      </motion.div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card">
          <span className="text-xs font-semibold text-stone-500">Solved Questions</span>
          <div className="text-3xl font-black text-forest-950 mt-1 font-sans">
            {stats?.solvedCount || 0} / {stats?.totalQuestions || 10}
          </div>
          <p className="text-[11px] text-forest-700 font-medium mt-1">
            {stats?.progressPercent || 0}% Completed
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card">
          <span className="text-xs font-semibold text-stone-500">Bookmarked for Revision</span>
          <div className="text-3xl font-black text-amber-700 mt-1 font-sans">
            {stats?.bookmarkedCount || 0}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Pinned high-yield topics</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sand-200 shadow-card">
          <span className="text-xs font-semibold text-stone-500">Practice Modules</span>
          <div className="text-3xl font-black text-stone-800 mt-1 font-sans">8 Topics</div>
          <p className="text-[11px] text-stone-500 mt-1">DSA, DBMS, OS, Networks, OOP, System Design</p>
        </div>
      </div>

      {/* Topic Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTopic === t
                ? 'bg-forest-900 text-white shadow-soft'
                : 'bg-white border border-sand-200 text-stone-600 hover:text-stone-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-sand-200 shadow-card text-center text-stone-400">
            <p className="text-xs">No questions found matching the selected filter.</p>
          </div>
        ) : (
          questions.map((q) => {
            const isExpanded = expandedId === q.id;
            const isSolved = q.userStatus === 'Solved';
            const isBookmarked = q.userStatus === 'Bookmarked';

            return (
              <div
                key={q.id}
                className={`p-6 rounded-2xl bg-white border transition-all shadow-card ${
                  isSolved ? 'border-emerald-200' : 'border-sand-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-100">
                        {q.topic}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-forest-950 font-sans mt-1">{q.title}</h3>
                  </div>

                  {/* Action Badges */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleMarkStatus(q, isBookmarked ? 'Unattempted' : 'Bookmarked')}
                      className={`p-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                        isBookmarked
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'border-sand-200 text-stone-500 hover:bg-sand-50'
                      }`}
                      title="Bookmark Question"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleMarkStatus(q, isSolved ? 'Unattempted' : 'Solved')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                        isSolved
                          ? 'bg-emerald-600 text-white shadow-soft'
                          : 'bg-ivory-50 border border-sand-200 text-stone-700 hover:border-forest-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isSolved ? 'Solved' : 'Mark Solved'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-700 mt-3 leading-relaxed">
                  {q.description}
                </p>

                {/* Expand Toggle */}
                <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="text-xs font-semibold text-forest-700 hover:text-forest-900 inline-flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Solution & Hint' : 'View Hint & Solution Explanation'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expanded Solution Panel */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 space-y-3 pt-3 border-t border-sand-100"
                  >
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                      <span className="font-bold text-amber-900 block mb-0.5">💡 Hint & Architectural Clue:</span>
                      <p className="text-stone-700 leading-relaxed">{q.hint}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-ivory-50 border border-sand-200 text-xs space-y-1.5">
                      <span className="font-bold text-forest-950 block">Formal Solution & Complexity Analysis:</span>
                      <p className="text-stone-700 leading-relaxed">{q.solutionExplanation}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PracticeLabPage;
