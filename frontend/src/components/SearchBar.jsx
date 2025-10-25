import React from "react";

export default function SearchBar({ query, setQuery, onSubmit, onUseLocation, loading }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
      <input
        type="text"
        placeholder="zip, city, coords (lat,lng) or landmark"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Resolving..." : "Search"}
      </button>
      <button
        type="button"
        onClick={onUseLocation}
        className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 transition-colors"
      >
        Use my location
      </button>
    </form>
  );
}
