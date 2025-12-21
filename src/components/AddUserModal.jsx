import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './AddUserModal.css';

const userColors = [
  '#5b9aff', '#ff6b9d', '#4ade80', '#ff9f43', 
  '#a78bfa', '#ff6b6b', '#ffd93d', '#22d3ee'
];

const avatarEmojis = ['👨', '👩', '👦', '👧', '🧑', '👴', '👵', '🐶', '🐱', '🦊'];

export default function AddUserModal({ onClose, editUser = null, requireAdult = false }) {
  const { addUser, updateUser, users, currentUser } = useApp();
  
  // Check if there are any adults
  const adults = users.filter(u => u.role === 'admin' || u.role === 'parent');
  const hasAdults = adults.length > 0;
  
  // Determine if current user can add users (must be adult, or no adults exist yet)
  const isCurrentUserAdult = currentUser?.role === 'admin' || currentUser?.role === 'parent';
  const canAddUsers = !hasAdults || isCurrentUserAdult || !currentUser;
  
  // If requireAdult is true, only allow admin/parent roles
  const defaultRole = requireAdult ? 'admin' : (hasAdults ? 'child' : 'admin');
  
  const [name, setName] = useState(editUser?.name || '');
  const [role, setRole] = useState(editUser?.role || defaultRole);
  const [pin, setPin] = useState(editUser?.pin || '');
  const [color, setColor] = useState(editUser?.color || userColors[0]);
  const [avatar, setAvatar] = useState(editUser?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (pin && pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (pin && !/^\d{4}$/.test(pin)) {
      setError('PIN must contain only numbers');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: name.trim(),
        role,
        pin: pin || null,
        color,
        avatar: avatar || null
      };

      if (editUser) {
        await updateUser(editUser.id, userData);
      } else {
        await addUser(userData);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {editUser ? 'Edit Family Member' : 'Add Family Member'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Preview */}
          <div className="user-preview">
            <div 
              className="preview-avatar"
              style={{ background: color }}
            >
              {avatar || name.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="preview-name">{name || 'Name'}</span>
          </div>

          {/* Name input */}
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              autoFocus
            />
          </div>

          {/* Role select */}
          <div className="form-group">
            <label className="form-label">Role</label>
            {requireAdult && (
              <div className="role-notice">
                <Shield size={16} />
                <span>First user must be an adult to manage the family hub</span>
              </div>
            )}
            <div className="role-options">
              {[
                { value: 'admin', label: 'Admin', desc: 'Full access to everything', isAdult: true },
                { value: 'parent', label: 'Parent', desc: 'Manage tasks & view all', isAdult: true },
                { value: 'child', label: 'Child', desc: 'Own tasks & earn points', isAdult: false }
              ].map((option) => {
                // Disable child option if requireAdult is true
                const isDisabled = requireAdult && !option.isAdult;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`role-option ${role === option.value ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && setRole(option.value)}
                    disabled={isDisabled}
                  >
                    <span className="role-label">{option.label}</span>
                    <span className="role-desc">{option.desc}</span>
                    {role === option.value && (
                      <Check size={18} className="role-check" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN input */}
          <div className="form-group">
            <label className="form-label">
              PIN (4 digits)
              <span className="form-hint">Optional but recommended</span>
            </label>
            <input
              type="password"
              className="form-input pin-input"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              inputMode="numeric"
              maxLength={4}
            />
          </div>

          {/* Color picker */}
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {userColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                >
                  {color === c && <Check size={18} />}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar picker (optional) */}
          <div className="form-group">
            <label className="form-label">
              Avatar (optional)
              <span className="form-hint">Leave empty to use initials</span>
            </label>
            <div className="avatar-picker">
              <button
                type="button"
                className={`avatar-option ${!avatar ? 'selected' : ''}`}
                onClick={() => setAvatar('')}
              >
                {name.charAt(0).toUpperCase() || '?'}
              </button>
              {avatarEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`avatar-option ${avatar === emoji ? 'selected' : ''}`}
                  onClick={() => setAvatar(emoji)}
                >
                  {emoji}
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
              {loading ? 'Saving...' : (editUser ? 'Save Changes' : 'Add Member')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
