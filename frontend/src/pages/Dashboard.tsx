import { useState, useEffect } from "react";
import {
  FaCloudSun,
  FaMoneyBillWave,
  FaRobot,
  FaWallet,
  FaSun,
  FaCloudRain,
  FaTint,
  FaSpinner,
  FaReceipt,
  FaShoppingBag,
} from "react-icons/fa";

import StatCard from "../components/dashboard/StatCard";
import SectionCard from "../components/dashboard/SectionCard";
import AIChatbotWidget from "../components/dashboard/AIChatbotWidget";
import { useAuth } from "../context/AuthContext";
import { getAllFarms } from "../services/farmService";
import type { Farm } from "../services/farmService";
import { getWeatherRecommendations } from "../services/aiService";
import type { WeatherRecommendationResponse } from "../services/aiService";
import { getLiveMarketPrices } from "../services/marketService";
import type { LivePricesResponse } from "../services/marketService";
import { getProfile } from "../services/profileService";
import type { ProfileData } from "../services/profileService";
import { getAllBills } from "../services/billService";
import type { BillData } from "../services/billService";
import { getDashboardData } from "../services/dashboardService";
import type { DashboardData } from "../services/dashboardService";
import { getWeather } from "../services/weatherService";
import type { WeatherData } from "../services/weatherService";

function Dashboard() {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<WeatherRecommendationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [, setDryingStartDateInput] = useState<string>("");

  // Market Prices State
  const [marketPrices, setMarketPrices] = useState<LivePricesResponse | null>(null);
  const [marketLoading, setMarketLoading] = useState<boolean>(false);
  const [marketError, setMarketError] = useState<string>("");
  const [selectedCommodity, setSelectedCommodity] = useState<"arecanut" | "coconut">("arecanut");
  const [selectedMarket, setSelectedMarket] = useState<string>(() => {
    return sessionStorage.getItem("selected_market") || "Shivamogga APMC";
  });

  // Profile, Bills & Dashboard Metrics State
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recentBills, setRecentBills] = useState<BillData[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // Sync selectedMarket when window gains focus or storage changes
  useEffect(() => {
    const syncMarket = () => {
      const stored = sessionStorage.getItem("selected_market") || "Shivamogga APMC";
      setSelectedMarket(stored);
    };
    window.addEventListener("focus", syncMarket);
    window.addEventListener("storage", syncMarket);
    return () => {
      window.removeEventListener("focus", syncMarket);
      window.removeEventListener("storage", syncMarket);
    };
  }, []);

  // Fetch farms, profile, and bills on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const farmList = await getAllFarms();
        setFarms(farmList);
        if (farmList.length > 0) {
          setSelectedFarmId(farmList[0].id || null);
        }
      } catch (err) {
        console.error("Error fetching farms:", err);
        setError("Failed to load farms.");
      }

      try {
        const prof = await getProfile();
        setProfile(prof);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }

      try {
        const bills = await getAllBills();
        setRecentBills(bills.slice(0, 3));
      } catch (err) {
        console.error("Error fetching bills:", err);
      }
    };
    fetchData();
  }, []);

  // Fetch dashboard metrics (Income & Expense) when farm changes or on mount
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const metrics = await getDashboardData(selectedFarmId || undefined);
        setDashboardMetrics(metrics);
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
      }
    };
    fetchDashboardMetrics();
  }, [selectedFarmId]);

  // Fetch real current weather for selected farm's area
  useEffect(() => {
    const selectedFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
    if (!selectedFarm || !selectedFarm.area) return;

    const fetchCurrentWeather = async () => {
      try {
        const data = await getWeather(selectedFarm.area);
        setWeatherData(data);
      } catch (err) {
        console.error("Error fetching weather for city:", selectedFarm.area, err);
        setWeatherData(null);
      }
    };
    fetchCurrentWeather();
  }, [selectedFarmId, farms]);

  // Fetch recommendations when farm changes
  useEffect(() => {
    if (selectedFarmId === null) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getWeatherRecommendations(selectedFarmId);
        setRecommendation(data);
        if (data.drying_recommendation?.start_date) {
          setDryingStartDateInput(data.drying_recommendation.start_date);
        } else {
          setDryingStartDateInput("");
        }
      } catch (err) {
        console.error("Error fetching AI recommendations:", err);
        setError("Failed to fetch weather recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [selectedFarmId]);

  // Fetch market prices on mount & selected market change
  useEffect(() => {
    const fetchMarketData = async () => {
      setMarketLoading(true);
      setMarketError("");
      try {
        const data = await getLiveMarketPrices(selectedMarket);
        setMarketPrices(data);
      } catch (err) {
        console.error("Error fetching live market prices:", err);
        setMarketError("Live market data is currently unavailable.");
      } finally {
        setMarketLoading(false);
      }
    };
    fetchMarketData();
  }, [selectedMarket]);

  const handleFarmChange = (farmId: number) => {
    setSelectedFarmId(farmId);
  };

  // Sparkline/trend rendering helper
  const renderSparkline = (history: { date: string; price: number }[]) => {
    if (!history || history.length === 0) return null;

    const prices = history.map((h) => h.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const width = 300;
    const height = 85;
    const padding = 10;

    const points = history.map((item, idx) => {
      const x = padding + (idx / (history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((item.price - min) / range) * (height - 2 * padding);
      return { x, y, ...item };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, "");

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
      <div className="relative mt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
          <line x1="0" y1={padding} x2={width} y2={padding} stroke="#e5e7eb" strokeWidth="1" />

          <path d={areaD} fill="url(#chartGradient)" />
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.length > 0 && (
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="#10b981" />
          )}
        </svg>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
          <span>{history[0].date}</span>
          <span>{history[history.length - 1].date}</span>
        </div>
      </div>
    );
  };

  const farmerName = user?.name || profile?.name || "Farmer";

  return (
    <div className="space-y-8">
      {/* Welcome Banner with Farmer Profile Info */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-500 rounded-3xl text-white p-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            🌾 Welcome to Raitha Mithra AI
          </h1>
          <p className="mt-2 text-green-100 text-lg">
            Hello {farmerName}! Smart Agriculture & Decision Support Dashboard
          </p>
        </div>
        {(profile || user) && (
          <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white bg-green-100 flex items-center justify-center shrink-0">
              {profile?.profile_photo ? (
                <img src={profile.profile_photo} alt={farmerName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-green-800">👨‍🌾</span>
              )}
            </div>
            <div className="text-sm">
              <p className="font-bold text-base">{farmerName}</p>
              <p className="text-green-100 text-xs">📍 {profile?.village || "Location N/A"} | 🌾 {profile?.main_crop || "Arecanut"}</p>
              <p className="text-green-200 text-xs">📞 {user?.phone || profile?.phone || "N/A"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Income Summary"
          value={
            dashboardMetrics !== null
              ? `₹${Number(dashboardMetrics.total_income).toLocaleString("en-IN")}`
              : "₹0"
          }
          icon={<FaMoneyBillWave />}
          color="bg-green-600"
        />
        <StatCard
          title="Expense Summary"
          value={
            dashboardMetrics !== null
              ? `₹${Number(dashboardMetrics.total_expense).toLocaleString("en-IN")}`
              : "₹0"
          }
          icon={<FaWallet />}
          color="bg-red-500"
        />
        <StatCard
          title="Weather Forecast"
          value={
            weatherData
              ? `${weatherData.temperature}°C - ${weatherData.weather}`
              : recommendation?.area
              ? `Weather: ${recommendation.area}`
              : "No Farm Selected"
          }
          icon={<FaCloudSun />}
          color="bg-sky-500"
        />
        <StatCard
          title="AI Recommendation Alert"
          value={
            recommendation?.spray_recommendation?.message ||
            recommendation?.sell_wait_recommendation?.decision ||
            "Normal Conditions"
          }
          icon={<FaRobot />}
          color="bg-purple-600"
        />
      </div>

      {/* Today's AI Recommendations Section */}
      <SectionCard title="Today's AI Recommendations">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700">Select Farm:</span>
            {farms.length > 0 ? (
              <select
                value={selectedFarmId || ""}
                onChange={(e) => handleFarmChange(Number(e.target.value))}
                className="border border-gray-300 rounded-lg p-2 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.farm_name} ({f.area})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm text-red-500 font-medium">No farms registered.</span>
            )}
          </div>

          {recommendation && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span>Location: <strong className="text-gray-700 font-semibold">{recommendation.area}</strong></span>
              {recommendation.has_arecanut ? (
                <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Arecanut Farm</span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium">General Farm</span>
              )}
            </div>
          )}
        </div>

        {farms.length === 0 ? (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
            Please add a farm in the <a href="/farm" className="text-green-600 font-semibold hover:underline">Farms</a> section to view tailored weather recommendations.
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12 text-green-600 gap-2">
            <FaSpinner className="animate-spin text-2xl" />
            <span>Loading intelligence reports...</span>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        ) : recommendation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* 1. Spray Recommendation Card */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              recommendation.spray_recommendation.status === "safe"
                ? "bg-green-50/50 border-green-200 text-green-900"
                : "bg-rose-50/50 border-rose-200 text-rose-900"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base">Spray Recommendation</h3>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                  recommendation.spray_recommendation.status === "safe" ? "bg-green-600" : "bg-rose-600"
                }`}>
                  <FaTint />
                </div>
              </div>
              <p className="font-bold text-lg mb-2">{recommendation.spray_recommendation.message}</p>
              <p className="text-xs opacity-80">{recommendation.spray_recommendation.reason}</p>
            </div>

            {/* 2. Rain Alert Card */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              recommendation.rain_alert.status === "alert"
                ? "bg-rose-50/50 border-rose-200 text-rose-900"
                : "bg-sky-50/50 border-sky-200 text-sky-950"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base">Rain Alert</h3>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                  recommendation.rain_alert.status === "alert" ? "bg-rose-600" : "bg-sky-500"
                }`}>
                  <FaCloudRain />
                </div>
              </div>
              <p className="font-bold text-lg mb-2">{recommendation.rain_alert.message}</p>
              <p className="text-xs opacity-80">
                {recommendation.rain_alert.status === "alert"
                  ? "Precipitation is detected in the upcoming weather forecast."
                  : "No rain expected in the forecast. Conditions remain dry."}
              </p>
            </div>

            {/* 3. Drying Recommendation Card */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              recommendation.drying_recommendation.status === "good"
                ? "bg-green-50/50 border-green-200 text-green-900"
                : recommendation.drying_recommendation.status === "cover"
                ? "bg-amber-50/50 border-amber-200 text-amber-900"
                : recommendation.drying_recommendation.status === "unset"
                ? "bg-gray-50 border-gray-200 text-gray-700"
                : "bg-blue-50/50 border-blue-200 text-blue-900"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base">Drying Recommendation</h3>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                  recommendation.drying_recommendation.status === "good"
                    ? "bg-green-600"
                    : recommendation.drying_recommendation.status === "cover"
                    ? "bg-amber-600"
                    : "bg-blue-600"
                }`}>
                  <FaSun />
                </div>
              </div>
              <p className="font-bold text-lg mb-2">{recommendation.drying_recommendation.message}</p>
              <p className="text-xs opacity-80 mb-2">{recommendation.drying_recommendation.reason}</p>
            </div>

            {/* 4. Sell / Wait Recommendation Card */}
            <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/50 text-purple-950 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base">Sell / Wait Recommendation</h3>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-purple-600">
                  <FaShoppingBag />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-purple-700 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  {recommendation.sell_wait_recommendation?.decision || "SELL NOW"}
                </span>
              </div>
              <p className="text-xs text-purple-900 opacity-90 leading-relaxed">
                {recommendation.sell_wait_recommendation?.reason || "Market prices are currently at peak values. Recommended to sell produce."}
              </p>
            </div>

          </div>
        ) : null}
      </SectionCard>

      {/* Grid: Live Market Prices & Recent Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Live Market Prices Widget */}
        <SectionCard title="📈 Live Market Prices & AI Predictions">
          {marketLoading ? (
            <div className="flex justify-center items-center py-12 text-green-600 gap-2">
              <FaSpinner className="animate-spin text-xl" />
              <span>Loading market metrics...</span>
            </div>
          ) : marketError ? (
            <div className="text-center py-6 text-red-500 bg-red-50 rounded-xl border border-red-200">
              {marketError}
            </div>
          ) : marketPrices ? (
            <div>
              {/* Commodity Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedCommodity("arecanut")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                    selectedCommodity === "arecanut"
                      ? "bg-green-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  🌰 Arecanut ({selectedMarket.replace(" APMC", "")})
                </button>
                <button
                  onClick={() => setSelectedCommodity("coconut")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                    selectedCommodity === "coconut"
                      ? "bg-green-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  🥥 Coconut ({selectedMarket.replace(" APMC", "")})
                </button>
              </div>

              {/* Price Details */}
              {(() => {
                const info = marketPrices[selectedCommodity];
                return (
                  <div className="space-y-3 text-gray-750">
                    <div className="flex justify-between items-baseline">
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{info.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-gray-500">
                        per {selectedCommodity === "arecanut" ? "Quintal" : "1000 nuts"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b py-2 my-2 border-gray-200">
                      <div>
                        <span className="text-gray-400 block font-medium">Min Price</span>
                        <span className="font-bold text-gray-800">₹{info.min_price.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-medium">Max Price</span>
                        <span className="font-bold text-gray-800">₹{info.max_price.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <p>🏛️ Market: <strong className="text-gray-700">{info.market}</strong></p>
                    </div>

                    {/* Sparkline Chart */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 block mb-1">
                        Historical Price Trajectory
                      </span>
                      {renderSparkline(info.history)}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : null}
        </SectionCard>

        {/* Recent Bills Widget */}
        <SectionCard title="🧾 Recent Farm Bills & Vouchers">
          {recentBills.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
              No bills uploaded yet. Manage your vouchers in the <a href="/bills" className="text-green-600 font-bold hover:underline">Bills</a> section.
            </div>
          ) : (
            <div className="space-y-3">
              {recentBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-lg">
                      <FaReceipt />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{bill.bill_type}</p>
                      <p className="text-xs text-gray-400">{bill.date || bill.uploaded_at.substring(0, 10)}</p>
                    </div>
                  </div>
                  <a href="/bills" className="text-xs font-bold text-green-700 hover:underline">
                    View Bill
                  </a>
                </div>
              ))}
              <div className="pt-2 text-right">
                <a href="/bills" className="text-xs font-bold text-green-700 hover:underline">
                  View All Bills →
                </a>
              </div>
            </div>
          )}
        </SectionCard>

      </div>

      {/* Embedded AI Chatbot Widget */}
      <SectionCard title="🤖 Interactive AI Farming Assistant">
        <AIChatbotWidget />
      </SectionCard>

    </div>
  );
}

export default Dashboard;