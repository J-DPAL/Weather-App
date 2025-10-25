import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Records from "./pages/Records";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Router>
      <header className="text-white dark:text-slate-100 shadow-md transition-colors bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-white/10 dark:border-slate-700">
        <div className="container mx-auto flex justify-between items-center p-4 md:py-5 md:px-6">
          <Link to="/" className="text-2xl font-bold">
            🌤️ WeatherApp
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex gap-4 items-center">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/records" className="hover:underline">
              Records
            </Link>
            <Link to="/about" className="hover:underline">
              About
            </Link>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden bg-blue-700/90 dark:bg-slate-800/90 px-4 pb-4 transition-colors">
            <Link
              to="/"
              className="block py-2 hover:underline"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/records"
              className="block py-2 hover:underline"
              onClick={() => setIsOpen(false)}
            >
              Records
            </Link>
            <Link
              to="/about"
              className="block py-2 hover:underline"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
          </nav>
        )}
      </header>

      <main className="min-h-screen py-6 transition-colors">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/records" element={<Records />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <footer className="bg-gray-200 dark:bg-slate-900 text-gray-700 dark:text-slate-300 text-center py-4 mt-6 transition-colors">
        &copy; 2025 WeatherApp. All rights reserved.
      </footer>
    </Router>
  );
}
