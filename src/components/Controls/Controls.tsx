import React from 'react';
import { DisplayMode } from '@/types/weather';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Thermometer, Cloud, Wind, Layers, RefreshCw } from 'lucide-react';

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
    <Card className="fixed bottom-6 left-6 w-64 bg-black/40 backdrop-blur-md border-white/20">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Display Mode Grid */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="ghost"
              onClick={() => onDisplayModeChange('temperature')}
              className={`flex items-center gap-2 ${
                displayMode === 'temperature' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Thermometer className="w-4 h-4" />
              <span>Temperature</span>
            </Button>
            <Button 
              variant="ghost"
              onClick={() => onDisplayModeChange('precipitation')}
              className={`flex items-center gap-2 ${
                displayMode === 'precipitation' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Rain</span>
            </Button>
            <Button 
              variant="ghost"
              onClick={() => onDisplayModeChange('wind')}
              className={`flex items-center gap-2 ${
                displayMode === 'wind' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Wind className="w-4 h-4" />
              <span>Wind</span>
            </Button>
            <Button 
              variant="ghost"
              onClick={() => onDisplayModeChange('composite')}
              className={`flex items-center gap-2 ${
                displayMode === 'composite' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All</span>
            </Button>
          </div>

          {/* Refresh Button */}
          <Button 
            onClick={onReload}
            variant="outline" 
            className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>

          {/* Legend Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-medium text-white/80">Legend</h4>
            <div className="space-y-2">
              {displayMode === 'temperature' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-white" />
                    <span className="text-sm text-white/70">Cold (-50°C to 0°C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-white to-red-500" />
                    <span className="text-sm text-white/70">Hot (0°C to 50°C)</span>
                  </div>
                </div>
              )}
              {displayMode === 'precipitation' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-200 to-blue-600" />
                    <span className="text-sm text-white/70">0mm/h to 100mm/h</span>
                  </div>
                </div>
              )}
              {displayMode === 'wind' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-yellow-500" />
                    <span className="text-sm text-white/70">0km/h to 100km/h</span>
                  </div>
                </div>
              )}
              {displayMode === 'composite' && (
                <div className="space-y-2 text-sm text-white/70">
                  <p>Showing temperature, precipitation, and wind data simultaneously</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Controls;