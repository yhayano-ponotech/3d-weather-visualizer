export interface WeatherData {
  latitude: number;
  longitude: number;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  clouds: number;
  timestamp: number;
}

export interface WindData {
  latitude: number;
  longitude: number;
  speed: number;
  direction: number;
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  current: {
    temperature_2m: number;
    precipitation: number;
    windspeed_10m: number;
    winddirection_10m: number;
  };
}

export interface CloudData {
  clouds: {
    all: number;
  };
}

export type DisplayMode = 'temperature' | 'precipitation' | 'wind' | 'composite';