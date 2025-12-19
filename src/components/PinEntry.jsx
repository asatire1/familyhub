import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Delete } from 'lucide-react';
import './PinEntry.css';

export default function PinEntry({ user, onSubmit, onClose, error }) {
  const [pin, setPin] = useState('');
  const maxLength = 4;

  const handleKeyPress = useCallback((digit) => {
    if (pin.length < maxLength) {
      const newPin = pin + digit;
      setPin(newPin);
      
      // Auto-submit when 4 digits entered
      if (newPin.length === maxLength) {
        setTimeout(() => {
          onSubmit(newPin);
          setPin('');
        }, 200);
      }
    }
  }, [pin, onSubmit]);

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setPin('');
  }, []);

  // Reset pin on error
  useEffect(() => {
    if (error) {
      setTimeout(() => setPin(''), 500);
    }
  }, [error]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete, onClose]);

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'delete']
  ];

  return (
    <motion.div 
      className="pin-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="pin-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Close button */}
        <button className="pin-close" onClick={onClose}>
          <X size={24} />
        </button>

        {/* User info */}
        <div className="pin-user">
          <div 
            className="pin-avatar"
            style={{ background: user.color || '#5b9aff' }}
          >
            {user.avatar || user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="pin-title">Welcome, {user.name}!</h2>
          <p className="pin-subtitle">Enter your PIN to continue</p>
        </div>

        {/* PIN dots */}
        <div className={`pin-dots ${error ? 'error' : ''}`}>
          {Array.from({ length: maxLength }).map((_, i) => (
            <motion.div 
              key={i}
              className={`pin-dot ${i < pin.length ? 'filled' : ''}`}
              animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>

        {error && (
          <motion.p 
            className="pin-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Incorrect PIN. Try again.
          </motion.p>
        )}

        {/* Keypad */}
        <div className="pin-keypad">
          {keys.map((row, rowIndex) => (
            <div key={rowIndex} className="pin-row">
              {row.map((key) => (
                <motion.button
                  key={key}
                  className={`pin-key ${key === 'clear' || key === 'delete' ? 'action' : ''}`}
                  onClick={() => {
                    if (key === 'delete') handleDelete();
                    else if (key === 'clear') handleClear();
                    else handleKeyPress(key);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {key === 'delete' ? (
                    <Delete size={24} />
                  ) : key === 'clear' ? (
                    'C'
                  ) : (
                    key
                  )}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
