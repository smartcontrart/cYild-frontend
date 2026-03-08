import { Address, erc20Abi } from "viem";
import { useConnection, useReadContract } from "wagmi";
import { ERC20TokenInfo } from "@/utils/constants";

/**
 * Custom hook to get the balance of a single ERC20 token.
 * @param token - The token data object to fetch balance for.
 * @param owner - Optional. The address to check balance for. Defaults to connected wallet.
 * @param refetchInterval - Optional. Interval in milliseconds to refetch the balance.
 * @returns An object containing the balance data, isLoading flag, refetch function, and error.
 */
export const useErc20Balance = ({
  token,
  owner,
  refetchInterval,
}: {
  token: ERC20TokenInfo;
  owner?: Address;
  refetchInterval?: number;
}) => {
  const { address } = useConnection();
  const targetAddress = owner || address;

  const { data, isLoading, refetch, error } = useReadContract({
    address: token.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    chainId: token.chainId,
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: targetAddress !== undefined && token.address !== undefined,
      staleTime: 1000 * 60 * 1, // 1 minute
      refetchInterval: refetchInterval,
    },
  });

  return {
    data: data as bigint | undefined,
    isLoading,
    refetch,
    error,
  } as const;
};
