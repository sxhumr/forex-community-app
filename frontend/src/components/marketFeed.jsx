import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

export default function MarketFeed() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMarket = useCallback(async () => {
    try {
      const response = await api.get(
        "/market/pair?symbol=EUR/USD"
      );

      setData(response.data);
      setError("");
      setLoading(false);
    } catch (err) {
      console.error("Market fetch error:", err);
      setError("Failed to load market data");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isMounted) return;
      await fetchMarket();
    };

    load();

    const interval = setInterval(() => {
      fetchMarket();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchMarket]);

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

  if (!data || !data.values || !data.values.length) {
    return (
      <div className="p-4 text-yellow-400">
        No market data available
      </div>
    );
  }

  const latest = data.values[0];

  return (
    <div className="bg-[#0f172a] border-b border-white/10 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-green-300 font-semibold">
          EUR/USD — Live Market
        </h2>
        <span className="text-xs text-green-400/70">
          {latest.datetime}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div>
          <p className="text-green-400/60">Open</p>
          <p>{latest.open}</p>
        </div>

        <div>
          <p className="text-green-400/60">High</p>
          <p>{latest.high}</p>
        </div>

        <div>
          <p className="text-green-400/60">Low</p>
          <p>{latest.low}</p>
        </div>

        <div>
          <p className="text-green-400/60">Close</p>
          <p className="text-green-200 font-semibold">
            {latest.close}
          </p>
        </div>

        <div>
          <p className="text-green-400/60">Volume</p>
          <p>{latest.volume}</p>
        </div>
      </div>
    </div>
  );
}