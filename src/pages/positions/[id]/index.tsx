"use client";

import { useRouter } from "next/router";
import { PositionInfo as PositionInfoInterface } from "@/utils/interfaces/misc";
import { ERC20TokenInfo } from "@/utils/constants";
import { useBatchFetchErc20Info } from "@/hooks/contracts/read/use-batch-fetch-erc20-info";
import { useEffect, useState } from "react";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { FeesEarned } from "@/components/position-info-card/fees-earned";
import { PositionValue } from "@/components/position-info-card/position-value";
import { Card, CardContent } from "@/components/ui/card";
import { PositionRangeDisplay } from "@/components/position-detail/position-range-display";
import { PositionInfo } from "@/components/position-detail/position-info";
import { usePoolData } from "@/hooks/contracts/read/use-pool-data";
import { InitialCapital } from "@/components/position-info-card/initial-capital";
import { AccumulatedFees } from "@/components/position-info-card/accumulated-fees";
import { PositionOptions } from "@/components/position-detail/position-options/position-options";
import { PositionHeader } from "@/components/position-detail/position-header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PositionPage() {
  const router = useRouter();
  const { id: positionId } = router.query;

  const { data: position } = useApiPositionInfo({
    positionId: positionId as string,
  });

  const { token0: contractToken0, token1: contractToken1 } = usePoolData({
    poolAddress: position?.poolAddress,
    chainId: position?.chainId,
    enabled: !position || position?.status !== "closed ",
  });

  const { data: positionInfo } = useContractPositionInfo({
    positionChainId: position?.chainId as number,
    positionTokenId: position?.activeTokenId as number,
  });

  const { fetchBatch } = useBatchFetchErc20Info();
  const [token0Info, setToken0Info] = useState<ERC20TokenInfo | undefined>();
  const [token1Info, setToken1Info] = useState<ERC20TokenInfo | undefined>();

  useEffect(() => {
    const fetchTokens = async () => {
      let result = undefined;
      let token0;
      let token1;
      if (!position) return;

      if (position.status === "closed") {
        if (!contractToken0 || !contractToken1) return;
        result = await fetchBatch(
          [contractToken0, contractToken1],
          position.chainId,
        );
        token0 = contractToken0;
        token1 = contractToken1;
      } else {
        if (!positionInfo) return;
        result = await fetchBatch(
          [positionInfo.token0, positionInfo.token1],
          position.chainId,
        );
        token0 = positionInfo.token0;
        token1 = positionInfo.token1;
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
  }, [positionInfo, fetchBatch, contractToken0, contractToken1, position]);

  return (
    <div className="space-y-6">
      <Link
        href={"/"}
        className="flex text-xs items-center gap-2 font-normal mb-5 text-muted-foreground cursor-pointer hover:underline"
      >
        <ArrowLeft size={13} className="-translate-y-0.5" />
        Back to Positions
      </Link>
      <PositionHeader
        position={position as PositionInfoInterface}
        token0Info={token0Info}
        token1Info={token1Info}
      />

      <section className="flex gap-3 flex-col md:flex-row">
        {position?.status !== "closed" ? (
          <>
            <Card className="md:w-1/2 p-0 overflow-hidden">
              <CardContent className="w-full p-0 overflow-hidden">
                <PositionValue
                  position={position as PositionInfoInterface}
                  token0Info={token0Info}
                  token1Info={token1Info}
                />
              </CardContent>
            </Card>
            <Card className="md:w-1/2 p-0 overflow-hidden">
              <CardContent className="w-full p-0 overflow-hidden">
                <FeesEarned
                  position={position as PositionInfoInterface}
                  token0Info={token0Info}
                  token1Info={token1Info}
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="md:w-1/2 p-0 overflow-hidden">
              <CardContent className="w-full p-0 overflow-hidden">
                <InitialCapital
                  position={position as PositionInfoInterface}
                  token0Info={token0Info}
                  token1Info={token1Info}
                />
              </CardContent>
            </Card>
            <Card className="md:w-1/2 p-0 overflow-hidden">
              <CardContent className="w-full p-0 overflow-hidden">
                <AccumulatedFees
                  position={position as PositionInfoInterface}
                  token0Info={token0Info}
                  token1Info={token1Info}
                />
              </CardContent>
            </Card>
          </>
        )}
      </section>
      <PositionRangeDisplay
        position={position as PositionInfoInterface}
        token0Info={token0Info}
        token1Info={token1Info}
      />
      <PositionInfo
        position={position as PositionInfoInterface}
        token0Info={token0Info}
        token1Info={token1Info}
      />

      {position?.status !== "closed" && <PositionOptions />}
    </div>
  );
}
