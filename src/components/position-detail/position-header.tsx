"use client";

import { PositionInfo as PositionInfoInterface } from "@/utils/interfaces/misc";
import { ERC20TokenInfo, getNetworkDataFromChainId } from "@/utils/constants";
import TokenLogo from "@/components/global/token-logo";
import LazyLoader from "@/components/ui/lazy-loader";
import { base } from "viem/chains";
import Image from "next/image";
import { useFeeTier } from "@/hooks/contracts/read/use-fee-tier";
import { cn } from "@/utils/shadcn";
import { useMemo, useState } from "react";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { formatUnits, zeroAddress } from "viem";

const SECONDS_IN_YEAR = 365 * 24 * 60 * 60;

export const PositionHeader = ({
  position,
  token0Info,
  token1Info,
  className,
}: {
  position: PositionInfoInterface;
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  className?: string;
}) => {
  const networkData = getNetworkDataFromChainId(position?.chainId || base.id);

  const tokenId = position?.activeTokenId
    ? position?.activeTokenId
    : position?.burnedTokenIds[0];

  return (
    <div
      className={cn(
        "flex flex-col gap-2 items-start relative justify-center",
        className,
      )}
    >
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
            <InfoBubbles
              position={position}
              token0Info={token0Info}
              token1Info={token1Info}
              className="hidden md:flex ml-2"
            />
          </div>
          <span className="text-xs text-muted-foreground flex items-center">
            #{tokenId}
          </span>
        </section>
        <Image
          src={networkData.image}
          width={30}
          height={20}
          alt={networkData.name}
          className="absolute right-0 md:top-1/2 md:-translate-y-1/2 top-2"
        />
      </section>
      <InfoBubbles
        position={position}
        token0Info={token0Info}
        token1Info={token1Info}
        className="md:hidden mt-2"
      />
    </div>
  );
};

const InfoBubbles = ({
  position,
  token0Info,
  token1Info,
  className,
}: {
  position: PositionInfoInterface;
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  className?: string;
}) => {
  const [timestampNow] = useState(() => Date.now() / 1000);

  const { data: feeTier } = useFeeTier({
    poolAddress: position?.poolAddress,
    chainId: position?.chainId,
  });

  const { data: positionInfo } = useContractPositionInfo({
    positionChainId: position?.chainId || base.id,
    positionTokenId: position?.activeTokenId,
  });

  const { data: token0Price } = useTokenPrice(
    token0Info?.address || zeroAddress,
    position?.chainId || base.id,
  );
  const { data: token1Price } = useTokenPrice(
    token1Info?.address || zeroAddress,
    position?.chainId || base.id,
  );

  const apr = useMemo(() => {
    if (
      token0Price === undefined ||
      token1Price === undefined ||
      token0Info === undefined ||
      token1Info === undefined
    )
      return undefined;

    const decimals0 = token0Info.decimals;
    const decimals1 = token1Info.decimals;

    if (positionInfo === undefined) return undefined;

    const feesToken0 = Number(position.totalFeesToken0) / 10 ** decimals0;
    const feesToken1 = Number(position.totalFeesToken1) / 10 ** decimals1;
    const feesUsd = feesToken0 * token0Price + feesToken1 * token1Price;

    const capitalToken0 = Number(
      formatUnits(positionInfo.principal0, decimals0),
    );
    const capitalToken1 = Number(
      formatUnits(positionInfo.principal1, decimals1),
    );
    const capitalUsd =
      capitalToken0 * token0Price + capitalToken1 * token1Price;

    if (capitalUsd <= 0) return undefined;

    const timestampEntry = new Date(position.createdAt).getTime() / 1000;
    const elapsed = timestampNow - timestampEntry;

    if (elapsed <= 0) return undefined;

    return (feesUsd / capitalUsd) * (SECONDS_IN_YEAR / elapsed) * 100;
  }, [
    token0Price,
    token1Price,
    token0Info,
    token1Info,
    position,
    positionInfo,
    timestampNow,
  ]);

  return (
    <section className={cn("flex items-center gap-3", className)}>
      <span className="text-xs px-2 flex items-center bg-secondary rounded-full h-6">
        {(feeTier || 0) / 10000}%
      </span>
      {apr !== undefined && (
        <span className="text-xs px-2 flex items-center bg-emerald-500/10 rounded-full h-6 text-emerald-500 font-medium">
          {apr.toFixed(2)}% APR
        </span>
      )}
      {position?.status === "closed" && (
        <span className="h-6 text-xs flex items-center bg-destructive/10 rounded-full px-2 text-destructive">
          Closed
        </span>
      )}
    </section>
  );
};
