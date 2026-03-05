import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import api from "../services/api";

export default function MarketFeed() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#0f172a" },
        textColor: "#cbd5f5",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    let interval;

    const fetchMarket = async () => {
      try {
        const response = await api.get("/market/pair?symbol=EUR/USD");

        if (!response.data?.values) {
          setError("No market data available");
          setLoading(false);
          return;
        }

        const formatted = response.data.values
          .slice()
          .reverse()
          .map((candle) => ({
            time: candle.datetime,
            open: parseFloat(candle.open),
            high: parseFloat(candle.high),
            low: parseFloat(candle.low),
            close: parseFloat(candle.close),
          }));

        candleSeriesRef.current.setData(formatted);

        setLoading(false);
        setError("");
      } catch (err) {
        console.error("Market fetch error:", err);
        setError("Failed to load market data");
        setLoading(false);
      }
    };

    fetchMarket();
    interval = setInterval(fetchMarket, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-green-300">
        Loading market data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] border-b border-white/10 p-4">
      <h2 className="text-green-300 font-semibold mb-4">
        EUR/USD — Live Market Chart
      </h2>

      <div
        ref={chartContainerRef}
        className="w-full h-[300px]"
      />
    </div>
  );
}