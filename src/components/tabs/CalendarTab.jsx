import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import AddEventModal from '../AddEventModal';
import './CalendarTab.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarTab() {
  const { 
    events, 
    users, 
    currentUser,
    getEventsForDate,
    getVisibleEvents,
    deleteEvent,
    canManageTasks 
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'day'
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEventDetail, setShowEventDetail] = useState(null);

  // Get visible events based on user permissions
  const visibleEvents = useMemo(() => getVisibleEvents(), [events, currentUser]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Previous month days to show
  const prevMonthDays = [];
  const prevMonth = new Date(year, month, 0);
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    prevMonthDays.push({
      day: prevMonth.getDate() - i,
      isOtherMonth: true,
      date: new Date(year, month - 1, prevMonth.getDate() - i)
    });
  }

  // Current month days
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push({
      day: i,
      isOtherMonth: false,
      date: new Date(year, month, i)
    });
  }

  // Next month days to fill the grid
  const totalCells = 42; // 6 rows * 7 days
  const remainingCells = totalCells - prevMonthDays.length - currentMonthDays.length;
  const nextMonthDays = [];
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDays.push({
      day: i,
      isOtherMonth: true,
      date: new Date(year, month + 1, i)
    });
  }

  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const goToPrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
    setCurrentDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
    setCurrentDate(next);
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Get events for a date
  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return visibleEvents.filter(event => event.date === dateStr);
  };

  // Get user by ID
  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  // Format time
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Handle day click
  const handleDayClick = (dayObj) => {
    setSelectedDate(dayObj.date);
    if (dayObj.isOtherMonth) {
      setCurrentDate(dayObj.date);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Delete this event?')) {
      await deleteEvent(eventId);
      setShowEventDetail(null);
    }
  };

  // Selected day events
  const selectedDayEvents = getEventsForDay(selectedDate);

  // Generate time slots for day view
  const timeSlots = [];
  for (let i = 6; i <= 22; i++) {
    timeSlots.push({
      hour: i,
      label: `${i % 12 || 12}:00 ${i >= 12 ? 'PM' : 'AM'}`
    });
  }

  return (
    <div className="calendar-tab">
      <div className="calendar-layout">
        {/* Left Panel - Mini Calendar */}
        <div className="calendar-sidebar">
          {/* Month Navigation */}
          <div className="mini-calendar">
            <div className="mini-cal-header">
              <h3 className="mini-cal-title">
                {MONTHS[month]} {year}
              </h3>
              <div className="mini-cal-nav">
                <button onClick={goToPrevMonth}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={goToNextMonth}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="mini-cal-weekdays">
              {DAYS.map(day => (
                <div key={day} className="mini-cal-weekday">{day.charAt(0)}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="mini-cal-days">
              {allDays.map((dayObj, index) => {
                const dayEvents = getEventsForDay(dayObj.date);
                return (
                  <button
                    key={index}
                    className={`mini-cal-day ${dayObj.isOtherMonth ? 'other-month' : ''} ${isToday(dayObj.date) ? 'today' : ''} ${isSelected(dayObj.date) ? 'selected' : ''}`}
                    onClick={() => handleDayClick(dayObj)}
                  >
                    <span>{dayObj.day}</span>
                    {dayEvents.length > 0 && (
                      <div className="day-event-dots">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <span 
                            key={i} 
                            className="event-dot"
                            style={{ background: event.color || '#5b9aff' }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today button */}
          <button className="today-btn" onClick={goToToday}>
            <CalendarIcon size={18} />
            Today
          </button>

          {/* Upcoming events */}
          <div className="upcoming-events">
            <h4>Upcoming Events</h4>
            <div className="upcoming-list">
              {visibleEvents
                .filter(e => e.date >= new Date().toISOString().split('T')[0])
                .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
                .slice(0, 5)
                .map(event => {
                  const eventUser = getUserById(event.userId);
                  return (
                    <div 
                      key={event.id} 
                      className="upcoming-event"
                      onClick={() => setShowEventDetail(event)}
                    >
                      <div 
                        className="event-color-bar"
                        style={{ background: event.color || eventUser?.color || '#5b9aff' }}
                      />
                      <div className="event-info">
                        <span className="event-title">{event.title}</span>
                        <span className="event-date">
                          {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          {event.startTime && ` • ${formatTime(event.startTime)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              {visibleEvents.filter(e => e.date >= new Date().toISOString().split('T')[0]).length === 0 && (
                <p className="no-events">No upcoming events</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Day View */}
        <div className="day-view">
          {/* Day View Header */}
          <div className="day-view-header">
            <div className="day-view-title">
              <h2>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h2>
              {isToday(selectedDate) && <span className="today-badge">Today</span>}
            </div>
            <div className="day-view-nav">
              <button onClick={goToPrevDay}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={goToNextDay}>
                <ChevronRight size={20} />
              </button>
              {canManageTasks() && (
                <button 
                  className="add-event-btn"
                  onClick={() => setShowAddEvent(true)}
                >
                  <Plus size={20} />
                  Add Event
                </button>
              )}
            </div>
          </div>

          {/* Events List for Selected Day */}
          <div className="day-events">
            {selectedDayEvents.length === 0 ? (
              <div className="no-events-day">
                <CalendarIcon size={48} strokeWidth={1.5} />
                <p>No events scheduled</p>
                {canManageTasks() && (
                  <button 
                    className="add-first-event"
                    onClick={() => setShowAddEvent(true)}
                  >
                    <Plus size={18} />
                    Add an event
                  </button>
                )}
              </div>
            ) : (
              <div className="events-list">
                {selectedDayEvents
                  .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                  .map(event => {
                    const eventUser = getUserById(event.userId);
                    return (
                      <motion.div
                        key={event.id}
                        className="event-card"
                        style={{ 
                          '--event-color': event.color || eventUser?.color || '#5b9aff' 
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setShowEventDetail(event)}
                      >
                        <div className="event-card-color" />
                        <div className="event-card-content">
                          <h4 className="event-card-title">{event.title}</h4>
                          {event.startTime && (
                            <div className="event-card-time">
                              <Clock size={14} />
                              <span>
                                {formatTime(event.startTime)}
                                {event.endTime && ` - ${formatTime(event.endTime)}`}
                              </span>
                            </div>
                          )}
                          {event.location && (
                            <div className="event-card-location">
                              <MapPin size={14} />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {eventUser && (
                            <div className="event-card-user">
                              <div 
                                className="event-user-avatar"
                                style={{ background: eventUser.color }}
                              >
                                {eventUser.avatar || eventUser.name.charAt(0)}
                              </div>
                              <span>{eventUser.name}</span>
                            </div>
                          )}
                        </div>
                        {canManageTasks() && (
                          <div className="event-card-actions">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingEvent(event);
                                setShowAddEvent(true);
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Time Grid (optional visual) */}
          <div className="time-grid">
            {timeSlots.map(slot => {
              const slotEvents = selectedDayEvents.filter(e => {
                if (!e.startTime) return false;
                const eventHour = parseInt(e.startTime.split(':')[0]);
                return eventHour === slot.hour;
              });
              
              return (
                <div key={slot.hour} className="time-slot">
                  <div className="time-label">{slot.label}</div>
                  <div className="time-slot-content">
                    {slotEvents.map(event => (
                      <div 
                        key={event.id}
                        className="time-slot-event"
                        style={{ background: event.color || '#5b9aff' }}
                        onClick={() => setShowEventDetail(event)}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      <AnimatePresence>
        {showAddEvent && (
          <AddEventModal
            onClose={() => {
              setShowAddEvent(false);
              setEditingEvent(null);
            }}
            editEvent={editingEvent}
            defaultDate={selectedDate}
          />
        )}
      </AnimatePresence>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {showEventDetail && (
          <motion.div 
            className="event-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEventDetail(null)}
          >
            <motion.div 
              className="event-detail-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div 
                className="event-detail-header"
                style={{ background: showEventDetail.color || '#5b9aff' }}
              >
                <h3>{showEventDetail.title}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowEventDetail(null)}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="event-detail-content">
                <div className="event-detail-row">
                  <CalendarIcon size={20} />
                  <span>
                    {new Date(showEventDetail.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                {showEventDetail.startTime && (
                  <div className="event-detail-row">
                    <Clock size={20} />
                    <span>
                      {formatTime(showEventDetail.startTime)}
                      {showEventDetail.endTime && ` - ${formatTime(showEventDetail.endTime)}`}
                    </span>
                  </div>
                )}
                {showEventDetail.location && (
                  <div className="event-detail-row">
                    <MapPin size={20} />
                    <span>{showEventDetail.location}</span>
                  </div>
                )}
                {showEventDetail.userId && (
                  <div className="event-detail-row">
                    <User size={20} />
                    <span>{getUserById(showEventDetail.userId)?.name || 'Unknown'}</span>
                  </div>
                )}
                {showEventDetail.description && (
                  <div className="event-detail-description">
                    <p>{showEventDetail.description}</p>
                  </div>
                )}
              </div>
              {canManageTasks() && (
                <div className="event-detail-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => {
                      setEditingEvent(showEventDetail);
                      setShowEventDetail(null);
                      setShowAddEvent(true);
                    }}
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteEvent(showEventDetail.id)}
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
