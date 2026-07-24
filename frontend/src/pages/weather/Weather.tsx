import { useState } from "react";
import WeatherCard from "../../components/weather/WeatherCard";
import { getWeather } from "../../services/weatherService";
import type { WeatherData } from "../../services/weatherService";

export default function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please enter a city.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getWeather(city);
      setWeather(data);
    } catch (err) {
      setWeather(null);
      setError("City not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        Weather
      </h1>

      <div className="bg-white shadow rounded-lg p-6 max-w-lg">

        <label className="block font-medium mb-2">
          Enter City
        </label>

        <div className="flex gap-3">

          <input
            type="text"
            placeholder="e.g. Mangalore"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 border rounded-lg p-2"
          />

          <button
            onClick={handleSearch}
            className="bg-green-600 text-white px-5 rounded-lg hover:bg-green-700"
          >
            Search
          </button>

        </div>

        {loading && (
          <p className="mt-4 text-blue-600">
            Loading weather...
          </p>
        )}

        {error && (
          <p className="mt-4 text-red-600">
            {error}
          </p>
        )}
      </div>

      {weather && <WeatherCard weather={weather} />}
    </div>
  );
}