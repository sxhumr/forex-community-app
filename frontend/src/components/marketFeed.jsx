import { useEffect, useState } from "react";
import api from "../services/api";

export default function MarketFeed() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMarket = async () => {
      try {
        const res = await api.get("/market/pair?symbol=EURUSD");

        if (!res.data || res.data.status === "error") {
          throw new Error(res.data?.message || "API error");
        }

        const values = res.data.values || [];

        if (values.length === 0) {
          throw new Error("No data");
        }

        if (isMounted) {
          setData(values.slice(0, 10)); // limit for performance
          setLoading(false);
        }
      } catch (err) {
        console.error("Market error:", err.message);

        if (isMounted) {
          setError("Market unavailable");
          setLoading(false);
        }
      }
    };

    fetchMarket();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-4 text-yellow-400">Loading market...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-400">{error}</div>;
  }

  return (
    <div className="p-4 border-b border-white/10">
      <h2 className="text-green-300 mb-2">EUR/USD</h2>

      {data.map((item, i) => (
        <div key={i} className="text-sm text-green-200">
          {item.datetime} → {item.close}
        </div>
      ))}
    </div>
  );
}