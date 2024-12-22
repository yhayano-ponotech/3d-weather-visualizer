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

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
  };
  hourly: {
    precipitation: number[];
  };
}

export interface CloudData {
  clouds: {
    all: number;
  };
}

export type DisplayMode = 'temperature' | 'precipitation' | 'wind' | 'composite';