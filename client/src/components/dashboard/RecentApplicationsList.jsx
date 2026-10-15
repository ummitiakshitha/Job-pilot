import React from 'react';
import { Link } from 'react-router-dom';
import { Building, ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { motion } from 'framer-motion';

export const RecentApplicationsList = ({ applications = [], onViewApplication }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-forest-950 font-sans">Recent Applications</h3>
          <p className="text-xs text-stone-500 font-medium">Latest job search submissions</p>
        </div>
        <Link
          to="/applications"
          className="text-xs text-forest-700 hover:text-forest-900 font-semibold inline-flex items-center gap-1 hover:underline"
        >
          <span>View all applications</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-sand-100">
        {applications.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs font-medium">
            No applications submitted yet.
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app._id}
              onClick={() => onViewApplication && onViewApplication(app)}
              className="py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-ivory-50/70 px-2 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-forest-50 border border-forest-100/90 flex items-center justify-center text-xs font-bold text-forest-800 uppercase shadow-sm">
                  {app.company.slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 group-hover:text-forest-800 transition-colors font-sans">
                    {app.role}
                  </h4>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5 font-medium">
                    <Building className="w-3 h-3 text-forest-600" />
                    <span>{app.company}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={app.status} size="sm" />
                <span className="text-xs text-stone-400 font-medium hidden sm:inline">
                  {formatDate(app.applicationDate)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default RecentApplicationsList;
