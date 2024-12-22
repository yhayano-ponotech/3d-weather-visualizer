import type { NextConfig } from 'next';

const config: NextConfig = {
  webpack: (config) => {
    return config;
  },
  env: {
    OPEN_METEO_API_URL: process.env.OPEN_METEO_API_URL as string,
    OPEN_WEATHER_MAP_API_KEY: process.env.OPEN_WEATHER_MAP_API_KEY as string,
  },
  images: {
    domains: ['unpkg.com'], // 外部画像を使用する場合
  },
};

export default config;