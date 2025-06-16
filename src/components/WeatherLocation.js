// components/WeatherLocation.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AnimatedWeather from 'react-animated-weather';
import { MapPin } from 'lucide-react';

const WeatherLocation = () => {
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
    const [icon, setIcon] = useState('PARTLY_CLOUDY_DAY');
    const [temperature, setTemperature] = useState(null);
    const [weatherDescription, setWeatherDescription] = useState('Partly Cloudy');


  const getWeatherDetails = (code: number, isDay: boolean): { icon: string; description: string } => {
    const map = {
      0: { day: 'CLEAR_DAY', night: 'CLEAR_NIGHT', desc: 'Clear sky' },
      1: { day: 'CLEAR_DAY', night: 'CLEAR_NIGHT', desc: 'Mostly clear' },
      2: { day: 'PARTLY_CLOUDY_DAY', night: 'PARTLY_CLOUDY_NIGHT', desc: 'Partly cloudy' },
      3: { day: 'CLOUDY', night: 'CLOUDY', desc: 'Overcast' },
      45: { day: 'FOG', night: 'FOG', desc: 'Foggy' },
      48: { day: 'FOG', night: 'FOG', desc: 'Depositing rime fog' },
      51: { day: 'RAIN', night: 'RAIN', desc: 'Light drizzle' },
      53: { day: 'RAIN', night: 'RAIN', desc: 'Moderate drizzle' },
      55: { day: 'RAIN', night: 'RAIN', desc: 'Dense drizzle' },
      61: { day: 'RAIN', night: 'RAIN', desc: 'Slight rain' },
      63: { day: 'RAIN', night: 'RAIN', desc: 'Moderate rain' },
      65: { day: 'RAIN', night: 'RAIN', desc: 'Heavy rain' },
      66: { day: 'SLEET', night: 'SLEET', desc: 'Freezing rain' },
      67: { day: 'SLEET', night: 'SLEET', desc: 'Heavy freezing rain' },
      71: { day: 'SNOW', night: 'SNOW', desc: 'Slight snow fall' },
      73: { day: 'SNOW', night: 'SNOW', desc: 'Moderate snow fall' },
      75: { day: 'SNOW', night: 'SNOW', desc: 'Heavy snow fall' },
      77: { day: 'SNOW', night: 'SNOW', desc: 'Snow grains' },
      80: { day: 'RAIN', night: 'RAIN', desc: 'Rain showers: slight' },
      81: { day: 'RAIN', night: 'RAIN', desc: 'Rain showers: moderate' },
      82: { day: 'RAIN', night: 'RAIN', desc: 'Rain showers: violent' },
      85: { day: 'SNOW', night: 'SNOW', desc: 'Snow showers: slight' },
      86: { day: 'SNOW', night: 'SNOW', desc: 'Snow showers: heavy' },
      95: { day: 'RAIN', night: 'RAIN', desc: 'Thunderstorm: slight' },
      96: { day: 'RAIN', night: 'RAIN', desc: 'Thunderstorm with hail' },
      99: { day: 'RAIN', night: 'RAIN', desc: 'Thunderstorm: violent' },
    };

    const weather = map[code] || { day: 'PARTLY_CLOUDY_DAY', night: 'PARTLY_CLOUDY_NIGHT', desc: 'Partly Cloudy' };
    return {
      icon: isDay ? weather.day : weather.night,
      description: weather.desc,
    };
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const locRes = await axios.get('https://ipapi.co/json/');
        const { city, region, country_name, latitude, longitude } = locRes.data;
        setLocation(`${city}, ${region}`);
        setCountry(country_name);

        const weatherRes = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const { weathercode, is_day, temperature: temp } = weatherRes.data.current_weather;

        const weatherDetails = getWeatherDetails(weathercode, is_day === 1);
        setIcon(weatherDetails.icon);
        setWeatherDescription(weatherDetails.description);
        setTemperature(temp);
      } catch (err) {
        console.error('Error fetching weather/location:', err);
        setLocation('Unknown');
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="absolute top-20 right-16 bg-white dark:bg-gray-800 shadow-xl px-5 py-3 rounded-xl flex items-center gap-4 z-10">
      <MapPin className="w-4 h-4 text-blue-500" />
      <div className="text-sm text-gray-700 dark:text-gray-300">
         <strong>{location}, {country}</strong>
      </div>
      <div className="flex items-center gap-2">
        <span title={weatherDescription}>
          <AnimatedWeather icon={icon} color="#facc15" size={32} animate={true} />
        </span>
        {temperature !== null && (
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {temperature}°C
          </span>
        )}
      </div>
    </div>
  );
};

export default WeatherLocation;
