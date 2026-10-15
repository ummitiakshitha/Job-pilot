import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Building, DollarSign, Calendar, Link2, FileText, CheckCircle2 } from 'lucide-react';
import applicationService from '../../api/applicationService';

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected'];

export const ApplicationFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  applicationToEdit = null,
}) => {
  const isEditMode = !!applicationToEdit;

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    jobLink: '',
    salaryExpectation: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'Applied',
    interviewDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (applicationToEdit) {
      setFormData({
        company: applicationToEdit.company || '',
        role: applicationToEdit.role || '',
        jobLink: applicationToEdit.jobLink || '',
        salaryExpectation:
          applicationToEdit.salaryExpectation !== null &&
          applicationToEdit.salaryExpectation !== undefined
            ? applicationToEdit.salaryExpectation
            : '',
        applicationDate: applicationToEdit.applicationDate
          ? new Date(applicationToEdit.applicationDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        status: applicationToEdit.status || 'Applied',
        interviewDate: applicationToEdit.interviewDate
          ? new Date(applicationToEdit.interviewDate).toISOString().split('T')[0]
          : '',
        notes: applicationToEdit.notes || '',
      });
    } else {
      setFormData({
        company: '',
        role: '',
        jobLink: '',
        salaryExpectation: '',
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        interviewDate: '',
        notes: '',
      });
    }
    setErrors({});
    setServerError('');
  }, [applicationToEdit, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.company.trim()) {
      errs.company = 'Company name is required';
    }
    if (!formData.role.trim()) {
      errs.role = 'Job role is required';
    }
    if (!formData.applicationDate) {
      errs.applicationDate = 'Application date is required';
    }
    if (formData.jobLink && formData.jobLink.trim()) {
      try {
        new URL(formData.jobLink.trim());
      } catch {
        errs.jobLink = 'Must be a valid URL (e.g. https://careers.google.com)';
      }
    }
    if (formData.salaryExpectation !== '' && formData.salaryExpectation !== null) {
      const sal = Number(formData.salaryExpectation);
      if (isNaN(sal) || sal < 0) {
        errs.salaryExpectation = 'Salary must be a non-negative number';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        company: formData.company.trim(),
        role: formData.role.trim(),
        jobLink: formData.jobLink.trim() || undefined,
        salaryExpectation:
          formData.salaryExpectation !== ''
            ? Number(formData.salaryExpectation)
            : null,
        applicationDate: formData.applicationDate,
        status: formData.status,
        interviewDate: formData.interviewDate || null,
        notes: formData.notes.trim() || undefined,
      };

      let response;
      if (isEditMode) {
        response = await applicationService.updateApplication(
          applicationToEdit._id,
          payload
        );
      } else {
        response = await applicationService.createApplication(payload);
      }

      setLoading(false);
      onSuccess(response?.data || response);
      onClose();
    } catch (err) {
      setLoading(false);
      if (err.errors) {
        setErrors(err.errors);
      }
      setServerError(err.message || 'Failed to save application');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={!loading ? onClose : undefined}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
        />

        {/* Modal Window with tactile scale entrance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-xl p-6 md:p-8 bg-white rounded-2xl border border-sand-200 shadow-modal z-10 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-sand-200/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center shadow-soft">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-forest-950 font-sans">
                  {isEditMode ? 'Edit Job Application' : 'Track New Application'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isEditMode
                    ? 'Update application status and details'
                    : 'Record application details to monitor interview progress'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-sand-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {serverError && (
            <div className="p-3 mb-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Company & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-forest-700" />
                  <span>Company Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google, Stripe, Netflix"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={`w-full clean-input text-sm ${
                    errors.company ? 'border-rose-400 focus:border-rose-500' : ''
                  }`}
                  disabled={loading}
                />
                {errors.company && (
                  <p className="text-rose-600 text-xs mt-1">{errors.company}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-forest-700" />
                  <span>Job Role / Position *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Engineer Intern"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full clean-input text-sm ${
                    errors.role ? 'border-rose-400 focus:border-rose-500' : ''
                  }`}
                  disabled={loading}
                />
                {errors.role && (
                  <p className="text-rose-600 text-xs mt-1">{errors.role}</p>
                )}
              </div>
            </div>

            {/* Row 2: Status & Application Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
                  <span>Status *</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full clean-input text-sm bg-white"
                  disabled={loading}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-forest-700" />
                  <span>Application Date *</span>
                </label>
                <input
                  type="date"
                  value={formData.applicationDate}
                  onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                  className={`w-full clean-input text-sm ${
                    errors.applicationDate ? 'border-rose-400 focus:border-rose-500' : ''
                  }`}
                  disabled={loading}
                />
                {errors.applicationDate && (
                  <p className="text-rose-600 text-xs mt-1">{errors.applicationDate}</p>
                )}
              </div>
            </div>

            {/* Row 3: Salary Expectation & Interview Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-forest-700" />
                  <span>Salary Expectation (USD / Year)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 95000"
                  min="0"
                  value={formData.salaryExpectation}
                  onChange={(e) => setFormData({ ...formData, salaryExpectation: e.target.value })}
                  className={`w-full clean-input text-sm ${
                    errors.salaryExpectation ? 'border-rose-400 focus:border-rose-500' : ''
                  }`}
                  disabled={loading}
                />
                {errors.salaryExpectation && (
                  <p className="text-rose-600 text-xs mt-1">{errors.salaryExpectation}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-forest-700" />
                  <span>Interview Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.interviewDate}
                  onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                  className="w-full clean-input text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row 4: Job Posting URL */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-forest-700" />
                <span>Job Posting URL (Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://company.com/careers/job-listing"
                value={formData.jobLink}
                onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                className={`w-full clean-input text-sm ${
                  errors.jobLink ? 'border-rose-400 focus:border-rose-500' : ''
                }`}
                disabled={loading}
              />
              {errors.jobLink && (
                <p className="text-rose-600 text-xs mt-1">{errors.jobLink}</p>
              )}
            </div>

            {/* Row 5: Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-forest-700" />
                <span>Preparation Notes & Referrals</span>
              </label>
              <textarea
                rows={3}
                placeholder="Mention recruiter contacts, tech stack requirements, or interview prep details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full clean-input text-sm resize-none"
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-sand-200/80">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-forest inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-soft disabled:opacity-50"
              >
                <span>{loading ? 'Saving Application...' : isEditMode ? 'Update Application' : 'Create Application'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApplicationFormModal;
