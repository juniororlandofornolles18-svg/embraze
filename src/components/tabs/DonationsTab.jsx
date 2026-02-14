import { useState } from 'react';
import { ref, push, set } from 'firebase/database';
import { database } from '../../config/firebase';
import { FiPackage, FiDroplet, FiShoppingBag } from 'react-icons/fi';

const DonationsTab = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    needs: {
      food: false,
      water: false,
      blankets: false,
      medicine: false,
      clothing: false
    },
    familySize: 1,
    specificNeeds: '',
    urgency: 'high'
  });
  const [loading, setLoading] = useState(false);

  const sendQuickRequest = async (needType) => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const donationRef = ref(database, 'alerts');
          const newDonationRef = push(donationRef);
          
          const needs = { food: false, water: false, blankets: false, medicine: false, clothing: false };
          needs[needType] = true;
          
          await set(newDonationRef, {
            name: 'Anonymous',
            contact: 'Not provided',
            address: 'Location on map',
            needs: needs,
            familySize: 1,
            specificNeeds: `Quick request for ${needType}`,
            urgency: 'high',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            type: 'donation',
            status: 'active'
          });

          alert(`${needType.charAt(0).toUpperCase() + needType.slice(1)} request sent!`);
          setLoading(false);
        }, (error) => {
          alert('Please enable location access');
          setLoading(false);
        });
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send request');
      setLoading(false);
    }
  };

  const handleNeedToggle = (need) => {
    setFormData({
      ...formData,
      needs: { ...formData.needs, [need]: !formData.needs[need] }
    });
  };

  const handleDetailedSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const donationRef = ref(database, 'alerts');
          const newDonationRef = push(donationRef);
          
          await set(newDonationRef, {
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            type: 'donation',
            status: 'active'
          });

          alert('Donation request posted successfully!');
          setFormData({
            name: '',
            contact: '',
            address: '',
            needs: { food: false, water: false, blankets: false, medicine: false, clothing: false },
            familySize: 1,
            specificNeeds: '',
            urgency: 'high'
          });
          setShowDetails(false);
        });
      }
    } catch (error) {
      console.error('Error posting donation request:', error);
      alert('Failed to post donation request');
    } finally {
      setLoading(false);
    }
  };

  const needsOptions = [
    { id: 'food', label: 'Food', icon: '🍚', color: 'bg-green-500 hover:bg-green-600' },
    { id: 'water', label: 'Water', icon: '💧', color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'blankets', label: 'Blankets', icon: '🛏️', color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'medicine', label: 'Medicine', icon: '💊', color: 'bg-red-500 hover:bg-red-600' },
    { id: 'clothing', label: 'Clothing', icon: '👕', color: 'bg-indigo-500 hover:bg-indigo-600' }
  ];

  if (!showDetails) {
    return (
      <div className="space-y-3">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Donation Request</h3>
          <p className="text-sm text-gray-600">Tap what you need immediately</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {needsOptions.map((need) => (
            <button
              key={need.id}
              onClick={() => sendQuickRequest(need.id)}
              disabled={loading}
              className={`${need.color} text-white py-6 rounded-xl font-semibold transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-2`}
            >
              <span className="text-3xl">{need.icon}</span>
              <span>{need.label}</span>
            </button>
          ))}
          <button
            onClick={() => sendQuickRequest('all')}
            disabled={loading}
            className="col-span-2 bg-gray-700 text-white py-6 rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            📦 Everything Needed
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
          <p>✓ Donors will see your request on the map</p>
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
        ← Back to Quick Request
      </button>

      <form onSubmit={handleDetailedSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (Optional)</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number (Optional)</label>
          <input
            type="tel"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What do you need?</label>
          <div className="grid grid-cols-2 gap-2">
            {needsOptions.map((need) => (
              <button
                key={need.id}
                type="button"
                onClick={() => handleNeedToggle(need.id)}
                className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  formData.needs[need.id]
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{need.icon}</span>
                <span className="text-sm font-medium">{need.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Family Size</label>
          <input
            type="number"
            min="1"
            value={formData.familySize}
            onChange={(e) => setFormData({ ...formData, familySize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
          <select
            value={formData.urgency}
            onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low - Can wait a few days</option>
            <option value="medium">Medium - Needed soon</option>
            <option value="high">High - Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specific Needs (Optional)</label>
          <textarea
            value={formData.specificNeeds}
            onChange={(e) => setFormData({ ...formData, specificNeeds: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any specific requirements..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Detailed Request'}
        </button>
      </form>
    </div>
  );
};

export default DonationsTab;
