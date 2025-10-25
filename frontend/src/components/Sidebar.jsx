import React from "react";

export default function Sidebar({ records = { locations: [], weather: [] }, exportData = () => {}, onLocationClick = null }) {
  const handleExport = async (format) => {
    try {
      const data = await exportData(format);
      let blob;
      let mime = "text/plain";
      if (data instanceof Blob) {
        blob = data; // e.g., PDF
      } else if (typeof data === "string") {
        if (format === "csv") mime = "text/csv";
        else if (format === "md") mime = "text/markdown";
        else if (format === "xml") mime = "application/xml";
        else mime = "text/plain";
        blob = new Blob([data], { type: mime });
      } else {
        // JSON object
        mime = "application/json";
        blob = new Blob([JSON.stringify(data, null, 2)], { type: mime });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export.${format}`;
      a.click();
    } catch (e) {
      // no-op; could surface toast in future
      console.error("Export failed", e);
    }
  };
  return (
    <div className="space-y-6">
      {/* Saved locations */}
      <div className="rounded-2xl p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-100 dark:border-slate-700 shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-slate-100">Saved locations</h3>
        {records.locations && records.locations.length > 0 ? (
          <ul className="space-y-1 max-h-48 overflow-y-auto text-gray-700 dark:text-slate-300">
            {records.locations.slice(0, 5).map((l) => (
              <li 
                key={l.id}
                onClick={() => onLocationClick && onLocationClick(l)}
                className={onLocationClick ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors pl-4 list-disc list-inside" : "pl-4 list-disc list-inside"}
              >
                {l.query} — {l.display_name} ({Number(l.lat).toFixed(2)},{Number(l.lng).toFixed(2)})
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500 dark:text-slate-400">No saved locations yet.</div>
        )}
      </div>

      {/* Saved weather */}
      <div className="rounded-2xl p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-100 dark:border-slate-700 shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-slate-100">Saved weather</h3>
        <div className="max-h-48 overflow-y-auto space-y-2 text-gray-700 dark:text-slate-300">
          {records.weather && records.weather.length > 0 ? (
            records.weather.slice(0, 5).map((w) => {
              const temp = w.snapshot?.main?.temp ? Math.round(w.snapshot.main.temp) : null;
              const location = w.snapshot?.name || `${w.lat?.toFixed(2)}, ${w.lng?.toFixed(2)}`;
              const date = new Date(w.created_at).toLocaleDateString();
              
              return (
                <div key={w.id} className="border-b border-gray-200 dark:border-slate-700 pb-1">
                  <div className="font-medium">
                    {temp !== null ? `${temp}°C` : 'N/A'} - {location}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{date}</div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 dark:text-slate-400">No saved weather snapshots.</div>
          )}
        </div>
      </div>

      {/* Export buttons */}
      <div className="rounded-2xl p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-100 dark:border-slate-700 shadow">
        <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-slate-100">Export data</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleExport("json")}
            className="px-3 py-1 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500"
          >
            Export JSON
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="px-3 py-1 rounded-lg bg-linear-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-500 hover:to-green-500"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport("md")}
            className="px-3 py-1 rounded-lg bg-gray-700 text-white hover:bg-gray-600 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Export MD
          </button>
          <button
            onClick={() => handleExport("xml")}
            className="px-3 py-1 rounded-lg bg-linear-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500"
          >
            Export XML
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-3 py-1 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
          >
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
