import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { Card } from "../ui/card";
import { PoolInfo } from "@/utils/interfaces";
import { cn } from "@/utils/shadcn";
import { useGraphPoolInfo } from "@/hooks/use-graph-pool-info";
import { formatNumber } from "@/utils/functions";
import LazyLoader from "../ui/lazy-loader";

export const NewPoolInfo = ({ poolInfo }: { poolInfo: PoolInfo }) => {
  const { setSelectedPool, selectedPool } = useNewPositionStore();

  const { monthlyVolume, tvl, isLoading } = useGraphPoolInfo({
    poolAddress: poolInfo.poolAddress,
    token0: poolInfo.token0,
    token1: poolInfo.token1,
  });

  const formattedVolume = formatNumber(monthlyVolume);
  const formattedTvl = formatNumber(tvl);

  const token0 = poolInfo.token0;
  const token1 = poolInfo.token1;

  const poolClicked = () => {
    setSelectedPool(poolInfo);
  };

  const isSelectedPool = selectedPool?.poolAddress === poolInfo.poolAddress;

  return (
    <Card
      className={cn(
        "flex flex-col gap-2 p-5 cursor-pointer hover:bg-accent",
        isSelectedPool && "bg-secondary",
      )}
      onClick={poolClicked}
    >
      <span>
        {token0?.symbol}/{token1?.symbol} ({poolInfo.feeTier / 10000}%)
      </span>
      <div className="flex gap-1">
        TVL:
        <LazyLoader isLoading={isLoading} type="line" className="h-5 min-w-20">
          <span>{formattedTvl}</span>
        </LazyLoader>
      </div>
      <div className="flex gap-1">
        30D Volume:
        <LazyLoader isLoading={isLoading} type="line" className="h-5 min-w-12">
          <span>{formattedVolume}</span>
        </LazyLoader>
      </div>
    </Card>
  );
};
