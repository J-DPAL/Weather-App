import React from "react";

function toF(c) { return typeof c === "number" ? Math.round((c * 9) / 5 + 32) : c; }

export default function ForecastList({ forecast, units = "C" }) {
  return (
    <div className="flex overflow-x-auto space-x-4 py-2 pr-2">
      {forecast.map((d, idx) => {
        const max = typeof d.max_temp === "number" ? d.max_temp : null;
        let accent = "from-sky-500 to-indigo-500";
        if (max !== null) {
          if (max >= 28) accent = "from-rose-500 to-orange-500";
          else if (max >= 20) accent = "from-emerald-500 to-teal-500";
        }
        return (
          <div
            key={idx}
            className="shrink-0 w-44 text-center rounded-2xl p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-100 dark:border-slate-700 shadow hover:shadow-lg transition-all"
          >
            <div className={`h-1 w-16 mx-auto rounded-full bg-linear-to-r ${accent}`}></div>
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400 mt-2">{d.date}</div>
            <div className="text-xl font-bold mt-1 text-gray-900 dark:text-white">
              {d.max_temp ? (
                units === "F"
                  ? `${toF(d.max_temp)}° / ${toF(d.min_temp)}°`
                  : `${Math.round(d.max_temp)}° / ${Math.round(d.min_temp)}°`
              ) : "N/A"}
            </div>
            <div className="text-xs mt-1 text-gray-600 dark:text-slate-300 min-h-4">{d.summary || "—"}</div>
            {d.icon && (
              <img
                src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                alt={d.summary || "icon"}
                className="mx-auto w-14 h-14 mt-2"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
