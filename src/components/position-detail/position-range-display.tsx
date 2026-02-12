import { PositionInfo } from "@/utils/interfaces/misc";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ERC20TokenInfo } from "@/utils/constants";
import { cn } from "@/utils/shadcn";
import { tickToPrice } from "@/utils/functions";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { useTokenPrice } from "@/hooks/use-token-price";
import { zeroAddress } from "viem";
import { base } from "viem/chains";
import LazyLoader from "../ui/lazy-loader";

export const PositionRangeDisplay = ({
  position,
  token0Info,
  token1Info,
  className,
}: {
  position: PositionInfo;
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  className?: string;
}) => {
  const [direction, setDirection] = useState<"0p1" | "1p0">("0p1");

  const { data: token0Price } = useTokenPrice(
    token0Info?.address || zeroAddress,
    position?.chainId || base.id,
  );
  const { data: token1Price } = useTokenPrice(
    token1Info?.address || zeroAddress,
    position?.chainId || base.id,
  );

  const footerText =
    direction === "0p1"
      ? `${token0Info?.symbol} per ${token1Info?.symbol}`
      : `${token1Info?.symbol} per ${token0Info?.symbol}`;

  const lowerPrice = tickToPrice(
    position?.lowerTick || 0,
    token0Info?.decimals || 18,
    token1Info?.decimals || 18,
  );

  const upperPrice = tickToPrice(
    position?.upperTick || 0,
    token0Info?.decimals || 18,
    token1Info?.decimals || 18,
  );

  const adjustedLowerPrice =
    direction === "0p1"
      ? lowerPrice / Number(token1Price ?? 0)
      : lowerPrice / Number(token0Price ?? 0);

  const adjustedUpperPrice =
    direction === "0p1"
      ? upperPrice / Number(token1Price ?? 0)
      : upperPrice / Number(token0Price ?? 0);

  const currentPrice =
    direction === "0p1"
      ? Number(token0Price ?? 0) / Number(token1Price ?? 1)
      : Number(token1Price ?? 0) / Number(token0Price ?? 1);

  const formattedLowerPrice = Number(adjustedLowerPrice).toLocaleString();
  const formattedUpperPrice = Number(adjustedUpperPrice).toLocaleString();
  const formattedCurrentPrice = Number(currentPrice).toLocaleString();

  return (
    <Card className="w-full">
      <CardHeader className="mb-0 pt-3">
        <CardTitle className="text-sm text-muted-foreground font-normal flex items-center justify-between">
          <span>Price Range</span>
          <Tabs
            onValueChange={(value: string) => {
              setDirection(value as "0p1" | "1p0");
            }}
            defaultValue="0p1"
          >
            <TabsList>
              <TabsTrigger value="0p1">{`${token0Info?.symbol}/${token1Info?.symbol}`}</TabsTrigger>
              <TabsTrigger value="1p0">{`${token1Info?.symbol}/${token0Info?.symbol}`}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <section className="flex gap-3 justify-between h-28">
          <PriceBox
            title="Min Price"
            value={formattedLowerPrice}
            footer={footerText}
            isLoading={
              position === undefined ||
              token0Price === undefined ||
              token1Price === undefined ||
              token0Info === undefined ||
              token1Info === undefined
            }
          />
          <PriceBox
            title="Current Price"
            value={formattedCurrentPrice}
            footer={footerText}
            isLoading={
              position === undefined ||
              token0Price === undefined ||
              token1Price === undefined ||
              token0Info === undefined ||
              token1Info === undefined
            }
          />
          <PriceBox
            title="Max Price"
            value={formattedUpperPrice}
            isLoading={
              position === undefined ||
              token0Price === undefined ||
              token1Price === undefined ||
              token0Info === undefined ||
              token1Info === undefined
            }
            footer={footerText}
          />
        </section>
      </CardContent>
    </Card>
  );
};

const PriceBox = ({
  title,
  value,
  footer,
  isLoading,
  className,
}: {
  title: string;
  value: string;
  footer: string;
  isLoading: boolean;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        "w-1/3 h-full flex flex-col items-center justify-between bg-secondary rounded-lg py-3",
        className,
      )}
    >
      <span className="text-sm text-muted-foreground">{title}</span>
      {/*<span className="text-lg">{value}</span>*/}
      <LazyLoader
        isLoading={isLoading}
        className="min-w-20 text-center min-h-5"
      >
        {value}
      </LazyLoader>
      <LazyLoader
        isLoading={isLoading}
        className="min-w-28 text-center min-h-5 text-sm text-muted-foreground"
      >
        {footer}
      </LazyLoader>
    </section>
  );
};
