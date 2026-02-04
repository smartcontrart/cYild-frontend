import { Address, erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { ERC20TokenInfo } from "@/utils/constants";

export const useErc20Allowance = (params: {
  token?: ERC20TokenInfo;
  owner?: Address;
  spender?: Address;
  enabled?: boolean;
}) => {
  const { owner, token, spender } = params;
  const queryClient = useQueryClient();
  const enabled =
    owner !== undefined && token !== undefined && spender !== undefined;
  const chainId = token?.chainId;

  // Call the allowance contract function
  const erc20Result = useReadContract({
    abi: erc20Abi,
    address: token?.address,
    functionName: "allowance",
    chainId: chainId,
    args: [owner!, spender!],
    query: {
      enabled: enabled,
      staleTime: 0, // Always consider data stale
      gcTime: 0, // Don't keep in cache
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      // Force fresh data every time
      // refetchOnReconnect: true,
    },
  });

  const invalidateCache = useCallback(async () => {
    if (token?.address && owner && spender) {
      await queryClient.invalidateQueries({
        queryKey: [
          "readContract",
          {
            address: token.address,
            functionName: "allowance",
            args: [owner, spender],
            chainId: chainId,
          },
        ],
      });
      // Also remove from cache entirely
      queryClient.removeQueries({
        queryKey: [
          "readContract",
          {
            address: token.address,
            functionName: "allowance",
            args: [owner, spender],
            chainId: chainId,
          },
        ],
      });
    }
  }, [token?.address, owner, spender, chainId, queryClient]);

  const forceRefetch = useCallback(async () => {
    await invalidateCache();
    return await erc20Result.refetch();
  }, [invalidateCache, erc20Result]);

  return {
    data: erc20Result.data || BigInt(0),
    error: erc20Result.error,
    isLoading: erc20Result.isLoading,
    refetch: forceRefetch,
    // refetch: erc20Result.refetch,
    invalidateCache,
  };
};
