import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import useWeatherData from "../hooks/useWeatherData";
import SearchBar from "../components/SearchBar";
import WeatherCurrent from "../components/WeatherCurrent";
import ForecastList from "../components/ForecastList";
import MapView from "../components/MapView";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import { fetchSavedRecords, exportData, saveLocation, saveWeather, saveRange } from "../api/dataService";
import { getHistorical } from "../api/weatherService";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lastProcessedQuery = useRef(null);
  
  const {
    query,
    setQuery,
    location,
    currentWeather,
    forecast,
    loading,
    error,
    fetchWeather,
  } = useWeatherData();

  const [records, setRecords] = useState({ locations: [], weather: [] });
  const [_recordsLoading, setRecordsLoading] = useState(false);
  const [units, setUnits] = useState("C"); // 'C' or 'F'
  const [saveMessage, setSaveMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rangeSeries, setRangeSeries] = useState([]);
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeError, setRangeError] = useState("");
  const [rangeSaving, setRangeSaving] = useState(false);

  useEffect(() => {
    async function loadRecords() {
      setRecordsLoading(true);
      try {
        const data = await fetchSavedRecords();
        setRecords(data);
      } catch {
        setRecords({ locations: [], weather: [] });
      } finally {
        setRecordsLoading(false);
      }
    }
    loadRecords();
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery && searchQuery !== lastProcessedQuery.current) {
      lastProcessedQuery.current = searchQuery;
      setQuery(searchQuery);
      fetchWeather(searchQuery);
      setSearchParams({});
    }
  }, [searchParams, fetchWeather, setQuery, setSearchParams]);

  const reloadRecords = async () => {
    try {
      const data = await fetchSavedRecords();
      setRecords(data);
    } catch {
      setRecords({ locations: [], weather: [] });
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeather(`${latitude},${longitude}`);
      },
      () => {}
    );
  };

  const handleSaveLocation = async () => {
    if (!location) return;
    try {
      await saveLocation({
        query: location.query || `${location.lat},${location.lng}`,
        lat: location.lat,
        lng: location.lng,
        display_name: location.display_name || "",
        source: location.source || "manual"
      });
      setSaveMessage("✅ Location saved!");
      setTimeout(() => setSaveMessage(""), 3000);
      await reloadRecords();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.detail || "Failed to save location";
      setSaveMessage(`❌ ${msg}`);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleSaveWeather = async () => {
    if (!currentWeather || !location) return;
    try {
      await saveWeather({
        location_id: null,
        lat: location.lat,
        lng: location.lng,
        snapshot: currentWeather,
        kind: "current"
      });
      setSaveMessage("✅ Weather saved!");
      setTimeout(() => setSaveMessage(""), 3000);
      await reloadRecords();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.detail || "Failed to save weather";
      setSaveMessage(`❌ ${msg}`);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleLocationClick = (locationRecord) => {
    const searchQuery = locationRecord.query || `${locationRecord.lat},${locationRecord.lng}`;
    setQuery(searchQuery);
    fetchWeather(searchQuery);
  };

  const handleFetchRange = async () => {
    setRangeError("");
    setRangeSeries([]);
    if (!location) {
      setRangeError("Search a location first");
      return;
    }
    if (!startDate || !endDate) {
      setRangeError("Please select a start and end date");
      return;
    }
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s) || isNaN(e)) {
      setRangeError("Invalid dates");
      return;
    }
    if (s > e) {
      setRangeError("Start date must be on or before end date");
      return;
    }
    const diffDays = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 7) {
      setRangeError("Date range too large (max 7 days)");
      return;
    }
    try {
      setRangeLoading(true);
      const res = await getHistorical(location.lat, location.lng, startDate, endDate);
      setRangeSeries(res.series || []);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || "Failed to fetch range";
      setRangeError(msg);
    } finally {
      setRangeLoading(false);
    }
  };

  const handleSaveRange = async () => {
    if (!location || rangeSeries.length === 0 || !startDate || !endDate) return;
    try {
      setRangeSaving(true);
      const mins = rangeSeries.map(d => d.min_temp).filter(v => typeof v === "number");
      const maxs = rangeSeries.map(d => d.max_temp).filter(v => typeof v === "number");
      const midpoints = rangeSeries
        .map(d => (typeof d.min_temp === "number" && typeof d.max_temp === "number") ? (d.min_temp + d.max_temp) / 2 : null)
        .filter(v => typeof v === "number");
      const summary = {
        count: rangeSeries.length,
        min_temp: mins.length ? Math.min(...mins) : null,
        max_temp: maxs.length ? Math.max(...maxs) : null,
        avg_temp: midpoints.length ? (midpoints.reduce((a,b)=>a+b,0) / midpoints.length) : null,
      };
      await saveRange({
        query: location.display_name || location.query || `${location.lat},${location.lng}`,
        lat: location.lat,
        lng: location.lng,
        start_date: startDate,
        end_date: endDate,
        summary,
      });
      setSaveMessage("✅ Range saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || "Failed to save range";
      setSaveMessage(`❌ ${msg}`);
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setRangeSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:py-10 md:px-6 bg-linear-to-b from-sky-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_380px] gap-8">
        {/* Main Column */}
        <main className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-700 dark:text-slate-300">Find weather</div>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setUnits("C")}
                  className={`px-3 py-1.5 text-sm ${units === "C" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200"}`}
                >
                  °C
                </button>
                <button
                  type="button"
                  onClick={() => setUnits("F")}
                  className={`px-3 py-1.5 text-sm ${units === "F" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200"}`}
                >
                  °F
                </button>
              </div>
              <ThemeToggle />
            </div>
          </div>
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSubmit={(e) => { e.preventDefault(); fetchWeather(query); }}
            onUseLocation={handleUseLocation}
            loading={loading}
          />

          {loading && <Loader text="Fetching weather data..." />}

          {error && (
            <div className="text-red-600 font-medium text-center">{error}</div>
          )}

          {/* Save Message */}
          {saveMessage && (
            <div className="text-center font-medium text-sm py-2 px-4 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-200 dark:border-slate-700">
              {saveMessage}
            </div>
          )}

          {/* Save Buttons */}
          {(currentWeather || location) && (
            <div className="flex flex-wrap gap-3">
              {location && (
                <button
                  onClick={handleSaveLocation}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow font-medium"
                >
                  💾 Save Location
                </button>
              )}
              {currentWeather && (
                <button
                  onClick={handleSaveWeather}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow font-medium"
                >
                  💾 Save Weather
                </button>
              )}
            </div>
          )}

          {currentWeather && location && (
            <WeatherCurrent current={currentWeather} location={location} units={units} />
          )}

          {forecast && forecast.length > 0 && (
            <ForecastList forecast={forecast} units={units} />
          )}

          {/* Date Range Section */}
          {location && (
            <div className="rounded-2xl p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-100 dark:border-slate-700 shadow space-y-3">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">Date range (max 7 days)</div>
              <div className="flex flex-wrap gap-3 items-center">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">Start</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">End</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100" />
                </div>
                <button onClick={handleFetchRange} className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow font-medium disabled:opacity-60" disabled={rangeLoading}>
                  {rangeLoading ? "Fetching…" : "Get Range"}
                </button>
                <button onClick={handleSaveRange} className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow font-medium disabled:opacity-60" disabled={rangeSaving || rangeSeries.length === 0}>
                  {rangeSaving ? "Saving…" : "Save Range"}
                </button>
              </div>
              {rangeError && <div className="text-sm text-red-600">{rangeError}</div>}
              {rangeSeries.length > 0 && (
                <div>
                  <div className="text-sm mb-2 text-gray-700 dark:text-slate-300">Results for {startDate} to {endDate}</div>
                  <ForecastList forecast={rangeSeries} units={units} />
                </div>
              )}
            </div>
          )}

          {location && (
            <div className="h-80 rounded-lg overflow-hidden shadow">
              <MapView location={location} />
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="space-y-6 md:sticky md:top-6">
          <Sidebar records={records} exportData={exportData} onLocationClick={handleLocationClick} />
        </aside>
      </div>
    </div>
  );
}
