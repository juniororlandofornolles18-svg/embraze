import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUser, faEnvelope, faPhone, faMapMarkerAlt, faBell, faShield, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { updateUserProfile } from '../../utils/auth';

const SettingsTab = ({ onLogout, currentUser }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Load user data when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || '',
        address: ''
      });
    }
  }, [currentUser]);

  // If no user, don't render anything
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-sm">Please sign in to access settings</p>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      const result = await updateUserProfile(currentUser.uid, {
        displayName: profile.name,
        phone: profile.phone,
        address: profile.address
      });
      
      if (result.success) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = async () => {
    if (confirmingLogout) {
      // User confirmed, proceed with logout
      setLoggingOut(true);
      try {
        await onLogout();
      } catch (error) {
        console.error('Logout error:', error);
        setLoggingOut(false);
      }
    } else {
      // First click, show confirmation
      setConfirmingLogout(true);
      // Reset after 3 seconds if user doesn't confirm
      setTimeout(() => setConfirmingLogout(false), 3000);
    }
  };

  const handleCancelLogout = () => {
    setConfirmingLogout(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Profile</h3>
        
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName || 'User'} 
                className="w-20 h-20 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-blue-500">
              <FontAwesomeIcon icon={faCamera} className="text-blue-500 text-xs" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Google Profile Photo</p>
        </div>

        {/* Profile Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faUser} className="text-gray-400 mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mr-1" />
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="your@email.com"
            />
            <p className="text-xs text-gray-500 mt-1">Email from Google account (cannot be changed)</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faPhone} className="text-gray-400 mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+63 912 345 6789"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mr-1" />
              Address
            </label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your address"
            />
          </div>

          <button 
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium text-sm transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Notifications</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faBell} className="text-gray-600" />
              <span className="text-sm">Emergency Alerts</span>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
          
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faBell} className="text-gray-600" />
              <span className="text-sm">Donation Requests</span>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
        </div>
      </div>

      {/* Privacy */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Privacy</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faShield} className="text-gray-600" />
              <span className="text-sm">Show Profile Publicly</span>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-4 border-t border-gray-200">
        <AnimatePresence mode="wait">
          {loggingOut ? (
            <motion.div
              key="logging-out"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-3 text-gray-600"
            >
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-sm">Signing out...</span>
            </motion.div>
          ) : confirmingLogout ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <p className="text-sm text-gray-700 text-center mb-2">Sign out of your account?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="logout"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={handleLogoutClick}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsTab;
