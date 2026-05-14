"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, MapPin,
  Search, AlertCircle, Loader, CloudSnow, CloudDrizzle, CloudLightning
} from "lucide-react";

// Types for weather data
interface WeatherData {
  coord: { lon: number; lat: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  name: string;
  cod: number;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    weather: Array<{ main: string; description: string; icon: string }>;
    wind: { speed: number };
    clouds: { all: number };
  }>;
  city: {
    name: string;
    country: string;
  };
}

// Custom UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, className = "", onClick = () => {}, disabled = false, type = "button" }: any) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

// Weather icon mapping
const getWeatherIcon = (weatherMain: string, size = 48) => {
  const iconProps = { size, className: "text-blue-300" };
  
  switch (weatherMain.toLowerCase()) {
    case "clear":
      return <Sun {...iconProps} className="text-yellow-300" />;
    case "clouds":
      return <Cloud {...iconProps} />;
    case "rain":
      return <CloudRain {...iconProps} className="text-blue-400" />;
    case "drizzle":
      return <CloudDrizzle {...iconProps} />;
    case "thunderstorm":
      return <CloudLightning {...iconProps} className="text-purple-400" />;
    case "snow":
      return <CloudSnow {...iconProps} className="text-cyan-300" />;
    default:
      return <Cloud {...iconProps} />;
  }
};

// Format time from Unix timestamp
const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

// Format date
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
};

export default function WeatherDashboard() {
  const [searchQuery, setSearchQuery] = useState("London");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  const fetchWeatherData = async (query: string) => {
    if (!query.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Fetch current weather
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=${unit}`
      );

      if (!weatherRes.ok) {
        throw new Error("City not found. Please try another search.");
      }

      const weather = await weatherRes.json();
      setWeatherData(weather);

      // Fetch forecast data
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${API_KEY}&units=${unit}`
      );

      if (forecastRes.ok) {
        const forecast = await forecastRes.json();
        setForecastData(forecast);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data");
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData(searchQuery);
  };

  const toggleUnit = () => {
    setUnit(unit === "metric" ? "imperial" : "metric");
    if (weatherData) {
      fetchWeatherData(weatherData.name);
    }
  };

  // Load default city on mount
  useEffect(() => {
    fetchWeatherData("London");
  }, []);

  const tempUnit = unit === "metric" ? "°C" : "°F";
  const speedUnit = unit === "metric" ? "m/s" : "mph";

  // Get unique forecast days (one per day)
  const getDailyForecasts = () => {
    if (!forecastData) return [];
    const dailyMap = new Map();
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyMap.has(date)) {
        dailyMap.set(date, item);
      }
    });
    
    return Array.from(dailyMap.values()).slice(0, 5);
  };

  const dailyForecasts = getDailyForecasts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Weather Dashboard</h1>
          <p className="text-slate-300">Real-time weather information for any city</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a city..."
                className="w-full px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 outline-none focus:border-blue-400 transition-colors"
                aria-label="Search for a city"
              />
              <Search className="absolute right-3 top-3.5 text-slate-400" size={20} aria-hidden="true" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader className="animate-spin" size={20} /> : "Search"}
            </Button>
            <Button
              type="button"
              onClick={toggleUnit}
              className="bg-slate-700 hover:bg-slate-600"
            >
              {unit === "metric" ? "°F" : "°C"}
            </Button>
          </form>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3 text-red-200"
            role="alert"
          >
            <AlertCircle size={24} aria-hidden="true" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin text-blue-400" size={48} aria-label="Loading weather data" />
          </div>
        )}

        {/* Main Weather Section */}
        {weatherData && !loading && (
          <>
            {/* Current Weather Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left side - Main info */}
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={20} className="text-blue-300" aria-hidden="true" />
                      <h2 className="text-3xl font-bold">
                        {weatherData.name}, {weatherData.sys.country}
                      </h2>
                    </div>
                    <p className="text-slate-300 mb-6">{weatherData.weather[0].description}</p>
                    <div className="mb-6">
                      <div className="text-7xl font-bold mb-2">
                        {Math.round(weatherData.main.temp)}{tempUnit}
                      </div>
                      <p className="text-slate-300">
                        Feels like {Math.round(weatherData.main.feels_like)}{tempUnit}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">High</p>
                        <p className="text-xl font-semibold">{Math.round(weatherData.main.temp_max)}{tempUnit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Low</p>
                        <p className="text-xl font-semibold">{Math.round(weatherData.main.temp_min)}{tempUnit}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Weather icon and details */}
                  <div className="flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {getWeatherIcon(weatherData.weather[0].main, 120)}
                    </motion.div>
                    <p className="text-2xl font-semibold mt-4 capitalize">
                      {weatherData.weather[0].main}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Weather Details Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {/* Humidity */}
              <Card>
                <div className="flex items-center gap-3 mb-2">
                  <Droplets className="text-blue-400" aria-hidden="true" />
                  <h3 className="font-semibold text-slate-300">Humidity</h3>
                </div>
                <p className="text-3xl font-bold">{weatherData.main.humidity}%</p>
              </Card>

              {/* Wind Speed */}
              <Card>
                <div className="flex items-center gap-3 mb-2">
                  <Wind className="text-cyan-400" aria-hidden="true" />
                  <h3 className="font-semibold text-slate-300">Wind Speed</h3>
                </div>
                <p className="text-3xl font-bold">{weatherData.wind.speed.toFixed(1)} {speedUnit}</p>
              </Card>

              {/* Visibility */}
              <Card>
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="text-purple-400" aria-hidden="true" />
                  <h3 className="font-semibold text-slate-300">Visibility</h3>
                </div>
                <p className="text-3xl font-bold">{(weatherData.visibility / 1000).toFixed(1)} km</p>
              </Card>

              {/* Pressure */}
              <Card>
                <div className="flex items-center gap-3 mb-2">
                  <Gauge className="text-orange-400" aria-hidden="true" />
                  <h3 className="font-semibold text-slate-300">Pressure</h3>
                </div>
                <p className="text-3xl font-bold">{weatherData.main.pressure} mb</p>
              </Card>
            </motion.div>

            {/* Sunrise/Sunset */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid md:grid-cols-2 gap-4 mb-8"
            >
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <Sun className="text-yellow-300" size={24} aria-hidden="true" />
                  <h3 className="text-xl font-semibold">Sunrise</h3>
                </div>
                <p className="text-2xl font-bold">{formatTime(weatherData.sys.sunrise)}</p>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <Cloud className="text-indigo-300" size={24} aria-hidden="true" />
                  <h3 className="text-xl font-semibold">Sunset</h3>
                </div>
                <p className="text-2xl font-bold">{formatTime(weatherData.sys.sunset)}</p>
              </Card>
            </motion.div>

            {/* 5-Day Forecast */}
            {dailyForecasts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-4">5-Day Forecast</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {dailyForecasts.map((day, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="text-center h-full hover:border-blue-400/50 transition-colors">
                        <p className="text-sm font-semibold text-slate-300 mb-3">
                          {formatDate(day.dt)}
                        </p>
                        <div className="flex justify-center mb-3">
                          {getWeatherIcon(day.weather[0].main, 32)}
                        </div>
                        <p className="text-xs text-slate-400 mb-3 capitalize">
                          {day.weather[0].main}
                        </p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-slate-500">High</p>
                            <p className="text-lg font-bold">
                              {Math.round(day.main.temp_max)}{tempUnit}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Low</p>
                            <p className="text-lg font-bold">
                              {Math.round(day.main.temp_min)}{tempUnit}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-xs text-slate-500">Humidity</p>
                            <p className="text-sm font-semibold">{day.main.humidity}%</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !weatherData && !error && (
          <Card className="text-center py-12">
            <Cloud size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-300">Search for a city to see weather information</p>
          </Card>
        )}
      </div>
    </div>
  );
}