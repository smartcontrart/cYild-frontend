import { PositionInfo as PositionInfoInterface } from "@/utils/interfaces/misc";
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ERC20TokenInfo } from "@/utils/constants";
import LazyLoader from "../ui/lazy-loader";
import { useFeeTier } from "@/hooks/contracts/read/use-fee-tier";
import { PositionInfoCard } from "../position-info-card/position-info-card";

export const PositionInfo = ({
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
  const { data: feeTier, isLoading: isLoadingFeeTier } = useFeeTier({
    poolAddress: position?.poolAddress,
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
          label="Fee Tier"
          value={`${(feeTier || 0) / 1000}%`}
          isLoading={position === undefined || isLoadingFeeTier}
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
