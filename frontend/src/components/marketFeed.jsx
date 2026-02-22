import { useEffect, useState, useRef } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar
} from "recharts";
import api from "../services/api";

export default function MarketFeed() {
  const [marketState, setMarketState] = useState({
    data: [],
    loading: true,
    error: "",
  });

  const previousCloseRef = useRef(null);

  useEffect(() => {
    let interval;

    const fetchMarket = async () => {
      try {
        const response = await api.get(
          "/market/pair?symbol=EUR/USD"
        );

        if (!response.data?.values?.length) {
          setMarketState({
            data: [],
            loading: false,
            error: "No market data available",
          });
          return;
        }

        const formatted = response.data.values
          .slice()
          .reverse()
          .map((candle) => ({
            time: candle.datetime.slice(11, 16),
            open: parseFloat(candle.open),
            high: parseFloat(candle.high),
            low: parseFloat(candle.low),
            close: parseFloat(candle.close),
          }));

        previousCloseRef.current =
          formatted[formatted.length - 1].close;

        setMarketState({
          data: formatted,
          loading: false,
          error: "",
        });
      } catch (err) {
        console.error("Market fetch error:", err);
        setMarketState({
          data: [],
          loading: false,
          error: "Failed to load market data",
        });
      }
    };

    fetchMarket();
    interval = setInterval(fetchMarket, 30000);

    return () => clearInterval(interval);
  }, []);

  const { data, loading, error } = marketState;

  if (loading) {
    return <div className="p-4 text-green-300">Loading chart...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-400">{error}</div>;
  }

  return (
    <div className="bg-[#0f172a] border-b border-white/10 p-4">
      <h2 className="text-green-300 font-semibold mb-4">
        EUR/USD — Live Candlestick Chart
      </h2>

      <div className="h-64 w-full">
        <ResponsiveContainer>
          <ComposedChart data={data}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis
              domain={["dataMin", "dataMax"]}
              stroke="#9ca3af"
            />
            <Tooltip />

            {data.map((entry, index) => {
              const isUp = entry.close >= entry.open;
              return (
                <Bar
                  key={index}
                  dataKey="close"
                  fill={isUp ? "#22c55e" : "#ef4444"}
                />)
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}