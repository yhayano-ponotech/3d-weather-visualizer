import { CloudData, WeatherData, WeatherResponse } from '@/types/weather';

const OPEN_METEO_API_URL = process.env.OPEN_METEO_API_URL;
const OPEN_WEATHER_MAP_API_KEY = process.env.OPEN_WEATHER_MAP_API_KEY;

export class WeatherService {
  private static instance: WeatherService;
  private cache: Map<string, { data: WeatherData; timestamp: number }>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    const cacheKey = `${latitude},${longitude}`;
    const cachedData = this.cache.get(cacheKey);

    if (
      cachedData &&
      Date.now() - cachedData.timestamp < this.CACHE_DURATION
    ) {
      return cachedData.data;
    }

    try {
      const [meteorologicalData, cloudData] = await Promise.all([
        this.fetchMeteorologicalData(latitude, longitude),
        this.fetchCloudData(latitude, longitude),
      ]);

      const weatherData: WeatherData = {
        temperature: meteorologicalData.current.temperature_2m,
        precipitation: meteorologicalData.current.precipitation,
        windSpeed: meteorologicalData.current.windspeed_10m,
        windDirection: meteorologicalData.current.winddirection_10m,
        clouds: cloudData.clouds.all,
        latitude: meteorologicalData.latitude,
        longitude: meteorologicalData.longitude,
        timestamp: Date.now(),
      };

      this.cache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now(),
      });

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  private async fetchMeteorologicalData(
    latitude: number,
    longitude: number
  ): Promise<WeatherResponse> {
    const response = await fetch(
      `${OPEN_METEO_API_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,windspeed_10m,winddirection_10m`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch meteorological data');
    }

    return response.json();
  }

  private async fetchCloudData(
    latitude: number,
    longitude: number
  ): Promise<CloudData> {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_MAP_API_KEY}`
    );
  
    if (!response.ok) {
      throw new Error('Failed to fetch cloud data');
    }
  
    return response.json();
  }

  public async getGlobalWeatherData(): Promise<WeatherData[]> {
    // Grid of coordinates covering the globe
    const coordinates: [number, number][] = [];
    for (let lat = -90; lat <= 90; lat += 15) {
      for (let lon = -180; lon <= 180; lon += 15) {
        coordinates.push([lat, lon]);
      }
    }

    const weatherPromises = coordinates.map(([lat, lon]) =>
      this.getWeatherData(lat, lon)
    );

    return Promise.all(weatherPromises);
  }
}