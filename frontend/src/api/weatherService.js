import axios from "axios";

const WEATHER_SERVICE = import.meta.env.VITE_WEATHER_SERVICE_URL || "http://127.0.0.1:8002/api/v1/weather";

export async function getCurrentWeather(lat, lng) {
  try {
    const res = await axios.get(`${WEATHER_SERVICE}/current`, {
      params: { lat, lng },
    });
    return res.data.snapshot;
  } catch (err) {
    console.error("Error fetching current weather:", err);
    throw err;
  }
}

export async function getCurrentWeatherAndSave(lat, lng, locationId) {
  try {
    const res = await axios.get(`${WEATHER_SERVICE}/current-and-save`, {
      params: { lat, lng, location_id: locationId },
    });
    return res.data.snapshot;
  } catch (err) {
    console.error("Error fetching and saving current weather:", err);
    throw err;
  }
}

export async function getForecast(lat, lng, days = 5) {
  try {
    const res = await axios.get(`${WEATHER_SERVICE}/forecast`, {
      params: { lat, lng, days },
    });
    return res.data.aggregated || [];
  } catch (err) {
    console.error("Error fetching forecast:", err);
    throw err;
  }
}

export async function getForecastAndSave(lat, lng, days = 5, locationId) {
  try {
    const res = await axios.get(`${WEATHER_SERVICE}/forecast-and-save`, {
      params: { lat, lng, days, location_id: locationId },
    });
    return res.data.aggregated || [];
  } catch (err) {
    console.error("Error fetching and saving forecast:", err);
    throw err;
  }
}

export async function getWeatherByQuery(lat, lng) {
  const current = await getCurrentWeather(lat, lng);
  const forecast = await getForecast(lat, lng, 5);
  return { current, forecast };
}

export async function getHistorical(lat, lng, start, end) {
  try {
    const res = await axios.get(`${WEATHER_SERVICE}/historical`, {
      params: { lat, lng, start, end },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching historical range:", err);
    throw err;
  }
}
