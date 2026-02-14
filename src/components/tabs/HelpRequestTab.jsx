import { useState } from 'react';
import { ref, push, set } from 'firebase/database';
import { database } from '../../config/firebase';
import { FiMapPin, FiAlertCircle } from 'react-icons/fi';

const HelpRequestTab = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    description: '',
    type: 'emergency'
  });
  const [loading, setLoading] = useState(false);

  const sendQuickAlert = async (type = 'emergency') => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const alertRef = ref(database, 'alerts');
          const newAlertRef = push(alertRef);
          
          await set(newAlertRef, {
            name: 'Anonymous',
            contact: 'Not provided',
            address: 'Location on map',
            description: `Quick ${type} alert`,
            type: type,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            status: 'active'
          });

          alert('Emergency alert sent! Help is on the way.');
          setLoading(false);
        }, (error) => {
          alert('Please enable location access to send alert');
          setLoading(false);
        });
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      alert('Failed to send alert');
      setLoading(false);
    }
  };

  const handleDetailedSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const alertRef = ref(database, 'alerts');
          const newAlertRef = push(alertRef);
          
          await set(newAlertRef, {
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            status: 'active'
          });

          alert('Help request sent successfully!');
          setFormData({ name: '', contact: '', address: '', description: '', type: 'emergency' });
          setShowDetails(false);
        });
      }
    } catch (error) {
      console.error('Error sending help request:', error);
      alert('Failed to send help request');
    } finally {
      setLoading(false);
    }
  };

  if (!showDetails) {
    return (
      <div className="space-y-3">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Emergency Alert</h3>
          <p className="text-sm text-gray-600">Tap to send your location immediately</p>
        </div>

        <button
          onClick={() => sendQuickAlert('emergency')}
          disabled={loading}
          className="w-full bg-red-600 text-white py-6 rounded-xl font-bold text-lg hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
        >
          <FiAlertCircle size={28} />
          {loading ? 'Sending...' : 'SEND EMERGENCY ALERT'}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => sendQuickAlert('medical')}
            disabled={loading}
            className="bg-orange-500 text-white py-4 rounded-lg font-semibold hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            🏥 Medical
          </button>
          <button
            onClick={() => sendQuickAlert('rescue')}
            disabled={loading}
            className="bg-yellow-500 text-white py-4 rounded-lg font-semibold hover:bg-yellow-600 transition-all disabled:opacity-50"
          >
            🚨 Rescue
          </button>
          <button
            onClick={() => sendQuickAlert('fire')}
            disabled={loading}
            className="bg-red-500 text-white py-4 rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
          >
            🔥 Fire
          </button>
          <button
            onClick={() => sendQuickAlert('flood')}
            disabled={loading}
            className="bg-blue-500 text-white py-4 rounded-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            🌊 Flood
          </button>
        </div>

        <button
          onClick={() => setShowDetails(true)}
          className="w-full text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all border border-blue-200"
        >
          Add More Details (Optional)
        </button>

        <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
          <p>✓ Your location will be shared automatically</p>
          <p>✓ Nearby volunteers will be notified</p>
          <p>✓ You can add details later if needed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowDetails(false)}
        className="text-blue-600 text-sm hover:underline mb-2"
      >
        ← Back to Quick Alert
      </button>

      <form onSubmit={handleDetailedSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (Optional)</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Juan Dela Cruz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number (Optional)</label>
          <input
            type="tel"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+63 912 345 6789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Barangay, Street"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="emergency">Emergency</option>
            <option value="medical">Medical</option>
            <option value="rescue">Rescue</option>
            <option value="fire">Fire</option>
            <option value="flood">Flood</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your situation..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FiMapPin />
          {loading ? 'Sending...' : 'Send Detailed Request'}
        </button>
      </form>
    </div>
  );
};

export default HelpRequestTab;
