import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Table as TableIcon,
  Kanban as KanbanIcon,
  Plus,
  X,
  RotateCcw,
  Download,
  Star,
} from 'lucide-react';
import applicationService from '../api/applicationService';
import ApplicationTable from '../components/applications/ApplicationTable';
import KanbanBoard from '../components/applications/KanbanBoard';
import ApplicationFormModal from '../components/applications/ApplicationFormModal';
import ApplicationDetailsModal from '../components/applications/ApplicationDetailsModal';
import ConfirmDeleteModal from '../components/common/ConfirmDeleteModal';
import { exportApplicationsToCSV } from '../utils/formatters';
import { motion } from 'framer-motion';

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected'];

export const ApplicationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const context = useOutletContext();
  const refreshTrigger = context?.refreshTrigger || 0;

  // View mode
  const initialView = searchParams.get('view') === 'kanban' ? 'kanban' : 'table';
  const [viewMode, setViewMode] = useState(initialView);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [favoritesOnly, setFavoritesOnly] = useState(searchParams.get('favorites') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'applicationDate');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');

  // Data state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        sortBy,
        order: sortOrder,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (favoritesOnly) params.favoritesOnly = true;

      const res = await applicationService.getApplications(params);
      if (res?.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter, favoritesOnly, sortBy, sortOrder, refreshTrigger]);

  // Keep query params in URL updated
  useEffect(() => {
    const nextParams = {};
    if (viewMode === 'kanban') nextParams.view = 'kanban';
    if (search.trim()) nextParams.search = search.trim();
    if (statusFilter) nextParams.status = statusFilter;
    if (favoritesOnly) nextParams.favorites = 'true';
    if (sortBy !== 'applicationDate') nextParams.sortBy = sortBy;
    if (sortOrder !== 'desc') nextParams.order = sortOrder;
    setSearchParams(nextParams, { replace: true });
  }, [viewMode, search, statusFilter, favoritesOnly, sortBy, sortOrder]);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setFavoritesOnly(false);
    setSortBy('applicationDate');
    setSortOrder('desc');
  };

  // Status PATCH update
  const handleStatusChange = async (appId, newStatus) => {
    try {
      // Optimistic UI update
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );

      await applicationService.updateStatus(appId, newStatus);
      if (context?.triggerRefresh) {
        context.triggerRefresh();
      }
    } catch (err) {
      console.error('Status update failed:', err);
      fetchApplications(); // Revert on failure
    }
  };

  // Toggle favorite / bookmark
  const handleToggleFavorite = async (appId) => {
    try {
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, isFavorite: !a.isFavorite } : a))
      );
      await applicationService.toggleFavorite(appId);
      if (context?.triggerRefresh) {
        context.triggerRefresh();
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      fetchApplications();
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!selectedApp) return;
    setDeleting(true);
    try {
      await applicationService.deleteApplication(selectedApp._id);
      setIsDeleteModalOpen(false);
      setSelectedApp(null);
      fetchApplications();
      if (context?.triggerRefresh) {
        context.triggerRefresh();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.message || 'Failed to delete application');
    } finally {
      setDeleting(false);
    }
  };

  const handleModalSuccess = () => {
    fetchApplications();
    if (context?.triggerRefresh) {
      context.triggerRefresh();
    }
  };

  const hasActiveFilters =
    search || statusFilter || favoritesOnly || sortBy !== 'applicationDate' || sortOrder !== 'desc';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200/90"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
            Job Applications
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
            Manage, filter, advance, and drag your active recruitment pipelines ({applications.length} displayed)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* CSV Export Button */}
          <button
            onClick={() => exportApplicationsToCSV(applications)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-sand-200 hover:bg-sand-50 text-stone-700 text-xs font-semibold shadow-sm transition-all"
            title="Export applications to CSV"
          >
            <Download className="w-3.5 h-3.5 text-forest-700" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white border border-sand-200 shadow-soft">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-forest-50 text-forest-900 border border-forest-100 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-forest-50 text-forest-900 border border-forest-100 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <KanbanIcon className="w-4 h-4" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="btn-forest inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-soft"
          >
            <Plus className="w-4 h-4" />
            <span>New Application</span>
          </button>
        </div>
      </motion.div>

      {/* Search, Filter & Sort Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="p-4 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm clean-input placeholder-stone-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Favorites Filter Toggle */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              favoritesOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-sm'
                : 'bg-white text-stone-600 border-sand-200 hover:bg-sand-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-500 text-amber-600' : 'text-stone-400'}`} />
            <span>Favorites</span>
          </button>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm clean-input bg-white text-stone-800"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm clean-input bg-white text-stone-800"
          >
            <option value="applicationDate">Date Applied</option>
            <option value="company">Company Name</option>
            <option value="salaryExpectation">Salary Expectation</option>
          </select>

          {/* Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-2 rounded-xl bg-white border border-sand-200 text-stone-600 hover:text-forest-900 shadow-sm"
            title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200"
              title="Clear all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Content Render: Table or Kanban */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {viewMode === 'table' ? (
          <ApplicationTable
            applications={applications}
            loading={loading}
            onView={(app) => {
              setSelectedApp(app);
              setIsDetailsModalOpen(true);
            }}
            onEdit={(app) => {
              setSelectedApp(app);
              setIsEditModalOpen(true);
            }}
            onDelete={(app) => {
              setSelectedApp(app);
              setIsDeleteModalOpen(true);
            }}
            onStatusChange={handleStatusChange}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <KanbanBoard
            applications={applications}
            loading={loading}
            onView={(app) => {
              setSelectedApp(app);
              setIsDetailsModalOpen(true);
            }}
            onEdit={(app) => {
              setSelectedApp(app);
              setIsEditModalOpen(true);
            }}
            onDelete={(app) => {
              setSelectedApp(app);
              setIsDeleteModalOpen(true);
            }}
            onStatusChange={handleStatusChange}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </motion.div>

      {/* Modals */}
      <ApplicationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        application={selectedApp}
        onEdit={(app) => {
          setSelectedApp(app);
          setIsEditModalOpen(true);
        }}
        onDelete={(app) => {
          setSelectedApp(app);
          setIsDeleteModalOpen(true);
        }}
        onStatusUpdated={(updatedApp) => {
          setApplications((prev) =>
            prev.map((a) => (a._id === updatedApp._id ? updatedApp : a))
          );
          if (context?.triggerRefresh) context.triggerRefresh();
        }}
        onRefresh={fetchApplications}
      />

      <ApplicationFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        applicationToEdit={selectedApp}
        onSuccess={handleModalSuccess}
      />

      <ApplicationFormModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        itemName={selectedApp ? `${selectedApp.role} at ${selectedApp.company}` : ''}
      />
    </div>
  );
};

export default ApplicationsPage;
