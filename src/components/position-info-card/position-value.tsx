import { PositionInfo } from "@/utils/interfaces/misc";
import { ERC20TokenInfo } from "@/utils/constants";
import LazyLoader from "../ui/lazy-loader";
import { formatUnits, zeroAddress } from "viem";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useConnection } from "wagmi";
import { base } from "viem/chains";
import { LabelWrapper } from "./label-wrapper";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { cn } from "@/utils/shadcn";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { useRouter } from "next/router";

export const PositionValue = ({
  position,
  token0Info,
  token1Info,
  className,
}: {
  position: PositionInfo;
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  className?: string;
}) => {
  const router = useRouter();
  const { id: positionId } = router.query;

  const { data: positionDetails } = useApiPositionInfo({
    positionId: positionId as string,
  });

  const { data: positionInfo, isLoading: isLoadingPositionInfo } =
    useContractPositionInfo({
      positionChainId: positionDetails?.chainId || base.id,
      positionTokenId: position?.activeTokenId,
    });

  const token0Amount = formatUnits(
    positionInfo?.principal0 || BigInt(0),
    positionInfo?.token0Decimals || 18,
  );

  const token1Amount = formatUnits(
    positionInfo?.principal1 || BigInt(0),
    positionInfo?.token1Decimals || 18,
  );

  const { data: token0Price, isLoading: isLoadingToken0Price } = useTokenPrice(
    token0Info?.address || zeroAddress,
    positionDetails?.chainId || base.id,
  );
  const { data: token1Price, isLoading: isLoadingToken1Price } = useTokenPrice(
    token1Info?.address || zeroAddress,
    positionDetails?.chainId || base.id,
  );

  const token0Value = Number(token0Amount) * Number(token0Price);
  const token1Value = Number(token1Amount) * Number(token1Price);
  const positionValue = token0Value + token1Value;

  return (
    <section className={cn("rounded-lg p-5 flex flex-col", className)}>
      <span className="text-sm mb-4 text-muted-foreground">Position Value</span>
      <LazyLoader
        isLoading={
          isLoadingToken0Price || isLoadingToken1Price || isNaN(positionValue)
        }
        className="h-5 w-20 text-xl font-semibold mb-5"
      >
        ${positionValue.toFixed(2)}
      </LazyLoader>
      <section className="flex flex-col gap-2">
        <LabelWrapper
          label={token0Info?.symbol}
          amount={Number(token0Amount).toFixed(5)}
          value={token0Value.toFixed(2)}
          isLabelLoading={token0Info === undefined || isLoadingPositionInfo}
          isValueLoading={
            isLoadingToken0Price || isLoadingPositionInfo || isNaN(token0Value)
          }
          isAmountLoading={isLoadingPositionInfo}
        />
        <LabelWrapper
          label={token1Info?.symbol}
          amount={Number(token1Amount).toFixed(5)}
          value={token1Value.toFixed(2)}
          isLabelLoading={token1Info === undefined || isLoadingPositionInfo}
          isValueLoading={
            isLoadingToken1Price || isLoadingPositionInfo || isNaN(token1Value)
          }
          isAmountLoading={isLoadingPositionInfo}
        />
      </section>
    </section>
  );
};
