import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building,
  Briefcase,
  ExternalLink,
  DollarSign,
  Calendar,
  FileText,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import applicationService from '../../api/applicationService';

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected'];

export const ApplicationDetailsModal = ({
  isOpen,
  onClose,
  application,
  onEdit,
  onDelete,
  onStatusUpdated,
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!isOpen || !application) return null;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === application.status) return;
    setUpdatingStatus(true);
    try {
      const res = await applicationService.updateStatus(application._id, newStatus);
      if (onStatusUpdated) {
        onStatusUpdated(res.data || { ...application, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
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
          className="relative w-full max-w-2xl p-6 md:p-8 bg-white rounded-2xl border border-sand-200 shadow-modal z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-sand-200/80">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-forest-950 tracking-tight font-sans">
                  {application.role}
                </h3>
                <StatusBadge status={application.status} size="md" />
              </div>
              <p className="text-base text-forest-700 font-semibold mt-1 flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                <span>{application.company}</span>
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
                    application.status === st
                      ? 'bg-forest-800 text-white shadow-soft'
                      : 'bg-white text-stone-600 hover:text-forest-900 border border-sand-200 hover:border-sand-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="p-4 rounded-xl bg-white border border-sand-200 flex items-start gap-3 shadow-soft">
              <Calendar className="w-5 h-5 text-teal-700 min-w-5 mt-0.5" />
              <div>
                <span className="text-xs text-stone-500 block font-medium">Applied Date</span>
                <span className="text-sm font-semibold text-stone-900">
                  {formatDate(application.applicationDate)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-sand-200 flex items-start gap-3 shadow-soft">
              <Calendar className="w-5 h-5 text-amber-700 min-w-5 mt-0.5" />
              <div>
                <span className="text-xs text-stone-500 block font-medium">Interview Date</span>
                <span className="text-sm font-semibold text-stone-900">
                  {application.interviewDate ? formatDate(application.interviewDate) : 'Not Scheduled'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-sand-200 flex items-start gap-3 shadow-soft">
              <DollarSign className="w-5 h-5 text-forest-700 min-w-5 mt-0.5" />
              <div>
                <span className="text-xs text-stone-500 block font-medium">Salary Expectation</span>
                <span className="text-sm font-semibold text-stone-900">
                  {application.salaryExpectation
                    ? `$${Number(application.salaryExpectation).toLocaleString()} / yr`
                    : 'Undisclosed'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-sand-200 flex items-start gap-3 shadow-soft">
              <ExternalLink className="w-5 h-5 text-forest-700 min-w-5 mt-0.5" />
              <div className="overflow-hidden">
                <span className="text-xs text-stone-500 block font-medium">Job Posting Link</span>
                {application.jobLink ? (
                  <a
                    href={application.jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-forest-700 hover:text-forest-900 hover:underline truncate block"
                  >
                    View Original Posting &rarr;
                  </a>
                ) : (
                  <span className="text-sm text-stone-400 font-medium">No link provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="my-6">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-forest-700" />
              <span>Notes & Preparation Details</span>
            </h4>
            <div className="p-4 rounded-xl bg-ivory-50 border border-sand-200 text-sm text-stone-700 leading-relaxed whitespace-pre-wrap min-h-[80px]">
              {application.notes || 'No notes added for this application.'}
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-sand-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Created: {formatDateTime(application.createdAt)}</span>
            </div>
            <div>
              <span>Last Updated: {formatDateTime(application.updatedAt)}</span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={() => {
                onClose();
                if (onDelete) onDelete(application);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onEdit) onEdit(application);
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
