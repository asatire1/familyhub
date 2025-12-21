import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  CheckSquare, 
  Star, 
  List, 
  Image, 
  Settings, 
  Lock, 
  LogOut,
  ChevronDown,
  Users
} from 'lucide-react';
import ChoresTab from './tabs/ChoresTab';
import CalendarTab from './tabs/CalendarTab';
import TasksTab from './tabs/TasksTab';
import ListsTab from './tabs/ListsTab';
import PhotosTab from './tabs/PhotosTab';
import SettingsPanel from './SettingsPanel';
import PinEntry from './PinEntry';
import './Dashboard.css';

export default function Dashboard() {
  const { 
    currentUser, 
    users,
    settings, 
    logout,
    login,
    verifyPin,
    setPrivacyMode,
    updateActivity
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('calendar');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [switchingToUser, setSwitchingToUser] = useState(null);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pinError, setPinError] = useState(false);
  
  // User filter state - shared across calendar/tasks
  const [selectedUserFilters, setSelectedUserFilters] = useState([]);

  // User colors fallback
  const userColors = [
    '#5b9aff', '#ff6b9d', '#4ade80', '#ff9f43', 
    '#a78bfa', '#ff6b6b', '#ffd93d', '#22d3ee'
  ];

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Track user activity
  const handleInteraction = () => {
    updateActivity();
    setShowUserMenu(false);
  };

  // Handle switching to a different user
  const handleSwitchUser = (user) => {
    setShowUserMenu(false);
    
    if (user.id === currentUser?.id) {
      return; // Already logged in as this user
    }

    if (settings.requirePin && user.pin) {
      setSwitchingToUser(user);
      setShowPinEntry(true);
    } else {
      login(user);
    }
  };

  // Handle PIN submission for user switching
  const handlePinSubmit = (pin) => {
    if (verifyPin(switchingToUser.id, pin)) {
      setShowPinEntry(false);
      login(switchingToUser);
      setSwitchingToUser(null);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
    }
  };

  const handlePinClose = () => {
    setShowPinEntry(false);
    setSwitchingToUser(null);
  };

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'chores', label: 'Chores', icon: Star },
    { id: 'lists', label: 'Lists', icon: List },
    { id: 'photos', label: 'Photos', icon: Image },
  ];

  // Toggle user filter
  const toggleUserFilter = (userId) => {
    setSelectedUserFilters(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Select all users (clear filter)
  const selectAllUsers = () => {
    setSelectedUserFilters([]);
  };

  // Check if filters should be shown (calendar or tasks tab)
  const showFilters = activeTab === 'calendar' || activeTab === 'tasks';

  const formatTime = (date) => {
    if (settings.use24Hour) {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar': return <CalendarTab selectedUsers={selectedUserFilters} />;
      case 'tasks': return <TasksTab selectedUsers={selectedUserFilters} />;
      case 'chores': return <ChoresTab />;
      case 'lists': return <ListsTab />;
      case 'photos': return <PhotosTab />;
      default: return <ChoresTab />;
    }
  };

  return (
    <div className="dashboard" onClick={handleInteraction}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          {/* User dropdown */}
          <div className="user-dropdown">
            <button 
              className="current-user-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
              }}
            >
              <div 
                className="user-avatar-small"
                style={{ background: currentUser?.color || '#5b9aff' }}
              >
                {currentUser?.avatar || currentUser?.name?.charAt(0) || '?'}
              </div>
              <div className="user-info">
                <span className="user-name">{currentUser?.name}</span>
                <span className="user-role">{currentUser?.role}</span>
              </div>
              <ChevronDown size={18} className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div 
                  className="user-menu"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="menu-section">
                    <span className="menu-label">Switch User</span>
                    {users.map((user) => (
                      <button 
                        key={user.id}
                        className={`menu-item ${user.id === currentUser?.id ? 'active' : ''}`}
                        onClick={() => handleSwitchUser(user)}
                      >
                        <div 
                          className="menu-avatar"
                          style={{ background: user.color }}
                        >
                          {user.avatar || user.name.charAt(0)}
                        </div>
                        <span>{user.name}</span>
                        {user.role === 'child' && (
                          <span className="menu-points">
                            <Star size={12} fill="currentColor" /> {user.points || 0}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center - Time & Date */}
        <div className="header-center">
          <div className="header-time">{formatTime(currentTime)}</div>
          <div className="header-date">{formatDate(currentTime)}</div>
        </div>

        {/* Right - Actions */}
        <div className="header-right">
          {(currentUser?.role === 'admin' || currentUser?.role === 'parent') && (
            <button 
              className="header-btn" 
              title="Settings"
              onClick={() => setShowSettings(true)}
            >
              <Settings size={22} />
            </button>
          )}
          <button 
            className="header-btn privacy-btn" 
            title="Privacy Mode"
            onClick={() => setPrivacyMode(true)}
          >
            <Lock size={22} />
          </button>
          <button 
            className="header-btn logout-btn" 
            title="Log Out"
            onClick={logout}
          >
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <div className="nav-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Filters - only show for calendar and tasks */}
        {showFilters && (
          <div className="nav-filters">
            <button 
              className={`nav-filter-btn all ${selectedUserFilters.length === 0 ? 'active' : ''}`}
              onClick={selectAllUsers}
            >
              <Users size={14} />
              <span>All</span>
            </button>
            {users.map((user, idx) => {
              const isActive = selectedUserFilters.includes(user.id);
              const userColor = user.color || userColors[idx % userColors.length];
              return (
                <button
                  key={user.id}
                  className={`nav-filter-btn user ${isActive ? 'active' : ''} ${selectedUserFilters.length > 0 && !isActive ? 'inactive' : ''}`}
                  style={{ 
                    '--user-color': userColor,
                    backgroundColor: isActive ? userColor : undefined,
                    borderColor: userColor
                  }}
                  onClick={() => toggleUserFilter(user.id)}
                >
                  <span 
                    className="nav-filter-avatar" 
                    style={{ backgroundColor: userColor }}
                  >
                    {user.avatar || user.name.charAt(0)}
                  </span>
                  <span>{user.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Content Area */}
      <main className="dashboard-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>

      {/* PIN Entry for User Switching */}
      <AnimatePresence>
        {showPinEntry && switchingToUser && (
          <PinEntry
            user={switchingToUser}
            onSubmit={handlePinSubmit}
            onClose={handlePinClose}
            error={pinError}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
