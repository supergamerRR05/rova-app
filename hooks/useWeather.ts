import { useState, useEffect } from 'react';
import type { LocationObject } from 'expo-location';

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  description: string;
  sfSymbol: string;
}

function describeCode(code: number): { description: string; sfSymbol: string } {
  if (code === 0) return { description: 'Clear Sky', sfSymbol: 'sun.max.fill' };
  if (code <= 3) return { description: 'Partly Cloudy', sfSymbol: 'cloud.sun.fill' };
  if (code <= 48) return { description: 'Foggy', sfSymbol: 'cloud.fog.fill' };
  if (code <= 67) return { description: 'Rainy', sfSymbol: 'cloud.rain.fill' };
  if (code <= 77) return { description: 'Snowy', sfSymbol: 'cloud.snow.fill' };
  if (code <= 82) return { description: 'Showers', sfSymbol: 'cloud.heavyrain.fill' };
  return { description: 'Thunderstorm', sfSymbol: 'cloud.bolt.rain.fill' };
}

export function useWeather(location: LocationObject | null): WeatherData | null {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Round to ~1 km precision so we don't refetch on every GPS ping
  const lat = location ? Math.round(location.coords.latitude * 100) / 100 : null;
  const lon = location ? Math.round(location.coords.longitude * 100) / 100 : null;

  useEffect(() => {
    if (lat === null || lon === null) return;

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`
    )
      .then(r => r.json())
      .then(data => {
        const c = data.current;
        const { description, sfSymbol } = describeCode(c.weather_code);
        setWeather({
          temperature: Math.round(c.temperature_2m),
          windSpeed: Math.round(c.wind_speed_10m),
          description,
          sfSymbol,
        });
      })
      .catch(() => null);
  }, [lat, lon]);

  return weather;
}
