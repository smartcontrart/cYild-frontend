import PositionManagerABI from "@/abi/PositionManager";
import { useQueryClient } from "@tanstack/react-query";
import {
  getDefaultTokensFromChainId,
  getManagerContractAddressFromChainId,
} from "@/utils/constants";
import { Address } from "viem";
import { DEFAULT_CHAIN_ID } from "@/utils/robinhood-chain";
import { useConnection, useReadContract } from "wagmi";
import { useErc20TokenInfo } from "./use-erc20-token-info";

export const useUserAccountingUnit = () => {
  const { address, chainId } = useConnection();

  const queryClient = useQueryClient();

  const {
    data: accountingUnitAddress,
    isLoading: isLoadingAddress,
    error: addressError,
    refetch: refetchAddress,
    queryKey: addressQueryKey,
  } = useReadContract({
    abi: PositionManagerABI,
    address: getManagerContractAddressFromChainId(chainId || DEFAULT_CHAIN_ID),
    functionName: "accountingUnit",
    args: [address as Address],
  });

  const {
    tokenInfo,
    isLoading: isLoadingTokenInfo,
    refetch: refetchTokenInfo,
    error: tokenInfoError,
  } = useErc20TokenInfo({
    address: (accountingUnitAddress as Address) || ("0x0" as Address),
    chainId: chainId || DEFAULT_CHAIN_ID,
  });

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: addressQueryKey });
    await refetchAddress();
    // Invalidate all readContracts queries to ensure token info for the new address is fetched
    await queryClient.invalidateQueries({ queryKey: ["readContracts"] });
  };

  const constantsTokenData = accountingUnitAddress
    ? getDefaultTokensFromChainId(chainId || DEFAULT_CHAIN_ID).find(
        (t) =>
          t.address.toLowerCase() ===
          (accountingUnitAddress as string).toLowerCase(),
      )
    : undefined;

  const accountingUnit = tokenInfo
    ? { ...constantsTokenData, ...tokenInfo }
    : undefined;

  return {
    accountingUnit,
    isLoading: isLoadingAddress || isLoadingTokenInfo,
    refetch,
    error: addressError || tokenInfoError,
  } as const;
};
