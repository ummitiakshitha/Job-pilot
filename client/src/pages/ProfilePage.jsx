import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Key, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../api/authService';
import { motion } from 'framer-motion';

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.updateProfile({ name: name.trim() });
      if (res?.data) {
        updateUser(res.data);
        setMessage('Profile name updated successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile name');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await authService.updateProfile({
        currentPassword,
        newPassword,
      });
      setMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pb-4 border-b border-sand-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 tracking-tight font-sans">
            Account & Profile Settings
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1 font-medium">
            Manage your personal profile details and security credentials
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </motion.div>

      {/* Notifications */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 min-w-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 min-w-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-forest-800 text-ivory-50 text-3xl font-extrabold flex items-center justify-center shadow-soft">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <h3 className="text-xl font-bold text-forest-950 font-sans">{user?.name}</h3>
          <p className="text-sm text-forest-700 flex items-center justify-center sm:justify-start gap-1.5 font-semibold">
            <Mail className="w-4 h-4" />
            <span>{user?.email}</span>
          </p>
          <p className="text-xs text-stone-500 flex items-center justify-center sm:justify-start gap-1.5 pt-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>Member since {formatDate(user?.createdAt)}</span>
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update Name Form */}
        <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card">
          <h3 className="text-base font-bold text-forest-950 mb-4 flex items-center gap-2 font-sans">
            <User className="w-4 h-4 text-forest-700" />
            <span>Personal Details</span>
          </h3>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full clean-input text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full clean-input text-sm bg-sand-50 text-stone-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-forest px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft disabled:opacity-50"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card">
          <h3 className="text-base font-bold text-forest-950 mb-4 flex items-center gap-2 font-sans">
            <Key className="w-4 h-4 text-forest-700" />
            <span>Change Password</span>
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full clean-input text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full clean-input text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
