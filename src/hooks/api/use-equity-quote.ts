import { useQuery } from "@tanstack/react-query";

export type EquityQuote = {
  ticker: string;
  price: number | null;
  changePercent: number | null;
  currency: string;
};

export const useEquityQuote = (ticker: string | null) => {
  return useQuery<EquityQuote>({
    queryKey: ["equity-quote", ticker],
    queryFn: async () => {
      const response = await fetch(`/api/equity-quote?ticker=${ticker}`);
      return response.json();
    },
    enabled: Boolean(ticker),
    refetchInterval: 30000,
  });
};
