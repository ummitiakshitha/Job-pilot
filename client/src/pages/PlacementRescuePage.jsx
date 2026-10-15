import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  Building,
  ArrowRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import prepService from '../api/prepService';
import applicationService from '../api/applicationService';

export const PlacementRescuePage = () => {
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [rescueData, setRescueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [appsRes, rescueRes] = await Promise.all([
          applicationService.getApplications({ limit: 50 }),
          prepService.getPlacementRescuePlan(),
        ]);

        if (appsRes?.data) setApplications(appsRes.data);
        if (rescueRes?.data) setRescueData(rescueRes.data);
      } catch (err) {
        console.error('Failed to load rescue plan', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSelectApp = async (e) => {
    const id = e.target.value;
    setSelectedAppId(id);
    setLoading(true);
    try {
      const res = await prepService.getPlacementRescuePlan(id);
      if (res?.data) {
        setRescueData(res.data);
      }
    } catch (err) {
      console.error('Failed to load rescue plan for application', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = (dayIndex, taskIndex) => {
    if (!rescueData?.dailySchedule) return;
    const updated = { ...rescueData };
    const task = updated.dailySchedule[dayIndex].tasks[taskIndex];
    task.completed = !task.completed;
    setRescueData(updated);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-4 border-b border-sand-200/90"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold mb-2 shadow-sm">
          <Flame className="w-3.5 h-3.5 text-rose-600" />
          <span>High-Intensity Interview Countdown Planner</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
          Placement Rescue Mode
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
          Focused day-by-day revision schedule tailored to your remaining prep time for an upcoming interview.
        </p>
      </motion.div>

      {/* Target Application Selector */}
      <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Focus Application with Upcoming Interview
          </label>
          <select
            value={selectedAppId}
            onChange={handleSelectApp}
            className="w-full sm:w-80 px-3 py-2 text-xs rounded-xl clean-input bg-white"
          >
            <option value="">— Nearest Upcoming Interview —</option>
            {applications
              .filter((a) => a.interviewDate)
              .map((app) => (
                <option key={app._id} value={app._id}>
                  {app.company} — {app.role} ({new Date(app.interviewDate).toLocaleDateString()})
                </option>
              ))}
          </select>
        </div>

        {rescueData?.hasUpcomingInterview && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-950 flex-shrink-0">
            <Clock className="w-5 h-5 text-rose-600" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Countdown</span>
              <span className="text-base font-extrabold">
                {rescueData.application?.daysRemaining} Day(s) Until Interview
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {!rescueData?.hasUpcomingInterview ? (
        <div className="p-12 rounded-2xl bg-white border border-sand-200 shadow-card text-center text-stone-400 space-y-3">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-700 font-sans">No Upcoming Interview Found</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            {rescueData?.message || 'Set an interview date on any of your tracked job applications to activate a customized daily preparation plan.'}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Target Company Banner */}
          <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-stone-500">Upcoming Round at</span>
              <h2 className="text-xl font-bold text-forest-950 font-sans">
                {rescueData.application?.company} — {rescueData.application?.role}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Interview Date: <strong className="text-forest-900">{new Date(rescueData.application?.interviewDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </p>
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="space-y-4">
            {rescueData.dailySchedule?.map((day, dayIdx) => (
              <div key={dayIdx} className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      Day {day.dayNumber} Focus
                    </span>
                    <h3 className="text-sm font-bold text-forest-950 mt-1 font-sans">{day.theme}</h3>
                    <p className="text-xs text-stone-500">{day.focus}</p>
                  </div>
                  <span className="text-xs font-semibold text-stone-500 bg-sand-100 px-2.5 py-1 rounded-lg">
                    ~{day.estimatedHours} Hours
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {day.tasks?.map((t, taskIdx) => (
                    <div
                      key={taskIdx}
                      onClick={() => handleToggleTask(dayIdx, taskIdx)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                        t.completed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-ivory-50 border-sand-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!t.completed}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-forest-800 cursor-pointer"
                      />
                      <span className={`text-xs ${t.completed ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}`}>
                        {t.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlacementRescuePage;
