import React from 'react';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  Applied: {
    label: 'Applied',
    badgeClass: 'bg-teal-50/80 text-teal-800 border-teal-200/80',
    dotClass: 'bg-teal-600',
  },
  Interview: {
    label: 'Interview',
    badgeClass: 'bg-amber-50/90 text-amber-900 border-amber-200/80',
    dotClass: 'bg-amber-600 animate-pulse-subtle',
  },
  Offer: {
    label: 'Offer',
    badgeClass: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80',
    dotClass: 'bg-emerald-600',
  },
  Rejected: {
    label: 'Rejected',
    badgeClass: 'bg-rose-50/80 text-rose-800 border-rose-200/80',
    dotClass: 'bg-rose-600',
  },
};

export const StatusBadge = ({ status = 'Applied', size = 'md', className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  return (
    <motion.span
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm font-sans ${config.badgeClass} ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </motion.span>
  );
};

export default StatusBadge;
