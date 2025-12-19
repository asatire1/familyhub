import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, ShoppingCart, Gift, Clipboard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './AddListModal.css';

const listTypes = [
  { value: 'groceries', label: 'Groceries', emoji: '🥬', color: '#22d3ee' },
  { value: 'shopping', label: 'Shopping', emoji: '🛒', color: '#4ade80' },
  { value: 'wishlist', label: 'Wish List', emoji: '🎁', color: '#ff6b9d' },
  { value: 'todo', label: 'To-Do', emoji: '📋', color: '#5b9aff' },
  { value: 'custom', label: 'Custom', emoji: '📝', color: '#a78bfa' }
];

const emojiOptions = [
  '📋', '🛒', '🥬', '🎁', '📝', '✈️', '🏠', '💼', 
  '📚', '🎬', '🍽️', '💪', '🎵', '🎮', '📦', '💡'
];

const colorOptions = [
  '#5b9aff', '#4ade80', '#22d3ee', '#ff6b9d', 
  '#a78bfa', '#ff9f43', '#ff6b6b', '#ffd93d'
];

export default function AddListModal({ onClose, editList = null }) {
  const { addList, updateList } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState('custom');
  const [emoji, setEmoji] = useState('📋');
  const [color, setColor] = useState('#5b9aff');
  const [isShared, setIsShared] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with edit data
  useEffect(() => {
    if (editList) {
      setName(editList.name || '');
      setType(editList.type || 'custom');
      setEmoji(editList.emoji || '📋');
      setColor(editList.color || '#5b9aff');
      setIsShared(editList.isShared !== false);
    }
  }, [editList]);

  // Update emoji and color when type changes
  const handleTypeChange = (newType) => {
    setType(newType);
    const typeConfig = listTypes.find(t => t.value === newType);
    if (typeConfig && !editList) {
      setEmoji(typeConfig.emoji);
      setColor(typeConfig.color);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a list name');
      return;
    }

    setLoading(true);

    try {
      const listData = {
        name: name.trim(),
        type,
        emoji,
        color,
        isShared
      };

      if (editList) {
        await updateList(editList.id, listData);
      } else {
        await addList(listData);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save list');
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
        className="add-list-modal"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Preview Header */}
        <div 
          className="list-modal-header"
          style={{ background: color }}
        >
          <div className="list-preview">
            <span className="preview-emoji">{emoji}</span>
            <span className="preview-name">{name || 'New List'}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="list-form">
          {/* Name */}
          <div className="form-group">
            <label className="form-label">List Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter list name"
              autoFocus
            />
          </div>

          {/* Type */}
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="type-options">
              {listTypes.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`type-option ${type === option.value ? 'selected' : ''}`}
                  onClick={() => handleTypeChange(option.value)}
                >
                  <span className="type-emoji">{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emoji */}
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="emoji-picker">
              {emojiOptions.map(e => (
                <button
                  key={e}
                  type="button"
                  className={`emoji-option ${emoji === e ? 'selected' : ''}`}
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {colorOptions.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                >
                  {color === c && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Shared Toggle */}
          <div className="form-toggle">
            <div>
              <span className="toggle-label">Shared with family</span>
              <span className="toggle-hint">Everyone can see and edit this list</span>
            </div>
            <button
              type="button"
              className={`toggle-btn ${isShared ? 'active' : ''}`}
              onClick={() => setIsShared(!isShared)}
            >
              <span className="toggle-slider" />
            </button>
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
              style={{ background: color }}
            >
              {loading ? 'Saving...' : (editList ? 'Save Changes' : 'Create List')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
