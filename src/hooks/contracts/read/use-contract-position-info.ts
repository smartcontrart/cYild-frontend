import { useMemo } from "react";
import { useReadContract } from "wagmi";
import PositionManagerABI from "@/abi/PositionManager";
import { getManagerContractAddressFromChainId } from "@/utils/constants";
import { GetPositionInfoReturnType } from "@/utils/interfaces/misc";

export const useContractPositionInfo = ({
  positionTokenId,
  positionChainId,
  burnedTokenIds,
}: {
  positionTokenId?: number;
  positionChainId: number;
  burnedTokenIds?: number[];
}) => {
  let id = undefined;
  if (positionTokenId) {
    id = BigInt(positionTokenId);
  } else if (!positionTokenId && burnedTokenIds && burnedTokenIds.length > 0) {
    id = BigInt(burnedTokenIds[0]);
  }

  const result = useReadContract({
    abi: PositionManagerABI,
    address: getManagerContractAddressFromChainId(positionChainId),
    functionName: "getPositionInfo",
    args: id ? [id] : undefined,
    query: {
      enabled: positionTokenId !== undefined,
    },
    chainId: positionChainId,
  });

  const structuredData = useMemo(() => {
    if (!result.data) return undefined;

    const [
      token0,
      token1,
      token0Decimals,
      token1Decimals,
      feesEarned0,
      feesEarned1,
      protocolFee0,
      protocolFee1,
      principal0,
      principal1,
      ownerAccountingUnit,
      ownerAccountingUnitDecimals,
    ] = result.data as readonly [
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

    return {
      token0,
      token1,
      token0Decimals,
      token1Decimals,
      feesEarned0,
      feesEarned1,
      protocolFee0,
      protocolFee1,
      principal0,
      principal1,
      ownerAccountingUnit,
      ownerAccountingUnitDecimals,
    } as GetPositionInfoReturnType;
  }, [result.data]);

  return {
    ...result,
    data: structuredData,
  };
};
