import ThemeToggle from "../components/ThemeToggle";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:py-10 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">ℹ️ About This Project</h1>
        <ThemeToggle />
      </div>

      {/* Project Info */}
      <div className="rounded-2xl p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-100 dark:border-slate-700 shadow mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🌤️ Weather App</h2>
        <p className="mb-3 text-gray-700 dark:text-slate-300">
          This full-stack weather application was built as part of the <strong>PM Accelerator AI Engineer Internship Assessment</strong>.
          It demonstrates proficiency in React, FastAPI, PostgreSQL, and modern web development practices.
        </p>
        <p className="text-gray-700 dark:text-slate-300">
          <strong>Features:</strong> Real-time weather data, 5-day forecasts, interactive maps, dark mode, temperature unit conversion (°C/°F), 
          geolocation support, and complete CRUD operations with data persistence.
        </p>
        <p className="mt-3 text-gray-700 dark:text-slate-300">
          <strong>Tech Stack:</strong> React 19, Vite, Tailwind CSS v4, FastAPI, PostgreSQL 15, Docker, OpenCage API, OpenWeather API
        </p>
        <p className="mt-4 text-sm text-gray-600 dark:text-slate-400">
          Developed by <strong className="text-gray-900 dark:text-white">Jean-David Pallares</strong>
        </p>
      </div>

      {/* PM Accelerator Info */}
      <div className="rounded-2xl p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-100 dark:border-slate-700 shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About PM Accelerator</h2>
        <p className="mb-4 text-gray-700 dark:text-slate-300">
          The <strong>Product Manager Accelerator Program</strong> is designed to support PM professionals through every stage of their careers. 
          From students looking for entry-level jobs to Directors looking to take on leadership roles, the program has helped hundreds of 
          students fulfill their career aspirations.
        </p>
        
        <div className="space-y-3 mb-4">
          <div className="text-gray-700 dark:text-slate-300">
            <strong className="text-gray-900 dark:text-white">AI PM Bootcamp:</strong> Gain hands-on AI Product Management skills by building 
            real-life AI products with teams of AI Engineers, data scientists, and designers.
          </div>
          <div className="text-gray-700 dark:text-slate-300">
            <strong className="text-gray-900 dark:text-white">PMA Pro:</strong> End-to-end product manager job hunting program that helps you 
            master FAANG-level PM skills and gain job referrals through the largest alumni network.
          </div>
          <div className="text-gray-700 dark:text-slate-300">
            <strong className="text-gray-900 dark:text-white">Free Resources:</strong> 500+ free training courses and resources available on 
            YouTube and social media channels.
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <a
            href="https://www.pmaccelerator.io/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow"
          >
            Visit Website
          </a>
          <a
            href="https://www.linkedin.com/school/pmaccelerator/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow"
          >
            LinkedIn
          </a>
          <a
            href="https://www.youtube.com/c/drnancyli"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-colors shadow"
          >
            YouTube
          </a>
        </div>

        <p className="mt-4 text-xs text-gray-500 dark:text-slate-400">
          Boston, MA • Founded 2020 • E-Learning Providers
        </p>
      </div>
    </div>
  );
}
