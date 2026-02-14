import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandsHelping, faHeart, faUserCircle, faCog, faChevronRight, faUsers } from '@fortawesome/free-solid-svg-icons';
import HelpRequestTab from './tabs/HelpRequestTab';
import DonationsTab from './tabs/DonationsTab';
import SettingsTab from './tabs/SettingsTab';
import ProfileTab from './tabs/ProfileTab';
import FamilyCircleTab from './tabs/FamilyCircleTab';

const SidePanel = ({ user, onFlyToMember }) => {
  const [activeTab, setActiveTab] = useState('help');
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    { id: 'help', icon: faHandsHelping, label: 'Help' },
    { id: 'donations', icon: faHeart, label: 'Donate' },
    { id: 'family', icon: faUsers, label: 'Family' },
    { id: 'profile', icon: faUserCircle, label: 'Profile' },
    { id: 'settings', icon: faCog, label: 'Settings' },
  ];

  return (
    <div className="fixed right-0 top-0 h-full flex z-40">
      {/* Collapsed Tab Bar */}
      <motion.div
        className="bg-white/95 backdrop-blur-sm shadow-lg flex flex-col items-center py-6 gap-2"
        style={{ width: '64px' }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setIsExpanded(true);
            }}
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={tab.icon} size="lg" />
            {activeTab === tab.id && isExpanded && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -right-1 w-1 h-8 bg-blue-500 rounded-l-full"
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Expanded Content Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white shadow-2xl overflow-hidden"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {user?.name || 'Guest User'}
                  </p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  {activeTab === 'help' && <HelpRequestTab />}
                  {activeTab === 'donations' && <DonationsTab currentUser={user} />}
                  {activeTab === 'family' && <FamilyCircleTab currentUser={user} onFlyToMember={onFlyToMember} />}
                  {activeTab === 'profile' && <ProfileTab user={user} />}
                  {activeTab === 'settings' && <SettingsTab />}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SidePanel;
