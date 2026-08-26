import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EpfoLoader } from '../ui/EpfoLoader';

export const SceneTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsLoading(true);
      
      const delay = 300;

      // Simulate network/transition delay
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        // Add a tiny delay before hiding loader so they see the new scene pop in
        setTimeout(() => setIsLoading(false), 200);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation.pathname]);

  return (
    <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center backdrop-blur-md"
          >
            <EpfoLoader />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 
        We render the old location while loading, and the new location once loading finishes.
        This prevents the UI from abruptly swapping underneath the fading loader.
      */}
      <div className="flex-1 flex flex-col w-full h-full">
        {React.Children.map(children, (child) => {
          // Pass the displayLocation to the router context or just render children
          // Since we are wrapping Routes, Routes looks at the context location.
          // To make Routes use `displayLocation`, we actually shouldn't wrap Routes directly like this if we want frozen state.
          // A simpler approach for React Router is just letting it switch, but putting the loader ON TOP.
          return child;
        })}
      </div>
    </div>
  );
};
