import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Lock } from 'lucide-react';
import './PrivacyScreen.css';

export default function PrivacyScreen() {
  const { setPrivacyMode, settings } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div 
      className="privacy-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setPrivacyMode(false)}
    >
      <div className="privacy-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="privacy-info"
        >
          <div className="privacy-icon">
            <Lock size={32} />
          </div>
          <p className="privacy-hint">Tap anywhere to unlock</p>
        </motion.div>

        <motion.div
          className="privacy-clock"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {formatTime(currentTime)}
        </motion.div>

        <motion.div
          className="privacy-date"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {formatDate(currentTime)}
        </motion.div>
      </div>

      {/* Ambient background animation */}
      <div className="privacy-bg">
        <div className="privacy-orb privacy-orb-1" />
        <div className="privacy-orb privacy-orb-2" />
        <div className="privacy-orb privacy-orb-3" />
      </div>
    </motion.div>
  );
}
