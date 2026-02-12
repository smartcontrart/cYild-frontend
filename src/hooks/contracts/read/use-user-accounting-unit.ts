import PositionManagerABI from "@/abi/PositionManager";
import { getManagerContractAddressFromChainId } from "@/utils/constants";
import { Address } from "viem";
import { base } from "viem/chains";
import { useConnection, useReadContract } from "wagmi";
import { useErc20TokenInfo } from "./use-erc20-token-info";

export const useUserAccountingUnit = () => {
  const { address, chainId } = useConnection();

  const {
    data: accountingUnitAddress,
    isLoading: isLoadingAddress,
    error: addressError,
  } = useReadContract({
    abi: PositionManagerABI,
    address: getManagerContractAddressFromChainId(chainId || base.id),
    functionName: "accountingUnit",
    args: [address as Address],
  });

  const {
    tokenInfo,
    isLoading: isLoadingTokenInfo,
    refetch,
    error: tokenInfoError,
  } = useErc20TokenInfo({
    address: (accountingUnitAddress as Address) || ("0x0" as Address),
    chainId: chainId || base.id,
  });

  return {
    accountingUnit: tokenInfo,
    isLoading: isLoadingAddress || isLoadingTokenInfo,
    refetch,
    error: addressError || tokenInfoError,
  } as const;
};
