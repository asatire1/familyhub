import { motion } from 'framer-motion';
import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <motion.div 
        className="loading-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="loading-icon">🏠</div>
        <h1 className="loading-title">Family Hub</h1>
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">Loading your family hub...</p>
      </motion.div>
    </div>
  );
}
