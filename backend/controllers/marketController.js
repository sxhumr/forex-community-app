import axios from "axios";
import NodeCache from "node-cache";

// Cache for 15 seconds. If a request comes in, serve the cached version.
const marketCache = new NodeCache({ stdTTL: 15 });

export const getMarketData = async (req, res) => {
  try {
    const { symbol = "EURUSD" } = req.query;
    const sanitizedSymbol = symbol.toUpperCase(); // Prevent weird query injection

    // 1. Check cache first
    const cachedData = marketCache.get(sanitizedSymbol);
    if (cachedData) {
      return res.json(cachedData);
    }

    const apiKey = process.env.TWELVE_DATA_API_KEY;

    // 2. Fetch if not in cache
    const response = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${sanitizedSymbol}&interval=1min&outputsize=20&apikey=${apiKey}`
    );

    if (response.data.status === "error") {
      return res.status(400).json({ message: response.data.message });
    }

    // 3. Optional: Simplify the payload before saving to cache
    // Only return the values the chart/dashboard actually needs
    const simplifiedData = {
      symbol: response.data.meta.symbol,
      values: response.data.values.map(point => ({
        time: point.datetime,
        price: parseFloat(point.close).toFixed(5)
      }))
    };

    // 4. Save to cache
    marketCache.set(sanitizedSymbol, simplifiedData);

    res.json(simplifiedData);
  } catch (error) {
    console.error("TwelveData Fetch Error:", error.message);
    res.status(500).json({ message: "Market data provider currently unavailable" });
  }
};