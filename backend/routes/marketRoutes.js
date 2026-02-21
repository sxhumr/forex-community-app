import express from "express";
import axios from "axios";

const router = express.Router();

// Example: EUR/USD 1min data
router.get("/pair/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    const response = await axios.get(
      `https://api.twelvedata.com/time_series`,
      {
        params: {
          symbol,
          interval: "1min",
          outputsize: 50,
          apikey: process.env.FOREX_API_KEY,
        },
      }
    );

    return res.json(response.data);
  } catch (err) {
    console.error("Market API error:", err.message);
    return res.status(500).json({ message: "Market data failed" });
  }
});

export default router;