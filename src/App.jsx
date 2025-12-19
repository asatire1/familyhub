import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import './styles/global.css';

function AppContent() {
  const { currentUser, loading, error, privacyMode, setPrivacyMode } = useApp();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading Family Hub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>⚠️ Connection Error</h2>
        <p>{error}</p>
        <p>Please check your internet connection and refresh.</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // Privacy mode - show clock only
  if (privacyMode) {
    return (
      <div className="privacy-screen" onClick={() => setPrivacyMode(false)}>
        <PrivacyClock />
      </div>
    );
  }

  // Show login or dashboard
  return currentUser ? <Dashboard /> : <LoginScreen />;
}

function PrivacyClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="privacy-content">
      <div className="privacy-icon">🔒</div>
      <p className="privacy-hint">Tap anywhere to unlock</p>
      <div className="privacy-time">{formatTime(time)}</div>
      <div className="privacy-date">{formatDate(time)}</div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
