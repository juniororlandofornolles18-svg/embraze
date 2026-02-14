import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLocationArrow, faClock, faRoad } from '@fortawesome/free-solid-svg-icons';
import { formatDistance, formatDuration } from '../utils/routing';

const NavigationPanel = ({ route, destination, onClose }) => {
  if (!route) return null;

  return (
    <div className="absolute top-4 left-4 z-40 bg-white rounded-xl shadow-2xl w-72 max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-green-500 text-white px-3 py-2 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-xs">Navigation</h3>
          <p className="text-xs opacity-90 truncate">{destination?.name || 'Destination'}</p>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-green-600 flex items-center justify-center transition-colors ml-2 flex-shrink-0"
        >
          <FontAwesomeIcon icon={faTimes} size="xs" />
        </button>
      </div>

      {/* Route Summary */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-around">
        <div className="text-center">
          <FontAwesomeIcon icon={faRoad} className="text-blue-500 text-xs mb-0.5" />
          <p className="text-xs text-gray-900 font-semibold">{formatDistance(route.distance)}</p>
        </div>
        <div className="w-px h-6 bg-gray-300"></div>
        <div className="text-center">
          <FontAwesomeIcon icon={faClock} className="text-blue-500 text-xs mb-0.5" />
          <p className="text-xs text-gray-900 font-semibold">{formatDuration(route.duration)}</p>
        </div>
      </div>

      {/* Turn-by-turn Instructions */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1.5">
          {route.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faLocationArrow} className="text-blue-600" style={{ fontSize: '10px' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 font-medium leading-tight mb-0.5">
                  {step.instruction}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistance(step.distance)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Button */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Cancel Navigation
        </button>
      </div>
    </div>
  );
};

export default NavigationPanel;
