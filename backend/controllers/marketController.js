const DEFAULT_SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "BTCUSD"];

const parseQuote = (symbol, payload) => {
  const quote = payload?.["Global Quote"];
  if (!quote || !quote["05. price"]) {
    return null;
  }

  return {
    symbol,
    price: Number(quote["05. price"]),
    changePercent: quote["10. change percent"] || "0%",
    updatedAt: quote["07. latest trading day"] || new Date().toISOString(),
  };
};

export const getMarketFeeds = async (req, res) => {
  try {
    const apiKey = process.env.MARKET_API_KEY || process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Market feed API key is missing",
      });
    }

    const symbols = (process.env.MARKET_SYMBOLS || DEFAULT_SYMBOLS.join(","))
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);

    const requests = symbols.map(async (symbol) => {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
        symbol
      )}&apikey=${apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Feed request failed (${response.status})`);
      }

      const payload = await response.json();

      if (payload?.Note || payload?.Information) {
        throw new Error(payload.Note || payload.Information);
      }

      return parseQuote(symbol, payload);
    });

    const settled = await Promise.allSettled(requests);

    const feeds = settled
      .filter((result) => result.status === "fulfilled" && result.value)
      .map((result) => result.value);

    if (!feeds.length) {
      return res.status(502).json({
        message: "Failed to load market feeds from upstream API",
      });
    }

    return res.json({ feeds, source: "Alpha Vantage" });
  } catch (err) {
    console.error("MARKET FEEDS ERROR:", err.message);
    return res.status(500).json({ message: "Failed to load market feeds" });
  }
};