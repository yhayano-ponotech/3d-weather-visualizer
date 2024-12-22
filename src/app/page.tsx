'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DisplayMode } from '@/types/weather';
import Controls from '@/components/Controls/Controls';

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
  const [key, setKey] = useState(0);
  const [dimensions, setDimensions] = useState({
    width: 1200, // デフォルト値
    height: 800  // デフォルト値
  });

  useEffect(() => {
    // クライアントサイドでのみ実行
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // 初期サイズの設定
    updateDimensions();

    // リサイズイベントのリスナーを追加
    window.addEventListener('resize', updateDimensions);

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleDisplayModeChange = useCallback((mode: DisplayMode) => {
    setDisplayMode(mode);
  }, []);

  const handleReload = useCallback(() => {
    setKey((prev) => prev + 1);
  }, []);

  return (
    <main className="relative min-h-screen bg-gray-900">
      <Earth
        key={key}
        width={dimensions.width}
        height={dimensions.height}
        displayMode={displayMode}
      />
      <Controls
        displayMode={displayMode}
        onDisplayModeChange={handleDisplayModeChange}
        onReload={handleReload}
      />
      <div className="absolute top-4 left-4 text-white">
        <h1 className="text-2xl font-bold">Weather Globe</h1>
        <p className="text-sm opacity-75">
          Real-time weather visualization in 3D
        </p>
      </div>
    </main>
  );
}