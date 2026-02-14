import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faHandsHelping, faHeart, faCheckCircle, faTimesCircle, faClock, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '../../config/firebase';

const HistoryTab = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const historyRef = ref(database, 'history');
      const historyQuery = query(historyRef, orderByChild('timestamp'), limitToLast(50));
      
      const unsubscribe = onValue(historyQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const historyArray = Object.entries(data).map(([id, entry]) => ({
            id,
            ...entry
          }));
          // Sort by timestamp descending (newest first)
          historyArray.sort((a, b) => b.timestamp - a.timestamp);
          setHistory(historyArray);
        } else {
          setHistory([]);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error loading history:', error);
        setError(error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up history listener:', error);
      setError(error.message);
      setLoading(false);
    }
  }, []);

  const getActionIcon = (action) => {
    switch (action) {
      case 'request_created':
        return faHandsHelping;
      case 'request_claimed':
        return faHeart;
      case 'request_fulfilled':
        return faCheckCircle;
      case 'request_cancelled':
        return faTimesCircle;
      case 'request_boosted':
        return faArrowUp;
      default:
        return faHistory;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'request_created':
        return 'text-blue-600';
      case 'request_claimed':
        return 'text-purple-600';
      case 'request_fulfilled':
        return 'text-green-600';
      case 'request_cancelled':
        return 'text-red-600';
      case 'request_boosted':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getActionText = (entry) => {
    switch (entry.action) {
      case 'request_created':
        const requestType = entry.requestType || 'request';
        let typeText = requestType;
        
        // Make emergency types more descriptive
        switch (requestType) {
          case 'medical':
            typeText = 'medical emergency';
            break;
          case 'fire':
            typeText = 'fire emergency';
            break;
          case 'rescue':
            typeText = 'rescue request';
            break;
          case 'flood':
            typeText = 'flood emergency';
            break;
          case 'donation':
            typeText = 'donation request';
            break;
          case 'emergency':
            typeText = 'emergency alert';
            break;
        }
        
        return `${entry.userName || 'Someone'} created a ${typeText}`;
      case 'request_claimed':
        return `${entry.donorName || 'Someone'} claimed a donation request`;
      case 'request_fulfilled':
        return `Request fulfilled by ${entry.donorName || 'someone'}`;
      case 'request_cancelled':
        return `Request cancelled by ${entry.userName || 'someone'}`;
      case 'request_boosted':
        return `Request boosted (${entry.boostCount || 1} total boosts)`;
      default:
        return 'Activity recorded';
    }
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400 text-sm">Loading history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 text-sm mb-2">Error loading history</div>
        <div className="text-gray-400 text-xs">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faHistory} className="text-gray-600" />
        <h3 className="font-semibold text-gray-800">Activity History</h3>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FontAwesomeIcon icon={faHistory} size="3x" className="mb-3 opacity-50" />
          <p className="text-sm">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Profile Photo or Icon */}
                {entry.userPhotoURL ? (
                  <img 
                    src={entry.userPhotoURL} 
                    alt={entry.userName || 'User'} 
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={getActionIcon(entry.action)} className="text-white text-xs" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {getActionText(entry)}
                  </p>
                  
                  {entry.location && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      📍 {entry.location}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <FontAwesomeIcon icon={faClock} size="xs" />
                    {getTimeAgo(entry.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
