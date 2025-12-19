import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Star, Check, Gift, Sparkles, Trophy } from 'lucide-react';
import './ChoresTab.css';

export default function ChoresTab() {
  const { 
    currentUser, 
    chores, 
    rewards, 
    completeChore, 
    redeemReward,
    getUserChoreStatus 
  } = useApp();

  const [completingChore, setCompletingChore] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [redeemingReward, setRedeemingReward] = useState(null);
  const [showRewardSuccess, setShowRewardSuccess] = useState(null);

  const choreStatus = getUserChoreStatus(currentUser?.id);
  const userPoints = currentUser?.points || 0;
  const completedCount = choreStatus.completed.length;
  const totalChores = chores.length;
  const progressPercent = totalChores > 0 ? (completedCount / totalChores) * 100 : 0;

  const handleCompleteChore = async (chore) => {
    if (choreStatus.completed.includes(chore.id)) return;
    
    setCompletingChore(chore.id);
    
    try {
      const result = await completeChore(currentUser.id, chore.id);
      
      if (result.success) {
        setEarnedPoints(result.pointsEarned);
        setShowCelebration(true);
        
        setTimeout(() => {
          setShowCelebration(false);
        }, 2500);
      }
    } catch (err) {
      console.error('Error completing chore:', err);
    } finally {
      setCompletingChore(null);
    }
  };

  const handleRedeemReward = async (reward) => {
    if (userPoints < reward.cost) return;
    
    setRedeemingReward(reward.id);
    
    try {
      await redeemReward(currentUser.id, reward.id);
      setShowRewardSuccess(reward);
      setTimeout(() => setShowRewardSuccess(null), 3000);
    } catch (err) {
      console.error('Error redeeming reward:', err);
    } finally {
      setRedeemingReward(null);
    }
  };

  return (
    <div className="chores-tab">
      {/* Header with Points */}
      <div className="chores-header">
        <div className="chores-title-section">
          <h2 className="chores-title">Today's Chores</h2>
          <p className="chores-subtitle">
            {completedCount === totalChores && totalChores > 0
              ? "🎉 All done! Great job!" 
              : `${completedCount} of ${totalChores} completed`}
          </p>
        </div>

        <motion.div 
          className="points-display"
          whileHover={{ scale: 1.02 }}
        >
          <div className="points-icon-wrapper">
            <Star size={28} fill="currentColor" />
          </div>
          <div className="points-info">
            <span className="points-label">Your Stars</span>
            <motion.span 
              className="points-value"
              key={userPoints}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {userPoints}
            </motion.span>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="progress-badges">
          {[25, 50, 75, 100].map((milestone) => (
            <div 
              key={milestone}
              className={`progress-badge ${progressPercent >= milestone ? 'earned' : ''}`}
            >
              {milestone === 100 ? <Trophy size={16} /> : `${milestone}%`}
            </div>
          ))}
        </div>
      </div>

      {/* Chores Grid */}
      <div className="chores-grid">
        {chores.map((chore, index) => {
          const isCompleted = choreStatus.completed.includes(chore.id);
          const isCompleting = completingChore === chore.id;

          return (
            <motion.button
              key={chore.id}
              className={`chore-card ${isCompleted ? 'completed' : ''} ${isCompleting ? 'completing' : ''}`}
              onClick={() => handleCompleteChore(chore)}
              disabled={isCompleted || isCompleting}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={!isCompleted ? { scale: 1.03, y: -5 } : {}}
              whileTap={!isCompleted ? { scale: 0.97 } : {}}
            >
              <div className="chore-icon">{chore.icon}</div>
              <span className="chore-name">{chore.name}</span>
              <div className={`chore-points ${isCompleted ? 'earned' : ''}`}>
                {isCompleted ? (
                  <>
                    <Check size={16} />
                    <span>Done!</span>
                  </>
                ) : (
                  <>
                    <Star size={16} fill="currentColor" />
                    <span>+{chore.points}</span>
                  </>
                )}
              </div>

              {/* Completion overlay */}
              {isCompleted && (
                <div className="chore-completed-overlay">
                  <Check size={40} strokeWidth={3} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Rewards Section */}
      <div className="rewards-section">
        <div className="rewards-header">
          <Gift size={24} />
          <h3>Rewards Shop</h3>
          <span className="rewards-hint">Spend your stars!</span>
        </div>

        <div className="rewards-grid">
          {rewards.map((reward, index) => {
            const canAfford = userPoints >= reward.cost;
            const isRedeeming = redeemingReward === reward.id;

            return (
              <motion.button
                key={reward.id}
                className={`reward-card ${canAfford ? 'affordable' : ''} ${isRedeeming ? 'redeeming' : ''}`}
                onClick={() => handleRedeemReward(reward)}
                disabled={!canAfford || isRedeeming}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={canAfford ? { scale: 1.05 } : {}}
                whileTap={canAfford ? { scale: 0.95 } : {}}
              >
                <div className="reward-icon">{reward.icon}</div>
                <span className="reward-name">{reward.name}</span>
                <div className="reward-cost">
                  <Star size={14} fill="currentColor" />
                  <span>{reward.cost}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            className="celebration-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="celebration-content"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -50 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="celebration-stars">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="floating-star"
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      scale: 0,
                      rotate: 0 
                    }}
                    animate={{ 
                      x: (Math.random() - 0.5) * 300,
                      y: (Math.random() - 0.5) * 300,
                      scale: [0, 1, 0],
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: i * 0.05,
                      ease: "easeOut"
                    }}
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles size={60} className="celebration-icon" />
              </motion.div>
              
              <h2 className="celebration-title">Amazing!</h2>
              
              <motion.div 
                className="celebration-points"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <Star size={32} fill="currentColor" />
                <span>+{earnedPoints}</span>
              </motion.div>
              
              <p className="celebration-message">Keep up the great work!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Redeemed Overlay */}
      <AnimatePresence>
        {showRewardSuccess && (
          <motion.div 
            className="celebration-overlay reward-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="celebration-content"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              <div className="reward-success-icon">{showRewardSuccess.icon}</div>
              <h2 className="celebration-title">Reward Claimed!</h2>
              <p className="celebration-message">{showRewardSuccess.name}</p>
              <p className="reward-success-hint">Show this to a parent</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
