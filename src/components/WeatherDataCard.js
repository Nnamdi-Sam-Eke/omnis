import React, { useState, useEffect, Suspense } from "react";

const WeatherDataCard = ({ location }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem("weatherCardCollapsed") === "true" || true
  );
  const [updateMessage, setUpdateMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const fetchWeather = async (locationQuery, isAutoUpdate = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&q=${locationQuery}&days=5`
      );
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
        setForecast(data.forecast.forecastday);
        if (isAutoUpdate) {
          setUpdateMessage("Weather updated!");
          setTimeout(() => setUpdateMessage(""), 3000);
        }
      } else {
        setError(data.error.message || "Unknown error");
      }
    } catch (err) {
      setError("Failed to fetch weather data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchWeather(location);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          fetchWeather(`${lat},${lon}`);
        },
        () => setError("Location access denied")
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }

    const interval = setInterval(() => {
      if (location) {
        fetchWeather(location, true);
      }
    }, 600000);

    return () => clearInterval(interval);
  }, [location]);

  const toggleCollapse = () => {
    const newCollapseState = !isCollapsed;
    setIsCollapsed(newCollapseState);
    localStorage.setItem("weatherCardCollapsed", newCollapseState);
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-32"
        role="status"
        aria-live="polite"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="text-red-500 dark:text-red-400 text-center"
        role="alert"
        aria-label="Weather data error"
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div
      className="bg-white w-full max-w-3xl dark:bg-gray-800 shadow-lg hover:shadow-blue-500/50 rounded-xl p-4 border mx-auto text-center text-gray-900 dark:text-white"
      aria-label="Weather data card"
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        {weather.location.name}, {weather.location.country}
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400" aria-label="Local time">
        Local Time: <span className="font-semibold">{currentTime.toLocaleTimeString()}</span>
      </p>

      {updateMessage && (
        <p
          className="mt-2 text-green-500 text-sm animate-fadeIn"
          role="status"
          aria-live="polite"
        >
          {updateMessage}
        </p>
      )}

      <div className="flex items-center justify-center mt-4" aria-label="Current weather">
        <img
          src={weather.current.condition.icon}
          alt={weather.current.condition.text}
          className="w-20 h-20 animate-fadeIn"
        />
        <div className="ml-4">
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-300">{weather.current.temp_c}°C</p>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{weather.current.condition.text}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
        <p><span className="font-semibold">Feels Like:</span> {weather.current.feelslike_c}°C</p>
        <p><span className="font-semibold">Humidity:</span> {weather.current.humidity}%</p>
        <p><span className="font-semibold">Wind Speed:</span> {weather.current.wind_kph} km/h</p>
        <p><span className="font-semibold">Sunrise:</span> {weather.forecast.forecastday[0].astro.sunrise}</p>
        <p><span className="font-semibold">Sunset:</span> {weather.forecast.forecastday[0].astro.sunset}</p>
      </div>

      <div className="mt-6">
        <button
          onClick={toggleCollapse}
          className="text-blue-600 dark:text-blue-300 text-lg font-semibold"
          aria-expanded={!isCollapsed}
          aria-controls="forecast-section"
        >
          {isCollapsed ? "Show Forecast" : "Hide Forecast"}
        </button>

        {!isCollapsed && (
          <div
            id="forecast-section"
            className="mt-4 flex overflow-x-auto space-x-4 p-2 scrollbar-hide"
            role="region"
            aria-label="5-day forecast"
          >
            {forecast.slice(0, 5).map((day) => (
              <div
                key={day.date}
                className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 min-w-[120px] sm:min-w-[160px]"
              >
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{day.date}</p>
                <img src={day.day.condition.icon} alt="forecast icon" className="w-12 mx-auto" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{day.day.condition.text}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{day.day.maxtemp_c}°C / {day.day.mintemp_c}°C</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDataCard;