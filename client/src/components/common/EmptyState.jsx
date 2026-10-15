import React from 'react';
import { FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No applications found',
  description = 'You have not added any job applications yet or no records match your filter.',
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-sand-200 shadow-card my-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-forest-50 border border-forest-100/80 flex items-center justify-center mb-4 text-forest-700 shadow-soft">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-forest-950 mb-1.5 font-sans">{title}</h3>
      <p className="text-sm text-stone-500 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-forest px-5 py-2.5 rounded-xl font-semibold text-sm shadow-soft hover:opacity-95 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
