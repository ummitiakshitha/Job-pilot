import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  RefreshCw,
  Play,
  RotateCcw,
} from 'lucide-react';
import prepService from '../api/prepService';

export const InterviewCoachPage = () => {
  // Session states
  const [session, setSession] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [submitting, setSubmitting] = useState(false);
  const [lastEval, setLastEval] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState([]);

  // Config setup
  const [role, setRole] = useState('Full Stack Software Engineer');
  const [company, setCompany] = useState('Google');
  const [type, setType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(3);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await prepService.getInterviews();
        if (res?.data) setHistory(res.data);
      } catch (err) {
        console.error('Failed to load past interviews', err);
      }
    };
    fetchHistory();
  }, []);

  // Timer countdown hook
  useEffect(() => {
    let timer;
    if (inProgress && timeLeft > 0 && !lastEval) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [inProgress, timeLeft, lastEval]);

  // Speech Recognition setup (Web Speech API)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser speech recognition is not supported in this browser. Typed answers are fully enabled.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join(' ');
        setUserAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error', err);
      setIsListening(false);
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    try {
      const res = await prepService.startInterview({
        targetRole: role,
        company,
        interviewType: type,
        difficulty,
        questionCount: Number(questionCount),
        timeAllowedPerQuestion: 180,
      });

      if (res?.data) {
        setSession(res.data);
        setInProgress(true);
        setCurrentIdx(0);
        setUserAnswer('');
        setTimeLeft(180);
        setLastEval(null);
      }
    } catch (err) {
      console.error('Failed to start interview', err);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      const timeSpent = 180 - timeLeft;
      const res = await prepService.submitAnswer(session._id, {
        questionIndex: currentIdx,
        answerText: userAnswer,
        timeSpentSeconds: timeSpent,
      });

      if (res?.data) {
        setLastEval(res.data.evaluation);
      }
    } catch (err) {
      console.error('Failed to submit answer', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!session) return;
    if (currentIdx < session.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setUserAnswer('');
      setTimeLeft(180);
      setLastEval(null);
    } else {
      handleCompleteSession();
    }
  };

  const handleCompleteSession = async () => {
    if (!session) return;
    try {
      const res = await prepService.completeInterview(session._id);
      if (res?.data) {
        setSession(res.data);
        setInProgress(false);
        setLastEval(null);
        // refresh history
        const updated = await prepService.getInterviews();
        if (updated?.data) setHistory(updated.data);
      }
    } catch (err) {
      console.error('Failed to complete interview', err);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
          <span>Interactive Mock Simulator & Rubric Feedback</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
          AI Interview Coach & Live Mock Room
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
          Practice high-pressure technical, behavioral, and HR questions with instant rubric-based evaluation.
        </p>
      </motion.div>

      {!inProgress && (!session || session.status === 'Completed') ? (
        /* Configuration & Setup Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleStartSession} className="lg:col-span-1 p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-forest-950 font-sans flex items-center gap-2">
              <Play className="w-4 h-4 text-forest-700" />
              <span>Configure Mock Session</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Target Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl clean-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Target Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl clean-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Interview Format</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl clean-input bg-white"
              >
                <option value="Technical">Technical (Core CS, System Design, Algorithms)</option>
                <option value="Behavioral">Behavioral (STAR Stories, Leadership, Conflict)</option>
                <option value="HR">HR & Situational (Culture, Goals, Working Style)</option>
                <option value="Comprehensive">Comprehensive Mixed Round</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl clean-input bg-white"
              >
                <option value="Beginner">Beginner (Foundational)</option>
                <option value="Intermediate">Intermediate (Standard College Placement)</option>
                <option value="Advanced">Advanced (High-Tier Product Companies)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Questions Count</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl clean-input bg-white"
              >
                <option value={2}>2 Questions (Quick 6-min Drill)</option>
                <option value={3}>3 Questions (Standard Round)</option>
                <option value={5}>5 Questions (Comprehensive Mock)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl btn-forest text-xs font-semibold shadow-soft flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Enter Mock Interview Room</span>
            </button>
          </form>

          {/* Past Sessions Performance Feed (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card">
              <h3 className="text-sm font-bold text-forest-950 font-sans mb-3 flex items-center justify-between">
                <span>Recent Mock Interview Attempts ({history.length})</span>
                <span className="text-xs text-stone-400 font-normal">Stored in MongoDB</span>
              </h3>

              {history.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  <Award className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="font-semibold text-stone-600">No mock rounds completed yet</p>
                  <p className="text-stone-400 mt-0.5">Start a session on the left to practice answering real questions under timer pressure.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((sess) => (
                    <div key={sess._id} className="p-4 rounded-xl bg-ivory-50 border border-sand-200 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-forest-950 font-sans">{sess.targetRole}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                            {sess.interviewType}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          {sess.company} • {sess.questions?.length} Questions • {new Date(sess.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xl font-black text-forest-900 font-sans">{sess.overallScore}%</span>
                        <p className="text-[10px] text-stone-400">Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Active Mock Interview Room */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Header Bar in Room */}
          <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-forest-100 text-forest-800">
                Question {currentIdx + 1} of {session?.questions?.length}
              </span>
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                {session?.targetRole} ({session?.interviewType})
              </span>
            </div>

            {/* Countdown Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-sm font-bold border ${
              timeLeft < 30 ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' : 'bg-ivory-50 border-sand-200 text-stone-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          </div>

          {/* Current Question Card */}
          <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
              {session?.questions[currentIdx]?.category || 'Technical Prompt'}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-forest-950 font-sans leading-snug">
              {session?.questions[currentIdx]?.questionText}
            </h2>
          </div>

          {/* Answer Input Area */}
          {!lastEval ? (
            <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">Your Answer (Speak or Type)</label>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-sand-100 text-stone-700 hover:bg-sand-200'
                  }`}
                  title="Voice input via browser microphone"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your response here... (Structure with situation/action/result or technical mechanisms)"
                className="w-full p-3.5 text-xs rounded-xl clean-input leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-stone-400">
                  {userAnswer.split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !userAnswer.trim()}
                  className="px-6 py-2.5 rounded-xl btn-forest text-xs font-semibold shadow-soft inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Evaluating Rubrics...' : 'Submit Answer'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Rubric Feedback Card */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4"
            >
              <div className="flex items-center justify-between border-b border-sand-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-forest-950 font-sans">Answer Evaluation & Rubrics</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-forest-900 font-sans">{lastEval.score}%</span>
                  <span className="text-xs text-stone-500 block">Rubric Score</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                  <span className="font-bold text-emerald-950 block">Key Strengths</span>
                  {lastEval.strengths?.map((s, i) => (
                    <p key={i} className="text-stone-700">• {s}</p>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-amber-950 block">Improvement Areas</span>
                  {lastEval.improvements?.map((imp, i) => (
                    <p key={i} className="text-stone-700">• {imp}</p>
                  ))}
                </div>
              </div>

              {lastEval.modelAnswer && (
                <div className="p-4 rounded-xl bg-ivory-50 border border-sand-200 text-xs space-y-1.5">
                  <span className="font-bold text-forest-950 block">Exemplary Model Answer:</span>
                  <p className="text-stone-700 leading-relaxed">{lastEval.modelAnswer}</p>
                </div>
              )}

              <div className="flex justify-end pt-3">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl btn-forest text-xs font-semibold shadow-soft inline-flex items-center gap-2"
                >
                  <span>{currentIdx < (session?.questions?.length || 1) - 1 ? 'Next Question' : 'Finish Session'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default InterviewCoachPage;
