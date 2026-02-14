import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUser, faEnvelope, faPhone, faMapMarkerAlt, faBell, faShield, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const SettingsTab = ({ onLogout }) => {
  const [profile, setProfile] = useState({
    name: 'Anonymous',
    email: '',
    phone: '',
    address: ''
  });

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout && onLogout();
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Profile</h3>
        
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-blue-500">
              <FontAwesomeIcon icon={faCamera} className="text-blue-500 text-xs" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click to upload photo</p>
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
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
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

          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium text-sm transition-colors">
            Save Profile
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
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
