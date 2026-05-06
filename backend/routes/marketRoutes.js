import express from "express";
import axios from "axios";
import nodeCache from "node-cache"; // You'll need to run: npm install node-cache

const router = express.Router();
// Cache data for 15 seconds to stay within API limits and boost speed
const marketCache = new nodeCache({ stdTTL: 15 }); 

router.get("/pair", async (req, res) => {
  try {
    const symbol = (req.query.symbol || "EURUSD").toUpperCase();
    
    // 1. Check if we have this price in our "memory" already
    const cachedData = marketCache.get(symbol);
    if (cachedData) {
      return res.json(cachedData);
    }

    console.log(`🌐 Fetching FRESH data from TwelveData for: ${symbol}`);

    const response = await axios.get(
      "https://api.twelvedata.com/time_series",
      {
        params: {
          symbol: symbol,
          interval: "1min",
          outputsize: 20,
          apikey: process.env.FOREX_API_KEY,
        },
      }
    );

    if (!response.data || response.data.status === "error") {
      // If we have an old version in cache, serve it anyway rather than an error
      if (cachedData) return res.json(cachedData); 
      
      return res.status(400).json({ message: "Market provider error" });
    }

    // 2. Save to cache before sending to user
    marketCache.set(symbol, response.data);

    res.json(response.data);
  } catch (err) {
    console.error("❌ Market API error:", err.message);
    res.status(500).json({ message: "Market data failed" });
  }
});

export default router;