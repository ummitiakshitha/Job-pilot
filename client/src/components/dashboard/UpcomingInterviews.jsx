import React from 'react';
import { Calendar, Building, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const UpcomingInterviews = ({ interviews = [], onViewApplication }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return {
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        day: d.getDate(),
        full: d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      };
    } catch {
      return { month: 'DATE', day: '—', full: dateStr };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-700 border border-forest-100 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-forest-950 font-sans">Upcoming Interviews</h3>
            <p className="text-xs text-stone-500 font-medium">Scheduled rounds and technical screens</p>
          </div>
        </div>

        <Link
          to="/applications?status=Interview"
          className="text-xs text-forest-700 hover:text-forest-900 font-semibold inline-flex items-center gap-1 hover:underline"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {interviews.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs">
            <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-stone-600">No interviews scheduled yet</p>
            <p className="text-stone-400 mt-0.5">
              Set an interview date on your applications to track your schedule.
            </p>
          </div>
        ) : (
          interviews.map((app) => {
            const dateObj = formatDate(app.interviewDate);
            return (
              <div
                key={app._id}
                onClick={() => onViewApplication && onViewApplication(app)}
                className="p-3.5 rounded-xl bg-ivory-50 border border-sand-200 hover:border-forest-300 hover:shadow-soft flex items-center justify-between gap-3 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  {/* Calendar badge */}
                  <div className="w-12 h-12 rounded-xl bg-white border border-sand-200/90 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-forest-700 leading-tight">
                      {dateObj.month}
                    </span>
                    <span className="text-base font-extrabold text-forest-950 leading-none">
                      {dateObj.day}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-forest-800 transition-colors font-sans">
                      {app.role}
                    </h4>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5 font-medium">
                      <Building className="w-3 h-3 text-forest-600" />
                      <span>{app.company}</span>
                    </p>
                  </div>
                </div>

                <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                  {dateObj.full}
                </span>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default UpcomingInterviews;
