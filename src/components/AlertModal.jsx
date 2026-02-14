import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMapMarkerAlt, faPhone, faHandHoldingHeart, faCheck, faArrowUp, faInfoCircle, faTruckMedical, faFireFlameCurved, faPersonCircleExclamation, faHouseFloodWater, faExclamationCircle, faRoute } from '@fortawesome/free-solid-svg-icons';
import { ref, update } from 'firebase/database';
import { database } from '../config/firebase';
import { logActivity } from '../utils/activityLogger';

const AlertModal = ({ alert, onClose, position, onGetDirections, isLoggedIn, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [donorInfo, setDonorInfo] = useState({ name: '', contact: '' });
  const [boosting, setBoosting] = useState(false);
  const [userBoostId, setUserBoostId] = useState(null);
  
  if (!alert) return null;

  const isEmergency = alert.type !== 'donation';
  const isDonation = alert.type === 'donation';
  const isOwnAlert = currentUser && alert.userId === currentUser.uid;
  const textColor = isEmergency ? 'text-red-700' : 'text-blue-700';
  const iconColor = isEmergency ? 'text-red-500' : 'text-blue-500';
  const badgeBg = isEmergency ? 'bg-red-50' : 'bg-blue-50';
  
  const addressText = alert.address || 'Location on map';
  const descriptionText = alert.description || '';
  
  // Extract partial description (first sentence or up to first exclamation mark)
  const getPartialDescription = (text) => {
    if (!text) return '';
    // Split by exclamation mark or period, take first part
    const firstPart = text.split(/[!.]/)[0];
    return firstPart ? firstPart + (text.includes('!') ? '!' : '.') : text;
  };
  
  const partialDescription = getPartialDescription(descriptionText);
  const hasMoreDescription = descriptionText.length > partialDescription.length;
  
  // Check if current user has boosted (using localStorage for demo)
  const hasUserBoosted = alert.boostedBy && userBoostId && alert.boostedBy.includes(userBoostId);
  
  // Generate or retrieve user boost ID
  useState(() => {
    let boostId = localStorage.getItem('userBoostId');
    if (!boostId) {
      boostId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userBoostId', boostId);
    }
    setUserBoostId(boostId);
  }, []);
  
  // Extract first name only
  const getFirstName = (fullName) => {
    if (!fullName) return 'Anonymous';
    return fullName.split(' ')[0];
  };
  
  const firstName = getFirstName(alert.name);
  
  // Extract street name (first part before first comma)
  const getStreetName = (address) => {
    if (!address || address === 'Location on map') return address;
    const parts = address.split(',');
    return parts[0].trim();
  };
  
  const streetName = getStreetName(addressText);
  const hasMoreAddressInfo = addressText.includes(',');

  const handleBoost = async (e) => {
    e.stopPropagation();
    
    if (!userBoostId) return;
    
    setBoosting(true);
    try {
      const alertRef = ref(database, `alerts/${alert.id}`);
      const currentBoostedBy = alert.boostedBy || [];
      
      if (hasUserBoosted) {
        // Remove boost
        const updatedBoostedBy = currentBoostedBy.filter(id => id !== userBoostId);
        await update(alertRef, {
          boosts: Math.max(0, (alert.boosts || 0) - 1),
          boostedBy: updatedBoostedBy
        });
      } else {
        // Add boost
        await update(alertRef, {
          boosts: (alert.boosts || 0) + 1,
          boostedBy: [...currentBoostedBy, userBoostId]
        });
        
        // Log activity
        await logActivity('request_boosted', {
          alertId: alert.id,
          requestType: alert.type,
          location: alert.address,
          boostCount: (alert.boosts || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error boosting request:', error);
      alert('Failed to boost request. Please try again.');
    } finally {
      setBoosting(false);
    }
  };

  const handleClaimClick = (e) => {
    e.stopPropagation();
    if (alert.claimed) {
      alert('This request has already been claimed.');
      return;
    }
    setShowClaimModal(true);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    
    if (!donorInfo.name.trim()) {
      alert('Please enter your name');
      return;
    }

    setClaiming(true);
    try {
      const alertRef = ref(database, `alerts/${alert.id}`);
      await update(alertRef, {
        claimed: true,
        claimedBy: donorInfo.name.trim(),
        claimedByContact: donorInfo.contact.trim() || 'Not provided',
        claimedAt: Date.now()
      });
      
      // Log activity
      await logActivity('request_claimed', {
        alertId: alert.id,
        donorName: donorInfo.name.trim(),
        requestType: alert.type,
        location: alert.address
      });
      
      alert(`You've claimed this donation request! The requester will be notified.`);
      setShowClaimModal(false);
      setDonorInfo({ name: '', contact: '' });
      onClose();
    } catch (error) {
      console.error('Error claiming request:', error);
      alert('Failed to claim request. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ 
          opacity: 0, 
          x: -20,
          transition: { duration: 0.2 }
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onTouchStart={() => setIsExpanded(true)}
        className="fixed z-50 left-4 top-1/2 -translate-y-1/2 md:left-1/4 md:-translate-x-1/2"
      >
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 max-w-[90vw] sm:max-w-md`}>
        {/* Collapsed Pill */}
        <div className="px-3 sm:px-4 py-2 flex items-center gap-2 min-w-[160px] sm:min-w-[180px]">
          {/* Profile Photo */}
          {alert.photoURL ? (
            <img 
              src={alert.photoURL} 
              alt={firstName} 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-xs sm:text-sm ${textColor} truncate`}>
              {firstName}
            </p>
            {isDonation && alert.claimed && (
              <span className="text-[10px] sm:text-xs text-green-600 font-medium flex items-center gap-1">
                <FontAwesomeIcon icon={faCheck} size="xs" />
                Claimed
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-400 text-xs" />
          </button>
        </div>

        {/* Expanded Details */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className={`px-4 pb-3 space-y-2 border-t border-gray-100`}>
            <p className="text-xs text-gray-500 uppercase font-medium pt-2">
              {alert.type === 'donation' ? 'Donation Request' : alert.type}
            </p>

            {alert.contact && alert.contact !== 'Not provided' && (
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <FontAwesomeIcon icon={faPhone} className={iconColor} size="sm" />
                <span>{alert.contact}</span>
              </div>
            )}

            <div className="flex items-start gap-2 text-xs text-gray-700">
              <FontAwesomeIcon icon={faMapMarkerAlt} className={`${iconColor} mt-0.5`} size="sm" />
              <div className="flex-1">
                <span>{streetName}</span>
                {hasMoreAddressInfo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddressModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                  >
                    see more
                  </button>
                )}
              </div>
            </div>

            {alert.description && alert.description !== `Quick ${alert.type} alert` && (
              <div className="flex items-start gap-2 text-xs text-gray-700">
                {/* Icon based on alert type */}
                {alert.type === 'medical' && <FontAwesomeIcon icon={faTruckMedical} className="text-red-500 mt-0.5" size="sm" />}
                {alert.type === 'fire' && <FontAwesomeIcon icon={faFireFlameCurved} className="text-orange-500 mt-0.5" size="sm" />}
                {alert.type === 'rescue' && <FontAwesomeIcon icon={faPersonCircleExclamation} className="text-yellow-500 mt-0.5" size="sm" />}
                {alert.type === 'flood' && <FontAwesomeIcon icon={faHouseFloodWater} className="text-blue-500 mt-0.5" size="sm" />}
                {alert.type === 'emergency' && <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 mt-0.5" size="sm" />}
                
                <div className="flex-1">
                  <span>{partialDescription}</span>
                  {hasMoreDescription && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDescriptionModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                    >
                      see more
                    </button>
                  )}
                </div>
              </div>
            )}

            {alert.needs && (
              <div className="pl-5">
                <p className="text-xs font-medium text-gray-500 mb-1">Needs:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(alert.needs).map(([need, value]) => 
                    value && (
                      <span key={need} className={`text-xs ${badgeBg} ${textColor} px-2 py-0.5 rounded-full font-medium`}>
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
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              {/* Get Directions Button - Only for authenticated users and not their own alerts */}
              {isLoggedIn && onGetDirections && !isOwnAlert && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGetDirections(alert);
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faRoute} />
                  Get Directions
                </button>
              )}

              {/* Message for own alerts */}
              {isLoggedIn && isOwnAlert && (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-600">This is your request</p>
                </div>
              )}

              {/* Sign in prompt for non-authenticated users */}
              {!isLoggedIn && (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-600 mb-2">Sign in to interact with requests</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.reload(); // Reload to show auth banner
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in with Google
                  </button>
                </div>
              )}

              {/* Claim Button for Donations - Only for authenticated users */}
              {isLoggedIn && isDonation && !isOwnAlert && (
                <>
                  {alert.claimed ? (
                    <div className="text-xs">
                      <p className="text-green-600 font-medium mb-1 flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheck} />
                        Claimed by {alert.claimedBy}
                      </p>
                      {alert.claimedByContact && alert.claimedByContact !== 'Not provided' && (
                        <p className="text-gray-600">Contact: {alert.claimedByContact}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleClaimClick}
                      disabled={claiming}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faHandHoldingHeart} />
                      {claiming ? 'Claiming...' : 'I Can Help - Claim This'}
                    </button>
                  )}
                  
                  {/* Boost Button */}
                  <button
                    onClick={handleBoost}
                    disabled={boosting || alert.claimed}
                    className={`w-full py-2 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2 ${
                      hasUserBoosted
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    <FontAwesomeIcon icon={faArrowUp} />
                    {boosting ? 'Boosting...' : hasUserBoosted ? 'Boosted' : 'Boost This Request'}
                    {alert.boosts > 0 && (
                      <span className="ml-1 font-bold">({alert.boosts})</span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pointer arrow - only on desktop */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 hidden md:block"
        style={{ bottom: '-8px' }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid white',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
        />
      </div>
    </motion.div>

      {/* Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
              className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center"
            >
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                    <h3 className="font-semibold text-gray-900">Full Address</h3>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {addressText}
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Claim Modal */}
      <AnimatePresence>
        {showClaimModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !claiming && setShowClaimModal(false)}
              className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center"
            >
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl p-5 max-w-sm mx-4 w-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faHandHoldingHeart} className="text-blue-500 text-sm" />
                    <h3 className="font-semibold text-gray-900 text-sm">Claim Request</h3>
                  </div>
                  <button
                    onClick={() => !claiming && setShowClaimModal(false)}
                    disabled={claiming}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-gray-400 text-xs" />
                  </button>
                </div>

                <form onSubmit={handleClaimSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                      placeholder="Enter your name"
                      disabled={claiming}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Contact <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={donorInfo.contact}
                      onChange={(e) => setDonorInfo({ ...donorInfo, contact: e.target.value })}
                      placeholder="+63 912 345 6789"
                      disabled={claiming}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowClaimModal(false)}
                      disabled={claiming}
                      className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={claiming}
                      className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:bg-gray-400 flex items-center justify-center gap-1.5"
                    >
                      {claiming ? (
                        <>Claiming...</>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faHandHoldingHeart} size="xs" />
                          Claim
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Description Modal */}
      <AnimatePresence>
        {showDescriptionModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDescriptionModal(false)}
              className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center"
            >
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
                    <h3 className="font-semibold text-gray-900">Emergency Details</h3>
                  </div>
                  <button
                    onClick={() => setShowDescriptionModal(false)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
                  </button>
                </div>
                <div className="flex items-start gap-2">
                  {/* Icon based on alert type - before the description */}
                  {alert.type === 'medical' && <FontAwesomeIcon icon={faTruckMedical} className="text-red-500 mt-1" />}
                  {alert.type === 'fire' && <FontAwesomeIcon icon={faFireFlameCurved} className="text-orange-500 mt-1" />}
                  {alert.type === 'rescue' && <FontAwesomeIcon icon={faPersonCircleExclamation} className="text-yellow-500 mt-1" />}
                  {alert.type === 'flood' && <FontAwesomeIcon icon={faHouseFloodWater} className="text-blue-500 mt-1" />}
                  {(alert.type === 'emergency' || !['medical', 'fire', 'rescue', 'flood'].includes(alert.type)) && <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 mt-1" />}
                  
                  <p className="text-sm text-gray-700 leading-relaxed flex-1">
                    {descriptionText}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AlertModal;
