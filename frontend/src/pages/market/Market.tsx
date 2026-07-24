import { useState, useEffect } from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaChartLine,
  FaSpinner,
  FaInfoCircle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { getMarketPredictions, getMarketsList } from "../../services/marketService";
import type { MarketPredictionsResponse, CommodityPredictionInfo, PredictionDetail } from "../../services/marketService";

export default function Market() {
  const [predictions, setPredictions] = useState<MarketPredictionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedCommodity, setSelectedCommodity] = useState<"arecanut" | "coconut">("arecanut");

  // Session persistence for selected APMC market
  const [selectedMarket, setSelectedMarket] = useState<string>(() => {
    return sessionStorage.getItem("selected_market") || "Shivamogga APMC";
  });

  const [marketsList, setMarketsList] = useState<string[]>([
    "Shivamogga APMC",
    "Mangaluru APMC",
    "Udupi APMC",
    "Puttur APMC",
    "Sullia APMC",
    "Sirsi APMC",
    "Channagiri APMC",
  ]);

  // Load available APMC markets from backend / CEDA
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const list = await getMarketsList();
        if (list && list.length > 0) {
          setMarketsList(list);
        }
      } catch (err) {
        console.error("Failed to load markets list:", err);
      }
    };
    fetchMarkets();
  }, []);

  // Save selected market in session storage & fetch market data dynamically
  useEffect(() => {
    sessionStorage.setItem("selected_market", selectedMarket);

    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMarketPredictions(selectedMarket);
        setPredictions(data);
      } catch (err) {
        console.error("Error fetching market predictions:", err);
        setError(`Live market data for "${selectedMarket}" is currently unavailable. Please select another APMC market.`);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [selectedMarket]);

  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMarket(e.target.value);
  };

  const renderSparkline = (history: { date: string; price: number }[]) => {
    if (!history || history.length === 0) return null;

    const prices = history.map((h) => h.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const width = 500;
    const height = 150;
    const padding = 15;

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
      <div className="relative mt-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible">
          <defs>
            <linearGradient id="chartGradientMarket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="#f3f4f6" strokeWidth="1.5" />
          <line x1="0" y1={padding} x2={width} y2={padding} stroke="#f3f4f6" strokeWidth="1.5" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />

          {/* Area under curve */}
          <path d={areaD} fill="url(#chartGradientMarket)" />
          {/* Curve path */}
          <path d={pathD} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Critical points */}
          {points.map((p, idx) => {
            const isLast = idx === points.length - 1;
            const isFirst = idx === 0;
            if (isLast || isFirst) {
              return (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#059669" />
                  <circle cx={p.x} cy={p.y} r="10" fill="#34d399" fillOpacity="0.4" className="animate-ping" />
                </g>
              );
            }
            return null;
          })}
        </svg>
        <div className="flex justify-between text-xs text-gray-400 mt-2 px-1 font-medium">
          <span>{history[0].date}</span>
          <span>{history[history.length - 1].date}</span>
        </div>
      </div>
    );
  };

  const getTrendBadge = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "upward":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-200">
            <FaArrowUp /> Upward
          </span>
        );
      case "downward":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-xs px-2.5 py-1 rounded-full font-bold border border-rose-200">
            <FaArrowDown /> Downward
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 text-xs px-2.5 py-1 rounded-full font-bold border border-gray-200">
            <FaMinus /> Stable
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case "high":
        return (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-semibold">
            High
          </span>
        );
      case "medium":
        return (
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold">
            Medium
          </span>
        );
      default:
        return (
          <span className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-full font-semibold">
            Low
          </span>
        );
    }
  };

  const getConfidenceBarColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case "high":
        return "bg-emerald-500";
      case "medium":
        return "bg-amber-500";
      default:
        return "bg-rose-500";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner with APMC Market Selector */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-800 rounded-3xl text-white p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pr-10 pointer-events-none">
          <FaChartLine className="text-[180px]" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            📈 Market Price Forecast Center
          </h1>
          <p className="mt-2 text-emerald-100 text-base sm:text-lg font-medium">
            Leverage historical CEDA Agmarknet data and linear trend algorithms to forecast short, medium, and long-term commodity prices.
          </p>
        </div>

        {/* APMC Market Selector Dropdown */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl shrink-0 w-full md:w-auto shadow-lg">
          <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-emerald-300" /> Select APMC Market
          </label>
          <select
            value={selectedMarket}
            onChange={handleMarketChange}
            className="w-full md:w-64 bg-white text-gray-900 font-bold text-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
          >
            {marketsList.map((m) => (
              <option key={m} value={m} className="text-gray-900 font-medium">
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 text-green-600 gap-4">
          <FaSpinner className="animate-spin text-4xl" />
          <span className="text-lg font-semibold">Calculating price projections for {selectedMarket}...</span>
        </div>
      ) : error ? (
        <div className="text-center py-10 px-6 text-red-700 bg-red-50 rounded-3xl border border-red-200 max-w-2xl mx-auto shadow-sm space-y-4">
          <p className="font-bold text-lg">{error}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Choose APMC Market:</label>
            <select
              value={selectedMarket}
              onChange={handleMarketChange}
              className="bg-white border border-red-300 rounded-xl px-4 py-2 text-sm font-bold text-gray-800 shadow-sm"
            >
              {marketsList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : predictions ? (
        <div className="space-y-8">
          {/* Commodity Tabs Selector */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl max-w-md shadow-inner">
            <button
              onClick={() => setSelectedCommodity("arecanut")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                selectedCommodity === "arecanut"
                  ? "bg-white text-green-800 shadow-md transform scale-[1.02]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
              }`}
            >
              <span className="text-base">🌰</span> Arecanut ({selectedMarket.replace(" APMC", "")})
            </button>
            <button
              onClick={() => setSelectedCommodity("coconut")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                selectedCommodity === "coconut"
                  ? "bg-white text-green-800 shadow-md transform scale-[1.02]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
              }`}
            >
              <span className="text-base">🥥</span> Coconut ({selectedMarket.replace(" APMC", "")})
            </button>
          </div>

          {/* Details & Forecast Grid */}
          {(() => {
            const info: CommodityPredictionInfo = predictions[selectedCommodity];
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Current Live Info Panel */}
                <div className="lg:col-span-5 bg-white rounded-3xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">{info.commodity}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">🏛️ {info.market}</p>
                      </div>
                      <span className="bg-green-50 text-green-800 text-xs px-3 py-1 rounded-full font-bold border border-green-200">
                        Live Data
                      </span>
                    </div>

                    <div className="my-6">
                      <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mb-1">
                        Current Modal Price
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-gray-900">
                          ₹{info.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          / {selectedCommodity === "arecanut" ? "Quintal" : "1000 nuts"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 my-4">
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Daily Range Min</span>
                        <span className="font-extrabold text-gray-800 text-sm">₹{info.min_price.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Daily Range Max</span>
                        <span className="font-extrabold text-gray-800 text-sm">₹{info.max_price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-2">
                        15-Day Price Trajectory
                      </h3>
                      {renderSparkline(info.history)}
                    </div>
                  </div>
                </div>

                {/* AI Forecasts Panel */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-3xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <span>🔮</span> AI Market Predictions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Tomorrow */}
                      {renderForecastCard("Tomorrow", info.predictions.tomorrow, "1 Day Forecast")}

                      {/* Next Week */}
                      {renderForecastCard("Next Week", info.predictions.next_week, "7 Day Forecast")}

                      {/* Next Month */}
                      {renderForecastCard("Next Month", info.predictions.next_month, "30 Day Forecast")}
                    </div>
                  </div>

                  {/* AI Explanation Insight */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 shadow-sm flex gap-4">
                    <div className="text-emerald-700 text-2xl pt-1">
                      <FaInfoCircle />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-base mb-1">
                        AI Prediction Methodology & Insights
                      </h3>
                      <p className="text-sm text-emerald-850 leading-relaxed">
                        Predictions are calculated by evaluating rolling Agmarknet prices for {info.market}. Standard regression models fit a trend slope to historical data points, projecting the commodity price vector into the future. 
                      </p>
                      <p className="text-sm text-emerald-800 leading-relaxed mt-2">
                        <strong>Confidence Rating</strong> is heavily dependent on timeframe and variance. Near-term forecasts (Tomorrow) maintain higher confidence due to tighter daily spreads, whereas longer-term forecasts (Next Month) degrade in confidence because of standard regression compounding error and market volatility.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}
    </div>
  );

  function renderForecastCard(title: string, data: PredictionDetail, subtitle: string) {
    return (
      <div className="bg-white hover:bg-gray-50/40 border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-300 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-extrabold text-gray-900 text-base">{title}</span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">{subtitle}</span>
          </div>
          <p className="text-2xl font-black text-green-700 mt-2">
            ₹{data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Trend:</span>
            {getTrendBadge(data.trend)}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">Confidence:</span>
              {getConfidenceBadge(data.confidence)}
            </div>
            
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getConfidenceBarColor(data.confidence)}`}
                style={{ width: `${data.confidence_percentage}%` }}
              />
            </div>
            <div className="text-[10px] text-right text-gray-400 font-semibold">
              {data.confidence_percentage}%
            </div>
          </div>
        </div>
      </div>
    );
  }
}
