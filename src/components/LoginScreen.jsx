import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { UserPlus, Star } from 'lucide-react';
import PinEntry from './PinEntry';
import AddUserModal from './AddUserModal';
import './LoginScreen.css';

export default function LoginScreen() {
  const { users, settings, login, verifyPin } = useApp();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [pinError, setPinError] = useState(false);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setPinError(false);
    
    if (settings.requirePin && user.pin) {
      setShowPinEntry(true);
    } else {
      login(user);
    }
  };

  const handlePinSubmit = (pin) => {
    if (verifyPin(selectedUser.id, pin)) {
      setShowPinEntry(false);
      login(selectedUser);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
    }
  };

  const handlePinClose = () => {
    setShowPinEntry(false);
    setSelectedUser(null);
  };

  const userColors = [
    '#5b9aff', '#ff6b9d', '#4ade80', '#ff9f43', 
    '#a78bfa', '#ff6b6b', '#ffd93d', '#22d3ee'
  ];

  return (
    <div className="login-screen">
      {/* Background decoration */}
      <div className="login-bg-decoration">
        <div className="bg-circle bg-circle-1" />
        <div className="bg-circle bg-circle-2" />
        <div className="bg-circle bg-circle-3" />
      </div>

      <motion.div 
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="login-header">
          <motion.div 
            className="login-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            🏠
          </motion.div>
          <h1 className="login-title">{settings.familyName} Hub</h1>
          <p className="login-subtitle">Who's using the hub?</p>
        </div>

        {/* User Grid */}
        <div className="user-grid">
          <AnimatePresence>
            {users.map((user, index) => (
              <motion.button
                key={user.id}
                className="user-card"
                onClick={() => handleUserSelect(user)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className="user-avatar"
                  style={{ background: user.color || userColors[index % userColors.length] }}
                >
                  {user.avatar || user.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.name}</span>
                {user.role === 'child' && (
                  <div className="user-points">
                    <Star size={14} fill="currentColor" />
                    <span>{user.points || 0}</span>
                  </div>
                )}
                <span className="user-role">{user.role}</span>
              </motion.button>
            ))}
          </AnimatePresence>

          {/* Add User Card */}
          <motion.button
            className="user-card add-user-card"
            onClick={() => setShowAddUser(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: users.length * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="add-user-icon">
              <UserPlus size={32} />
            </div>
            <span className="user-name">Add Person</span>
          </motion.button>
        </div>

        {/* Quick Chore Button */}
        <motion.button
          className="quick-chore-btn"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {/* Will implement quick chore flow */}}
        >
          <span className="quick-chore-icon">⚡</span>
          <span className="quick-chore-text">
            <strong>Quick Chore Log</strong>
            <small>Tap to log a completed chore</small>
          </span>
        </motion.button>
      </motion.div>

      {/* PIN Entry Modal */}
      <AnimatePresence>
        {showPinEntry && selectedUser && (
          <PinEntry
            user={selectedUser}
            onSubmit={handlePinSubmit}
            onClose={handlePinClose}
            error={pinError}
          />
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUser && (
          <AddUserModal onClose={() => setShowAddUser(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
