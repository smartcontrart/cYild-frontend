import { useMemo } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@tanstack/react-query";

import { getClientFromChainId } from "@/utils/apolloClient";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useChainId } from "wagmi";
import { ERC20TokenInfo } from "@/utils/constants";
import { useErc20Balances } from "@/hooks/contracts/read/use-erc20-balances";
import { formatUnits } from "viem";

interface UseGraphPoolInfoParams {
  poolAddress: `0x${string}`;
  token0?: ERC20TokenInfo;
  token1?: ERC20TokenInfo;
}

interface GraphPoolInfoData {
  monthlyVolume: number;
  tvl: number;
  isLoading: boolean;
  error: any;
}

function getOneMonthAgoTimestamp() {
  const oneMonthAgoTimestamp =
    Math.floor(new Date().getTime() / 1000) - 30 * 24 * 60 * 60;
  return oneMonthAgoTimestamp;
}

function getMonthlyVolume(data: any, price0: any, price1: any) {
  if (!data || data.length < 1 || !data.map) return 0;
  if (!price0 || !price1) return 0;

  let totalVolumeUSD = 0;

  data.forEach((elem: any) => {
    if (elem) {
      const { volumeToken0, volumeToken1 } = elem;
      const vol0 = parseFloat(volumeToken0);
      const vol1 = parseFloat(volumeToken1);

      // Calculate USD volume for each token and take the average to avoid double counting
      // since swapping token0 for token1 should only count as one transaction
      const volumeUSD0 = vol0 * parseFloat(price0);
      const volumeUSD1 = vol1 * parseFloat(price1);

      // Use average to avoid double counting the same swaps
      totalVolumeUSD += (volumeUSD0 + volumeUSD1) / 2;
    }
  });

  return totalVolumeUSD;
}

export const useGraphPoolInfo = ({
  poolAddress,
  token0,
  token1,
}: UseGraphPoolInfoParams): GraphPoolInfoData => {
  const chainId = useChainId();

  const tokensReady = !!token0 && !!token1;

  // Fetch token balances from the pool
  const { balances, isLoading: isLoadingBalances } = useErc20Balances({
    tokens: tokensReady ? [token0, token1] : [],
    owner: poolAddress,
  });

  const token0Balance = token0
    ? balances[`${token0.symbol}-${token0.chainId}`]
    : undefined;
  const token1Balance = token1
    ? balances[`${token1.symbol}-${token1.chainId}`]
    : undefined;

  const token0BalanceInPool = useMemo(() => {
    if (!token0Balance || !token0) return 0;
    return Number(formatUnits(token0Balance, token0.decimals));
  }, [token0Balance, token0]);

  const token1BalanceInPool = useMemo(() => {
    if (!token1Balance || !token1) return 0;
    return Number(formatUnits(token1Balance, token1.decimals));
  }, [token1Balance, token1]);

  const timestamp = useMemo(() => getOneMonthAgoTimestamp(), []);

  const GET_DATA = useMemo(
    () => gql`
    {
      poolDayDatas(first: 30, orderBy: date, where: {
        pool: "${poolAddress.toLowerCase()}",
        date_gt: ${timestamp.toString()}
      }) {
        date
        liquidity
        sqrtPrice
        token0Price
        token1Price
        volumeToken0
        volumeToken1
      }
    }
  `,
    [poolAddress, timestamp],
  );

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["poolDayDatas", poolAddress.toLowerCase()],
    queryFn: async () => {
      const client = getClientFromChainId(chainId);
      const result = await client.query({
        query: GET_DATA,
      });
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!poolAddress && tokensReady,
  });

  const { data: token0Price } = useTokenPrice(
    token0?.address || "0x0000000000000000000000000000000000000000",
    token0?.chainId || chainId,
  );
  const { data: token1Price } = useTokenPrice(
    token1?.address || "0x0000000000000000000000000000000000000000",
    token1?.chainId || chainId,
  );

  const monthlyVolume = useMemo(() => {
    if (!data?.poolDayDatas || !token0Price || !token1Price) return 0;
    return getMonthlyVolume(data.poolDayDatas, token0Price, token1Price);
  }, [data?.poolDayDatas, token0Price, token1Price]);

  const tvl = useMemo(() => {
    if (!token0Price || !token1Price) return 0;
    return (
      Number(token0BalanceInPool) * Number(token0Price) +
      Number(token1BalanceInPool) * Number(token1Price)
    );
  }, [token0BalanceInPool, token1BalanceInPool, token0Price, token1Price]);

  return {
    monthlyVolume: tokensReady ? monthlyVolume : 0,
    tvl: tokensReady ? tvl : 0,
    isLoading: tokensReady ? loading || isLoadingBalances : true,
    error,
  };
};
