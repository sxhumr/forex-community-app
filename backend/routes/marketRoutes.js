import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/pair", async (req, res) => {
  try {
    const { symbol = "EUR/USD" } = req.query;

    const response = await axios.get(
      "https://api.twelvedata.com/time_series",
      {
        params: {
          symbol,
          interval: "1min",
          outputsize: 50,
          apikey: process.env.FOREX_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Market API error:", err.message);
    res.status(500).json({ message: "Market data failed" });
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "Market route working" });
});

export default router;