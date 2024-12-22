import { useState, useEffect } from 'react';
import { WeatherData } from '@/types/weather';
import { WeatherService } from '@/services/api/weatherService';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const weatherService = WeatherService.getInstance();
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await weatherService.getGlobalWeatherData();
        if (isMounted) {
          setWeatherData(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error occurred'));
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Set up polling every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return { weatherData, isLoading, error };
};