import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building,
  Briefcase,
  ExternalLink,
  Calendar,
  FileText,
  Clock,
  Edit2,
  Trash2,
  Star,
  Bell,
  CheckCircle,
  Activity,
  Award,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import PreparationChecklist from './PreparationChecklist';
import applicationService from '../../api/applicationService';
import { formatINR, formatDate } from '../../utils/formatters';

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected'];

export const ApplicationDetailsModal = ({
  isOpen,
  onClose,
  application: initialApp,
  onEdit,
  onDelete,
  onStatusUpdated,
  onRefresh,
}) => {
  const [app, setApp] = useState(initialApp);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'checklist' | 'activity'

  React.useEffect(() => {
    setApp(initialApp);
  }, [initialApp]);

  if (!isOpen || !app) return null;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === app.status) return;
    setUpdatingStatus(true);
    try {
      const res = await applicationService.updateStatus(app._id, newStatus);
      const updated = res.data || { ...app, status: newStatus };
      setApp(updated);
      if (onStatusUpdated) onStatusUpdated(updated);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await applicationService.toggleFavorite(app._id);
      if (res?.data) {
        setApp(res.data);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleToggleFollowUp = async () => {
    try {
      const res = await applicationService.updateFollowUp(app._id, {
        followUpCompleted: !app.followUpCompleted,
      });
      if (res?.data) {
        setApp(res.data);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to toggle follow-up:', err);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
        />

        {/* Modal Window with tactile scale entrance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-3xl p-6 md:p-8 bg-white rounded-2xl border border-sand-200 shadow-modal z-10 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-sand-200/80">
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleFavorite}
                  className="p-1 rounded-lg text-amber-500 hover:text-amber-600 transition-colors"
                  title={app.isFavorite ? 'Bookmarked application' : 'Click to bookmark'}
                >
                  <Star className={`w-5 h-5 ${app.isFavorite ? 'fill-amber-400' : 'text-stone-300'}`} />
                </button>
                <h3 className="text-2xl font-bold text-forest-950 tracking-tight font-sans">
                  {app.role}
                </h3>
                <StatusBadge status={app.status} size="md" />
              </div>
              <p className="text-base text-forest-700 font-semibold mt-1 flex items-center gap-1.5 ml-8">
                <Building className="w-4 h-4" />
                <span>{app.company}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-sand-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Status Updater */}
          <div className="my-5 p-4 rounded-xl bg-ivory-100 border border-sand-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider font-sans">
              Quick Status Pipeline:
            </span>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((st) => (
                <button
                  key={st}
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(st)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    app.status === st
                      ? 'bg-forest-800 text-white shadow-soft'
                      : 'bg-white text-stone-600 hover:text-forest-900 border border-sand-200 hover:border-sand-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-sand-200 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'overview'
                  ? 'border-forest-800 text-forest-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              Overview & Details
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'checklist'
                  ? 'border-forest-800 text-forest-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>Prep Checklist</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-forest-100 text-forest-800 font-extrabold">
                {app.checklist?.filter((t) => t.completed).length || 0}/{app.checklist?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'activity'
                  ? 'border-forest-800 text-forest-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Activity History</span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Grid Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-sand-200 flex items-start gap-3 shadow-soft">
                  <Calendar className="w-5 h-5 text-teal-700 min-w-5 mt-0.5" />
                  <div>
                    <span className="text-xs text-stone-500 block font-medium">Applied Date</span>
                    <span className="text-sm font-semibold text-stone-900">
                      {formatDate(app.applicationDate)}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-sand-200 flex items-start gap-3 shadow-soft">
                  <Calendar className="w-5 h-5 text-amber-700 min-w-5 mt-0.5" />
                  <div>
                    <span className="text-xs text-stone-500 block font-medium">Interview Date</span>
                    <span className="text-sm font-semibold text-stone-900">
                      {app.interviewDate ? formatDate(app.interviewDate) : 'Not Scheduled'}
                    </span>
                  </div>
                </div>

                {/* Salary Expectation (Indian Rupees) */}
                <div className="p-4 rounded-xl bg-white border border-sand-200 flex items-start gap-3 shadow-soft">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs min-w-5 mt-0.5">
                    ₹
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block font-medium">Expected Salary</span>
                    <span className="text-sm font-bold text-forest-950">
                      {formatINR(app.salaryExpectation) || 'Undisclosed'}
                    </span>
                  </div>
                </div>

                {/* Confirmed Offer Salary if available */}
                <div className="p-4 rounded-xl bg-white border border-sand-200 flex items-start gap-3 shadow-soft">
                  <Award className="w-5 h-5 text-emerald-600 min-w-5 mt-0.5" />
                  <div>
                    <span className="text-xs text-stone-500 block font-medium">Confirmed Offer Compensation</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {formatINR(app.offeredSalary) || (app.status === 'Offer' ? 'Pending offer letter' : 'N/A')}
                    </span>
                  </div>
                </div>

                {/* Job Link */}
                <div className="p-4 rounded-xl bg-white border border-sand-200 flex items-start gap-3 shadow-soft md:col-span-2">
                  <ExternalLink className="w-5 h-5 text-forest-700 min-w-5 mt-0.5" />
                  <div className="overflow-hidden flex-1">
                    <span className="text-xs text-stone-500 block font-medium">Job Posting Link</span>
                    {app.jobLink ? (
                      <a
                        href={app.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-forest-700 hover:text-forest-900 hover:underline truncate block"
                      >
                        {app.jobLink} &rarr;
                      </a>
                    ) : (
                      <span className="text-sm text-stone-400 font-medium">No link provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Feature 5: Follow-Up Reminder Box */}
              {app.followUpDate && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-amber-700 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-amber-950">
                        Follow-Up Scheduled: {formatDate(app.followUpDate)}
                      </div>
                      <span className="text-[11px] text-amber-800">
                        {app.followUpCompleted ? 'Completed' : 'Action needed: send follow-up inquiry'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleFollowUp}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                      app.followUpCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-stone-700 border border-sand-200 hover:bg-amber-100'
                    }`}
                  >
                    {app.followUpCompleted ? '✓ Completed' : 'Mark Done'}
                  </button>
                </div>
              )}

              {/* Notes Section */}
              <div>
                <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-forest-700" />
                  <span>Notes & Preparation Details</span>
                </h4>
                <div className="p-4 rounded-xl bg-ivory-50 border border-sand-200 text-sm text-stone-700 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                  {app.notes || 'No notes added for this application.'}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Interview Preparation Checklist */}
          {activeTab === 'checklist' && (
            <div className="p-2">
              <PreparationChecklist
                application={app}
                onRefresh={(updated) => {
                  setApp(updated);
                  if (onRefresh) onRefresh();
                }}
              />
            </div>
          )}

          {/* Tab 3: Activity Timeline */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-forest-700" />
                <h4 className="text-sm font-bold text-forest-950 font-sans">
                  Chronological Event Timeline
                </h4>
              </div>

              {app.activityHistory && app.activityHistory.length > 0 ? (
                <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-sand-300">
                  {app.activityHistory
                    .slice()
                    .reverse()
                    .map((item, idx) => (
                      <div key={idx} className="relative group">
                        <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-forest-600 ring-4 ring-white" />
                        <div className="p-3 rounded-xl bg-ivory-50 border border-sand-200 shadow-sm">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-forest-950 font-sans">{item.action}</span>
                            <span className="text-[10px] text-stone-400">
                              {formatDateTime(item.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl border border-dashed border-sand-300 text-xs text-stone-400">
                  No activity history recorded yet.
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 mt-6 border-t border-sand-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Created: {formatDateTime(app.createdAt)}</span>
            </div>
            <div>
              <span>Last Updated: {formatDateTime(app.updatedAt)}</span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={() => {
                onClose();
                if (onDelete) onDelete(app);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onEdit) onEdit(app);
              }}
              className="btn-forest inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Application</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApplicationDetailsModal;
