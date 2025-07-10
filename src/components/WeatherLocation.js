import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

const WeatherLocation = () => {
  const [location, setLocation] = useState('Loading...');
  const [country, setCountry] = useState('');
  const [icon, setIcon] = useState('⛅');
  const [temperature, setTemperature] = useState(null);
  const [weatherDescription, setWeatherDescription] = useState('Fetching...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getWeatherDetails = (code, isDay) => {
    const map = {
      0: { day: '☀️', night: '🌙', desc: 'Clear sky' },
      1: { day: '🌤️', night: '🌙', desc: 'Mostly clear' },
      2: { day: '⛅', night: '☁️', desc: 'Partly cloudy' },
      3: { day: '☁️', night: '☁️', desc: 'Overcast' },
      45: { day: '🌫️', night: '🌫️', desc: 'Foggy' },
      48: { day: '🌫️', night: '🌫️', desc: 'Rime fog' },
      51: { day: '🌦️', night: '🌧️', desc: 'Light drizzle' },
      53: { day: '🌦️', night: '🌧️', desc: 'Moderate drizzle' },
      55: { day: '🌧️', night: '🌧️', desc: 'Heavy drizzle' },
      61: { day: '🌧️', night: '🌧️', desc: 'Slight rain' },
      63: { day: '🌧️', night: '🌧️', desc: 'Moderate rain' },
      65: { day: '🌧️', night: '🌧️', desc: 'Heavy rain' },
      66: { day: '🌨️', night: '🌨️', desc: 'Freezing rain' },
      67: { day: '🌨️', night: '🌨️', desc: 'Heavy freezing rain' },
      71: { day: '🌨️', night: '🌨️', desc: 'Slight snow' },
      73: { day: '❄️', night: '❄️', desc: 'Moderate snow' },
      75: { day: '❄️', night: '❄️', desc: 'Heavy snow' },
      77: { day: '❄️', night: '❄️', desc: 'Snow grains' },
      80: { day: '🌦️', night: '🌧️', desc: 'Light showers' },
      81: { day: '🌦️', night: '🌧️', desc: 'Moderate showers' },
      82: { day: '🌧️', night: '🌧️', desc: 'Heavy showers' },
      85: { day: '🌨️', night: '🌨️', desc: 'Light snow showers' },
      86: { day: '❄️', night: '❄️', desc: 'Heavy snow showers' },
      95: { day: '⛈️', night: '⛈️', desc: 'Thunderstorm' },
      96: { day: '⛈️', night: '⛈️', desc: 'Thunderstorm with hail' },
      99: { day: '⛈️', night: '⛈️', desc: 'Violent thunderstorm' },
    };

    const fallback = { day: '⛅', night: '☁️', desc: 'Partly Cloudy' };
    const match = map[code] || fallback;
    return {
      icon: isDay ? match.day : match.night,
      description: match.desc,
    };
  };

  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Step 1: Get user IP-based location (CORS-safe)
        const locRes = await fetch('https://ipinfo.io/json?token='); // Optional: add ?token=YOUR_TOKEN
        if (!locRes.ok) throw new Error('Failed to get location');
        const locData = await locRes.json();

        const [lat, lon] = locData.loc.split(',').map(Number);
        setLocation(`${locData.city}, ${locData.region}`);
        setCountry(locData.country);

        // Step 2: Fetch weather from Open-Meteo
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (!weatherRes.ok) throw new Error('Weather API error');

        const { current_weather } = await weatherRes.json();
        if (!current_weather) throw new Error('Invalid weather response');

        const { weathercode, is_day, temperature: temp } = current_weather;
        const details = getWeatherDetails(weathercode, is_day === 1);

        setIcon(details.icon);
        setWeatherDescription(details.description);
        setTemperature(Math.round(temp));
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load weather');
        setLocation('Unknown');
        setCountry('');
        setIcon('❌');
        setTemperature(null);
        setWeatherDescription('Unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationAndWeather();
  }, []);

  if (isLoading) {
    return (
      <div className="absolute top-20 right-16 bg-white dark:bg-gray-800 shadow-xl px-5 py-3 rounded-xl flex items-center gap-4 z-10">
        <MapPin className="w-4 h-4 text-blue-500" />
        <span className="text-sm text-gray-700 dark:text-gray-300">Fetching weather...</span>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-20 right-16 bg-white dark:bg-gray-800 shadow-xl px-5 py-3 rounded-xl flex items-center gap-4 z-10">
        <MapPin className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
      </div>
    );
  }

  return (
    <div className="absolute top-20 right-16 bg-white dark:bg-gray-800 shadow-xl px-5 py-3 rounded-xl flex items-center gap-4 z-10">
      <MapPin className="w-4 h-4 text-blue-500" />
      <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
        {location}{country ? `, ${country}` : ''}
      </span>
      <span className="text-2xl" title={weatherDescription}>{icon}</span>
      {temperature !== null && (
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {temperature}°C
        </span>
      )}
    </div>
  );
};

export default WeatherLocation;
