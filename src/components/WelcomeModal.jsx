import { useState } from 'react';
import { motion } from 'framer-motion';

const WelcomeModal = ({ onComplete }) => {
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (displayName.trim()) {
      localStorage.setItem('embraze_display_name', displayName.trim());
      localStorage.setItem('embraze_onboarding_complete', 'true');
      onComplete(displayName.trim());
    }
  };

  const handleSkip = () => {
    localStorage.setItem('embraze_onboarding_complete', 'true');
    onComplete(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl p-5 max-w-sm w-full"
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome to Embraze</h2>
          <p className="text-xs text-gray-600">How should we display your name?</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-3"
            autoFocus
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={!displayName.trim()}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default WelcomeModal;
