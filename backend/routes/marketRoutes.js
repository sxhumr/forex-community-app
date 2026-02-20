// routes/marketRoutes.js
import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/forex/:pair", async (req, res) => {
  try {
    const { pair } = req.params;

    const response = await axios.get(
      `https://api.twelvedata.com/time_series`,
      {
        params: {
          symbol: pair,
          interval: "1min",
          apikey: process.env.FOREX_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

export default router;
