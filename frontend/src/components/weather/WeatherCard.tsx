import type { WeatherData } from "../../services/weatherService";

interface Props {
  weather: WeatherData;
}

export default function WeatherCard({ weather }: Props) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mt-6 border border-gray-200 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-green-700 mb-4">
        Weather Details
      </h2>

      <div className="space-y-3 text-lg">
        <p>
          <span className="font-semibold">📍 City:</span> {weather.city}
        </p>

        <p>
          <span className="font-semibold">🌡 Temperature:</span>{" "}
          {weather.temperature} °C
        </p>

        <p>
          <span className="font-semibold">💧 Humidity:</span>{" "}
          {weather.humidity}%
        </p>

        <p>
          <span className="font-semibold">☁ Condition:</span>{" "}
          {weather.weather}
        </p>

        <p>
          <span className="font-semibold">🌬 Wind Speed:</span>{" "}
          {weather.wind_speed} m/s
        </p>
      </div>
    </div>
  );
}