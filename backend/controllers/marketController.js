import axios from "axios";

export const getMarketData = async (req, res) => {
  try {
    const { symbol = "EURUSD" } = req.query;
    const apiKey = process.env.TWELVE_DATA_API_KEY;


    const response = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&outputsize=50&apikey=${apiKey}`
    );

    if (response.data.status === "error") {
      return res.status(400).json({ message: response.data.message });
    }

    // We send the whole object back to the frontend
    res.json(response.data);
  } catch (error) {
    console.error("TwelveData Fetch Error:", error.message);
    res.status(500).json({ message: "Internal Server Error fetching market data" });
  }
};