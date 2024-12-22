import React from 'react';
import { DisplayMode } from '@/types/weather';

interface ControlsProps {
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  onReload: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  displayMode,
  onDisplayModeChange,
  onReload,
}) => {
  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Display Mode</h3>
          <div className="flex flex-col gap-2">
            {['temperature', 'precipitation', 'wind', 'composite'].map((mode) => (
              <button
                key={mode}
                onClick={() => onDisplayModeChange(mode as DisplayMode)}
                className={`px-4 py-2 rounded ${
                  displayMode === mode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onReload}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Reload Data
        </button>
      </div>
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Legend</h4>
        {displayMode === 'temperature' && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500" />
              <span>Cold (-50°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500" />
              <span>Hot (50°C)</span>
            </div>
          </div>
        )}
        {displayMode === 'precipitation' && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200" />
              <span>Light (0mm/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600" />
              <span>Heavy (100mm/h)</span>
            </div>
          </div>
        )}
        {displayMode === 'wind' && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500" />
              <span>Calm (0km/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500" />
              <span>Strong (100km/h)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;