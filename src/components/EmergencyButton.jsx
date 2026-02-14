import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandsHelping, faHeart, faCheck, faTimes, faTruckMedical, faFireFlameCurved, faPersonCircleExclamation, faHouseFloodWater } from '@fortawesome/free-solid-svg-icons';
import { ref, push, set, update } from 'firebase/database';
import { database } from '../config/firebase';
import { logActivity } from '../utils/activityLogger';

const EmergencyButton = ({ currentUser }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [currentAlertId, setCurrentAlertId] = useState(null);
  const [currentAlertType, setCurrentAlertType] = useState(null);
  const [details, setDetails] = useState({
    name: '',
    contact: '',
    description: '',
    needs: {
      food: false,
      water: false,
      medicine: false,
      shelter: false,
      transport: false
    }
  });

  const emergencyTypes = [
    { type: 'medical', icon: faTruckMedical, label: 'Medical', color: 'bg-red-500' },
    { type: 'fire', icon: faFireFlameCurved, label: 'Fire', color: 'bg-orange-500' },
    { type: 'rescue', icon: faPersonCircleExclamation, label: 'Rescue', color: 'bg-yellow-500' },
    { type: 'flood', icon: faHouseFloodWater, label: 'Flood', color: 'bg-blue-500' }
  ];

  const sendAlert = async (type) => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          // Reverse geocode to get address
          let address = 'Location on map';
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'Embraze Emergency App'
                }
              }
            );
            const data = await response.json();
            
            if (data.display_name) {
              address = data.display_name;
            } else if (data.address) {
              // Build a cleaner address from components
              const addr = data.address;
              const parts = [
                addr.road || addr.street,
                addr.suburb || addr.neighbourhood,
                addr.city || addr.town || addr.municipality,
                addr.state,
                addr.country
              ].filter(Boolean);
              address = parts.join(', ');
            }
          } catch (geoError) {
            console.error('Geocoding error:', geoError);
            // Keep default address if geocoding fails
          }

          const alertRef = ref(database, 'alerts');
          const newAlertRef = push(alertRef);
          
          const alertData = {
            name: currentUser?.displayName || 'Anonymous',
            contact: currentUser?.phoneNumber || 'Not provided',
            email: currentUser?.email || '',
            photoURL: currentUser?.photoURL || '',
            userId: currentUser?.uid || null,
            address: address,
            latitude: latitude,
            longitude: longitude,
            timestamp: Date.now(),
            status: 'active',
            claimed: false,
            claimedBy: null,
            claimedAt: null,
            boosts: 0,
            boostedBy: []
          };

          if (type === 'emergency') {
            alertData.description = 'Quick emergency alert';
            alertData.type = 'emergency';
          } else if (type === 'donation') {
            alertData.needs = { food: false, water: false, blankets: false, medicine: false, clothing: false };
            alertData.familySize = 1;
            alertData.specificNeeds = 'General donation request';
            alertData.urgency = 'high';
            alertData.type = 'donation';
          } else {
            // Specific emergency types with default messages (without emojis)
            alertData.type = type;
            switch(type) {
              case 'medical':
                alertData.description = 'URGENT: Medical emergency! Someone needs immediate medical attention. Please send help now!';
                break;
              case 'fire':
                alertData.description = 'FIRE EMERGENCY! Building/area on fire. Need immediate evacuation assistance and fire response!';
                break;
              case 'rescue':
                alertData.description = 'HELP! Person trapped or in immediate danger. Urgent rescue needed!';
                break;
              case 'flood':
                alertData.description = 'FLOOD ALERT! Water rising rapidly. Need evacuation help immediately!';
                break;
              default:
                alertData.description = 'EMERGENCY! Urgent assistance needed at this location!';
            }
          }
          
          await set(newAlertRef, alertData);

          // Log activity
          await logActivity('request_created', {
            alertId: newAlertRef.key,
            userName: alertData.name,
            userPhotoURL: alertData.photoURL,
            requestType: type,
            location: address,
            latitude: latitude,
            longitude: longitude
          });

          // Show success and optional details modal
          setCurrentAlertId(newAlertRef.key);
          setCurrentAlertType(type);
          setShowMenu(false);
          setLoading(false);
          setShowDetailsModal(true);
        }, (error) => {
          alert('Please enable location access');
          setLoading(false);
        });
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      alert('Failed to send request');
      setLoading(false);
    }
  };

  const handleAddDetails = async () => {
    if (!currentAlertId) return;

    try {
      const alertRef = ref(database, `alerts/${currentAlertId}`);
      const updates = {};

      if (details.name.trim()) updates.name = details.name.trim();
      if (details.contact.trim()) updates.contact = details.contact.trim();
      if (details.description.trim()) updates.description = details.description.trim();
      
      // Only add needs if it's a donation request
      if (currentAlertType === 'donation') {
        updates.needs = details.needs;
      }

      await update(alertRef, updates);
      
      setShowDetailsModal(false);
      setDetails({
        name: '',
        contact: '',
        description: '',
        needs: { food: false, water: false, medicine: false, shelter: false, transport: false }
      });
      
      alert('Details added successfully!');
    } catch (error) {
      console.error('Error adding details:', error);
      alert('Failed to add details');
    }
  };

  const handleSkipDetails = () => {
    setShowDetailsModal(false);
    setDetails({
      name: '',
      contact: '',
      description: '',
      needs: { food: false, water: false, medicine: false, shelter: false, transport: false }
    });
  };

  return (
    <>
      <div 
        className="fixed bottom-8 z-50 transition-all duration-300" 
        style={{ 
          left: '50%',
          transform: 'translateX(calc(-50% - var(--panel-expanded, 0) * 190px))'
        }}
      >
        {/* Radial Menu for Emergency Types */}
        <AnimatePresence>
          {showRadialMenu && (
            <div className="absolute bottom-full mb-2 left-1/2" style={{ transform: 'translateX(-50%)' }}>
              <div className="flex items-center gap-2">
                {/* Radial buttons - horizontal layout */}
                {emergencyTypes.map((emergency, index) => (
                  <motion.button
                    key={emergency.type}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      sendAlert(emergency.type);
                      setShowRadialMenu(false);
                    }}
                    disabled={loading}
                    className={`w-12 h-12 ${emergency.color} text-white rounded-full shadow-lg flex flex-col items-center justify-center hover:scale-110 transition-transform disabled:opacity-50`}
                  >
                    <FontAwesomeIcon icon={emergency.icon} size="lg" />
                  </motion.button>
                ))}

                {/* Close button */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={() => setShowRadialMenu(false)}
                  className="w-12 h-12 bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </motion.button>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Drop-up Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
              style={{ 
                left: '0',
                right: '0',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: 'fit-content'
              }}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowRadialMenu(true);
                }}
                disabled={loading}
                className="w-full px-5 py-2 text-xs font-medium text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 border-b border-gray-100 whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faHandsHelping} className="text-red-500 text-sm" />
                Emergency
              </button>

              <button
                onClick={() => sendAlert('donation')}
                disabled={loading}
                className="w-full px-5 py-2 text-xs font-medium text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faHeart} className="text-blue-500 text-sm" />
                Donation
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-white text-gray-900 px-5 py-2.5 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 border border-gray-200"
          whileHover={{ boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
          whileTap={{ scale: 0.98 }}
        >
          <FontAwesomeIcon icon={faHandsHelping} className="text-blue-600" />
          {loading ? 'Sending...' : 'Request Help'}
        </motion.button>
      </div>

      {/* Backdrop when menu is open */}
      {(showMenu || showRadialMenu) && (
        <div
          onClick={() => {
            setShowMenu(false);
            setShowRadialMenu(false);
          }}
          className="fixed inset-0 z-40"
        />
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-4 max-w-sm w-full"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faCheck} className="text-green-600 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">Request Sent!</h3>
                  <p className="text-xs text-gray-500">Add details? (optional)</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={details.name}
                    onChange={(e) => setDetails({ ...details, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={details.contact}
                    onChange={(e) => setDetails({ ...details, contact: e.target.value })}
                    placeholder="+63 912 345 6789"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {currentAlertType === 'donation' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      What do you need?
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.keys(details.needs).map((need) => (
                        <label
                          key={need}
                          className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={details.needs[need]}
                            onChange={(e) => setDetails({
                              ...details,
                              needs: { ...details.needs, [need]: e.target.checked }
                            })}
                            className="w-3.5 h-3.5"
                          />
                          <span className="text-xs capitalize">{need}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Additional Details
                  </label>
                  <textarea
                    value={details.description}
                    onChange={(e) => setDetails({ ...details, description: e.target.value })}
                    placeholder="Describe your situation..."
                    rows="2"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSkipDetails}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleAddDetails}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Add Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencyButton;
