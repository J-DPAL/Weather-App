import axios from "axios";

const DATA_SERVICE = import.meta.env.VITE_DATA_SERVICE_URL || "http://127.0.0.1:8003/api/v1/records";

export async function fetchSavedRecords() {
  try {
    const [locations, weather, ranges] = await Promise.all([
      axios.get(`${DATA_SERVICE}/location`),
      axios.get(`${DATA_SERVICE}/weather`),
      axios.get(`${DATA_SERVICE}/range`),
    ]);
    return { locations: locations.data, weather: weather.data, ranges: ranges.data };
  } catch (err) {
    console.error("Error fetching saved records:", err);
    throw err;
  }
}

export async function saveLocation(locationData) {
  try {
    const res = await axios.post(`${DATA_SERVICE}/location`, locationData);
    return res.data;
  } catch (err) {
    console.error("Error saving location:", err);
    throw err;
  }
}

export async function saveWeather(weatherData) {
  try {
    const res = await axios.post(`${DATA_SERVICE}/weather`, weatherData);
    return res.data;
  } catch (err) {
    console.error("Error saving weather:", err);
    throw err;
  }
}

export async function exportData(format = "csv") {
  try {
    let responseType = "text";
    if (format === "json") responseType = "json";
    else if (format === "pdf") responseType = "blob";
    else responseType = "text";

    const res = await axios.get(`${DATA_SERVICE}/export`, {
      params: { format },
      responseType,
    });
    return res.data;
  } catch (err) {
    console.error("Error exporting data:", err);
    throw err;
  }
}

export async function deleteLocation(locationId) {
  try {
    const res = await axios.delete(`${DATA_SERVICE}/location/${locationId}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting location:", err);
    throw err;
  }
}

export async function deleteWeather(weatherId) {
  try {
    const res = await axios.delete(`${DATA_SERVICE}/weather/${weatherId}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting weather:", err);
    throw err;
  }
}

export async function deleteRange(rangeId) {
  try {
    const res = await axios.delete(`${DATA_SERVICE}/range/${rangeId}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting range:", err);
    throw err;
  }
}

export async function updateLocation(locationId, updates) {
  try {
    const res = await axios.put(`${DATA_SERVICE}/location/${locationId}`, updates);
    return res.data;
  } catch (err) {
    console.error("Error updating location:", err);
    throw err;
  }
}

export async function updateWeather(weatherId, updates) {
  try {
    const res = await axios.put(`${DATA_SERVICE}/weather/${weatherId}`, updates);
    return res.data;
  } catch (err) {
    console.error("Error updating weather:", err);
    throw err;
  }
}

export async function updateRange(rangeId, updates) {
  try {
    const res = await axios.put(`${DATA_SERVICE}/range/${rangeId}`, updates);
    return res.data;
  } catch (err) {
    console.error("Error updating range:", err);
    throw err;
  }
}

export async function deleteAllLocations() {
  try {
    const res = await axios.delete(`${DATA_SERVICE}/all/location`);
    return res.data;
  } catch (err) {
    console.error("Error deleting all locations:", err);
    throw err;
  }
}

export async function deleteAllWeather() {
  try {
    const res = await axios.delete(`${DATA_SERVICE}/all/weather`);
    return res.data;
  } catch (err) {
    console.error("Error deleting all weather:", err);
    throw err;
  }
}

export async function saveRange(rangeData) {
  try {
    const res = await axios.post(`${DATA_SERVICE}/range`, rangeData);
    return res.data;
  } catch (err) {
    console.error("Error saving range:", err);
    throw err;
  }
}
