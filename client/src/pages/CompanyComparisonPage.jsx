import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  Building,
  Briefcase,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import applicationService from '../api/applicationService';
import { formatINR, formatDate } from '../utils/formatters';

export const CompanyComparisonPage = () => {
  const [applications, setApplications] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await applicationService.getApplications({ limit: 50 });
        if (res?.data) {
          setApplications(res.data);
          // Default select first two
          if (res.data.length >= 2) {
            setSelectedIds([res.data[0]._id, res.data[1]._id]);
          } else if (res.data.length === 1) {
            setSelectedIds([res.data[0]._id]);
          }
        }
      } catch (err) {
        console.error('Failed to load applications for comparison', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const toggleSelectApp = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert('You can compare up to 3 opportunities side-by-side.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedApps = applications.filter((a) => selectedIds.includes(a._id));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-4 border-b border-sand-200/90"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-forest-800 text-xs font-semibold mb-2 shadow-sm">
          <Scale className="w-3.5 h-3.5" />
          <span>Multi-Offer & Opportunity Matrix</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
          Company & Role Comparison
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
          Compare tracked opportunities side-by-side across salary compensation, interview status, preparation effort, and requirements.
        </p>
      </motion.div>

      {/* Selector Pills */}
      <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-3">
        <h3 className="text-xs font-bold text-forest-950 font-sans">Select Opportunities to Compare (Up to 3)</h3>
        <div className="flex flex-wrap gap-2">
          {applications.map((app) => {
            const isSelected = selectedIds.includes(app._id);
            return (
              <button
                key={app._id}
                onClick={() => toggleSelectApp(app._id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-forest-900 border-forest-900 text-white shadow-soft'
                    : 'bg-ivory-50 border-sand-200 text-stone-700 hover:border-forest-300'
                }`}
              >
                {app.company} — {app.role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      {selectedApps.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-sand-200 shadow-card text-center text-stone-400">
          <p className="text-xs">Please select at least 1 opportunity above to view comparison details.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {selectedApps.map((app) => (
            <div key={app._id} className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card space-y-4">
              <div className="border-b border-sand-100 pb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  app.status === 'Offer'
                    ? 'bg-emerald-100 text-emerald-800'
                    : app.status === 'Interview'
                    ? 'bg-amber-100 text-amber-800'
                    : app.status === 'Applied'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {app.status}
                </span>
                <h3 className="text-lg font-bold text-forest-950 font-sans mt-2">{app.role}</h3>
                <p className="text-xs text-stone-500 font-medium flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-forest-700" />
                  <span>{app.company}</span>
                </p>
              </div>

              {/* Attributes Matrix */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-stone-400 block text-[11px]">Location & Work Mode</span>
                  <span className="font-semibold text-stone-800">{app.location || 'Not specified'}</span>
                </div>

                <div>
                  <span className="text-stone-400 block text-[11px]">Expected CTC</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {app.salary ? formatINR(app.salary) : 'Not specified'}
                  </span>
                </div>

                {app.offeredSalary && (
                  <div>
                    <span className="text-stone-400 block text-[11px]">Confirmed Offer Compensation</span>
                    <span className="font-bold text-forest-950 text-sm">
                      {formatINR(app.offeredSalary)}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-stone-400 block text-[11px]">Interview Date</span>
                  <span className="font-semibold text-stone-800">
                    {app.interviewDate ? formatDate(app.interviewDate) : 'Not scheduled'}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 block text-[11px]">Prep Tasks Checklist</span>
                  <span className="font-semibold text-stone-800">
                    {app.checklist && app.checklist.length > 0
                      ? `${app.checklist.filter((t) => t.completed).length} of ${app.checklist.length} done`
                      : 'No prep checklist created'}
                  </span>
                </div>

                {app.notes && (
                  <div className="pt-2 border-t border-sand-100">
                    <span className="text-stone-400 block text-[11px] mb-1">Application Notes</span>
                    <p className="text-stone-600 text-[11px] line-clamp-3 bg-ivory-50 p-2 rounded-lg border border-sand-200">
                      {app.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CompanyComparisonPage;
