import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '@/types/weather';
import { WeatherService } from '@/services/api/weatherService';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const weatherService = WeatherService.getInstance();
      const data = await weatherService.getGlobalWeatherData();
      setWeatherData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      try {
        await fetchData();
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error occurred'));
          setIsLoading(false);
        }
      }
    };

    initFetch();

    // Set up polling every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchData]);

  return { weatherData, isLoading, error, refetch };
};