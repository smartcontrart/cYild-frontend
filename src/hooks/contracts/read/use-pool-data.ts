import { Address } from "viem";
import { useReadContracts } from "wagmi";
import { UniswapV3PoolABI } from "@/abi/UniswapV3Pool";

export const usePoolData = ({
  poolAddress,
  chainId,
  enabled = true,
}: {
  poolAddress?: Address;
  chainId?: number;
  enabled?: boolean;
}) => {
  const { data, isLoading, isError, error, refetch } = useReadContracts({
    contracts: [
      {
        address: poolAddress,
        abi: UniswapV3PoolABI,
        functionName: "token0",
        chainId,
      },
      {
        address: poolAddress,
        abi: UniswapV3PoolABI,
        functionName: "token1",
        chainId,
      },
    ],
    query: {
      enabled: enabled && !!poolAddress && !!chainId,
    },
  });

  const token0 = data?.[0]?.status === "success" ? data[0].result : undefined;
  const token1 = data?.[1]?.status === "success" ? data[1].result : undefined;

  return {
    token0: token0 as Address | undefined,
    token1: token1 as Address | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
};
