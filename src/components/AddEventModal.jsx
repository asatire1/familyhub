import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, MapPin, User, AlignLeft, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './AddEventModal.css';

const eventColors = [
  '#5b9aff', '#4ade80', '#ff9f43', '#ff6b9d', 
  '#a78bfa', '#ff6b6b', '#ffd93d', '#22d3ee'
];

export default function AddEventModal({ onClose, editEvent = null, defaultDate = null }) {
  const { users, currentUser, addEvent, updateEvent } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(eventColors[0]);
  const [userId, setUserId] = useState('');
  const [isFamily, setIsFamily] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with edit data or defaults
  useEffect(() => {
    if (editEvent) {
      setTitle(editEvent.title || '');
      setDate(editEvent.date || '');
      setStartTime(editEvent.startTime || '');
      setEndTime(editEvent.endTime || '');
      setLocation(editEvent.location || '');
      setDescription(editEvent.description || '');
      setColor(editEvent.color || eventColors[0]);
      setUserId(editEvent.userId || '');
      setIsFamily(editEvent.isFamily || false);
      setAllDay(editEvent.allDay || false);
    } else if (defaultDate) {
      setDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [editEvent, defaultDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter an event title');
      return;
    }

    if (!date) {
      setError('Please select a date');
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        title: title.trim(),
        date,
        startTime: allDay ? null : startTime || null,
        endTime: allDay ? null : endTime || null,
        location: location.trim() || null,
        description: description.trim() || null,
        color,
        userId: userId || null,
        isFamily,
        allDay
      };

      if (editEvent) {
        await updateEvent(editEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save event');
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
        className="add-event-modal"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with color preview */}
        <div 
          className="event-modal-header"
          style={{ background: color }}
        >
          <h2>{editEvent ? 'Edit Event' : 'New Event'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          {/* Title */}
          <div className="form-group">
            <input
              type="text"
              className="form-input title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              autoFocus
            />
          </div>

          {/* Date & Time */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Date
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="form-toggle">
            <span>All day</span>
            <button
              type="button"
              className={`toggle-btn ${allDay ? 'active' : ''}`}
              onClick={() => setAllDay(!allDay)}
            >
              <span className="toggle-slider" />
            </button>
          </div>

          {/* Time inputs (hidden if all day) */}
          {!allDay && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Start
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  End
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div className="form-group">
            <label className="form-label">
              <MapPin size={16} />
              Location
            </label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location (optional)"
            />
          </div>

          {/* Assign to user */}
          <div className="form-group">
            <label className="form-label">
              <User size={16} />
              Assign to
            </label>
            <div className="user-select">
              <button
                type="button"
                className={`user-option ${!userId && !isFamily ? 'selected' : ''}`}
                onClick={() => { setUserId(''); setIsFamily(false); }}
              >
                <span className="user-avatar-mini">👤</span>
                <span>Personal</span>
              </button>
              <button
                type="button"
                className={`user-option ${isFamily ? 'selected' : ''}`}
                onClick={() => { setUserId(''); setIsFamily(true); }}
              >
                <span className="user-avatar-mini">👨‍👩‍👧‍👦</span>
                <span>Family</span>
              </button>
              {users.map(user => (
                <button
                  key={user.id}
                  type="button"
                  className={`user-option ${userId === user.id ? 'selected' : ''}`}
                  onClick={() => { setUserId(user.id); setIsFamily(false); }}
                >
                  <span 
                    className="user-avatar-mini"
                    style={{ background: user.color }}
                  >
                    {user.avatar || user.name.charAt(0)}
                  </span>
                  <span>{user.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {eventColors.map(c => (
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

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <AlignLeft size={16} />
              Notes
            </label>
            <textarea
              className="form-input form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes (optional)"
              rows={3}
            />
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
              {loading ? 'Saving...' : (editEvent ? 'Save Changes' : 'Add Event')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
