import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Flag, Calendar, User, AlignLeft, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './AddTaskModal.css';

const priorityOptions = [
  { value: 'high', label: 'High', color: '#ff6b6b', icon: '🔴' },
  { value: 'medium', label: 'Medium', color: '#ff9f43', icon: '🟠' },
  { value: 'low', label: 'Low', color: '#5b9aff', icon: '🔵' }
];

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

export default function AddTaskModal({ onClose, editTask = null }) {
  const { users, currentUser, addTask, updateTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with edit data or defaults
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '');
      setDescription(editTask.description || '');
      setDueDate(editTask.dueDate || '');
      setPriority(editTask.priority || 'medium');
      setStatus(editTask.status || 'todo');
      setAssigneeId(editTask.assigneeId || '');
    }
  }, [editTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate || null,
        priority,
        status,
        assigneeId: assigneeId || null,
        completed: status === 'done'
      };

      if (editTask) {
        await updateTask(editTask.id, taskData);
      } else {
        await addTask(taskData);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const selectedPriority = priorityOptions.find(p => p.value === priority);

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="add-task-modal"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="task-modal-header">
          <h2>{editTask ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {/* Title */}
          <div className="form-group">
            <input
              type="text"
              className="form-input title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <AlignLeft size={16} />
              Description
            </label>
            <textarea
              className="form-input form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details (optional)"
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} />
              Due Date
            </label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">
              <Flag size={16} />
              Priority
            </label>
            <div className="priority-options">
              {priorityOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`priority-option ${priority === option.value ? 'selected' : ''}`}
                  style={{ 
                    '--priority-color': option.color,
                    borderColor: priority === option.value ? option.color : 'transparent'
                  }}
                  onClick={() => setPriority(option.value)}
                >
                  <span className="priority-icon">{option.icon}</span>
                  <span>{option.label}</span>
                  {priority === option.value && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Status (only show when editing) */}
          {editTask && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="status-options">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`status-option ${status === option.value ? 'selected' : ''}`}
                    onClick={() => setStatus(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignee */}
          <div className="form-group">
            <label className="form-label">
              <User size={16} />
              Assign to
            </label>
            <div className="assignee-options">
              <button
                type="button"
                className={`assignee-option ${!assigneeId ? 'selected' : ''}`}
                onClick={() => setAssigneeId('')}
              >
                <span className="assignee-avatar-mini">👤</span>
                <span>Unassigned</span>
              </button>
              {users.map(user => (
                <button
                  key={user.id}
                  type="button"
                  className={`assignee-option ${assigneeId === user.id ? 'selected' : ''}`}
                  onClick={() => setAssigneeId(user.id)}
                >
                  <span 
                    className="assignee-avatar-mini"
                    style={{ background: user.color }}
                  >
                    {user.avatar || user.name.charAt(0)}
                  </span>
                  <span>{user.name}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          {/* Actions */}
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editTask ? 'Save Changes' : 'Add Task')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
