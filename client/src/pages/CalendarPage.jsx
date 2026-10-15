import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building,
  Briefcase,
  CalendarDays,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import applicationService from '../api/applicationService';
import ApplicationDetailsModal from '../components/applications/ApplicationDetailsModal';
import { formatDate, formatTime } from '../utils/formatters';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'agenda'
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch applications with interview dates
  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getApplications({ limit: 200 });
      if (res?.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to load interview calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Filter applications that have interview dates
  const interviewApps = applications.filter((app) => Boolean(app.interviewDate));

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Group interviews by day of current month
  const getInterviewsForDay = (day) => {
    return interviewApps.filter((app) => {
      if (!app.interviewDate) return false;
      const d = new Date(app.interviewDate);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  };

  // Status classification for an interview
  const getInterviewStatus = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    if (isToday) return { label: 'Today', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    if (d > now) return { label: 'Upcoming', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    return { label: 'Completed / Past', color: 'bg-stone-100 text-stone-700 border-stone-200' };
  };

  // Calendar Day Cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i),
      interviews: [],
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push({
      day,
      isCurrentMonth: true,
      isToday: isCurrentMonth && today.getDate() === day,
      date: new Date(year, month, day),
      interviews: getInterviewsForDay(day),
    });
  }

  // Next month leading days to complete grid
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarCells.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day),
      interviews: [],
    });
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sand-200/90">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-forest-800 text-xs font-semibold mb-2 shadow-sm">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Interview Preparation & Schedule</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
            Interview Calendar
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
            Chronological overview of scheduled rounds, technical screens, and company interviews
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-ivory-200/80 border border-sand-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-forest-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white text-forest-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-white border border-sand-200 text-stone-600 hover:text-forest-900 hover:bg-sand-50 transition-colors shadow-sm"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-2 rounded-xl bg-white border border-sand-200 text-xs font-bold text-stone-700 hover:text-forest-900 hover:bg-sand-50 transition-colors shadow-sm"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-white border border-sand-200 text-stone-600 hover:text-forest-900 hover:bg-sand-50 transition-colors shadow-sm"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Title Indicator */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-forest-900 font-sans">
          {monthNames[month]} {year}
        </h2>
        <span className="text-xs text-stone-500 font-medium">
          {interviewApps.length} total scheduled {interviewApps.length === 1 ? 'interview' : 'interviews'}
        </span>
      </div>

      {/* View Mode 1: Month Grid */}
      {viewMode === 'month' && (
        <div className="rounded-2xl bg-white border border-sand-200 shadow-card overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 bg-ivory-100/90 border-b border-sand-200 text-center py-2.5 text-xs font-bold text-stone-600">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-sand-200/70">
            {calendarCells.map((cell, idx) => (
              <div
                key={idx}
                className={`min-h-[110px] p-2 flex flex-col transition-colors ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-ivory-50/50 text-stone-400'
                } ${cell.isToday ? 'bg-forest-50/40 ring-1 ring-inset ring-forest-600/30' : ''}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      cell.isToday
                        ? 'bg-forest-800 text-white font-extrabold shadow-sm'
                        : cell.isCurrentMonth
                        ? 'text-stone-800'
                        : 'text-stone-400'
                    }`}
                  >
                    {cell.day}
                  </span>
                  {cell.interviews.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      {cell.interviews.length}
                    </span>
                  )}
                </div>

                {/* Day Events */}
                <div className="space-y-1 overflow-y-auto max-h-[80px] pr-0.5">
                  {cell.interviews.map((app) => (
                    <button
                      key={app._id}
                      onClick={() => {
                        setSelectedApp(app);
                        setIsDetailsOpen(true);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-forest-50/90 hover:bg-forest-100 border border-forest-200/80 transition-all text-xs group block"
                    >
                      <div className="font-bold text-forest-950 truncate text-[11px] font-sans">
                        {app.company}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-forest-600" />
                        <span>{formatTime(app.interviewDate) || 'Time set'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Mode 2: Agenda List */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {interviewApps.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-sand-300">
              <CalendarIcon className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-700">No Interviews Scheduled</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                When you add or edit applications and set an interview date, they will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-sand-200 shadow-card divide-y divide-sand-200/70 overflow-hidden">
              {interviewApps
                .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
                .map((app) => {
                  const statusInfo = getInterviewStatus(app.interviewDate);
                  return (
                    <div
                      key={app._id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-ivory-50/60 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-800 border border-forest-200 flex flex-col items-center justify-center font-sans">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-600">
                            {new Date(app.interviewDate).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-base font-extrabold leading-none text-forest-950">
                            {new Date(app.interviewDate).getDate()}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-stone-900 text-sm font-sans">{app.role}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                            <Building className="w-3.5 h-3.5 text-forest-600" />
                            <span className="font-semibold text-stone-700">{app.company}</span>
                            <span>&bull;</span>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>{formatTime(app.interviewDate) || 'Time specified in details'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setIsDetailsOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sand-200 bg-white hover:bg-sand-50 text-xs font-semibold text-stone-700 shadow-sm transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-forest-700" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <ApplicationDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedApp(null);
          }}
          application={selectedApp}
          onEdit={() => {}}
          onRefresh={fetchInterviews}
        />
      )}
    </div>
  );
};

export default CalendarPage;
