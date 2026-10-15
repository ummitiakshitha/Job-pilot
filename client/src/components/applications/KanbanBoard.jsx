import React from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  Calendar,
  DollarSign,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const COLUMNS = [
  { id: 'Applied', title: 'Applied', color: 'border-teal-200 text-teal-800 bg-teal-50', dot: 'bg-teal-600' },
  { id: 'Interview', title: 'Interview', color: 'border-amber-200 text-amber-900 bg-amber-50', dot: 'bg-amber-600' },
  { id: 'Offer', title: 'Offer', color: 'border-emerald-200 text-emerald-800 bg-emerald-50', dot: 'bg-emerald-600' },
  { id: 'Rejected', title: 'Rejected', color: 'border-rose-200 text-rose-800 bg-rose-50', dot: 'bg-rose-600' },
];

export const KanbanBoard = ({
  applications,
  loading,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getNextStatus = (current) => {
    if (current === 'Applied') return 'Interview';
    if (current === 'Interview') return 'Offer';
    return null;
  };

  const getPrevStatus = (current) => {
    if (current === 'Offer') return 'Interview';
    if (current === 'Interview') return 'Applied';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {COLUMNS.map((col) => {
        const columnApps = applications.filter((app) => app.status === col.id);

        return (
          <div
            key={col.id}
            className="rounded-2xl bg-ivory-100/80 border border-sand-200/90 p-4 flex flex-col min-h-[500px] shadow-sm"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-sand-200/80">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h4 className="font-bold text-sm text-forest-950 font-sans tracking-tight">
                  {col.title}
                </h4>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border shadow-sm ${col.color}`}>
                {columnApps.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1">
              {columnApps.length === 0 ? (
                <div className="h-40 rounded-xl border border-dashed border-sand-300 flex items-center justify-center text-xs text-stone-400 font-medium">
                  No {col.title.toLowerCase()} roles
                </div>
              ) : (
                columnApps.map((app) => (
                  <motion.div
                    key={app._id}
                    layout
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="p-4 rounded-xl bg-white border border-sand-200 shadow-card hover:shadow-card-hover transition-all duration-200 group relative"
                  >
                    {/* Top Row: Role & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="overflow-hidden">
                        <h5 className="font-bold text-stone-900 text-sm truncate group-hover:text-forest-800 transition-colors font-sans">
                          {app.role}
                        </h5>
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5 font-medium">
                          <Building className="w-3 h-3 text-forest-600" />
                          <span className="truncate">{app.company}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onView(app)}
                          className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-sand-100"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(app)}
                          className="p-1 rounded text-stone-400 hover:text-forest-700 hover:bg-sand-100"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(app)}
                          className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-1.5 my-2.5">
                      {app.salaryExpectation && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/70 flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3" />
                          ${Number(app.salaryExpectation).toLocaleString()}
                        </span>
                      )}
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-sand-50 text-stone-600 border border-sand-200 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {formatDate(app.applicationDate)}
                      </span>
                      {app.interviewDate && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1 font-semibold">
                          Int: {formatDate(app.interviewDate)}
                        </span>
                      )}
                    </div>

                    {/* Notes preview */}
                    {app.notes && (
                      <p className="text-xs text-stone-500 line-clamp-2 italic mb-3 font-normal">
                        "{app.notes}"
                      </p>
                    )}

                    {/* Move Status Controls */}
                    <div className="pt-2 border-t border-sand-100 flex items-center justify-between gap-1 text-[11px]">
                      {getPrevStatus(app.status) ? (
                        <button
                          onClick={() => onStatusChange(app._id, getPrevStatus(app.status))}
                          className="text-stone-500 hover:text-stone-900 flex items-center gap-0.5 py-1 px-1.5 rounded hover:bg-sand-100 transition-colors font-medium"
                          title={`Move back to ${getPrevStatus(app.status)}`}
                        >
                          <ChevronLeft className="w-3 h-3" />
                          <span>{getPrevStatus(app.status)}</span>
                        </button>
                      ) : <span />}

                      {getNextStatus(app.status) && (
                        <button
                          onClick={() => onStatusChange(app._id, getNextStatus(app.status))}
                          className="text-forest-700 hover:text-forest-900 flex items-center gap-0.5 py-1 px-2 rounded bg-forest-50 hover:bg-forest-100 font-semibold transition-colors"
                          title={`Advance to ${getNextStatus(app.status)}`}
                        >
                          <span>{getNextStatus(app.status)}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}

                      {app.status !== 'Rejected' && (
                        <button
                          onClick={() => onStatusChange(app._id, 'Rejected')}
                          className="text-stone-400 hover:text-rose-600 text-[10px] py-0.5 px-1.5 rounded hover:bg-rose-50"
                        >
                          Mark Rejected
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
