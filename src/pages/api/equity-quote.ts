import type { NextApiRequest, NextApiResponse } from "next";

type Quote = {
  ticker: string;
  price: number | null;
  changePercent: number | null;
  currency: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Quote | { error: string }>,
) {
  const ticker = String(req.query.ticker || "").toUpperCase();
  if (!ticker) {
    return res.status(400).json({ error: "ticker required" });
  }

  if (ticker === "SPCX") {
    return res.status(200).json({
      ticker,
      price: null,
      changePercent: null,
      currency: "USD",
    });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      ticker,
    )}?interval=1d&range=5d`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 Yild" },
    });
    const json = await response.json();
    const meta = json?.chart?.result?.[0]?.meta;
    const price = typeof meta?.regularMarketPrice === "number"
      ? meta.regularMarketPrice
      : null;
    const prev = meta?.chartPreviousClose ?? meta?.previousClose;
    const changePercent =
      price !== null && typeof prev === "number" && prev !== 0
        ? ((price - prev) / prev) * 100
        : null;

    return res.status(200).json({
      ticker,
      price,
      changePercent,
      currency: meta?.currency ?? "USD",
    });
  } catch {
    return res.status(200).json({
      ticker,
      price: null,
      changePercent: null,
      currency: "USD",
    });
  }
}
