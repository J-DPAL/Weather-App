import React from "react";

function toF(c) { return typeof c === "number" ? Math.round((c * 9) / 5 + 32) : c; }

export default function WeatherCurrent({ location, current, units = "C" }) {
  return (
    <div className="rounded-2xl p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-100 dark:border-slate-700 shadow-lg">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
          {location?.display_name || "Current location"}
        </h2>
        {current?.weather?.[0]?.icon && (
          <img
            src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
            alt={current.weather[0].description}
            className="w-14 h-14"
          />
        )}
      </div>
      <div className="text-5xl font-extrabold my-3 text-gray-900 dark:text-white">
        {(() => {
          const c = current?.main?.temp ?? current?.temp;
          const val = units === "F" ? toF(c) : Math.round(c);
          return `${val}°${units}`;
        })()}
      </div>
      <div className="capitalize text-gray-600 dark:text-slate-300">
        {current?.weather?.[0]?.description || ""}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-slate-300">
        <div className="rounded-xl bg-gray-50 dark:bg-slate-700/60 p-3">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Humidity</div>
          <div className="font-semibold">{current?.main?.humidity ?? current?.humidity}%</div>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-slate-700/60 p-3">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Wind</div>
          <div className="font-semibold">{current?.wind?.speed ?? current?.wind_speed} m/s</div>
        </div>
      </div>
    </div>
  );
}
