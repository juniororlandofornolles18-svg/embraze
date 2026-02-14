import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import animationData from '../assets/embraze-loading.json';

const LoadingScreen = ({ message = null }) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || animationRef.current) return;

    console.log('Loading Lottie animation');
    
    try {
      animationRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet'
        }
      });

      animationRef.current.addEventListener('DOMLoaded', () => {
        console.log('Lottie animation loaded successfully');
      });
    } catch (error) {
      console.error('Error loading Lottie:', error);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Lottie Animation Container */}
      <div className="w-48 h-48">
        <div ref={containerRef} className="w-full h-full"></div>
      </div>
      
      {message && (
        <p className="mt-6 text-gray-600 text-lg font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingScreen;
