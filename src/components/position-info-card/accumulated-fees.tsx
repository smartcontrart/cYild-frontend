import { PositionInfo } from "@/utils/interfaces/misc";
import { ERC20TokenInfo } from "@/utils/constants";
import LazyLoader from "../ui/lazy-loader";
import { formatUnits, zeroAddress } from "viem";
import { useTokenPrice } from "@/hooks/use-token-price";
import { base } from "viem/chains";
import { LabelWrapper } from "./label-wrapper";
import { cn } from "@/utils/shadcn";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { useRouter } from "next/router";

export const AccumulatedFees = ({
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

  const token0Amount = formatUnits(
    BigInt(position?.totalFeesToken0),
    token0Info?.decimals || 18,
  );

  const token1Amount = formatUnits(
    BigInt(position?.totalFeesToken1),
    token1Info?.decimals || 18,
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
      <span className="text-sm mb-4 text-muted-foreground">
        Accumulated Fees
      </span>
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
          isLabelLoading={token0Info === undefined}
          isValueLoading={isLoadingToken0Price || isNaN(token0Value)}
          // isAmountLoading={isLoadingPositionInfo}
        />
        <LabelWrapper
          label={token1Info?.symbol}
          amount={Number(token1Amount).toFixed(5)}
          value={token1Value.toFixed(2)}
          isLabelLoading={token1Info === undefined}
          isValueLoading={isLoadingToken1Price || isNaN(token1Value)}
          // isAmountLoading={isLoadingPositionInfo}
        />
      </section>
    </section>
  );
};
