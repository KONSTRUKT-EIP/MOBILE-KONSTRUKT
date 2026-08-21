import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface WeatherInfo {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

export interface CurrentWeatherData {
  temperature: number | null;
  weatherDescription: string;
  feelsLike: number | null;
  humidity: number | null;
  windSpeed: number | null;
  precipitation?: number;
  windDirection?: number | null;
}

export interface ForecastDay {
  date: string;
  weatherDescription: string;
  temperatureMax: number;
  temperatureMin: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  current: CurrentWeatherData;
  daily: ForecastDay[];
}