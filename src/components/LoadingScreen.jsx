import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

const LoadingScreen = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/embraze-loading.json'
      });

      return () => animation.destroy();
    }
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div ref={containerRef} className="w-48 h-48"></div>
    </div>
  );
};

export default LoadingScreen;
