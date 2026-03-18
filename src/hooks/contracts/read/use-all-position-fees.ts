import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import PositionManagerABI from "@/abi/PositionManager";
import { getManagerContractAddressFromChainId } from "@/utils/constants";
import { PositionInfo } from "@/utils/interfaces/misc";

export const useAllPositionFees = ({ position }: { position?: PositionInfo }) => {
  const chainId = position?.chainId;
  const contractAddress = chainId
    ? getManagerContractAddressFromChainId(chainId)
    : undefined;

  const allTokenIds = useMemo(() => {
    if (!position) return [];
    const ids: number[] = [];
    if (position.activeTokenId) ids.push(position.activeTokenId);
    for (const id of position.burnedTokenIds ?? []) {
      ids.push(id);
    }
    return ids;
  }, [position]);

  const calls = useMemo(
    () =>
      allTokenIds.map((id) => ({
        address: contractAddress as `0x${string}`,
        abi: PositionManagerABI,
        functionName: "getPositionInfo" as const,
        args: [BigInt(id)] as const,
        chainId,
      })),
    [allTokenIds, contractAddress, chainId],
  );

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: calls,
    query: {
      enabled: allTokenIds.length > 0 && !!contractAddress,
    },
  });

  const combinedFees = useMemo(() => {
    if (!data || data.length === 0) return undefined;

    let feesEarned0 = BigInt(0);
    let feesEarned1 = BigInt(0);

    for (const result of data) {
      if (result.status !== "success" || !result.result) continue;

      const [, , , , resultFees0, resultFees1] = result.result as readonly [
        `0x${string}`,
        `0x${string}`,
        number,
        number,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        `0x${string}`,
        number,
      ];

      feesEarned0 += resultFees0;
      feesEarned1 += resultFees1;
    }

    return { feesEarned0, feesEarned1 };
  }, [data]);

  return {
    data: combinedFees,
    isLoading,
    error,
    refetch,
  };
};
