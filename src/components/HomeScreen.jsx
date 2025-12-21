import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Settings, 
  UserPlus,
  Star,
  ChevronRight,
  Sun,
  Moon,
  CloudSun
} from 'lucide-react';
import PinEntry from './PinEntry';
import AddUserModal from './AddUserModal';
import './HomeScreen.css';

export default function HomeScreen() {
  const { 
    users, 
    settings, 
    chores, 
    tasks,
    choreCompletions,
    verifyPin,
    completeChore,
    updateTaskStatus,
    login
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedAction, setSelectedAction] = useState(null); // { type: 'chore'|'task', item, user, targetStatus }
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const adults = users.filter(u => u.role === 'admin' || u.role === 'parent');
  const hasAdults = adults.length > 0;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: 'Good Morning', icon: <Sun size={24} /> };
    if (hour < 17) return { text: 'Good Afternoon', icon: <CloudSun size={24} /> };
    return { text: 'Good Evening', icon: <Moon size={24} /> };
  };

  const greeting = getGreeting();

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: !settings.use24Hour
    });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric',
      month: 'long'
    });
  };

  // Get chore completion status for a user
  const getUserChoreCompletion = (userId, choreId) => {
    return choreCompletions.find(
      c => c.userId === userId && c.choreId === choreId && c.date === today
    );
  };

  // Get task status for display
  const getTaskStatus = (task) => {
    if (task.completed || task.status === 'done') return 'done';
    if (task.status === 'inProgress') return 'inProgress';
    return 'todo';
  };

  // Get today's tasks
  const getTodaysTasks = () => {
    return tasks.filter(task => {
      if (task.completed) return true; // Show completed tasks
      if (!task.dueDate) return false;
      return task.dueDate === today;
    });
  };

  // Handle status tap - show PIN entry
  const handleStatusTap = (type, item, user, targetStatus) => {
    setSelectedAction({ type, item, user, targetStatus });
    
    if (settings.requirePin && user.pin) {
      setPinError(false);
      setShowPinEntry(true);
    } else {
      executeAction({ type, item, user, targetStatus });
    }
  };

  // Execute the action after PIN verification
  const executeAction = async (action) => {
    const { type, item, user, targetStatus } = action;
    
    try {
      if (type === 'chore') {
        const result = await completeChore(user.id, item.id);
        if (result.success) {
          setCelebrationData({ 
            userName: user.name, 
            points: result.pointsEarned,
            choreName: item.name 
          });
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2000);
        }
      } else if (type === 'task') {
        await updateTaskStatus(item.id, targetStatus);
      }
    } catch (err) {
      console.error('Error executing action:', err);
    }
    
    setSelectedAction(null);
  };

  // Handle PIN submission
  const handlePinSubmit = (pin) => {
    if (verifyPin(selectedAction.user.id, pin)) {
      setShowPinEntry(false);
      executeAction(selectedAction);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
    }
  };

  // Handle PIN close
  const handlePinClose = () => {
    setShowPinEntry(false);
    setSelectedAction(null);
  };

  // Navigate to dashboard as a user
  const handleUserLogin = (user) => {
    if (settings.requirePin && user.pin) {
      setSelectedAction({ type: 'login', user });
      setShowPinEntry(true);
    } else {
      login(user);
    }
  };

  // Handle login PIN
  const handleLoginPin = (pin) => {
    if (verifyPin(selectedAction.user.id, pin)) {
      setShowPinEntry(false);
      login(selectedAction.user);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
    }
  };

  const userColors = [
    '#5b9aff', '#ff6b9d', '#4ade80', '#ff9f43', 
    '#a78bfa', '#ff6b6b', '#ffd93d', '#22d3ee'
  ];

  const todaysTasks = getTodaysTasks();

  // Status icon component
  const StatusIcon = ({ status, size = 20 }) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 size={size} className="status-icon done" />;
      case 'inProgress':
        return <PlayCircle size={size} className="status-icon in-progress" />;
      default:
        return <Circle size={size} className="status-icon todo" />;
    }
  };

  // Get next status
  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'todo': return 'inProgress';
      case 'inProgress': return 'done';
      default: return 'todo';
    }
  };

  return (
    <div className="home-screen">
      {/* Background decoration */}
      <div className="home-bg-decoration">
        <div className="bg-gradient" />
      </div>

      {/* Header */}
      <header className="home-header">
        <div className="header-left">
          <div className="greeting">
            {greeting.icon}
            <span>{greeting.text}</span>
          </div>
          <h1 className="family-name">{settings.familyName}</h1>
        </div>
        <div className="header-right">
          <div className="time-display">
            <Clock size={20} />
            <span className="time">{formatTime(currentTime)}</span>
          </div>
          <div className="date-display">
            <Calendar size={18} />
            <span>{formatDate(currentTime)}</span>
          </div>
        </div>
      </header>

      {/* First-time setup - no adults */}
      {!hasAdults && (
        <motion.div 
          className="setup-prompt"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="setup-icon">👋</div>
          <h2>Welcome to Family Hub!</h2>
          <p>Let's set up your family. Add an adult to get started.</p>
          <motion.button
            className="setup-btn"
            onClick={() => setShowAddUser(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <UserPlus size={20} />
            <span>Add First Adult</span>
          </motion.button>
        </motion.div>
      )}

      {/* Main Content - Only show if there are adults */}
      {hasAdults && (
        <main className="home-content">
          {/* Chores Section */}
          {chores.length > 0 && users.length > 0 && (
            <section className="home-section">
              <div className="section-header">
                <h2>Today's Chores</h2>
              </div>
              
              <div className="chores-board">
                {/* Header row with user avatars */}
                <div className="board-header">
                  <div className="board-cell chore-label">Chore</div>
                  {users.map((user, idx) => (
                    <div key={user.id} className="board-cell user-header">
                      <div 
                        className="mini-avatar"
                        style={{ background: user.color || userColors[idx % userColors.length] }}
                      >
                        {user.avatar || user.name.charAt(0)}
                      </div>
                      <span className="user-name-mini">{user.name}</span>
                    </div>
                  ))}
                </div>

                {/* Chore rows */}
                {chores.map((chore) => (
                  <div key={chore.id} className="board-row">
                    <div className="board-cell chore-info">
                      <span className="chore-icon">{chore.icon}</span>
                      <span className="chore-name">{chore.name}</span>
                      <span className="chore-points">
                        <Star size={12} fill="currentColor" />
                        {chore.points}
                      </span>
                    </div>
                    {users.map((user, idx) => {
                      const completion = getUserChoreCompletion(user.id, chore.id);
                      const isCompleted = !!completion;
                      
                      return (
                        <motion.button
                          key={user.id}
                          className={`board-cell status-cell ${isCompleted ? 'completed' : ''}`}
                          onClick={() => !isCompleted && handleStatusTap('chore', chore, user, 'done')}
                          disabled={isCompleted}
                          whileHover={!isCompleted ? { scale: 1.1 } : {}}
                          whileTap={!isCompleted ? { scale: 0.9 } : {}}
                        >
                          <StatusIcon status={isCompleted ? 'done' : 'todo'} />
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tasks Section */}
          {todaysTasks.length > 0 && (
            <section className="home-section">
              <div className="section-header">
                <h2>Today's Tasks</h2>
              </div>
              
              <div className="tasks-list">
                {todaysTasks.map((task) => {
                  const assignee = users.find(u => u.id === task.assigneeId);
                  const status = getTaskStatus(task);
                  const nextStatus = getNextStatus(status);
                  const userIdx = users.findIndex(u => u.id === task.assigneeId);
                  
                  return (
                    <motion.div 
                      key={task.id} 
                      className={`task-row ${status}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="task-info">
                        <span className="task-title">{task.title}</span>
                        {task.description && (
                          <span className="task-description">{task.description}</span>
                        )}
                      </div>
                      
                      {assignee && (
                        <div className="task-assignee">
                          <div 
                            className="mini-avatar"
                            style={{ background: assignee.color || userColors[userIdx % userColors.length] }}
                          >
                            {assignee.avatar || assignee.name.charAt(0)}
                          </div>
                          <span>{assignee.name}</span>
                        </div>
                      )}
                      
                      <motion.button
                        className={`task-status-btn ${status}`}
                        onClick={() => assignee && status !== 'done' && handleStatusTap('task', task, assignee, nextStatus)}
                        disabled={status === 'done' || !assignee}
                        whileHover={status !== 'done' ? { scale: 1.05 } : {}}
                        whileTap={status !== 'done' ? { scale: 0.95 } : {}}
                      >
                        <StatusIcon status={status} size={18} />
                        <span>
                          {status === 'done' ? 'Done' : status === 'inProgress' ? 'In Progress' : 'To Do'}
                        </span>
                        {status !== 'done' && <ChevronRight size={16} />}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty state */}
          {chores.length === 0 && todaysTasks.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h3>All Clear!</h3>
              <p>No chores or tasks for today. Enjoy your day!</p>
            </div>
          )}
        </main>
      )}

      {/* Footer - User quick access */}
      {hasAdults && (
        <footer className="home-footer">
          <div className="footer-users">
            {users.map((user, idx) => (
              <motion.button
                key={user.id}
                className="footer-user"
                onClick={() => handleUserLogin(user)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className="footer-avatar"
                  style={{ background: user.color || userColors[idx % userColors.length] }}
                >
                  {user.avatar || user.name.charAt(0)}
                </div>
                <span>{user.name}</span>
                {user.role === 'child' && (
                  <div className="footer-points">
                    <Star size={12} fill="currentColor" />
                    {user.points || 0}
                  </div>
                )}
              </motion.button>
            ))}
            
            {/* Add user button - only if adults exist */}
            <motion.button
              className="footer-user add-user"
              onClick={() => setShowAddUser(true)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="footer-avatar add">
                <UserPlus size={20} />
              </div>
              <span>Add</span>
            </motion.button>
          </div>
          
          {/* Settings button */}
          <motion.button
            className="settings-btn"
            onClick={() => {
              // Login as first adult to access settings
              const firstAdult = adults[0];
              if (firstAdult) handleUserLogin(firstAdult);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={20} />
          </motion.button>
        </footer>
      )}

      {/* PIN Entry Modal */}
      <AnimatePresence>
        {showPinEntry && selectedAction && (
          <PinEntry
            user={selectedAction.user}
            onSubmit={selectedAction.type === 'login' ? handleLoginPin : handlePinSubmit}
            onClose={handlePinClose}
            error={pinError}
          />
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUser && (
          <AddUserModal 
            onClose={() => setShowAddUser(false)} 
            requireAdult={!hasAdults}
          />
        )}
      </AnimatePresence>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && celebrationData && (
          <motion.div 
            className="celebration-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="celebration-content"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -50 }}
            >
              <div className="celebration-emoji">⭐</div>
              <h2>{celebrationData.userName} completed</h2>
              <p className="celebration-chore">{celebrationData.choreName}</p>
              <div className="celebration-points">
                <Star size={24} fill="currentColor" />
                <span>+{celebrationData.points}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
