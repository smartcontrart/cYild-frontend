import { useMemo } from "react";

import {
  ERC20TokenInfo,
  getUniswapV3FactoryContractAddressFromChainId,
  POOL_DATA_FETCH_INTERVAL,
  VALID_FEE_TIERS,
} from "@/utils/constants";
import { Address } from "viem";
import { useReadContracts } from "wagmi";
import { PoolInfo } from "@/utils/interfaces/misc";
import { reArrangeTokensByContractAddress } from "@/utils/functions";

const abi = [
  {
    inputs: [
      { internalType: "address", name: "tokenA", type: "address" },
      { internalType: "address", name: "tokenB", type: "address" },
      { internalType: "uint24", name: "fee", type: "uint24" },
    ],
    name: "getPool",
    outputs: [{ internalType: "address", name: "pool", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const useAvailablePools = ({
  token0,
  token1,
  chainId,
}: {
  token0: ERC20TokenInfo | undefined;
  token1: ERC20TokenInfo | undefined;
  chainId: number;
}) => {
  const calls =
    token0 && token1
      ? VALID_FEE_TIERS.map((feeTier) => ({
          address: getUniswapV3FactoryContractAddressFromChainId(chainId),
          abi: abi,
          functionName: "getPool",
          chainId: chainId,
          args: [token0.address, token1.address, feeTier],
        }))
      : [];

  const {
    data: rawData,
    isLoading,
    error,
    refetch,
    ...rest
  } = useReadContracts({
    contracts: calls,
    query: {
      enabled: !!token0 && !!token1,
    },
  });

  const data = useMemo<PoolInfo[]>(() => {
    if (!rawData) return [];

    return rawData
      .map((result, index) => {
        const poolAddress = result.result as Address | undefined;
        if (
          !poolAddress ||
          poolAddress === "0x0000000000000000000000000000000000000000"
        ) {
          return null;
        }
        const tokens = reArrangeTokensByContractAddress([
          token0 as ERC20TokenInfo,
          token1 as ERC20TokenInfo,
        ]);
        return {
          token0: tokens[0],
          token1: tokens[1],
          poolAddress,
          feeTier: VALID_FEE_TIERS[index],
        };
      })
      .filter((pool): pool is PoolInfo => pool !== null);
  }, [rawData, token0, token1]);

  return {
    data,
    isLoading,
    error,
    refetch,
    ...rest,
  };
};
