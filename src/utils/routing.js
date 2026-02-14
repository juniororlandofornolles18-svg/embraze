/**
 * Get route from OSRM (Open Source Routing Machine)
 * @param {number} startLng - Starting longitude
 * @param {number} startLat - Starting latitude
 * @param {number} endLng - Destination longitude
 * @param {number} endLat - Destination latitude
 * @returns {Promise} Route data with geometry and instructions
 */
export const getRoute = async (startLng, startLat, endLng, endLat) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code !== 'Ok') {
      throw new Error('Route not found');
    }
    
    const route = data.routes[0];
    
    return {
      geometry: route.geometry,
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
      steps: route.legs[0].steps.map(step => ({
        instruction: step.maneuver.instruction || getManeuverInstruction(step.maneuver),
        distance: step.distance,
        duration: step.duration,
        location: step.maneuver.location
      }))
    };
  } catch (error) {
    console.error('Routing error:', error);
    throw error;
  }
};

/**
 * Generate instruction from maneuver type
 */
const getManeuverInstruction = (maneuver) => {
  const type = maneuver.type;
  const modifier = maneuver.modifier;
  
  if (type === 'depart') return 'Head ' + (modifier || 'straight');
  if (type === 'arrive') return 'You have arrived at your destination';
  if (type === 'turn') return 'Turn ' + modifier;
  if (type === 'merge') return 'Merge ' + modifier;
  if (type === 'roundabout') return 'Take the roundabout';
  if (type === 'continue') return 'Continue straight';
  
  return 'Continue';
};

/**
 * Format distance for display
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration for display
 */
export const formatDuration = (seconds) => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};
