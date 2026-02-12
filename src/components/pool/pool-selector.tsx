import { ERC20TokenInfo } from "@/utils/constants";
import { reArrangeTokensByContractAddress } from "@/utils/functions";

import { useAvailablePools } from "@/hooks/contracts/read/use-available-pools";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { PoolInfo } from "./pool-info";

export default function PoolSelector({ chainId }: { chainId: number }) {
  const { selectedToken0, selectedToken1 } = useNewPositionStore();
  const sortedTokens = reArrangeTokensByContractAddress([
    selectedToken0 as ERC20TokenInfo,
    selectedToken1 as ERC20TokenInfo,
  ]);
  const { data: availablePools, isLoading } = useAvailablePools({
    token0: sortedTokens[0],
    token1: sortedTokens[1],
    chainId,
  });

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && <Skeletons />}
        {(availablePools || []).map((poolInfo) => (
          <PoolInfo
            key={poolInfo.poolAddress}
            poolInfo={poolInfo}
            isLoadingPoolInfo={false}
          />
        ))}
        {(availablePools || []).length === 0 && !isLoading && (
          <>No pools available for this pair. Please choose other tokens.</>
        )}{" "}
      </div>
    </>
  );
}

const Skeletons = () => {
  return [...new Array(4)].map((_, index) => (
    // <Card key={index} className="animate-pulse bg-loader h-32" />
    <PoolInfo key={index} poolInfo={undefined} isLoadingPoolInfo={true} />
  ));
};
