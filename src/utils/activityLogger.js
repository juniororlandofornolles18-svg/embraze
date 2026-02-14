import { ref, push, set } from 'firebase/database';
import { database } from '../config/firebase';

/**
 * Log an activity to Firebase history
 * @param {string} action - Type of action (request_created, request_claimed, request_fulfilled, request_cancelled)
 * @param {object} data - Activity data
 */
export const logActivity = async (action, data) => {
  try {
    const historyRef = ref(database, 'history');
    const newLogRef = push(historyRef);
    
    const logEntry = {
      action,
      timestamp: Date.now(),
      ...data
    };
    
    await set(newLogRef, logEntry);
    console.log('Activity logged:', action);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
