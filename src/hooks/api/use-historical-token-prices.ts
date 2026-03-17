import { ERC20TokenInfo, getNetworkNameFromChainId } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";

const DEFILLAMA_COINS_API = "https://coins.llama.fi/prices/historical";

const buildCoinsParam = (tokens: ERC20TokenInfo[]): string =>
  tokens
    .map((t) => `${getNetworkNameFromChainId(t.chainId)}:${t.address}`)
    .join(",");

export const useHistoricalTokenPrices = ({
  tokens,
  timestamp,
}: {
  tokens: ERC20TokenInfo[];
  timestamp: number;
}) => {
  const coinsParam = buildCoinsParam(tokens);

  return useQuery({
    queryKey: ["historicalTokenPrices", coinsParam, timestamp],
    queryFn: async (): Promise<Record<string, number>> => {
      const url = `${DEFILLAMA_COINS_API}/${timestamp}/${encodeURIComponent(coinsParam)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `DefiLlama historical prices request failed: ${response.status}`,
        );
      }

      const json = await response.json() as {
        coins: Record<string, { price: number; symbol: string; decimals: number; timestamp: number }>;
      };

      return Object.fromEntries(
        Object.entries(json.coins).map(([coinKey, coinData]) => {
          // coinKey is like "base:0xabc..." — extract just the address part
          const address = coinKey.split(":")[1].toLowerCase();
          return [address, coinData.price];
        }),
      );
    },
    enabled: tokens.length > 0 && timestamp > 0,
  });
};
