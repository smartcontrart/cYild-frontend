import { Address, erc20Abi } from "viem";
import { useConnection, useReadContracts } from "wagmi";
import { ERC20TokenInfo } from "@/utils/constants";

/**
 * Custom hook to get the balances of multiple tokens using multicall.
 * @param tokens - Array of token data objects to fetch balances for.
 * @param owner - Optional. The address to check balances for. Defaults to connected wallet.
 * @returns An object containing the balances data, isLoading flag, refetch function, and error.
 */
export const useErc20Balances = ({
  tokens,
  owner,
  refetchInterval,
}: {
  tokens: ERC20TokenInfo[];
  owner?: Address;
  refetchInterval?: number;
}) => {
  const { address } = useConnection();
  const targetAddress = owner || address;

  // Construct multicall for all token balances
  const calls = tokens.map((token) => ({
    address: token.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    chainId: token.chainId,
    args: [targetAddress],
  }));

  const { data, isLoading, refetch, error } = useReadContracts({
    contracts: calls,
    query: {
      enabled: targetAddress !== undefined && tokens.length > 0,
      staleTime: 1000 * 60 * 1, // 5 minutes
      refetchInterval: refetchInterval,
    },
  });

  // Process the results and map them back to tokens
  const balances: Record<string, bigint | undefined> = {};

  if (data && tokens) {
    data.forEach((result, index) => {
      const token = tokens[index];
      const key = `${token.symbol}-${token.chainId}`;

      if (result.status === "success" && result.result !== undefined) {
        balances[key] = result.result as bigint;
      } else {
        balances[key] = undefined;
      }
    });
  }

  return {
    balances,
    isLoading,
    refetch,
    error,
  } as const;
};
