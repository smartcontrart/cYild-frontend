import PositionManager from "@/abi/PositionManager";
import { UniswapV3PoolABI } from "@/abi/UniswapV3Pool";
import { Address } from "viem";
import { useReadContract } from "wagmi";

export const useFeeTier = ({
  poolAddress,
  chainId,
}: {
  poolAddress: Address | undefined;
  chainId?: number;
}) => {
  const { data, isLoading, error, refetch, ...rest } = useReadContract({
    address: poolAddress,
    abi: UniswapV3PoolABI,
    functionName: "fee",
    chainId: chainId,
    query: {
      enabled:
        !!poolAddress &&
        poolAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  return {
    data: data as number | undefined,
    isLoading,
    error,
    refetch,
    ...rest,
  };
};
