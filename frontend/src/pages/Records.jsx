import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  fetchSavedRecords, 
  exportData, 
  deleteLocation, 
  deleteWeather,
  deleteRange,
  updateLocation,
  updateWeather,
  updateRange,
  deleteAllLocations,
  deleteAllWeather
} from "../api/dataService";
import Loader from "../components/Loader";
import ThemeToggle from "../components/ThemeToggle";

export default function Records() {
  const navigate = useNavigate();
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, type: null, data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, id: null, name: null });
  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await fetchSavedRecords();
      setRecords(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleExport = async (format) => {
    const data = await exportData(format);
    let blob;
    let mime = "text/plain";
    if (data instanceof Blob) {
      blob = data;
    } else if (typeof data === "string") {
      if (format === "csv") mime = "text/csv";
      else if (format === "md") mime = "text/markdown";
      else if (format === "xml") mime = "application/xml";
      else mime = "text/plain";
      blob = new Blob([data], { type: mime });
    } else {
      mime = "application/json";
      blob = new Blob([JSON.stringify(data, null, 2)], { type: mime });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export.${format}`;
    a.click();
  };

  const openDeleteModal = (type, id, name) => {
    setDeleteModal({ open: true, type, id, name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, type: null, id: null, name: null });
  };

  const confirmDelete = async () => {
    try {
      if (deleteModal.type === "location") {
        await deleteLocation(deleteModal.id);
      } else if (deleteModal.type === "weather") {
        await deleteWeather(deleteModal.id);
      } else if (deleteModal.type === "range") {
        await deleteRange(deleteModal.id);
      }
      await loadRecords();
      closeDeleteModal();
    } catch {
      alert("Failed to delete record");
    }
  };

  const openEditModal = (type, data) => {
    setEditModal({ open: true, type, data });
    if (type === "location") {
      setEditForm({
        query: data.query || "",
        lat: data.lat || "",
        lng: data.lng || "",
        display_name: data.display_name || "",
        source: data.source || ""
      });
    } else if (type === "weather") {
      setEditForm({
        lat: data.lat || "",
        lng: data.lng || "",
        kind: data.kind || "current"
      });
    } else if (type === "range") {
      setEditForm({
        query: data.query || "",
        lat: data.lat || "",
        lng: data.lng || "",
        start_date: data.start_date || "",
        end_date: data.end_date || "",
      });
    }
  };

  const closeEditModal = () => {
    setEditModal({ open: false, type: null, data: null });
    setEditForm({});
  };

  const saveEdit = async () => {
    try {
      if (editModal.type === "location") {
        await updateLocation(editModal.data.id, {
          query: editForm.query,
          lat: parseFloat(editForm.lat),
          lng: parseFloat(editForm.lng),
          display_name: editForm.display_name,
          source: editForm.source
        });
      } else if (editModal.type === "weather") {
        await updateWeather(editModal.data.id, {
          lat: parseFloat(editForm.lat),
          lng: parseFloat(editForm.lng),
          kind: editForm.kind
        });
      } else if (editModal.type === "range") {
        await updateRange(editModal.data.id, {
          query: editForm.query,
          lat: parseFloat(editForm.lat),
          lng: parseFloat(editForm.lng),
          start_date: editForm.start_date,
          end_date: editForm.end_date,
        });
      }
      await loadRecords();
      closeEditModal();
    } catch {
      alert("Failed to update record");
    }
  };

  const openDeleteAllModal = () => {
    setDeleteAllModal(true);
  };

  const closeDeleteAllModal = () => {
    setDeleteAllModal(false);
  };

  const confirmDeleteAll = async () => {
    try {
      await Promise.all([
        deleteAllLocations(),
        deleteAllWeather()
      ]);
      await loadRecords();
      closeDeleteAllModal();
    } catch {
      alert("Failed to delete all records");
    }
  };

  const handleLocationCardClick = (locationRecord) => {
    const searchQuery = locationRecord.query || `${locationRecord.lat},${locationRecord.lng}`;
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:py-8 md:px-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">📦 Saved Weather Records</h1>
        <ThemeToggle />
      </div>
      
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => handleExport("csv")}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow hover:from-blue-500 hover:to-indigo-500"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport("json")}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-emerald-600 to-green-600 text-white shadow hover:from-emerald-500 hover:to-green-500"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport("xml")}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white shadow hover:from-violet-500 hover:to-purple-500"
            >
              Export XML
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="px-4 py-2 rounded-xl bg-gray-800 text-white shadow hover:bg-gray-700"
            >
              Export PDF
            </button>
            <button
              onClick={openDeleteAllModal}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-red-600 to-rose-600 text-white shadow hover:from-red-500 hover:to-rose-500 font-medium"
            >
              Delete All Records
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Locations Column */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                📍 Locations ({records?.locations?.length || 0})
              </h2>
              <div className="space-y-4">
                {records?.locations && records.locations.length > 0 ? (
                  records.locations.map((loc) => (
                    <div
                      key={loc.id}
                      className="rounded-2xl p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-100 dark:border-slate-700 shadow hover:shadow-lg transition-shadow"
                    >
                      <div 
                        className="cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700/50 rounded-lg p-2 -m-2 mb-1 transition-colors"
                        onClick={() => handleLocationCardClick(loc)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            {loc.query || "Unknown Location"}
                          </h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            ID: {loc.id}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-700 dark:text-slate-300">
                          <p><strong>Display Name:</strong> {loc.display_name || "N/A"}</p>
                          <p><strong>Coordinates:</strong> {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}</p>
                          <p><strong>Source:</strong> {loc.source || "N/A"}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            <strong>Created:</strong> {new Date(loc.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal("location", loc)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal("location", loc.id, loc.query)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-slate-400 text-center py-8">No saved locations yet</p>
                )}
              </div>
            </div>

            {/* Weather Column */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                🌤️ Weather Records ({records?.weather?.length || 0})
              </h2>
              <div className="space-y-4">
                {records?.weather && records.weather.length > 0 ? (
                  records.weather.map((w) => {
                    const placeName = w.snapshot?.name || `${w.lat?.toFixed(2)}, ${w.lng?.toFixed(2)}`;
                    
                    return (
                      <div
                        key={w.id}
                        className="rounded-2xl p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-100 dark:border-slate-700 shadow hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {placeName} Weather
                          </h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                            ID: {w.id}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-700 dark:text-slate-300 mb-3">
                          <p><strong>Coordinates:</strong> {w.lat?.toFixed(4)}, {w.lng?.toFixed(4)}</p>
                          {w.location_id && <p><strong>Location ID:</strong> {w.location_id}</p>}
                          {w.snapshot?.main?.temp && (
                            <p><strong>Temperature:</strong> {Math.round(w.snapshot.main.temp)}°C</p>
                          )}
                          {w.snapshot?.weather?.[0]?.description && (
                            <p><strong>Condition:</strong> {w.snapshot.weather[0].description}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            <strong>Created:</strong> {new Date(w.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal("weather", w)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal("weather", w.id, `${w.lat?.toFixed(2)}, ${w.lng?.toFixed(2)}`)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 dark:text-slate-400 text-center py-8">No saved weather records yet</p>
                )}
              </div>
            </div>

            {/* Date Ranges Column */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                📅 Date Ranges ({records?.ranges?.length || 0})
              </h2>
              <div className="space-y-4">
                {records?.ranges && records.ranges.length > 0 ? (
                  records.ranges.map((r) => {
                    const place = r.query || `${Number(r.lat).toFixed(2)}, ${Number(r.lng).toFixed(2)}`;
                    const count = r.summary?.count ?? null;
                    const avg = typeof r.summary?.avg_temp === "number" ? Math.round(r.summary.avg_temp) : null;
                    const min = typeof r.summary?.min_temp === "number" ? Math.round(r.summary.min_temp) : null;
                    const max = typeof r.summary?.max_temp === "number" ? Math.round(r.summary.max_temp) : null;
                    const title = `${place} — ${r.start_date} to ${r.end_date}${count ? ` (${count} days)` : ""}`;
                    return (
                      <div
                        key={r.id}
                        className="rounded-2xl p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-100 dark:border-slate-700 shadow hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {title}
                          </h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                            ID: {r.id}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-700 dark:text-slate-300">
                          <p>
                            <strong>Coordinates:</strong> {r.lat?.toFixed(4)}, {r.lng?.toFixed(4)}
                          </p>
                          <p>
                            <strong>Summary:</strong> {avg !== null ? `${avg}°C avg` : "N/A"}
                            {min !== null && max !== null ? ` (min ${min}°C, max ${max}°C)` : ""}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            <strong>Created:</strong> {new Date(r.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => openEditModal("range", r)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal("range", r.id, title)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 dark:text-slate-400 text-center py-8">No saved date ranges yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Edit {editModal.type === "location" ? "Location" : editModal.type === "weather" ? "Weather" : "Range"} Record
            </h2>
            
            {editModal.type === "location" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Query</label>
                  <input
                    type="text"
                    value={editForm.query}
                    onChange={(e) => setEditForm({ ...editForm, query: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.lat}
                      onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.lng}
                      onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Source</label>
                  <input
                    type="text"
                    value={editForm.source}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            ) : editModal.type === "weather" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.lat}
                      onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.lng}
                      onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={editForm.kind}
                    onChange={(e) => setEditForm({ ...editForm, kind: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="current">Current</option>
                    <option value="forecast">Forecast</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Query</label>
                  <input
                    type="text"
                    value={editForm.query}
                    onChange={(e) => setEditForm({ ...editForm, query: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.lat}
                      onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.lng}
                      onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Confirm Delete
            </h2>
            <p className="text-gray-700 dark:text-slate-300 mb-6">
              Are you sure you want to delete {deleteModal.type === "location" ? "the location" : deleteModal.type === "weather" ? "the weather record" : "the date range"}{" "}
              <strong className="text-gray-900 dark:text-white">"{deleteModal.name}"</strong>?
              <br />
              <span className="text-red-600 dark:text-red-400 text-sm">This action cannot be undone.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 font-medium"
              >
                Delete
              </button>
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {deleteAllModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
              ⚠️ Delete All Records
            </h2>
            <p className="text-gray-700 dark:text-slate-300 mb-4">
              Are you sure you want to delete <strong className="text-red-600 dark:text-red-400">ALL</strong> location and weather records?
            </p>
            <p className="text-gray-700 dark:text-slate-300 mb-6">
              This will permanently delete:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-700 dark:text-slate-300 space-y-1">
              <li><strong>{records?.locations?.length || 0}</strong> location records</li>
              <li><strong>{records?.weather?.length || 0}</strong> weather records</li>
            </ul>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
              <p className="text-red-800 dark:text-red-300 text-sm font-semibold">
                ⚠️ This action cannot be undone!
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteAll}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 font-medium"
              >
                Delete All
              </button>
              <button
                onClick={closeDeleteAllModal}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
