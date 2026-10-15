import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckSquare,
  Clock,
  Sparkles,
  GripVertical,
} from 'lucide-react';
import { formatINR, formatDate } from '../../utils/formatters';

const COLUMNS = [
  { id: 'Applied', title: 'Applied', color: 'border-teal-200 text-teal-800 bg-teal-50', dot: 'bg-teal-600', countBg: 'bg-teal-100 text-teal-900' },
  { id: 'Interview', title: 'Interview', color: 'border-amber-200 text-amber-900 bg-amber-50', dot: 'bg-amber-600', countBg: 'bg-amber-100 text-amber-900' },
  { id: 'Offer', title: 'Offer', color: 'border-emerald-200 text-emerald-800 bg-emerald-50', dot: 'bg-emerald-600', countBg: 'bg-emerald-100 text-emerald-900' },
  { id: 'Rejected', title: 'Rejected', color: 'border-rose-200 text-rose-800 bg-rose-50', dot: 'bg-rose-600', countBg: 'bg-rose-100 text-rose-900' },
];

export const KanbanBoard = ({
  applications,
  loading,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleFavorite,
}) => {
  const [draggedAppId, setDraggedAppId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

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

  // Drag and Drop event handlers
  const handleDragStart = (e, app) => {
    setDraggedAppId(app._id);
    e.dataTransfer.setData('application/json', JSON.stringify({ appId: app._id, currentStatus: app.status }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedAppId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    if (dragOverColumn === colId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const { appId, currentStatus } = JSON.parse(dataStr);
      if (appId && currentStatus !== targetStatus) {
        onStatusChange(appId, targetStatus);
      }
    } catch (err) {
      console.error('Drag drop parse error:', err);
    } finally {
      setDraggedAppId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
      {COLUMNS.map((col) => {
        const columnApps = applications.filter((app) => app.status === col.id);
        const isTargeted = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`rounded-2xl border transition-all duration-200 p-4 flex flex-col min-h-[550px] ${
              isTargeted
                ? 'bg-forest-50/70 border-forest-500 ring-2 ring-forest-400/30 shadow-modal'
                : 'bg-ivory-100/80 border-sand-200/90 shadow-sm'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-sand-200/80">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h4 className="font-bold text-sm text-forest-950 font-sans tracking-tight">
                  {col.title}
                </h4>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${col.countBg} ${col.color}`}>
                {columnApps.length}
              </span>
            </div>

            {/* Drop Target Helper Notice */}
            {isTargeted && (
              <div className="mb-3 py-2 px-3 rounded-xl border border-dashed border-forest-600 bg-forest-100/60 text-center text-xs font-bold text-forest-900 animate-pulse">
                Drop to move to {col.title}
              </div>
            )}

            {/* Column Cards */}
            <div className="space-y-3 flex-1">
              {columnApps.length === 0 ? (
                <div className="h-44 rounded-xl border border-dashed border-sand-300 flex flex-col items-center justify-center text-xs text-stone-400 font-medium p-4 text-center">
                  <span>No {col.title.toLowerCase()} roles</span>
                  <span className="text-[10px] text-stone-400 mt-1">Drag cards here or advance status</span>
                </div>
              ) : (
                columnApps.map((app) => {
                  const isDragging = draggedAppId === app._id;
                  const completedTasks = app.checklist?.filter((t) => t.completed)?.length || 0;
                  const totalTasks = app.checklist?.length || 0;

                  return (
                    <motion.div
                      key={app._id}
                      layout
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, app)}
                      onDragEnd={handleDragEnd}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className={`p-4 rounded-xl bg-white border shadow-card hover:shadow-card-hover transition-all duration-200 group relative cursor-grab active:cursor-grabbing select-none ${
                        isDragging ? 'opacity-40 border-forest-400 scale-95' : 'border-sand-200'
                      }`}
                    >
                      {/* Drag Handle & Top Row: Role & Actions */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-1.5 overflow-hidden">
                          <GripVertical className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 mt-0.5 flex-shrink-0" />
                          <div className="overflow-hidden">
                            <h5 className="font-bold text-stone-900 text-sm truncate group-hover:text-forest-800 transition-colors font-sans">
                              {app.role}
                            </h5>
                            <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5 font-medium">
                              <Building className="w-3 h-3 text-forest-600 flex-shrink-0" />
                              <span className="truncate">{app.company}</span>
                            </p>
                          </div>
                        </div>

                        {/* Top Action Icons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {/* Favorite Bookmark */}
                          <button
                            onClick={() => onToggleFavorite && onToggleFavorite(app._id)}
                            className={`p-1 rounded transition-colors ${
                              app.isFavorite
                                ? 'text-amber-500 hover:text-amber-600'
                                : 'text-stone-300 hover:text-amber-500'
                            }`}
                            title={app.isFavorite ? 'Remove bookmark' : 'Bookmark application'}
                          >
                            <Star className={`w-3.5 h-3.5 ${app.isFavorite ? 'fill-amber-400' : ''}`} />
                          </button>

                          <button
                            onClick={() => onView(app)}
                            className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-sand-100"
                            title="View Details & Checklist"
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

                      {/* Metadata tags: INR Salary, Date, Interview, Checklist */}
                      <div className="flex flex-wrap gap-1.5 my-2.5">
                        {/* Expected Salary in INR */}
                        {app.salaryExpectation && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80">
                            {formatINR(app.salaryExpectation)}
                          </span>
                        )}

                        {/* Confirmed Offer Salary if available */}
                        {app.offeredSalary && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-forest-100 text-forest-900 font-extrabold border border-forest-300 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-forest-700" />
                            Offer: {formatINR(app.offeredSalary)}
                          </span>
                        )}

                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-sand-50 text-stone-600 border border-sand-200 flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {formatDate(app.applicationDate)}
                        </span>

                        {/* Interview Date badge */}
                        {app.interviewDate && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1 font-semibold">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Int: {formatDate(app.interviewDate)}
                          </span>
                        )}

                        {/* Checklist progress badge */}
                        {totalTasks > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md border flex items-center gap-1 font-semibold ${
                            completedTasks === totalTasks
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-stone-50 text-stone-600 border-sand-200'
                          }`}>
                            <CheckSquare className="w-2.5 h-2.5 text-forest-600" />
                            {completedTasks}/{totalTasks} prep
                          </span>
                        )}
                      </div>

                      {/* Notes preview */}
                      {app.notes && (
                        <p className="text-xs text-stone-500 line-clamp-2 italic mb-3 font-normal">
                          "{app.notes}"
                        </p>
                      )}

                      {/* Move Status Controls (Accessible fallback to drag & drop) */}
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
                            Reject
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
