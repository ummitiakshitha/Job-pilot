import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Clock, Building, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/formatters';
import applicationService from '../../api/applicationService';

export const FollowUpWidget = ({
  followUps = [],
  dueTodayCount = 0,
  overdueCount = 0,
  onViewApplication,
  onFollowUpToggled,
}) => {
  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isDueToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const handleToggle = async (e, app) => {
    e.stopPropagation();
    try {
      await applicationService.updateFollowUp(app._id, {
        followUpCompleted: !app.followUpCompleted,
      });
      if (onFollowUpToggled) {
        onFollowUpToggled();
      }
    } catch (err) {
      console.error('Failed to complete follow up', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-forest-950 font-sans">Follow-Up Reminders</h3>
              {overdueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  {overdueCount} Overdue
                </span>
              )}
              {dueTodayCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {dueTodayCount} Today
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 font-medium">Recruiter touchpoints & thank-you notes</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {followUps.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-forest-400 mx-auto mb-2" />
            <p className="font-semibold text-stone-600">All caught up!</p>
            <p className="text-stone-400 mt-0.5">
              No pending follow-ups. Set dates on applications to stay in touch with recruiters.
            </p>
          </div>
        ) : (
          followUps.slice(0, 4).map((app) => {
            const overdue = isOverdue(app.followUpDate);
            const dueToday = isDueToday(app.followUpDate);

            return (
              <div
                key={app._id}
                onClick={() => onViewApplication && onViewApplication(app)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all group ${
                  overdue
                    ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                    : dueToday
                    ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                    : 'bg-ivory-50 border-sand-200 hover:border-forest-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={(e) => handleToggle(e, app)}
                    title="Mark follow-up done"
                    className="flex-shrink-0 text-stone-300 hover:text-forest-600 transition-colors p-1"
                  >
                    <CheckCircle2 className="w-5 h-5 hover:scale-110 transition-transform" />
                  </button>

                  <div className="truncate">
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-forest-800 transition-colors font-sans truncate">
                      {app.role}
                    </h4>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5 font-medium truncate">
                      <Building className="w-3 h-3 text-forest-600 flex-shrink-0" />
                      <span className="truncate">{app.company}</span>
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  {overdue ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-md">
                      <AlertCircle className="w-3 h-3" />
                      {formatDate(app.followUpDate)}
                    </span>
                  ) : dueToday ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" />
                      Today
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-stone-500">
                      {formatDate(app.followUpDate)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default FollowUpWidget;
