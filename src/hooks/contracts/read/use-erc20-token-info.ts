import { Address, erc20Abi } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useReadContracts } from "wagmi";
import { ERC20TokenInfo } from "@/utils/constants";

/**
 * Custom hook to get the name, symbol, and decimals of a token using multicall.
 * @param address - The token contract address.
 * @param chainId - The chain ID where the token is deployed.
 * @returns An object containing the token info data, isLoading flag, refetch function, and error.
 */
export const useErc20TokenInfo = ({
  address,
  chainId,
}: {
  address: Address;
  chainId: number;
}) => {
  // Construct multicall for name, symbol, and decimals
  const calls = [
    {
      address: address,
      abi: erc20Abi,
      functionName: "name",
      chainId: chainId,
    },
    {
      address: address,
      abi: erc20Abi,
      functionName: "symbol",
      chainId: chainId,
    },
    {
      address: address,
      abi: erc20Abi,
      functionName: "decimals",
      chainId: chainId,
    },
  ] as const;

  const queryClient = useQueryClient();

  const { data, isLoading, refetch, error, queryKey } = useReadContracts({
    contracts: calls,
    query: {
      enabled: address !== undefined && chainId !== undefined,
      staleTime: Infinity,
    },
  });

  // Process the results
  let tokenInfo: Partial<ERC20TokenInfo> | undefined = undefined;

  if (data) {
    const [nameResult, symbolResult, decimalsResult] = data;

    if (
      nameResult.status === "success" &&
      symbolResult.status === "success" &&
      decimalsResult.status === "success"
    ) {
      tokenInfo = {
        name: nameResult.result as string,
        symbol: symbolResult.result as string,
        decimals: decimalsResult.result as number,
        address: address,
        chainId: chainId,
      };
    }
  }

  const invalidateAndRefetch = async () => {
    await queryClient.invalidateQueries({ queryKey });
    await refetch();
  };

  return {
    tokenInfo,
    isLoading,
    refetch: invalidateAndRefetch,
    error,
  } as const;
};
