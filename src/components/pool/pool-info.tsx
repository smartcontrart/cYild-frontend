import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { Card } from "../ui/card";
import { PoolInfo as PoolInfoType } from "@/utils/interfaces";
import { cn } from "@/utils/shadcn";
import { useGraphPoolInfo } from "@/hooks/use-graph-pool-info";
import { formatNumber } from "@/utils/functions";
import LazyLoader from "../ui/lazy-loader";
import { zeroAddress } from "viem";

export const PoolInfo = ({
  poolInfo,
  isLoadingPoolInfo,
}: {
  poolInfo?: PoolInfoType;
  isLoadingPoolInfo?: boolean;
}) => {
  const { setSelectedPool, selectedPool } = useNewPositionStore();

  const {
    monthlyVolume,
    tvl,
    isLoading: isLoadingGraphInfo,
  } = useGraphPoolInfo({
    poolAddress: poolInfo?.poolAddress || zeroAddress,
    token0: poolInfo?.token0,
    token1: poolInfo?.token1,
  });

  const formattedVolume = formatNumber(monthlyVolume);
  const formattedTvl = formatNumber(tvl);

  const token0 = poolInfo?.token0;
  const token1 = poolInfo?.token1;

  const poolClicked = () => {
    setSelectedPool(poolInfo);
  };

  const isSelectedPool = selectedPool?.poolAddress === poolInfo?.poolAddress;
  const isLoading = isLoadingPoolInfo || isLoadingGraphInfo;

  return (
    <Card
      className={cn(
        "flex flex-col gap-2 p-5 cursor-pointer hover:bg-accent h-32 justify-between",
        isSelectedPool &&
          "bg-primary text-primary-foreground hover:bg-primary/80",
      )}
      onClick={poolClicked}
    >
      <LazyLoader
        isLoading={isLoadingPoolInfo}
        className={cn("h-5", isLoadingPoolInfo && "w-20")}
      >
        {token0?.symbol}/{token1?.symbol} ({(poolInfo?.feeTier || 0) / 10000}
        %)
      </LazyLoader>
      <div className="flex gap-1 h-5">
        TVL:
        <LazyLoader isLoading={isLoading} type="line" className="h-5 min-w-20">
          <span>{formattedTvl}</span>
        </LazyLoader>
      </div>
      <div className="flex gap-1 h-5">
        30D Volume:
        <LazyLoader isLoading={isLoading} type="line" className="h-5 min-w-12">
          <span>{formattedVolume}</span>
        </LazyLoader>
      </div>
    </Card>
  );
};
