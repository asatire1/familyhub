import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db, firebaseConfigured } from '../config/firebase';

const AppContext = createContext();

// Default data for first-time setup
const defaultSettings = {
  familyName: 'Our Family',
  use24Hour: false,
  autoDim: true,
  requirePin: true,
  autoLockMinutes: 5,
  theme: 'dark'
};

const defaultChores = [
  { name: 'Make Bed', icon: '🛏️', points: 5 },
  { name: 'Brush Teeth', icon: '🪥', points: 3 },
  { name: 'Tidy Room', icon: '🧹', points: 10 },
  { name: 'Set Table', icon: '🍽️', points: 5 },
  { name: 'Feed Pet', icon: '🐕', points: 5 },
  { name: 'Do Homework', icon: '📚', points: 15 },
  { name: 'Read 20 mins', icon: '📖', points: 10 },
  { name: 'Help Cook', icon: '👨‍🍳', points: 20 }
];

const defaultRewards = [
  { name: 'Extra Screen Time', icon: '📱', cost: 30 },
  { name: 'Choose Dinner', icon: '🍕', cost: 50 },
  { name: 'Stay Up Late', icon: '🌙', cost: 40 },
  { name: 'Movie Night Pick', icon: '🎬', cost: 25 },
  { name: 'Ice Cream', icon: '🍦', cost: 20 },
  { name: 'New Game', icon: '🎮', cost: 100 }
];

export function AppProvider({ children }) {
  // Core state
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data state
  const [chores, setChores] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [choreCompletions, setChoreCompletions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [lists, setLists] = useState([]);
  const [photos, setPhotos] = useState([]);
  
  // UI state
  const [privacyMode, setPrivacyMode] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [slideshowMode, setSlideshowMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // Track which action is loading

  // Generate a unique hub ID for this device/family (stored in localStorage)
  const getHubId = () => {
    let hubId = localStorage.getItem('familyHubId');
    if (!hubId) {
      hubId = 'hub_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('familyHubId', hubId);
    }
    return hubId;
  };

  const hubId = getHubId();

  // Initialize or load data from Firebase
  useEffect(() => {
    // Check if Firebase is configured
    if (!firebaseConfigured) {
      setError('Firebase is not configured. Please add your Firebase credentials to the .env file.');
      setLoading(false);
      return;
    }

    // Store unsubscribe functions
    const unsubscribers = [];
    // Track if initialization has been done to prevent duplicate writes
    let choresInitialized = false;
    let rewardsInitialized = false;

    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Subscribe to users collection
        const usersRef = collection(db, 'hubs', hubId, 'users');
        const unsubUsers = onSnapshot(usersRef, (snapshot) => {
          const usersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUsers(usersData);
        });
        unsubscribers.push(unsubUsers);

        // Subscribe to settings
        const settingsRef = doc(db, 'hubs', hubId, 'config', 'settings');
        const unsubSettings = onSnapshot(settingsRef, (snapshot) => {
          if (snapshot.exists()) {
            setSettings({ ...defaultSettings, ...snapshot.data() });
          } else {
            // Initialize with defaults
            setDoc(settingsRef, defaultSettings);
          }
        });
        unsubscribers.push(unsubSettings);

        // Subscribe to chores
        const choresRef = collection(db, 'hubs', hubId, 'chores');
        const unsubChores = onSnapshot(choresRef, async (snapshot) => {
          if (snapshot.empty && !choresInitialized) {
            // Initialize default chores only once
            choresInitialized = true;
            for (const chore of defaultChores) {
              await addDoc(choresRef, chore);
            }
          } else {
            setChores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        });
        unsubscribers.push(unsubChores);

        // Subscribe to rewards
        const rewardsRef = collection(db, 'hubs', hubId, 'rewards');
        const unsubRewards = onSnapshot(rewardsRef, async (snapshot) => {
          if (snapshot.empty && !rewardsInitialized) {
            // Initialize default rewards only once
            rewardsInitialized = true;
            for (const reward of defaultRewards) {
              await addDoc(rewardsRef, reward);
            }
          } else {
            setRewards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        });
        unsubscribers.push(unsubRewards);

        // Subscribe to chore completions
        const completionsRef = collection(db, 'hubs', hubId, 'choreCompletions');
        const unsubCompletions = onSnapshot(completionsRef, (snapshot) => {
          setChoreCompletions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        unsubscribers.push(unsubCompletions);

        // Subscribe to tasks
        const tasksRef = collection(db, 'hubs', hubId, 'tasks');
        const unsubTasks = onSnapshot(tasksRef, (snapshot) => {
          setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        unsubscribers.push(unsubTasks);

        // Subscribe to events
        const eventsRef = collection(db, 'hubs', hubId, 'events');
        const unsubEvents = onSnapshot(eventsRef, (snapshot) => {
          setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        unsubscribers.push(unsubEvents);

        // Subscribe to lists
        const listsRef = collection(db, 'hubs', hubId, 'lists');
        const unsubLists = onSnapshot(listsRef, (snapshot) => {
          setLists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        unsubscribers.push(unsubLists);

        // Subscribe to photos
        const photosRef = collection(db, 'hubs', hubId, 'photos');
        const unsubPhotos = onSnapshot(photosRef, (snapshot) => {
          setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        unsubscribers.push(unsubPhotos);

        setLoading(false);
      } catch (err) {
        console.error('Error initializing app:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeApp();

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [hubId]);

  // Auto-lock timer
  useEffect(() => {
    if (!currentUser || settings.autoLockMinutes === 0) return;

    const checkInactivity = setInterval(() => {
      const inactiveTime = (Date.now() - lastActivity) / 1000 / 60;
      if (inactiveTime >= settings.autoLockMinutes) {
        setCurrentUser(null); // Direct state update instead of calling logout
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInactivity);
  }, [currentUser, lastActivity, settings.autoLockMinutes]);

  // Track activity
  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  // User management functions
  const addUser = async (userData) => {
    try {
      const usersRef = collection(db, 'hubs', hubId, 'users');
      const newUser = {
        ...userData,
        points: 0,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(usersRef, newUser);
      return { id: docRef.id, ...newUser };
    } catch (err) {
      console.error('Error adding user:', err);
      throw err;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const userRef = doc(db, 'hubs', hubId, 'users', userId);
      await updateDoc(userRef, updates);
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const userRef = doc(db, 'hubs', hubId, 'users', userId);
      await deleteDoc(userRef);
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  const login = (user) => {
    setCurrentUser(user);
    updateActivity();
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const verifyPin = (userId, pin) => {
    const user = users.find(u => u.id === userId);
    return user && user.pin === pin;
  };

  // Settings functions
  const updateSettings = async (updates) => {
    try {
      const settingsRef = doc(db, 'hubs', hubId, 'config', 'settings');
      await updateDoc(settingsRef, updates);
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  // Chore functions
  const completeChore = async (userId, choreId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const completionsRef = collection(db, 'hubs', hubId, 'choreCompletions');
      
      // Check if already completed today
      const existingCompletion = choreCompletions.find(
        c => c.userId === userId && c.choreId === choreId && c.date === today
      );
      
      if (existingCompletion) {
        return { alreadyCompleted: true };
      }

      // Add completion
      await addDoc(completionsRef, {
        userId,
        choreId,
        date: today,
        completedAt: new Date().toISOString()
      });

      // Update user points
      const chore = chores.find(c => c.id === choreId);
      if (chore) {
        const user = users.find(u => u.id === userId);
        if (user) {
          await updateUser(userId, { points: (user.points || 0) + chore.points });
        }
      }

      return { success: true, pointsEarned: chore?.points || 0 };
    } catch (err) {
      console.error('Error completing chore:', err);
      throw err;
    }
  };

  const redeemReward = async (userId, rewardId) => {
    try {
      const user = users.find(u => u.id === userId);
      const reward = rewards.find(r => r.id === rewardId);
      
      if (!user || !reward) throw new Error('User or reward not found');
      if (user.points < reward.cost) throw new Error('Not enough points');

      await updateUser(userId, { points: user.points - reward.cost });

      // Log redemption
      const redemptionsRef = collection(db, 'hubs', hubId, 'redemptions');
      await addDoc(redemptionsRef, {
        userId,
        rewardId,
        rewardName: reward.name,
        cost: reward.cost,
        redeemedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (err) {
      console.error('Error redeeming reward:', err);
      throw err;
    }
  };

  // Event functions
  const addEvent = async (eventData) => {
    try {
      const eventsRef = collection(db, 'hubs', hubId, 'events');
      const newEvent = {
        ...eventData,
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(eventsRef, newEvent);
      return { id: docRef.id, ...newEvent };
    } catch (err) {
      console.error('Error adding event:', err);
      throw err;
    }
  };

  const updateEvent = async (eventId, updates) => {
    try {
      const eventRef = doc(db, 'hubs', hubId, 'events', eventId);
      await updateDoc(eventRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'hubs', hubId, 'events', eventId);
      await deleteDoc(eventRef);
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  // Get events for a date range
  const getEventsForRange = (startDate, endDate) => {
    const start = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
    const end = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];
    return events.filter(event => event.date >= start && event.date <= end);
  };

  // Get events for current user (children see only their events)
  const getVisibleEvents = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin' || currentUser.role === 'parent') {
      return events;
    }
    // Children see their own events + family events
    return events.filter(event => 
      event.userId === currentUser.id || 
      event.isFamily || 
      !event.userId
    );
  };

  // Task functions
  const addTask = async (taskData) => {
    try {
      const tasksRef = collection(db, 'hubs', hubId, 'tasks');
      const newTask = {
        ...taskData,
        completed: false,
        status: 'todo', // todo, inProgress, done
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(tasksRef, newTask);
      return { id: docRef.id, ...newTask };
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'hubs', hubId, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'hubs', hubId, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const toggleTaskComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const newCompleted = !task.completed;
      const newStatus = newCompleted ? 'done' : 'todo';
      
      await updateTask(taskId, { 
        completed: newCompleted, 
        status: newStatus,
        completedAt: newCompleted ? new Date().toISOString() : null
      });
      
      return { success: true, completed: newCompleted };
    } catch (err) {
      console.error('Error toggling task:', err);
      throw err;
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const completed = status === 'done';
      await updateTask(taskId, { 
        status, 
        completed,
        completedAt: completed ? new Date().toISOString() : null
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      throw err;
    }
  };

  // Get visible tasks based on user permissions
  const getVisibleTasks = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin' || currentUser.role === 'parent') {
      return tasks;
    }
    // Children see their own tasks only
    return tasks.filter(task => task.assigneeId === currentUser.id);
  };

  // Get tasks by status
  const getTasksByStatus = (status) => {
    return getVisibleTasks().filter(task => task.status === status);
  };

  // Get tasks for a specific user
  const getTasksForUser = (userId) => {
    return tasks.filter(task => task.assigneeId === userId);
  };

  // Get overdue tasks
  const getOverdueTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return getVisibleTasks().filter(task => 
      task.dueDate && 
      task.dueDate < today && 
      !task.completed
    );
  };

  // ==========================================
  // LIST FUNCTIONS
  // ==========================================
  
  // Add a new list
  const addList = async (listData) => {
    try {
      const listsRef = collection(db, 'hubs', hubId, 'lists');
      const newList = {
        ...listData,
        items: [],
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(listsRef, newList);
      return { id: docRef.id, ...newList };
    } catch (err) {
      console.error('Error adding list:', err);
      throw err;
    }
  };

  // Update list details
  const updateList = async (listId, updates) => {
    try {
      const listRef = doc(db, 'hubs', hubId, 'lists', listId);
      await updateDoc(listRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating list:', err);
      throw err;
    }
  };

  // Delete a list
  const deleteList = async (listId) => {
    try {
      const listRef = doc(db, 'hubs', hubId, 'lists', listId);
      await deleteDoc(listRef);
    } catch (err) {
      console.error('Error deleting list:', err);
      throw err;
    }
  };

  // Add item to a list
  const addListItem = async (listId, itemData) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) throw new Error('List not found');

      const newItem = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        text: itemData.text,
        checked: false,
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString()
      };

      const updatedItems = [...(list.items || []), newItem];
      await updateList(listId, { items: updatedItems });
      
      return newItem;
    } catch (err) {
      console.error('Error adding list item:', err);
      throw err;
    }
  };

  // Update a list item
  const updateListItem = async (listId, itemId, updates) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) throw new Error('List not found');

      const updatedItems = (list.items || []).map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      
      await updateList(listId, { items: updatedItems });
    } catch (err) {
      console.error('Error updating list item:', err);
      throw err;
    }
  };

  // Toggle list item checked state
  const toggleListItem = async (listId, itemId) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) throw new Error('List not found');

      const updatedItems = (list.items || []).map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      
      await updateList(listId, { items: updatedItems });
    } catch (err) {
      console.error('Error toggling list item:', err);
      throw err;
    }
  };

  // Delete a list item
  const deleteListItem = async (listId, itemId) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) throw new Error('List not found');

      const updatedItems = (list.items || []).filter(item => item.id !== itemId);
      await updateList(listId, { items: updatedItems });
    } catch (err) {
      console.error('Error deleting list item:', err);
      throw err;
    }
  };

  // Clear all checked items from a list
  const clearCheckedItems = async (listId) => {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list) throw new Error('List not found');

      const updatedItems = (list.items || []).filter(item => !item.checked);
      await updateList(listId, { items: updatedItems });
    } catch (err) {
      console.error('Error clearing checked items:', err);
      throw err;
    }
  };

  // Reorder list items
  const reorderListItems = async (listId, newItemsOrder) => {
    try {
      await updateList(listId, { items: newItemsOrder });
    } catch (err) {
      console.error('Error reordering items:', err);
      throw err;
    }
  };

  // Get visible lists based on permissions
  const getVisibleLists = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin' || currentUser.role === 'parent') {
      return lists;
    }
    // Children see shared lists and their own private lists
    return lists.filter(list => 
      list.isShared || 
      list.createdBy === currentUser.id
    );
  };

  // ==========================================
  // PHOTO FUNCTIONS
  // ==========================================
  
  // Add a new photo
  const addPhoto = async (photoData) => {
    try {
      const photosRef = collection(db, 'hubs', hubId, 'photos');
      const newPhoto = {
        ...photoData,
        uploadedBy: currentUser?.id,
        uploadedAt: new Date().toISOString()
      };
      const docRef = await addDoc(photosRef, newPhoto);
      return { id: docRef.id, ...newPhoto };
    } catch (err) {
      console.error('Error adding photo:', err);
      throw err;
    }
  };

  // Update photo details
  const updatePhoto = async (photoId, updates) => {
    try {
      const photoRef = doc(db, 'hubs', hubId, 'photos', photoId);
      await updateDoc(photoRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating photo:', err);
      throw err;
    }
  };

  // Delete a photo
  const deletePhoto = async (photoId) => {
    try {
      const photoRef = doc(db, 'hubs', hubId, 'photos', photoId);
      await deleteDoc(photoRef);
    } catch (err) {
      console.error('Error deleting photo:', err);
      throw err;
    }
  };

  // Toggle photo favorite
  const togglePhotoFavorite = async (photoId) => {
    try {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;
      await updatePhoto(photoId, { isFavorite: !photo.isFavorite });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  };

  // Get photos sorted by date
  const getPhotosSorted = (sortBy = 'newest') => {
    const sorted = [...photos];
    if (sortBy === 'newest') {
      return sorted.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    } else if (sortBy === 'oldest') {
      return sorted.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
    } else if (sortBy === 'favorites') {
      return sorted.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    }
    return sorted;
  };

  // Get favorite photos only
  const getFavoritePhotos = () => {
    return photos.filter(p => p.isFavorite);
  };

  // Helper to get user's chore status for today
  const getUserChoreStatus = (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = choreCompletions.filter(
      c => c.userId === userId && c.date === today
    );
    return {
      completed: completedToday.map(c => c.choreId),
      totalCompleted: completedToday.length,
      totalChores: chores.length
    };
  };

  // Permission helpers
  const canManageUsers = () => {
    return currentUser?.role === 'admin';
  };

  const canManageTasks = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'parent';
  };

  const canViewAllTasks = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'parent';
  };

  const value = {
    // State
    currentUser,
    users,
    settings,
    loading,
    error,
    hubId,
    chores,
    rewards,
    choreCompletions,
    tasks,
    events,
    lists,
    photos,
    privacyMode,
    slideshowMode,
    actionLoading,
    
    // Auth functions
    login,
    logout,
    verifyPin,
    
    // User functions
    addUser,
    updateUser,
    deleteUser,
    
    // Settings functions
    updateSettings,
    
    // Chore functions
    completeChore,
    redeemReward,
    getUserChoreStatus,
    
    // Task functions
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    updateTaskStatus,
    getVisibleTasks,
    getTasksByStatus,
    getTasksForUser,
    getOverdueTasks,
    
    // Event functions
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventsForRange,
    getVisibleEvents,
    
    // List functions
    addList,
    updateList,
    deleteList,
    addListItem,
    updateListItem,
    toggleListItem,
    deleteListItem,
    clearCheckedItems,
    reorderListItems,
    getVisibleLists,
    
    // Photo functions
    addPhoto,
    updatePhoto,
    deletePhoto,
    togglePhotoFavorite,
    getPhotosSorted,
    getFavoritePhotos,
    setSlideshowMode,
    
    // Activity tracking
    updateActivity,
    
    // Privacy
    setPrivacyMode,
    
    // Permissions
    canManageUsers,
    canManageTasks,
    canViewAllTasks
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
