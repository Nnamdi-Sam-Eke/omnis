// services/api.js (Handles API Calls)
import axios from "axios";

export const getWeatherAlertsData = async (location) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/alerts?location=${encodeURIComponent(location)}`);
    return { type: "weather alerts", data: response.data.data };
  } catch (error) {
    throw new Error("Error fetching weather alerts data");
  }
};

export const getWeatherData = async (location) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/weather?location=${encodeURIComponent(location)}`);
    return { type: "weather", data: response.data.data };
  } catch (error) {
    throw new Error("Error fetching weather data");
  }
};

export const getWeatherForecast = async (location) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/forecast?location=${encodeURIComponent(location)}`);
    return { type: "forecast", data: response.data.data };
  } catch (error) {
    throw new Error("Error fetching weather forecast");
  }
};

export const getWeatherHistory = async (location) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/history?location=${encodeURIComponent(location)}`);
    return { type: "History", data: response.data.data };
  } catch (error) {
    throw new Error("Error fetching weather history");
  }
};

export const getGeolocationData = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/geolocate");
    if (response.data.status === "success") {
      return { type: "geolocate", data: response.data.data };
    } else {
      throw new Error("Geolocation error: " + (response.data.error || "Unknown error"));
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching geolocation data");
  }
};

export const getGeocodeData = async (address) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/geocode?address=${encodeURIComponent(address)}`);
    return { type: "geocode", data: response.data.data };
  } catch (error) {
    throw new Error("Error fetching geocode data");
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/reverse-geocode?lat=${latitude}&lng=${longitude}`);
    return { type: "reverse-geocode", data: response.data.data };
  } catch (error) {
    throw new Error("Error performing reverse geocoding");
  }
};
