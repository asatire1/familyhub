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

export default function CalendarTab({ selectedUsers = [] }) {
  const { 
    events, 
    users, 
    currentUser,
    getVisibleEvents,
    deleteEvent,
    canManageTasks 
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month' - default to week
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEventDetail, setShowEventDetail] = useState(null);

  // User colors fallback
  const userColors = [
    '#5b9aff', '#ff6b9d', '#4ade80', '#ff9f43', 
    '#a78bfa', '#ff6b6b', '#ffd93d', '#22d3ee'
  ];

  // Get visible events based on user permissions
  const visibleEvents = useMemo(() => getVisibleEvents(), [events, currentUser]);

  // Filter events by selected users (passed from Dashboard)
  const filteredEvents = useMemo(() => {
    if (selectedUsers.length === 0) return visibleEvents;
    return visibleEvents.filter(event => 
      selectedUsers.includes(event.userId) || 
      (event.isFamily && selectedUsers.length === users.length)
    );
  }, [visibleEvents, selectedUsers, users]);

  // Week calculations
  const getWeekDays = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // Go to Sunday
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const lastDayOfMonth = new Date(year, month + 1, 0);
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
  const totalCells = 42;
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
  const goToPrev = () => {
    if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const goToNext = () => {
    if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
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

  // Get events for a date (filtered)
  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => event.date === dateStr);
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
  const handleDayClick = (date) => {
    setSelectedDate(date);
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Delete this event?')) {
      await deleteEvent(eventId);
      setShowEventDetail(null);
    }
  };

  // Get week range string
  const getWeekRangeString = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = MONTHS[start.getMonth()];
    const endMonth = MONTHS[end.getMonth()];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${startMonth} ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}`;
    }
  };

  return (
    <div className="calendar-tab">
      {/* Compact Header - just controls */}
      <div className="calendar-header">
        <div className="view-toggle">
          <button 
            className={viewMode === 'week' ? 'active' : ''}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={viewMode === 'month' ? 'active' : ''}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
        
        <button className="today-btn-small" onClick={goToToday}>
          Today
        </button>

        <div className="nav-buttons">
          <button onClick={goToPrev}>
            <ChevronLeft size={20} />
          </button>
          <span className="current-range">
            {viewMode === 'week' ? getWeekRangeString() : `${MONTHS[month]} ${year}`}
          </span>
          <button onClick={goToNext}>
            <ChevronRight size={20} />
          </button>
        </div>

        {canManageTasks() && (
          <button 
            className="add-event-btn"
            onClick={() => setShowAddEvent(true)}
          >
            <Plus size={18} />
            <span>Add Event</span>
          </button>
        )}
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="week-view">
          <div className="week-header">
            {weekDays.map((date, idx) => (
              <div 
                key={idx} 
                className={`week-header-day ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                onClick={() => handleDayClick(date)}
              >
                <span className="day-name">{DAYS[date.getDay()]}</span>
                <span className={`day-number ${isToday(date) ? 'today' : ''}`}>
                  {date.getDate()}
                </span>
              </div>
            ))}
          </div>
          
          <div className="week-body">
            {weekDays.map((date, idx) => {
              const dayEvents = getEventsForDay(date);
              return (
                <div 
                  key={idx} 
                  className={`week-day-column ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                  onClick={() => handleDayClick(date)}
                >
                  {dayEvents.length === 0 ? (
                    <div className="no-events-placeholder" />
                  ) : (
                    <div className="day-events-list">
                      {dayEvents
                        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                        .map(event => {
                          const eventUser = getUserById(event.userId);
                          return (
                            <motion.div
                              key={event.id}
                              className="week-event"
                              style={{ 
                                '--event-color': event.color || eventUser?.color || '#5b9aff' 
                              }}
                              whileHover={{ scale: 1.02 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowEventDetail(event);
                              }}
                            >
                              <div className="week-event-color" />
                              <div className="week-event-content">
                                <span className="week-event-title">{event.title}</span>
                                {event.startTime && (
                                  <span className="week-event-time">{formatTime(event.startTime)}</span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="month-view">
          <div className="month-header">
            {DAYS.map(day => (
              <div key={day} className="month-weekday">{day}</div>
            ))}
          </div>
          
          <div className="month-grid">
            {allDays.map((dayObj, index) => {
              const dayEvents = getEventsForDay(dayObj.date);
              return (
                <div
                  key={index}
                  className={`month-day ${dayObj.isOtherMonth ? 'other-month' : ''} ${isToday(dayObj.date) ? 'today' : ''} ${isSelected(dayObj.date) ? 'selected' : ''}`}
                  onClick={() => handleDayClick(dayObj.date)}
                >
                  <span className="month-day-number">{dayObj.day}</span>
                  <div className="month-day-events">
                    {dayEvents.slice(0, 3).map(event => {
                      const eventUser = getUserById(event.userId);
                      return (
                        <div 
                          key={event.id}
                          className="month-event"
                          style={{ background: event.color || eventUser?.color || '#5b9aff' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEventDetail(event);
                          }}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="more-events">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                    {new Date(showEventDetail.date + 'T00:00:00').toLocaleDateString('en-GB', {
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
