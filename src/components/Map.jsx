import { useEffect, useState, useRef } from 'react';
import { Map, Marker } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPaper, faHeart, faTruckMedical, faFireFlameCurved, faPersonCircleExclamation, faHouseFloodWater, faLocationArrow, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { CEBU_CITY_CENTER } from '../config/mapbox';
import lottie from 'lottie-web';
import embrazeLogoData from '../assets/embraze-logo.json';

const MapView = ({ onMarkerClick, flyToLocation, route, userLocation }) => {
  const [alerts, setAlerts] = useState({});
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [myLocationMarker, setMyLocationMarker] = useState(null);
  const mapRef = useRef(null);
  const logoRef = useRef(null);
  const [viewState, setViewState] = useState({
    longitude: CEBU_CITY_CENTER.longitude,
    latitude: CEBU_CITY_CENTER.latitude,
    zoom: CEBU_CITY_CENTER.zoom,
    pitch: 60, // Camera tilt angle (0-85 degrees)
    bearing: 0
  });

  // Load Embraze logo animation
  useEffect(() => {
    if (!logoRef.current) return;

    const animation = lottie.loadAnimation({
      container: logoRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: embrazeLogoData
    });

    // Remove white background from SVG after it loads
    animation.addEventListener('DOMLoaded', () => {
      const svg = logoRef.current.querySelector('svg');
      if (svg) {
        // Find and remove any white background rectangles
        const rects = svg.querySelectorAll('rect, path');
        rects.forEach(rect => {
          const fill = rect.getAttribute('fill');
          const style = window.getComputedStyle(rect);
          const computedFill = style.fill;
          
          // Remove white fills (rgb(255, 255, 255) or #ffffff or white)
          if (fill === '#ffffff' || fill === 'white' || fill === 'rgb(255, 255, 255)' ||
              computedFill === 'rgb(255, 255, 255)') {
            rect.style.fill = 'transparent';
          }
        });
      }
    });

    return () => {
      animation.destroy();
    };
  }, []);

  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        
        // Set the marker at user's location
        setMyLocationMarker({ longitude, latitude });
        
        if (mapRef.current) {
          const map = mapRef.current.getMap();
          map.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            pitch: 60,
            duration: 2000,
            essential: true
          });
        }
        
        setLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        
        // Provide specific error messages based on error code
        let errorMessage = 'Unable to get your location.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting your location.';
        }
        
        alert(errorMessage);
        setLocating(false);
      },
      {
        enableHighAccuracy: false, // Use false for faster response
        timeout: 10000, // Increase timeout to 10 seconds
        maximumAge: 30000 // Allow cached position up to 30 seconds old
      }
    );
  };

  // Handle flying to a specific location
  useEffect(() => {
    if (flyToLocation && mapRef.current) {
      const map = mapRef.current.getMap();
      map.flyTo({
        center: [flyToLocation.longitude, flyToLocation.latitude],
        zoom: 16,
        pitch: 60,
        duration: 2000, // 2 seconds smooth transition
        essential: true
      });
    }
  }, [flyToLocation]);

  // Draw route on map
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      
      if (route) {
        // Wait for map to load
        if (!map.isStyleLoaded()) {
          map.once('load', () => addRouteToMap(map, route));
        } else {
          addRouteToMap(map, route);
        }
      } else {
        // Remove route when navigation is cancelled
        if (map.isStyleLoaded()) {
          removeRouteFromMap(map);
        }
      }
    }
  }, [route]);

  const removeRouteFromMap = (map) => {
    if (map.getLayer('route')) {
      map.removeLayer('route');
    }
    if (map.getSource('route')) {
      map.removeSource('route');
    }
  };

  const addRouteToMap = (map, routeData) => {
    // Remove existing route if any
    if (map.getLayer('route')) {
      map.removeLayer('route');
    }
    if (map.getSource('route')) {
      map.removeSource('route');
    }

    // Add route source and layer
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: routeData.geometry
      }
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 5,
        'line-opacity': 0.8
      }
    });

    // Fit map to show entire route
    const coordinates = routeData.geometry.coordinates;
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

    map.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  };

  useEffect(() => {
    try {
      const alertsRef = ref(database, 'alerts');
      onValue(alertsRef, (snapshot) => {
        const data = snapshot.val();
        setAlerts(data || {});
      }, (error) => {
        console.error('Firebase error:', error);
        if (error.code === 'PERMISSION_DENIED') {
          setError('Firebase permission denied. Please update database rules.');
        }
      });
    } catch (err) {
      console.error('Firebase initialization error:', err);
      setError('Failed to connect to database.');
    }
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Map Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Embraze Logo - Top Left */}
      <div className="absolute -top-8 left-4 z-10">
        <div ref={logoRef} className="w-32 h-32 sm:w-40 sm:h-40"></div>
      </div>

      {/* Find My Location Button - Mobile */}
      <button
        onClick={handleFindMyLocation}
        disabled={locating}
        className="sm:hidden fixed right-4 w-14 h-14 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        style={{
          bottom: 'calc(5rem + 3.5rem + 3.5rem + 1rem)', // Above history button with more gap: 80px + 56px + 56px + 16px
          zIndex: 45
        }}
        title="Find my location"
      >
        {locating ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        ) : (
          <FontAwesomeIcon icon={faLocationCrosshairs} size="lg" />
        )}
      </button>

      {/* Desktop Find My Location Button */}
      <button
        onClick={handleFindMyLocation}
        disabled={locating}
        className="hidden sm:block absolute bottom-8 z-[100] bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          right: 'calc(64px + 2rem)',
          transform: 'translateX(calc(var(--panel-expanded, 0) * -380px))',
          transition: 'transform 0.3s ease'
        }}
        title="Find my location"
      >
        {locating ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        ) : (
          <FontAwesomeIcon icon={faLocationCrosshairs} className="text-lg" />
        )}
      </button>

      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapLib={import('maplibre-gl')}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
            anchor="center"
          >
            <div className="relative">
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75" 
                   style={{ width: '40px', height: '40px', top: '-8px', left: '-8px' }} />
              
              {/* Main marker */}
              <div className="relative w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faLocationArrow} className="text-white text-xs" />
              </div>
            </div>
          </Marker>
        )}

        {/* My Location Marker (from Find My Location button) */}
        {myLocationMarker && (
          <Marker
            longitude={myLocationMarker.longitude}
            latitude={myLocationMarker.latitude}
            anchor="center"
          >
            <div className="relative" style={{ width: '40px', height: '40px' }}>
              {/* Outer light blue circle */}
              <div 
                className="absolute rounded-full bg-blue-400/25"
                style={{ 
                  width: '40px', 
                  height: '40px',
                  top: '0',
                  left: '0'
                }} 
              />
              
              {/* Inner blue dot */}
              <div 
                className="absolute rounded-full bg-blue-500 border-2 border-white shadow-md"
                style={{ 
                  width: '16px', 
                  height: '16px',
                  top: '12px',
                  left: '12px'
                }}
              />
            </div>
          </Marker>
        )}

        {/* Alert Markers */}
        {Object.entries(alerts).map(([id, alert]) => {
          // Validate coordinates before rendering
          const hasValidCoordinates = 
            alert.longitude != null && 
            alert.latitude != null && 
            !isNaN(alert.longitude) && 
            !isNaN(alert.latitude) &&
            isFinite(alert.longitude) &&
            isFinite(alert.latitude);
          
          if (!hasValidCoordinates) {
            console.warn(`Alert ${id} has invalid coordinates:`, alert.longitude, alert.latitude);
            return null;
          }
          
          const isDonation = alert.type === 'donation';
          const isClaimed = isDonation && alert.claimed;
          const boostCount = alert.boosts || 0;
          const isBoosted = boostCount > 0;
          
          // Determine marker color and icon based on type
          let markerColor, markerIcon;
          
          if (isDonation) {
            markerColor = isClaimed ? '#10b981' : '#3b82f6';
            markerIcon = faHeart;
          } else {
            // Emergency types
            switch(alert.type) {
              case 'medical':
                markerColor = '#ef4444'; // red
                markerIcon = faTruckMedical;
                break;
              case 'fire':
                markerColor = '#f97316'; // orange
                markerIcon = faFireFlameCurved;
                break;
              case 'rescue':
                markerColor = '#eab308'; // yellow
                markerIcon = faPersonCircleExclamation;
                break;
              case 'flood':
                markerColor = '#3b82f6'; // blue
                markerIcon = faHouseFloodWater;
                break;
              default:
                markerColor = '#ef4444'; // red for general emergency
                markerIcon = faHandPaper;
            }
          }
          
          // Scale marker based on boosts
          const baseSize = 32;
          const boostScale = Math.min(1 + (boostCount * 0.1), 1.5); // Max 1.5x size
          const markerSize = baseSize * boostScale;
          
          return (
            <Marker
              key={id}
              longitude={alert.longitude}
              latitude={alert.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onMarkerClick({ id, ...alert });
              }}
            >
              <div className="relative cursor-pointer group">
                {/* Pulse animation ring - only for unclaimed */}
                {!isClaimed && (
                  <div 
                    className={`absolute inset-0 rounded-full animate-ping ${isBoosted ? 'opacity-90' : 'opacity-75'}`}
                    style={{
                      backgroundColor: markerColor,
                      width: `${markerSize + 8}px`,
                      height: `${markerSize + 8}px`,
                      top: '-5px',
                      left: '-5px'
                    }}
                  />
                )}
                
                {/* Main marker */}
                <div
                  className="relative transition-transform group-hover:scale-110"
                  style={{
                    width: `${markerSize}px`,
                    height: `${markerSize}px`,
                    background: markerColor,
                    borderRadius: '50%',
                    boxShadow: isBoosted 
                      ? '0 6px 20px rgba(0,0,0,0.4), 0 0 20px rgba(255,165,0,0.5)' 
                      : '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isBoosted ? '4px solid #ff9800' : '3px solid white'
                  }}
                >
                  <FontAwesomeIcon 
                    icon={markerIcon} 
                    className="text-white"
                    style={{ fontSize: `${14 * boostScale}px` }}
                  />
                </div>
                
                {/* Boost count badge */}
                {isBoosted && (
                  <div
                    className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                    style={{ fontSize: '10px' }}
                  >
                    {boostCount}
                  </div>
                )}
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
};

export default MapView;
