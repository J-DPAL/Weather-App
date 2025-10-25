import axios from "axios";

const LOCATION_SERVICE = "http://127.0.0.1:8001/api/v1/location";

export async function resolveLocation(query) {
  try {
    const res = await axios.post(`${LOCATION_SERVICE}/resolve`, { query });
    return res.data;
  } catch (err) {
    console.error("Error resolving location:", err);
    throw err;
  }
}

export async function resolveAndSaveLocation(query) {
  try {
    const res = await axios.post(`${LOCATION_SERVICE}/resolve-and-save`, { query });
    return res.data;
  } catch (err) {
    console.error("Error resolving and saving location:", err);
    throw err;
  }
}
