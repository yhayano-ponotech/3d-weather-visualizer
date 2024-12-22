import { CloudData, WeatherData, OpenMeteoResponse } from '@/types/weather';

export class WeatherService {
  private static instance: WeatherService;
  private cache: Map<string, { data: WeatherData; timestamp: number }>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly openMeteoUrl: string;
  private readonly openWeatherMapUrl: string;
  private readonly openWeatherMapApiKey: string;

  private constructor() {
    this.cache = new Map();
    this.openMeteoUrl = process.env.OPEN_METEO_API_URL || 'https://api.open-meteo.com/v1';
    this.openWeatherMapUrl = process.env.OPEN_WEATHER_MAP_API_URL || 'https://api.openweathermap.org/data/2.5';
    this.openWeatherMapApiKey = process.env.OPEN_WEATHER_MAP_API_KEY || '';

    if (!this.openMeteoUrl) {
      console.warn('OPEN_METEO_API_URL is not configured');
    }
    if (!this.openWeatherMapUrl) {
      console.warn('OPEN_WEATHER_MAP_API_URL is not configured');
    }
    if (!this.openWeatherMapApiKey) {
      console.warn('OPEN_WEATHER_MAP_API_KEY is not configured');
    }
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

    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
      return cachedData.data;
    }

    try {
      const meteorologicalData = await this.fetchMeteorologicalData(latitude, longitude);
      let cloudData: CloudData = { clouds: { all: 0 } };

      try {
        cloudData = await this.fetchCloudData(latitude, longitude);
      } catch (error) {
        console.warn('Failed to fetch cloud data, using default value', error);
      }

      const weatherData: WeatherData = {
        temperature: meteorologicalData.current_weather.temperature,
        precipitation: meteorologicalData.hourly.precipitation[0] || 0,
        windSpeed: meteorologicalData.current_weather.windspeed,
        windDirection: meteorologicalData.current_weather.winddirection,
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to fetch weather data: ${errorMessage}`);
    }
  }

  private async fetchMeteorologicalData(
    latitude: number,
    longitude: number
  ): Promise<OpenMeteoResponse> {
    const url = `${this.openMeteoUrl}/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=precipitation`;

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  private async fetchCloudData(
    latitude: number,
    longitude: number
  ): Promise<CloudData> {
    if (!this.openWeatherMapApiKey) {
      throw new Error('OpenWeatherMap API key is not configured');
    }

    const url = `${this.openWeatherMapUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.openWeatherMapApiKey}`;

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error('Failed to fetch cloud data');
    }

    return response.json();
  }

  public async getGlobalWeatherData(): Promise<WeatherData[]> {
    // より疎なグリッドを使用して負荷を軽減
    const coordinates: [number, number][] = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lon = -180; lon <= 180; lon += 30) {
        coordinates.push([lat, lon]);
      }
    }

    const weatherPromises = coordinates.map(([lat, lon]) =>
      this.getWeatherData(lat, lon).catch(error => {
        console.error(`Failed to fetch weather data for lat:${lat}, lon:${lon}:`, error);
        // エラーが発生した場合はデフォルト値を返す
        return {
          latitude: lat,
          longitude: lon,
          temperature: 0,
          precipitation: 0,
          windSpeed: 0,
          windDirection: 0,
          clouds: 0,
          timestamp: Date.now(),
        };
      })
    );

    return Promise.all(weatherPromises);
  }
}