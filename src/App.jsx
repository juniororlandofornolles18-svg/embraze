import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Map from './components/Map';
import EmergencyButton from './components/EmergencyButton';
import AlertsPanel from './components/AlertsPanel';
import AlertModal from './components/AlertModal';
import NavigationPanel from './components/NavigationPanel';
import LoadingScreen from './components/LoadingScreen';
import AuthBanner from './components/AuthBanner';
import WelcomeModal from './components/WelcomeModal';
import { getRoute } from './utils/routing';
import { signInWithGoogle, signOutUser, onAuthChange } from './utils/auth';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthBanner, setShowAuthBanner] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [flyToLocation, setFlyToLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [navigationRoute, setNavigationRoute] = useState(null);
  const [navigationDestination, setNavigationDestination] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setFlyToLocation({ longitude: alert.longitude, latitude: alert.latitude });
  };

  // Close AlertModal when drawer opens on mobile
  useEffect(() => {
    if (isMobile && isPanelExpanded && selectedAlert) {
      setSelectedAlert(null);
    }
  }, [isMobile, isPanelExpanded, selectedAlert]);

  // Track window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize app and listen to auth state
  useEffect(() => {
    const initializeApp = async () => {
      // Simulate loading time for smooth animation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
    };

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
        setShowAuthBanner(false);
        
        // Check if this is first time login
        const onboardingComplete = localStorage.getItem('embraze_onboarding_complete');
        if (!onboardingComplete) {
          setShowWelcomeModal(true);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setShowAuthBanner(true);
      }
    });

    initializeApp();

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const result = await signInWithGoogle();
    
    if (result.success) {
      // Auth state change listener will handle the rest
      console.log('Signed in successfully:', result.user);
    } else if (result.cancelled) {
      // User cancelled - don't show error, just log it
      console.log('Sign-in cancelled by user');
    } else {
      // Show error for other failures
      alert('Failed to sign in: ' + result.error);
    }
  };

  const handleWelcomeComplete = (displayName) => {
    setShowWelcomeModal(false);
    localStorage.setItem('embraze_onboarding_complete', 'true');
    console.log('User display name set:', displayName);
  };

  const handleLogout = async () => {
    setIsSigningOut(true);
    const result = await signOutUser();
    
    if (result.success) {
      // Auth state change listener will handle the rest
      console.log('Signed out successfully');
      // Keep showing signing out screen for animation to complete
      setTimeout(() => {
        setIsSigningOut(false);
      }, 2500);
    } else {
      alert('Failed to sign out: ' + result.error);
      setIsSigningOut(false);
    }
  };

  const handleDismissBanner = () => {
    setShowAuthBanner(false);
  };

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
          });
        },
        (error) => {
          // Silently handle error - location is optional
          console.log('Location not available:', error.code);
        },
        {
          enableHighAccuracy: false,
          maximumAge: 30000,
          timeout: 10000
        }
      );

      // Watch position for real-time updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
          });
        },
        (error) => {
          // Silently handle error - location is optional
          if (error.code !== 3) { // Only log non-timeout errors
            console.log('Location watch error:', error.code);
          }
        },
        {
          enableHighAccuracy: false,
          maximumAge: 30000,
          timeout: 15000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleGetDirections = async (alertData) => {
    if (!userLocation) {
      window.alert('Please enable location services to get directions');
      return;
    }

    setLoadingRoute(true);
    try {
      const route = await getRoute(
        userLocation.longitude,
        userLocation.latitude,
        alertData.longitude,
        alertData.latitude
      );
      
      setNavigationRoute(route);
      setNavigationDestination({
        name: alertData.name || 'Emergency Location',
        address: alertData.address
      });
      setSelectedAlert(null); // Close alert modal
    } catch (error) {
      console.error('Failed to get route:', error);
      window.alert('Failed to calculate route. Please try again.');
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleCloseNavigation = () => {
    setNavigationRoute(null);
    setNavigationDestination(null);
  };

  return (
    <>
      {isLoading ? (
        <LoadingScreen key="loading" />
      ) : isSigningOut ? (
        <LoadingScreen key="signing-out" message="Signing out..." />
      ) : (
        <div className="h-screen w-screen overflow-hidden bg-gray-100 relative">
          {/* Auth Banner - Shows at top when not logged in */}
          <AnimatePresence>
            {!isLoggedIn && showAuthBanner && (
              <AuthBanner onLogin={handleLogin} onDismiss={handleDismissBanner} />
            )}
          </AnimatePresence>

          {/* Map Layer - Always visible as background */}
          <div className="absolute inset-0 z-0">
            <Map 
              onMarkerClick={setSelectedAlert} 
              flyToLocation={flyToLocation}
              route={navigationRoute}
              userLocation={navigationRoute ? userLocation : null}
              currentUser={currentUser}
            />
          </div>

          {/* Emergency Button - Only for authenticated users */}
          {isLoggedIn && <EmergencyButton currentUser={currentUser} />}
          
          {/* Alerts Panel - Right side (limited for non-authenticated) */}
          <AlertsPanel 
            onAlertClick={handleAlertClick} 
            onLogout={handleLogout}
            onLogin={handleLogin}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onExpandChange={(expanded) => {
              setIsPanelExpanded(expanded);
              // Track panel expansion state for responsive layout
              document.documentElement.style.setProperty('--panel-expanded', expanded ? '1' : '0');
            }}
            onHistoryChange={setIsHistoryOpen}
          />
          
          {/* Navigation Panel - Only for authenticated users */}
          {isLoggedIn && navigationRoute && (
            <NavigationPanel
              route={navigationRoute}
              destination={navigationDestination}
              onClose={handleCloseNavigation}
            />
          )}
          
          {/* Alert Modal - Top layer */}
          <AnimatePresence>
            {selectedAlert && (
              <AlertModal 
                alert={selectedAlert} 
                onClose={() => setSelectedAlert(null)}
                onGetDirections={isLoggedIn ? handleGetDirections : undefined}
                isLoggedIn={isLoggedIn}
                currentUser={currentUser}
              />
            )}
          </AnimatePresence>

          {/* Loading indicator for route calculation */}
          {loadingRoute && (
            <div className="absolute inset-0 z-50 bg-black/30 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-2xl p-6 flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                <p className="text-sm font-medium text-gray-700">Calculating route...</p>
              </div>
            </div>
          )}

          {/* Welcome Modal - For first-time users */}
          {showWelcomeModal && (
            <WelcomeModal onComplete={handleWelcomeComplete} />
          )}
        </div>
      )}
    </>
  );
}

export default App;
