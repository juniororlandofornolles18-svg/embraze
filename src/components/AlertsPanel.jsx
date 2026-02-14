import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faChevronRight, faMapMarkerAlt, faClock, faCheck, faHistory, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import SettingsTab from './tabs/SettingsTab';
import HistoryTab from './tabs/HistoryTab';

const AlertsPanel = ({ onAlertClick, onLogout, isLoggedIn }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [alerts, setAlerts] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);
  const [expandedAddresses, setExpandedAddresses] = useState({});

  useEffect(() => {
    try {
      const alertsRef = ref(database, 'alerts');
      onValue(alertsRef, (snapshot) => {
        const data = snapshot.val();
        setAlerts(data || {});
        // Mark as unread when new alerts come in
        if (data && Object.keys(data).length > 0) {
          setHasUnreadAlerts(true);
        }
      });
    } catch (err) {
      console.error('Firebase error:', err);
    }
  }, []);

  const alertsArray = Object.entries(alerts).map(([id, alert]) => ({ id, ...alert }));
  const sortedAlerts = alertsArray.sort((a, b) => b.timestamp - a.timestamp);

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="fixed right-0 top-0 h-full flex z-40">
      {/* Collapsed Tab */}
      <motion.div
        className="bg-white/95 backdrop-blur-sm shadow-lg flex flex-col items-center py-6 justify-between"
        style={{ width: '64px' }}
      >
        {/* Only show alerts button for authenticated users */}
        {isLoggedIn && (
          <button
            onClick={() => {
              if (showSettings || showHistory) {
                setShowSettings(false);
                setShowHistory(false);
                setIsExpanded(true);
                setHasUnreadAlerts(false);
              } else {
                setIsExpanded(!isExpanded);
                if (!isExpanded) {
                  // Opening alerts tab - mark as read
                  setHasUnreadAlerts(false);
                }
              }
            }}
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
              isExpanded && !showSettings && !showHistory
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={faBell} size="lg" />
            {hasUnreadAlerts && alertsArray.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {alertsArray.length}
              </span>
            )}
          </button>
        )}

        {/* History Button - Always visible */}
        <button 
          onClick={() => {
            setIsExpanded(true);
            setShowSettings(false);
            setShowHistory(true);
          }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
            showHistory
              ? 'bg-purple-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FontAwesomeIcon icon={faHistory} size="lg" />
        </button>

        {/* Profile Photo - Only for authenticated users */}
        {isLoggedIn && (
          <button 
            onClick={() => {
              setIsExpanded(true);
              setShowSettings(true);
              setShowHistory(false);
            }}
            className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              U
            </div>
          </button>
        )}
      </motion.div>

      {/* Expanded Alerts Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white shadow-2xl overflow-hidden"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {showSettings ? 'Settings' : showHistory ? 'History' : 'All Requests'}
                  </h3>
                  {!showSettings && !showHistory && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {alertsArray.filter(a => a.type === 'donation').length} donations · {alertsArray.filter(a => a.type !== 'donation').length} emergencies
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    setShowSettings(false);
                    setShowHistory(false);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {showSettings ? (
                  <div className="p-6">
                    <SettingsTab onLogout={onLogout} />
                  </div>
                ) : showHistory ? (
                  <div className="p-6">
                    <HistoryTab />
                  </div>
                ) : sortedAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                    <FontAwesomeIcon icon={faBell} size="3x" className="mb-4 opacity-50" />
                    <p className="text-sm text-center">No active requests</p>
                    <p className="text-xs text-center mt-2">Help and donation requests will appear here</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {sortedAlerts.map((alert) => {
                      const addressText = alert.address || 'Location on map';
                      const isLongAddress = addressText.length > 50;
                      const showFullAddress = expandedAddresses[alert.id] || false;
                      
                      return (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md bg-white ${
                            alert.type === 'donation'
                              ? 'border-l-blue-500 hover:bg-blue-50'
                              : 'border-l-red-500 hover:bg-red-50'
                          }`}
                          onClick={() => {
                            onAlertClick(alert);
                            setIsExpanded(false);
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {/* Profile Photo */}
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {(alert.name || 'Anonymous').charAt(0).toUpperCase()}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {alert.name || 'Anonymous'}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-medium ${
                                    alert.type === 'donation' ? 'text-blue-600' : 'text-red-600'
                                  }`}>
                                    {alert.type === 'donation' ? 'Donation Request' : alert.type}
                                  </span>
                                  {alert.type === 'donation' && alert.claimed && (
                                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                      <FontAwesomeIcon icon={faCheck} size="xs" />
                                      Claimed
                                    </span>
                                  )}
                                  {alert.type === 'donation' && !alert.claimed && alert.boosts > 0 && (
                                    <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                      <FontAwesomeIcon icon={faArrowUp} size="xs" />
                                      {alert.boosts} {alert.boosts === 1 ? 'boost' : 'boosts'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                              <FontAwesomeIcon icon={faClock} size="xs" />
                              {getTimeAgo(alert.timestamp)}
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-1 text-xs text-gray-600 mb-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-0.5" size="xs" />
                            <div className="flex-1">
                              <span className={isLongAddress && !showFullAddress ? 'line-clamp-1' : ''}>
                                {addressText}
                              </span>
                              {isLongAddress && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedAddresses(prev => ({
                                      ...prev,
                                      [alert.id]: !prev[alert.id]
                                    }));
                                  }}
                                  className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                                >
                                  {showFullAddress ? 'see less' : 'see more'}
                                </button>
                              )}
                            </div>
                          </div>

                          {alert.description && alert.description !== `Quick ${alert.type} alert` && (
                            <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                              {alert.description}
                            </p>
                          )}

                          {alert.needs && (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(alert.needs).map(([need, value]) => 
                                value && (
                                  <span key={need} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                    {need === 'food' && '🍚'}
                                    {need === 'water' && '💧'}
                                    {need === 'blankets' && '🛏️'}
                                    {need === 'medicine' && '💊'}
                                    {need === 'clothing' && '👕'}
                                    {' '}{need}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertsPanel;
