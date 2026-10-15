import React from 'react';
import { Eye, Edit2, Trash2, ExternalLink, Building, Star, CheckSquare, Sparkles } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { TableRowSkeleton } from '../common/LoadingSkeleton';
import { formatINR, formatDate } from '../../utils/formatters';

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected'];

export const ApplicationTable = ({
  applications,
  loading,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleFavorite,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white shadow-card">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-sand-200 bg-ivory-50 text-stone-500 text-xs font-semibold uppercase tracking-wider font-sans">
            <th className="py-4 px-3 text-center w-10">★</th>
            <th className="py-4 px-4">Company & Role</th>
            <th className="py-4 px-4">Status</th>
            <th className="py-4 px-4">Expected / Offer (INR)</th>
            <th className="py-4 px-4">Applied Date</th>
            <th className="py-4 px-4">Interview Date</th>
            <th className="py-4 px-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100 text-sm">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
          ) : applications.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-stone-500 font-medium">
                No job applications match your filters.
              </td>
            </tr>
          ) : (
            applications.map((app) => (
              <tr
                key={app._id}
                className="hover:bg-ivory-50/70 transition-colors group"
              >
                {/* Favorite Bookmark */}
                <td className="py-4 px-3 text-center">
                  <button
                    onClick={() => onToggleFavorite && onToggleFavorite(app._id)}
                    className="p-1 text-stone-300 hover:text-amber-500 transition-colors"
                    title={app.isFavorite ? 'Remove bookmark' : 'Bookmark application'}
                  >
                    <Star
                      className={`w-4 h-4 mx-auto ${
                        app.isFavorite ? 'text-amber-500 fill-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                </td>

                {/* Company & Role */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-forest-50 border border-forest-100/90 flex items-center justify-center text-forest-800 font-bold text-xs uppercase shadow-sm">
                      {app.company.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900 group-hover:text-forest-800 transition-colors flex items-center gap-1.5 font-sans">
                        <span>{app.role}</span>
                        {app.jobLink && (
                          <a
                            href={app.jobLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stone-400 hover:text-forest-700 transition-colors"
                            title="Open original job posting"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-forest-600" />
                        <span>{app.company}</span>
                        {app.checklist?.length > 0 && (
                          <span className="ml-2 text-[10px] text-stone-400 flex items-center gap-0.5">
                            <CheckSquare className="w-2.5 h-2.5 text-forest-600" />
                            {app.checklist.filter((t) => t.completed).length}/{app.checklist.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status Dropdown */}
                <td className="py-4 px-4">
                  <div className="relative inline-block">
                    <select
                      value={app.status}
                      onChange={(e) => onStatusChange(app._id, e.target.value)}
                      className="text-xs font-semibold py-1 px-2.5 rounded-lg bg-white border border-sand-200 text-stone-800 cursor-pointer hover:border-forest-600 focus:outline-none transition-colors shadow-sm"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* Salary (Indian Rupees format) */}
                <td className="py-4 px-4 font-semibold text-stone-800 text-xs">
                  <div>
                    {app.salaryExpectation ? (
                      <span>{formatINR(app.salaryExpectation)}</span>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </div>
                  {app.offeredSalary && (
                    <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 mt-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      Offer: {formatINR(app.offeredSalary)}
                    </div>
                  )}
                </td>

                {/* Applied Date */}
                <td className="py-4 px-4 text-stone-500 text-xs font-medium">
                  {formatDate(app.applicationDate)}
                </td>

                {/* Interview Date */}
                <td className="py-4 px-4 text-xs">
                  {app.interviewDate ? (
                    <span className="text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                      {formatDate(app.interviewDate)}
                    </span>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(app)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-sand-100 transition-colors"
                      title="View Details & Checklist"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(app)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-forest-700 hover:bg-sand-100 transition-colors"
                      title="Edit Application"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(app)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationTable;
