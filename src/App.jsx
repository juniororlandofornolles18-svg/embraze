import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Map from './components/Map';
import EmergencyButton from './components/EmergencyButton';
import AlertsPanel from './components/AlertsPanel';
import AlertModal from './components/AlertModal';
import NavigationPanel from './components/NavigationPanel';
import LoadingScreen from './components/LoadingScreen';
import AuthBanner from './components/AuthBanner';
import { getRoute } from './utils/routing';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthBanner, setShowAuthBanner] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [flyToLocation, setFlyToLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [navigationRoute, setNavigationRoute] = useState(null);
  const [navigationDestination, setNavigationDestination] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Initialize app and check login status
  useEffect(() => {
    const initializeApp = async () => {
      // Simulate loading time for smooth animation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const loggedIn = localStorage.getItem('embraze_logged_in');
      if (loggedIn === 'true') {
        setIsLoggedIn(true);
        setShowAuthBanner(false);
      } else {
        setIsLoggedIn(false);
        setShowAuthBanner(true);
      }
      
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const handleLogin = () => {
    localStorage.setItem('embraze_logged_in', 'true');
    setIsLoggedIn(true);
    setShowAuthBanner(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('embraze_logged_in');
    setIsLoggedIn(false);
    setShowAuthBanner(true);
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
          console.error('Error getting location:', error);
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
          console.error('Error watching location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setFlyToLocation({ longitude: alert.longitude, latitude: alert.latitude });
  };

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
        <LoadingScreen />
      ) : (
        <div className="h-screen w-screen overflow-hidden bg-gray-100 relative">
          {/* Auth Banner - Shows at top when not logged in */}
          {!isLoggedIn && showAuthBanner && (
            <AuthBanner onLogin={handleLogin} onDismiss={handleDismissBanner} />
          )}

          {/* Map Layer - Always visible as background */}
          <div className="absolute inset-0 z-0">
            <Map 
              onMarkerClick={setSelectedAlert} 
              flyToLocation={flyToLocation}
              route={navigationRoute}
              userLocation={navigationRoute ? userLocation : null}
            />
          </div>

          {/* Emergency Button - Only for authenticated users */}
          {isLoggedIn && <EmergencyButton />}
          
          {/* Alerts Panel - Right side (limited for non-authenticated) */}
          <AlertsPanel 
            onAlertClick={handleAlertClick} 
            onLogout={handleLogout}
            isLoggedIn={isLoggedIn}
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
        </div>
      )}
    </>
  );
}

export default App;
