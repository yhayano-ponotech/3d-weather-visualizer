'use client';

import { useState, useCallback, useEffect } from 'react';
import { DisplayMode } from '@/types/weather';
import Controls from '@/components/Controls/Controls';
import dynamic from 'next/dynamic';

// Dynamic import for Earth component to avoid SSR issues with Three.js
const Earth = dynamic(() => import('@/components/Earth/Earth'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
    </div>
  ),
});

export default function Home() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('temperature');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDisplayModeChange = useCallback((mode: DisplayMode) => {
    setDisplayMode(mode);
  }, []);

  const handleReload = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <main className="relative w-full h-screen bg-black">
      <Earth
        width={dimensions.width}
        height={dimensions.height}
        displayMode={displayMode}
        refreshTrigger={refreshTrigger}
      />
      <Controls
        displayMode={displayMode}
        onDisplayModeChange={handleDisplayModeChange}
        onReload={handleReload}
      />
      <div className="absolute top-4 left-4 text-white z-10">
        <h1 className="text-2xl font-bold">Weather Globe</h1>
        <p className="text-sm opacity-75">
          Real-time weather visualization in 3D
        </p>
      </div>
    </main>
  );
}