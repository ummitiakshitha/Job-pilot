import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import applicationService from '../../api/applicationService';

export const PreparationChecklist = ({ application, onRefresh }) => {
  const [tasks, setTasks] = useState(application?.checklist || []);
  const [newTaskText, setNewTaskText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync tasks when application prop changes
  React.useEffect(() => {
    if (application?.checklist) {
      setTasks(application.checklist);
    }
  }, [application?.checklist]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Toggle task completion
  const handleToggleTask = async (taskId) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);

    try {
      const res = await applicationService.toggleChecklistTask(application._id, taskId);
      if (res?.data && onRefresh) {
        onRefresh(res.data);
      }
    } catch (err) {
      console.error('Failed to toggle checklist task:', err);
      // Revert on error
      setTasks(tasks);
    }
  };

  // Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    setIsSubmitting(true);
    const textToAdd = newTaskText.trim();
    setNewTaskText('');

    try {
      const res = await applicationService.addChecklistTask(application._id, textToAdd);
      if (res?.data?.checklist) {
        setTasks(res.data.checklist);
        if (onRefresh) onRefresh(res.data);
      }
    } catch (err) {
      console.error('Failed to add checklist task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);

    try {
      const res = await applicationService.deleteChecklistTask(application._id, taskId);
      if (res?.data && onRefresh) {
        onRefresh(res.data);
      }
    } catch (err) {
      console.error('Failed to delete checklist task:', err);
      setTasks(tasks);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-forest-700" />
            <h4 className="text-sm font-bold text-forest-950 font-sans">
              Interview Preparation Checklist
            </h4>
          </div>
          <span className="text-xs font-bold text-forest-800">
            {completedCount} of {totalCount} completed ({percentage}%)
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-2 rounded-full bg-sand-200 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              percentage === 100
                ? 'bg-emerald-600'
                : percentage > 50
                ? 'bg-forest-600'
                : 'bg-amber-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-sand-300 text-center text-xs text-stone-400">
            No preparation tasks yet. Add one below to get started!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                task.completed
                  ? 'bg-forest-50/50 border-forest-100 text-stone-500'
                  : 'bg-white border-sand-200 text-stone-800 shadow-sm'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleTask(task.id)}
                className="flex items-center gap-2.5 text-left flex-1"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-stone-300 hover:text-forest-600 flex-shrink-0 transition-colors" />
                )}
                <span
                  className={`text-xs font-medium ${
                    task.completed ? 'line-through text-stone-400' : 'text-stone-800'
                  }`}
                >
                  {task.text}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteTask(task.id)}
                className="p-1 rounded text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add New Task Form */}
      <form onSubmit={handleAddTask} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="Add custom preparation task..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl text-xs clean-input placeholder-stone-400"
        />
        <button
          type="submit"
          disabled={!newTaskText.trim() || isSubmitting}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl btn-forest text-xs font-semibold disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};

export default PreparationChecklist;
