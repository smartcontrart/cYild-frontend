"use client";

import { useRouter } from "next/router";
import { PositionInfo as PositionInfoInterface } from "@/utils/interfaces/misc";
import { ERC20TokenInfo, getNetworkDataFromChainId } from "@/utils/constants";
import TokenLogo from "@/components/global/token-logo";
import LazyLoader from "@/components/ui/lazy-loader";
import { useBatchFetchErc20Info } from "@/hooks/contracts/read/use-batch-fetch-erc20-info";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { FeesEarned } from "@/components/position-info-card/fees-earned";
import { PositionValue } from "@/components/position-info-card/position-value";
import { Card, CardContent } from "@/components/ui/card";
import { IncreaseLiquidityButton } from "@/components/position-detail/position-options/increase-liquidity-button";
import { DecreaseLiquidityButton } from "@/components/position-detail/position-options/decrease-liquidity-button";
import { CollectFeesButton } from "@/components/position-detail/position-options/collect-fees-button";
import { ClosePositionButton } from "@/components/position-detail/position-options/close-position-button";
import { PositionRangeDisplay } from "@/components/position-detail/position-range-display";
import { PositionInfo } from "@/components/position-detail/position-info";
import Link from "next/link";
import { base } from "viem/chains";
import Image from "next/image";
import { useFeeTier } from "@/hooks/contracts/read/use-fee-tier";
import { CompoundFeesButton } from "@/components/position-detail/position-options/compound-fees-button";
import { usePoolData } from "@/hooks/contracts/read/use-pool-data";
import { InitialCapital } from "@/components/position-info-card/initial-capital";
import { AccumulatedFees } from "@/components/position-info-card/accumulated-fees";
import { UpdateBufferButton } from "@/components/position-detail/position-options/update-buffer-button";

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
      <Header
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

      {position?.status !== "closed" && (
        <Card>
          <CardContent className="py-4 flex flex-wrap gap-5">
            <IncreaseLiquidityButton
              position={position as PositionInfoInterface}
              token0Info={token0Info}
              token1Info={token1Info}
            />
            <DecreaseLiquidityButton
              position={position as PositionInfoInterface}
              token0Info={token0Info}
              token1Info={token1Info}
            />
            <UpdateBufferButton
              position={position as PositionInfoInterface}
              token0Info={token0Info}
              token1Info={token1Info}
            />
            <CollectFeesButton
              position={position as PositionInfoInterface}
              token0Info={token0Info}
              token1Info={token1Info}
            />
            <CompoundFeesButton
              position={position as PositionInfoInterface}
              token0Info={token0Info}
              token1Info={token1Info}
            />
            <ClosePositionButton />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const Header = ({
  position,
  token0Info,
  token1Info,
}: {
  position: PositionInfoInterface;
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
}) => {
  const networkData = getNetworkDataFromChainId(position?.chainId || base.id);
  const { data: feeTier } = useFeeTier({
    poolAddress: position?.poolAddress,
    chainId: position?.chainId,
  });
  const tokenId = position?.activeTokenId
    ? position?.activeTokenId
    : position?.burnedTokenIds[0];

  return (
    <div className="flex flex-col gap-2 items-start relative">
      <Link
        href={"/"}
        className="flex text-xs items-center gap-2 font-normal mb-2 text-muted-foreground cursor-pointer hover:underline"
      >
        <ArrowLeft size={13} className="-translate-y-0.5" />
        Back to Positions
      </Link>
      <section className="flex gap-3">
        <section className="-space-x-4 flex">
          <TokenLogo token={token0Info} />
          <TokenLogo token={token1Info} />
        </section>
        <section className="flex flex-col">
          <div className="flex gap-2">
            <div className="flex gap-1">
              <LazyLoader
                className="font-semibold min-w-8"
                isLoading={token0Info === undefined}
              >
                {token0Info?.symbol}
              </LazyLoader>
              <span>/</span>
              <LazyLoader
                className="font-semibold min-w-8"
                isLoading={token1Info === undefined}
              >
                {token1Info?.symbol}
              </LazyLoader>
            </div>
            <section className="flex items-center gap-3">
              <span className="text-xs px-2 flex items-center bg-secondary rounded-full h-6">
                {(feeTier || 0) / 1000}%
              </span>
              {position?.status === "closed" && (
                <span className="h-6 text-xs flex items-center bg-destructive/10 rounded-full px-2 text-destructive">
                  Closed
                </span>
              )}
            </section>
          </div>
          <span className="text-xs text-muted-foreground flex items-center">
            #{tokenId}
            <ExternalLink size={10} className="ml-2 cursor-pointer" />
          </span>
        </section>
        <Image
          src={networkData.image}
          width={30}
          height={20}
          alt={networkData.name}
          className="absolute right-0 top-1/2"
        />
      </section>
    </div>
  );
};
