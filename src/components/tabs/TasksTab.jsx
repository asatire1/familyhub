import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Check, 
  Clock, 
  User, 
  Calendar,
  Flag,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Filter,
  ListTodo
} from 'lucide-react';
import AddTaskModal from '../AddTaskModal';
import './TasksTab.css';

const priorityConfig = {
  high: { label: 'High', color: '#ff6b6b', icon: '🔴' },
  medium: { label: 'Medium', color: '#ff9f43', icon: '🟠' },
  low: { label: 'Low', color: '#5b9aff', icon: '🔵' }
};

const statusConfig = {
  todo: { label: 'To Do', color: '#a78bfa' },
  inProgress: { label: 'In Progress', color: '#5b9aff' },
  done: { label: 'Done', color: '#4ade80' }
};

export default function TasksTab() {
  const { 
    users, 
    currentUser,
    getVisibleTasks,
    toggleTaskComplete,
    updateTaskStatus,
    deleteTask,
    canManageTasks 
  } = useApp();

  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterUser, setFilterUser] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [taskMenu, setTaskMenu] = useState(null);

  // Get and filter tasks
  const allTasks = useMemo(() => getVisibleTasks(), [getVisibleTasks]);
  
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (filterUser !== 'all' && task.assigneeId !== filterUser) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      return true;
    });
  }, [allTasks, filterUser, filterPriority]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => ({
    todo: filteredTasks.filter(t => t.status === 'todo' || (!t.status && !t.completed)),
    inProgress: filteredTasks.filter(t => t.status === 'inProgress'),
    done: filteredTasks.filter(t => t.status === 'done' || t.completed)
  }), [filteredTasks]);

  // Check if task is overdue
  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    return task.dueDate < new Date().toISOString().split('T')[0];
  };

  // Format due date
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get user by ID
  const getUserById = (userId) => users.find(u => u.id === userId);

  // Handle drag end for status change
  const handleDragEnd = async (taskId, newStatus) => {
    await updateTaskStatus(taskId, newStatus);
  };

  // Handle task completion toggle
  const handleToggleComplete = async (taskId, e) => {
    e.stopPropagation();
    await toggleTaskComplete(taskId);
  };

  // Handle delete
  const handleDelete = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(taskId);
      setTaskMenu(null);
    }
  };

  // Render task card
  const TaskCard = ({ task, showStatus = false }) => {
    const assignee = getUserById(task.assigneeId);
    const priority = priorityConfig[task.priority] || priorityConfig.medium;
    const overdue = isOverdue(task);

    return (
      <motion.div
        className={`task-card ${task.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -2 }}
        onClick={() => {
          if (canManageTasks()) {
            setEditingTask(task);
            setShowAddTask(true);
          }
        }}
      >
        {/* Checkbox */}
        <button 
          className={`task-checkbox ${task.completed ? 'checked' : ''}`}
          onClick={(e) => handleToggleComplete(task.id, e)}
        >
          {task.completed ? (
            <CheckCircle2 size={22} />
          ) : (
            <Circle size={22} />
          )}
        </button>

        {/* Content */}
        <div className="task-content">
          <div className="task-header">
            <span className="task-title">{task.title}</span>
            {canManageTasks() && (
              <button 
                className="task-menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setTaskMenu(taskMenu === task.id ? null : task.id);
                }}
              >
                <MoreVertical size={16} />
              </button>
            )}
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-meta">
            {/* Priority */}
            <span 
              className="task-priority"
              style={{ color: priority.color }}
            >
              <Flag size={12} fill={priority.color} />
              {priority.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className={`task-due ${overdue ? 'overdue' : ''}`}>
                {overdue && <AlertCircle size={12} />}
                <Calendar size={12} />
                {formatDueDate(task.dueDate)}
              </span>
            )}

            {/* Assignee */}
            {assignee && (
              <span className="task-assignee">
                <span 
                  className="assignee-avatar"
                  style={{ background: assignee.color }}
                >
                  {assignee.avatar || assignee.name.charAt(0)}
                </span>
                {assignee.name}
              </span>
            )}

            {/* Status badge (for list view) */}
            {showStatus && (
              <span 
                className="task-status-badge"
                style={{ background: statusConfig[task.status || 'todo'].color }}
              >
                {statusConfig[task.status || 'todo'].label}
              </span>
            )}
          </div>
        </div>

        {/* Task menu dropdown */}
        <AnimatePresence>
          {taskMenu === task.id && (
            <motion.div 
              className="task-menu"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => {
                setEditingTask(task);
                setShowAddTask(true);
                setTaskMenu(null);
              }}>
                <Edit2 size={14} />
                Edit
              </button>
              <button 
                className="delete"
                onClick={() => handleDelete(task.id)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Render column
  const TaskColumn = ({ status, tasks }) => {
    const config = statusConfig[status];
    
    return (
      <div className="task-column">
        <div className="column-header">
          <div 
            className="column-indicator"
            style={{ background: config.color }}
          />
          <h3>{config.label}</h3>
          <span className="column-count">{tasks.length}</span>
        </div>

        <div className="column-tasks">
          <AnimatePresence>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="column-empty">
              <p>No tasks</p>
            </div>
          )}
        </div>

        {/* Quick add button at bottom */}
        {canManageTasks() && status === 'todo' && (
          <button 
            className="quick-add-task"
            onClick={() => setShowAddTask(true)}
          >
            <Plus size={18} />
            Add task
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="tasks-tab">
      {/* Header */}
      <div className="tasks-header">
        <div className="tasks-title-section">
          <h2>Tasks</h2>
          <div className="task-stats">
            <span className="stat">
              <Circle size={14} />
              {tasksByStatus.todo.length} to do
            </span>
            <span className="stat">
              <Clock size={14} />
              {tasksByStatus.inProgress.length} in progress
            </span>
            <span className="stat done">
              <Check size={14} />
              {tasksByStatus.done.length} done
            </span>
          </div>
        </div>

        <div className="tasks-actions">
          {/* View toggle */}
          <div className="view-toggle">
            <button 
              className={viewMode === 'board' ? 'active' : ''}
              onClick={() => setViewMode('board')}
              title="Board view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="5" height="18" rx="1"/>
                <rect x="10" y="3" width="5" height="12" rx="1"/>
                <rect x="17" y="3" width="5" height="8" rx="1"/>
              </svg>
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <ListTodo size={18} />
            </button>
          </div>

          {/* Filter button */}
          <button 
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filter
          </button>

          {/* Add task button */}
          {canManageTasks() && (
            <button 
              className="add-task-btn"
              onClick={() => setShowAddTask(true)}
            >
              <Plus size={20} />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="filters-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="filter-group">
              <label>Assignee</label>
              <select 
                value={filterUser} 
                onChange={(e) => setFilterUser(e.target.value)}
              >
                <option value="all">All members</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Priority</label>
              <select 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {(filterUser !== 'all' || filterPriority !== 'all') && (
              <button 
                className="clear-filters"
                onClick={() => {
                  setFilterUser('all');
                  setFilterPriority('all');
                }}
              >
                Clear filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board View */}
      {viewMode === 'board' && (
        <div className="tasks-board">
          <TaskColumn status="todo" tasks={tasksByStatus.todo} />
          <TaskColumn status="inProgress" tasks={tasksByStatus.inProgress} />
          <TaskColumn status="done" tasks={tasksByStatus.done} />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <div className="no-tasks">
              <ListTodo size={48} strokeWidth={1.5} />
              <p>No tasks yet</p>
              {canManageTasks() && (
                <button onClick={() => setShowAddTask(true)}>
                  <Plus size={18} />
                  Create your first task
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {filteredTasks
                .sort((a, b) => {
                  // Sort by: incomplete first, then by priority, then by due date
                  if (a.completed !== b.completed) return a.completed ? 1 : -1;
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  if (a.priority !== b.priority) {
                    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
                  }
                  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
                  if (a.dueDate) return -1;
                  if (b.dueDate) return 1;
                  return 0;
                })
                .map(task => (
                  <TaskCard key={task.id} task={task} showStatus />
                ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <AddTaskModal
            onClose={() => {
              setShowAddTask(false);
              setEditingTask(null);
            }}
            editTask={editingTask}
          />
        )}
      </AnimatePresence>

      {/* Click outside to close menu */}
      {taskMenu && (
        <div 
          className="menu-backdrop"
          onClick={() => setTaskMenu(null)}
        />
      )}
    </div>
  );
}
