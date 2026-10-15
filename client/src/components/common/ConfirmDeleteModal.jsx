import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmDeleteModal = ({
  isOpen,
  title = 'Delete Job Application',
  message = 'Are you sure you want to delete this application? This action cannot be undone.',
  itemName,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={!loading ? onCancel : undefined}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md p-6 sm:p-7 bg-white rounded-2xl border border-sand-200 shadow-modal z-10"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <button
              onClick={onCancel}
              disabled={loading}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-sand-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-forest-950 mb-1.5 font-sans">{title}</h3>
          <p className="text-sm text-stone-600 leading-relaxed mb-4">
            {message}
          </p>

          {itemName && (
            <div className="p-3 mb-6 bg-sand-50 border border-sand-200 rounded-xl">
              <span className="text-xs text-stone-500 block font-medium">Target Application:</span>
              <span className="text-sm font-semibold text-rose-800 break-words">
                {itemName}
              </span>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-stone-700 hover:bg-sand-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Deleting...' : 'Delete Application'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;
