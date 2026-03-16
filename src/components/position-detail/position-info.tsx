import { PositionInfo as PositionInfoInterface } from "@/utils/interfaces/misc";
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ERC20TokenInfo } from "@/utils/constants";
import LazyLoader from "../ui/lazy-loader";
import { useFeeTier } from "@/hooks/contracts/read/use-fee-tier";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { formatUnits, zeroAddress } from "viem";
import { base } from "viem/chains";

export const PositionInfo = ({
  position,
  token0Info,
  token1Info,
}: {
  position: PositionInfoInterface;
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
}) => {
  const { data: feeTier, isLoading: isLoadingFeeTier } = useFeeTier({
    poolAddress: position?.poolAddress,
    chainId: position?.chainId,
  });
  const formattedPositionCreation = position
    ? position.createdAt
      ? new Date(position.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : ""
    : "";

  const tokenId = position?.activeTokenId
    ? position?.activeTokenId
    : position?.burnedTokenIds[0];

  const { data: token0Price, isLoading: isLoadingToken0Price } = useTokenPrice(
    token0Info?.address || zeroAddress,
    position?.chainId || base.id,
  );
  const { data: token1Price, isLoading: isLoadingToken1Price } = useTokenPrice(
    token1Info?.address || zeroAddress,
    position?.chainId || base.id,
  );

  const token0InitialCapitalUsd =
    token0Info && token0Price !== undefined
      ? Number(
          formatUnits(
            BigInt(position.initialCapitalToken0),
            token0Info.decimals,
          ),
        ) * token0Price
      : undefined;

  const token1InitialCapitalUsd =
    token1Info && token1Price !== undefined
      ? Number(
          formatUnits(
            BigInt(position.initialCapitalToken1),
            token1Info.decimals,
          ),
        ) * token1Price
      : undefined;

  const { data: positionInfo, isLoading: isLoadingPositionInfo } =
    useContractPositionInfo({
      positionChainId: position?.chainId || base.id,
      positionTokenId: position?.activeTokenId,
    });

  const currentCapitalUsd =
    positionInfo &&
    token0Info &&
    token1Info &&
    token0Price !== undefined &&
    token1Price !== undefined
      ? Number(formatUnits(positionInfo.principal0, token0Info.decimals)) *
          token0Price +
        Number(formatUnits(positionInfo.principal1, token1Info.decimals)) *
          token1Price
      : undefined;

  const initialCapitalUsd =
    token0InitialCapitalUsd !== undefined &&
    token1InitialCapitalUsd !== undefined
      ? token0InitialCapitalUsd + token1InitialCapitalUsd
      : undefined;

  const impermanentLoss =
    currentCapitalUsd !== undefined && initialCapitalUsd !== undefined
      ? currentCapitalUsd - initialCapitalUsd
      : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">
          Position Info
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ListItem
          label="Position ID"
          value={`#${tokenId}`}
          isLoading={position === undefined}
        />
        <ListItem
          label="Created At"
          value={formattedPositionCreation}
          isLoading={position === undefined}
        />
        <ListItem
          label="Fee Tier"
          value={`${(feeTier || 0) / 10000}%`}
          isLoading={position === undefined || isLoadingFeeTier}
        />
        <ListItem
          label="Token 0"
          value={token0Info?.symbol}
          isLoading={position === undefined || token0Info === undefined}
        />
        <ListItem
          label="Token 1"
          value={token1Info?.symbol}
          isLoading={position === undefined || token1Info === undefined}
        />
        <ListItem
          label="Token0 Initial Capital"
          value={
            token0InitialCapitalUsd !== undefined
              ? `$${token0InitialCapitalUsd.toFixed(2)}`
              : undefined
          }
          isLoading={
            position === undefined ||
            token0Info === undefined ||
            isLoadingToken0Price
          }
        />
        <ListItem
          label="Token1 Initial Capital"
          value={
            token1InitialCapitalUsd !== undefined
              ? `$${token1InitialCapitalUsd.toFixed(2)}`
              : undefined
          }
          isLoading={
            position === undefined ||
            token1Info === undefined ||
            isLoadingToken1Price
          }
        />
        <ListItem
          label="Impermanent Loss"
          value={
            impermanentLoss !== undefined
              ? `${impermanentLoss >= 0 ? "+" : ""}$${impermanentLoss.toFixed(2)}`
              : undefined
          }
          isLoading={
            position === undefined ||
            token0Info === undefined ||
            token1Info === undefined ||
            isLoadingToken0Price ||
            isLoadingToken1Price ||
            isLoadingPositionInfo
          }
        />
        <ListItem
          label="Rebalance Split"
          value={
            position
              ? `${Math.round((position.lowerRangeDistribution ?? 5000) / 100)}% ${token0Info?.symbol ?? "T0"} / ${Math.round((position.upperRangeDistribution ?? 5000) / 100)}% ${token1Info?.symbol ?? "T1"}`
              : undefined
          }
          isLoading={position === undefined}
        />
      </CardContent>
    </Card>
  );
};

const ListItem = ({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: ReactNode;
  isLoading: boolean;
}) => {
  return (
    <section className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <LazyLoader isLoading={isLoading} className="min-w-20 text-right">
        {value}
      </LazyLoader>
    </section>
  );
};
