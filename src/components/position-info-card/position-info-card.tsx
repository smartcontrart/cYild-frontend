import { Card, CardContent } from "../ui/card";
import { PositionInfo } from "@/utils/interfaces/misc";
import Link from "next/link";
import { useBatchFetchErc20Info } from "@/hooks/contracts/read/use-batch-fetch-erc20-info";
import { useEffect, useState } from "react";
import { ERC20TokenInfo } from "@/utils/constants";
import { PositionValue } from "./position-value";
import { FeesEarned } from "./fees-earned";
import { RangeIndicator } from "./range-indicator";
import { base } from "viem/chains";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { useFeeTier } from "@/hooks/contracts/read/use-fee-tier";
import { usePoolData } from "@/hooks/contracts/read/use-pool-data";
import { InitialCapital } from "./initial-capital";
import { AccumulatedFees } from "./accumulated-fees";
import { PositionHeader } from "../position-detail/position-header";

export const PositionInfoCard = ({ position }: { position: PositionInfo }) => {
  const { data, error } = useContractPositionInfo({
    positionChainId: position.chainId || base.id,
    positionTokenId: position.activeTokenId,
    burnedTokenIds: position.burnedTokenIds,
  });
  const { token0: contractToken0, token1: contractToken1 } = usePoolData({
    poolAddress: position.poolAddress,
    chainId: position.chainId,
    enabled: position.status !== "closed ",
  });
  const { fetchBatch } = useBatchFetchErc20Info();
  const [token0Info, setToken0Info] = useState<ERC20TokenInfo | undefined>();
  const [token1Info, setToken1Info] = useState<ERC20TokenInfo | undefined>();

  useEffect(() => {
    const fetchTokens = async () => {
      let result = undefined;
      let token0;
      let token1;

      if (position.status === "closed") {
        if (!contractToken0 || !contractToken1) return;
        result = await fetchBatch(
          [contractToken0, contractToken1],
          position.chainId,
        );
        token0 = contractToken0;
        token1 = contractToken1;
      } else {
        if (!data?.token0 || !data?.token1) return;
        result = await fetchBatch([data.token0, data.token1], position.chainId);
        token0 = data.token0;
        token1 = data.token1;
      }

      if (result.success.length > 0) {
        const foundToken0 = result.success.find(
          (t) => t.address.toLowerCase() === token0.toLowerCase(),
        );
        const foundToken1 = result.success.find(
          (t) => t.address.toLowerCase() === token1.toLowerCase(),
        );

        if (foundToken0) setToken0Info(foundToken0);
        if (foundToken1) setToken1Info(foundToken1);
      }
    };

    fetchTokens();
  }, [
    data,
    position.chainId,
    fetchBatch,
    position.status,
    contractToken0,
    contractToken1,
  ]);

  return (
    <Card>
      <Link href={`/positions/${position.positionId}`}>
        <CardContent className="cursor-pointer w-full">
          <PositionHeader
            className="mt-3.5"
            position={position}
            token0Info={token0Info}
            token1Info={token1Info}
          />
          <div className="w-full h-px bg-border my-3" />
          <section className="flex gap-5 w-full md:flex-row flex-col">
            {position.status !== "closed" && (
              <>
                <PositionValue
                  position={position}
                  token0Info={token0Info}
                  token1Info={token1Info}
                  className="w-full md:w-1/2 bg-secondary"
                />
                <FeesEarned
                  position={position}
                  token0Info={token0Info}
                  token1Info={token1Info}
                  className="w-full md:w-1/2 bg-secondary"
                />
              </>
            )}
            {position.status === "closed" && (
              <>
                <InitialCapital
                  position={position}
                  token0Info={token0Info}
                  token1Info={token1Info}
                  className="w-full md:w-1/2 bg-secondary"
                />
                <AccumulatedFees
                  position={position}
                  token0Info={token0Info}
                  token1Info={token1Info}
                  className="w-full md:w-1/2 bg-secondary"
                />
              </>
            )}
          </section>
          <RangeIndicator
            position={position}
            token0Info={token0Info}
            token1Info={token1Info}
          />
        </CardContent>
      </Link>
    </Card>
  );
};
