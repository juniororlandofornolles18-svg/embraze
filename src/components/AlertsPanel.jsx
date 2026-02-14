import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faChevronRight, faMapMarkerAlt, faClock, faCheck, faHistory, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import SettingsTab from './tabs/SettingsTab';
import HistoryTab from './tabs/HistoryTab';

const AlertsPanel = ({ onAlertClick, onLogout, onLogin, isLoggedIn, onExpandChange, onHistoryChange, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [alerts, setAlerts] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);
  const [expandedAddresses, setExpandedAddresses] = useState({});

  // Notify parent when expansion state changes
  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(isExpanded);
    }
  }, [isExpanded, onExpandChange]);

  // Notify parent when history state changes (mobile only)
  useEffect(() => {
    if (onHistoryChange) {
      onHistoryChange(isExpanded && showHistory);
    }
  }, [isExpanded, showHistory, onHistoryChange]);

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
    <>
      {/* Mobile: Floating Action Button */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40 flex flex-col gap-2">
        {isLoggedIn && (
          <button
            onClick={() => {
              setIsExpanded(true);
              setShowSettings(false);
              setShowHistory(false);
            }}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center relative transition-colors ${
              isExpanded && !showSettings && !showHistory
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
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
        <button
          onClick={() => {
            setIsExpanded(true);
            setShowSettings(false);
            setShowHistory(true);
          }}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
            isExpanded && showHistory
              ? 'bg-purple-500 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          <FontAwesomeIcon icon={faHistory} size="lg" />
        </button>
        
        {/* Profile Button - Only for logged in users */}
        {isLoggedIn && (
          <button
            onClick={() => {
              setIsExpanded(true);
              setShowSettings(true);
              setShowHistory(false);
            }}
            className={`w-14 h-14 rounded-full shadow-lg overflow-hidden transition-all ${
              showSettings ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        )}
        
        {!isLoggedIn && (
          <button
            onClick={onLogin}
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Mobile: Bottom Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="sm:hidden fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="sm:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
            >
              <div className="h-full flex flex-col">
                {/* Handle */}
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {showSettings ? 'Settings' : showHistory ? 'History' : 'Requests'}
                  </h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="rotate-90" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {showSettings ? (
                    <div className="p-4">
                      <SettingsTab onLogout={onLogout} currentUser={currentUser} />
                    </div>
                  ) : showHistory ? (
                    <div className="p-4">
                      <HistoryTab />
                    </div>
                  ) : sortedAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                      <FontAwesomeIcon icon={faBell} size="3x" className="mb-4 opacity-50" />
                      <p className="text-sm text-center">No active requests</p>
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
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {alert.photoURL ? (
                                  <img 
                                    src={alert.photoURL} 
                                    alt={alert.name || 'Anonymous'} 
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                    {(alert.name || 'Anonymous').charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {alert.name || 'Anonymous'}
                                  </p>
                                  <span className="text-xs font-medium text-blue-600">
                                    {alert.type === 'donation' ? 'Donation' : alert.type}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FontAwesomeIcon icon={faClock} size="xs" />
                                {getTimeAgo(alert.timestamp)}
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-1 text-xs text-gray-600">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-0.5" size="xs" />
                              <span className={isLongAddress && !showFullAddress ? 'line-clamp-1' : ''}>
                                {addressText}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop: Side Panel */}
      <div className="fixed right-0 top-0 h-full hidden sm:flex z-40">
        {/* Collapsed Tab - Desktop only */}
        <motion.div
          className="bg-white/95 backdrop-blur-sm shadow-lg flex flex-col items-center py-6 justify-between"
          style={{ width: '64px' }}
        >
          <div className="flex flex-col gap-3">
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

            {/* History Button */}
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

            {/* Google Sign-in Button */}
            {!isLoggedIn && (
              <button 
                onClick={onLogin}
                className="w-12 h-12 rounded-xl bg-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105"
                title="Sign in with Google"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
            )}
          </div>

          {/* Profile Photo */}
          {isLoggedIn && (
            <button 
              onClick={() => {
                setIsExpanded(true);
                setShowSettings(true);
                setShowHistory(false);
              }}
              className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
            >
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'User'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          )}
        </motion.div>

        {/* Expanded Panel - Desktop */}
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
                    <SettingsTab onLogout={onLogout} currentUser={currentUser} />
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
                              {alert.photoURL ? (
                                <img 
                                  src={alert.photoURL} 
                                  alt={alert.name || 'Anonymous'} 
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {(alert.name || 'Anonymous').charAt(0).toUpperCase()}
                                </div>
                              )}
                              
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
    </>
  );
};

export default AlertsPanel;
