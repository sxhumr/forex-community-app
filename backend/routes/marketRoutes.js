import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/pair", async (req, res) => {
  try {
    const symbol = req.query.symbol || "EURUSD";

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
      console.log("❌ TwelveData error:", response.data);
      return res.status(400).json({
        message: "Market provider error",
      });
    }

    res.json(response.data);
  } catch (err) {
    console.error("❌ Market API error:", err.message);
    res.status(500).json({ message: "Market data failed" });
  }
});

export default router;