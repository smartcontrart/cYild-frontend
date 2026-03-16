import { ERC20TokenInfo } from "@/utils/constants";
import { reArrangeTokensByContractAddress } from "@/utils/functions";

import { useAvailablePools } from "@/hooks/contracts/read/use-available-pools";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { PoolInfo } from "./pool-info";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default function PoolSelector({ chainId }: { chainId: number }) {
  const { selectedToken0, selectedToken1 } = useNewPositionStore();
  const sortedTokens = reArrangeTokensByContractAddress(
    !selectedToken0 || !selectedToken1
      ? []
      : [selectedToken0 as ERC20TokenInfo, selectedToken1 as ERC20TokenInfo],
  );
  const { data: availablePools, isLoading } = useAvailablePools({
    token0: sortedTokens[0],
    token1: sortedTokens[1],
    chainId,
  });

  return (
    <Card className="shadow-none w-full md:w-1/3 min-h-96">
      <CardHeader>
        <CardTitle>Select a Pool</CardTitle>
        <CardDescription>Choose a pool from the list below</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading && <Skeletons />}
        {(availablePools || []).map((poolInfo) => (
          <PoolInfo
            key={poolInfo.poolAddress}
            poolInfo={poolInfo}
            isLoadingPoolInfo={false}
          />
        ))}
        {selectedToken1 === undefined ? (
          <div className="w-full h-56 flex items-center justify-center">
            <span>Select tokens to continue</span>
          </div>
        ) : (
          <>
            {(availablePools || []).length === 0 && !isLoading && (
              <div className="w-full h-56 flex items-center justify-center text-center">
                <span>
                  No pools available for this pair. Please choose other tokens.
                </span>
              </div>
            )}{" "}
          </>
        )}
      </CardContent>
    </Card>
  );
}

const Skeletons = () => {
  return [...new Array(4)].map((_, index) => (
    // <Card key={index} className="animate-pulse bg-loader h-32" />
    <PoolInfo key={index} poolInfo={undefined} isLoadingPoolInfo={true} />
  ));
};
