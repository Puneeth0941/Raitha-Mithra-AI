import { useState, useEffect } from "react";
import { FaFileAlt, FaMoneyBillWave, FaWallet, FaChartPie, FaSpinner, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { getOverallReport } from "../../services/reportService";
import type { OverallReport } from "../../services/reportService";

// Helper component for smooth count-up number animation
function AnimatedNumber({ value, prefix = "₹", duration = 800 }: { value: number; prefix?: string; duration?: number }) {
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad formula for natural acceleration and deceleration
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      setCurrent(Math.floor(easedProgress * (endValue - startValue) + startValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {current.toLocaleString()}
    </span>
  );
}

export default function ReportPage() {
  const [report, setReport] = useState<OverallReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await getOverallReport();
        setReport(data);
      } catch (err) {
        console.error("Error fetching overall report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-green-600 gap-3">
        <FaSpinner className="animate-spin text-3xl" />
        <span className="text-lg font-semibold">Generating Financial Reports...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-800 to-emerald-600 rounded-3xl text-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <FaFileAlt /> Farm Financial Intelligence & Reports
        </h1>
        <p className="text-green-100 mt-1">Annual net earnings, expense structure, and crop-wise profitability analytics</p>
      </div>

      {report && (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Annual Income</p>
                <h2 className="text-3xl font-black text-emerald-600 mt-2">
                  <AnimatedNumber value={report.total_income} />
                </h2>
              </div>
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 hover:scale-110">
                <FaMoneyBillWave />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Annual Expenses</p>
                <h2 className="text-3xl font-black text-rose-600 mt-2">
                  <AnimatedNumber value={report.total_expense} />
                </h2>
              </div>
              <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 hover:scale-110">
                <FaWallet />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Annual Net Profit</p>
                <h2 className={`text-3xl font-black mt-2 ${report.annual_profit >= 0 ? "text-green-700" : "text-rose-600"}`}>
                  <AnimatedNumber value={report.annual_profit} />
                </h2>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 hover:scale-110 ${
                report.annual_profit >= 0 ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
              }`}>
                {report.annual_profit >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              </div>
            </div>
          </div>

          {/* Crop-wise Profit Breakdown */}
          <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaChartPie className="text-green-600" /> Crop-wise Profit Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {report.crop_wise_profit.map((cropItem) => {
                const totalProf = report.crop_wise_profit.reduce((acc, c) => acc + Math.max(c.profit, 0), 0) || 1;
                const pct = Math.round((Math.max(cropItem.profit, 0) / totalProf) * 100);
                return (
                  <div key={cropItem.crop} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-gray-900 text-base">{cropItem.crop}</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {pct}% Share
                      </span>
                    </div>

                    <p className="text-2xl font-black text-green-700">
                      <AnimatedNumber value={cropItem.profit} />
                    </p>

                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-green-600 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
