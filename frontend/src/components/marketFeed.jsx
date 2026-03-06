import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import api from "../services/api";

export default function MarketFeed() {
  const chartContainerRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const chartRef = useRef(null); 
  const candleSeriesRef = useRef(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /* -------------------------------
     1. Initialize Chart Canvas
  --------------------------------*/
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

    // Store references for the data-fetching effect
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

  /* -------------------------------
     2. Fetch & Map Market Data
  --------------------------------*/
  useEffect(() => {
    let interval;

    const fetchMarket = async () => {
      // Don't fetch if the chart hasn't initialized its series yet
      if (!candleSeriesRef.current) return;

      try {
        // Ensure your backend marketController is active
        const response = await api.get("/market/pair?symbol=EURUSD");

        if (!response.data?.values) {
          setError("No market data available from TwelveData");
          setLoading(false);
          return;
        }

        const formatted = response.data.values
          .slice()
          .reverse()
          .map((candle) => ({
            // CRITICAL: Lightweight Charts needs Unix Seconds (number), 
            // TwelveData sends Date strings.
            time: Math.floor(new Date(candle.datetime).getTime() / 1000),
            open: parseFloat(candle.open),
            high: parseFloat(candle.high),
            low: parseFloat(candle.low),
            close: parseFloat(candle.close),
          }));

        // Push data to the chart
        candleSeriesRef.current.setData(formatted);

        setLoading(false);
        setError("");
      } catch (err) {
        console.error("Market fetch error:", err);
        setError("Failed to connect to market data stream");
        setLoading(false);
      }
    };

    fetchMarket();
    
    // Refresh every 30s (Stay under TwelveData 8 req/min limit)
    interval = setInterval(fetchMarket, 30000);

    return () => clearInterval(interval);
  }, []); 

  /* -------------------------------
     3. Conditional Rendering
  --------------------------------*/
  if (loading) {
    return (
      <div className="p-8 text-center bg-[#0f172a] border-b border-white/10">
        <div className="animate-pulse text-green-400 font-mono text-sm">
          INITIALIZING MARKET STREAM...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-[#0f172a] border-b border-white/10">
        <div className="text-red-400 font-mono text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] border-b border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#80f7c7] font-mono text-xs tracking-widest uppercase">
          Live Feed: EUR/USD (1m)
        </h2>
        <span className="text-[10px] text-white/30 font-mono">
          REFRESHING EVERY 30S
        </span>
      </div>

      <div
        ref={chartContainerRef}
        className="w-full h-[300px] rounded-lg overflow-hidden border border-white/5"
      />
    </div>
  );
}