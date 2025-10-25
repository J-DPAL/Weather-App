import { useState, useEffect, useCallback } from "react";
import { getWeatherByQuery } from "../api/weatherService";
import { resolveLocation } from "../api/locationService";

export default function useWeatherData(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = useCallback(async (q) => {
    if (!q) return;
    setLoading(true);
    setError("");
    setLocation(null);
    setCurrentWeather(null);
    setForecast([]);
    
    try {
      const loc = await resolveLocation(q);
      if (!loc) throw new Error("Location not found");

      setLocation(loc);
      const weatherData = await getWeatherByQuery(loc.lat, loc.lng);

      setCurrentWeather(weatherData.current);
      setForecast(weatherData.forecast);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const errorMsg = err.response.data?.detail || err.response.data?.message || "Location not found or does not exist";
        setError(errorMsg);
      } else {
        setError(err.message || "Something went wrong");
      }
      setLocation(null);
      setCurrentWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) fetchWeather(initialQuery);
  }, [initialQuery, fetchWeather]);

  return {
    query,
    setQuery,
    location,
    currentWeather,
    forecast,
    loading,
    error,
    fetchWeather,
  };
}
