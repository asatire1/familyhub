import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  X, 
  User, 
  Users, 
  Clock, 
  Palette, 
  Bell, 
  Shield,
  Trash2,
  Edit2,
  Plus,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Star,
  Check
} from 'lucide-react';
import './SettingsPanel.css';

const themeOptions = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'auto', label: 'Auto', icon: Monitor }
];

export default function SettingsPanel({ onClose }) {
  const { 
    settings, 
    updateSettings, 
    users, 
    currentUser,
    deleteUser,
    canManageUsers 
  } = useApp();

  const [activeSection, setActiveSection] = useState('general');
  const [editingUser, setEditingUser] = useState(null);
  const [familyName, setFamilyName] = useState(settings.familyName || 'Our Family');
  const [saving, setSaving] = useState(false);

  const sections = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'family', label: 'Family Members', icon: Users },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ];

  const handleSaveFamilyName = async () => {
    setSaving(true);
    await updateSettings({ familyName });
    setSaving(false);
  };

  const handleToggleSetting = async (key) => {
    await updateSettings({ [key]: !settings[key] });
  };

  const handleUpdateSetting = async (key, value) => {
    await updateSettings({ [key]: value });
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this family member?')) {
      await deleteUser(userId);
    }
  };

  return (
    <motion.div 
      className="settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="settings-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-layout">
          {/* Sidebar Navigation */}
          <nav className="settings-nav">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon size={20} />
                  <span>{section.label}</span>
                  <ChevronRight size={16} className="chevron" />
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="settings-content">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="settings-section">
                <h3>General Settings</h3>

                {/* Family Name */}
                <div className="setting-group">
                  <label>Family Name</label>
                  <div className="setting-input-group">
                    <input
                      type="text"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="Enter family name"
                    />
                    <button 
                      className="save-btn"
                      onClick={handleSaveFamilyName}
                      disabled={saving || familyName === settings.familyName}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Time Format */}
                <div className="setting-group">
                  <label>Time Format</label>
                  <div className="toggle-group">
                    <button 
                      className={!settings.use24Hour ? 'active' : ''}
                      onClick={() => handleUpdateSetting('use24Hour', false)}
                    >
                      12-hour
                    </button>
                    <button 
                      className={settings.use24Hour ? 'active' : ''}
                      onClick={() => handleUpdateSetting('use24Hour', true)}
                    >
                      24-hour
                    </button>
                  </div>
                </div>

                {/* Auto-lock Timer */}
                <div className="setting-group">
                  <label>Auto-lock Timer</label>
                  <p className="setting-description">Automatically log out after inactivity</p>
                  <select 
                    value={settings.autoLockMinutes || 5}
                    onChange={(e) => handleUpdateSetting('autoLockMinutes', Number(e.target.value))}
                  >
                    <option value={0}>Disabled</option>
                    <option value={1}>1 minute</option>
                    <option value={2}>2 minutes</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
              </div>
            )}

            {/* Family Members */}
            {activeSection === 'family' && (
              <div className="settings-section">
                <h3>Family Members</h3>
                <p className="section-description">Manage who has access to this Family Hub</p>

                <div className="family-list">
                  {users.map((user) => (
                    <div key={user.id} className="family-member">
                      <div 
                        className="member-avatar"
                        style={{ background: user.color }}
                      >
                        {user.avatar || user.name.charAt(0)}
                      </div>
                      <div className="member-info">
                        <span className="member-name">{user.name}</span>
                        <span className="member-role">{user.role}</span>
                      </div>
                      {user.role === 'child' && (
                        <span className="member-points">
                          <Star size={14} fill="currentColor" />
                          {user.points || 0} pts
                        </span>
                      )}
                      {canManageUsers() && user.id !== currentUser?.id && (
                        <div className="member-actions">
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {canManageUsers() && (
                  <button className="add-member-btn" onClick={onClose}>
                    <Plus size={18} />
                    Add Family Member
                    <span className="hint">(from login screen)</span>
                  </button>
                )}
              </div>
            )}

            {/* Display Settings */}
            {activeSection === 'display' && (
              <div className="settings-section">
                <h3>Display Settings</h3>

                {/* Theme */}
                <div className="setting-group">
                  <label>Theme</label>
                  <div className="theme-options">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          className={`theme-option ${settings.theme === option.value ? 'active' : ''}`}
                          onClick={() => handleUpdateSetting('theme', option.value)}
                        >
                          <Icon size={24} />
                          <span>{option.label}</span>
                          {settings.theme === option.value && <Check size={16} className="check" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Auto Dim */}
                <div className="setting-group">
                  <div className="setting-row">
                    <div>
                      <label>Auto Dim Screen</label>
                      <p className="setting-description">Dim display when idle to save energy</p>
                    </div>
                    <button
                      className={`toggle-switch ${settings.autoDim ? 'active' : ''}`}
                      onClick={() => handleToggleSetting('autoDim')}
                    >
                      <span className="toggle-knob" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="settings-section">
                <h3>Notifications</h3>

                <div className="setting-group">
                  <div className="setting-row">
                    <div>
                      <label>Event Reminders</label>
                      <p className="setting-description">Get notified before calendar events</p>
                    </div>
                    <button
                      className={`toggle-switch ${settings.eventReminders !== false ? 'active' : ''}`}
                      onClick={() => handleToggleSetting('eventReminders')}
                    >
                      <span className="toggle-knob" />
                    </button>
                  </div>
                </div>

                <div className="setting-group">
                  <div className="setting-row">
                    <div>
                      <label>Task Due Dates</label>
                      <p className="setting-description">Remind when tasks are due</p>
                    </div>
                    <button
                      className={`toggle-switch ${settings.taskReminders !== false ? 'active' : ''}`}
                      onClick={() => handleToggleSetting('taskReminders')}
                    >
                      <span className="toggle-knob" />
                    </button>
                  </div>
                </div>

                <div className="setting-group">
                  <div className="setting-row">
                    <div>
                      <label>Chore Completion Sounds</label>
                      <p className="setting-description">Play sound when chores are completed</p>
                    </div>
                    <button
                      className={`toggle-switch ${settings.choreSounds !== false ? 'active' : ''}`}
                      onClick={() => handleToggleSetting('choreSounds')}
                    >
                      <span className="toggle-knob" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security */}
            {activeSection === 'privacy' && (
              <div className="settings-section">
                <h3>Privacy & Security</h3>

                <div className="setting-group">
                  <div className="setting-row">
                    <div>
                      <label>Require PIN</label>
                      <p className="setting-description">Ask for PIN when switching users</p>
                    </div>
                    <button
                      className={`toggle-switch ${settings.requirePin !== false ? 'active' : ''}`}
                      onClick={() => handleToggleSetting('requirePin')}
                    >
                      <span className="toggle-knob" />
                    </button>
                  </div>
                </div>

                <div className="setting-group">
                  <div className="setting-row">
                    <div>
                      <label>Show Points to Others</label>
                      <p className="setting-description">Let children see each other's points</p>
                    </div>
                    <button
                      className={`toggle-switch ${settings.showPointsToOthers !== false ? 'active' : ''}`}
                      onClick={() => handleToggleSetting('showPointsToOthers')}
                    >
                      <span className="toggle-knob" />
                    </button>
                  </div>
                </div>

                <div className="setting-group danger-zone">
                  <label>Danger Zone</label>
                  <p className="setting-description">These actions cannot be undone</p>
                  <button className="danger-btn">
                    <Trash2 size={18} />
                    Reset All Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <span className="version">Family Hub v1.0</span>
          <span className="copyright">Made with ❤️ for families</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
