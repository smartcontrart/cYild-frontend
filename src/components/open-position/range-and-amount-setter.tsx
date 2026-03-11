"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useTokenPrice } from "@/hooks/use-token-price";
import { PriceRangeSetter } from "./price-range-setter";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { useChainId } from "wagmi";
import { ERC20TokenInfo } from "@/utils/constants";
import { AmountSetter } from "./amount-setter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Undo2 } from "lucide-react";
import { OpenPositionButton } from "./open-position-button";

export const RangeAndAmountSetter = () => {
  const chainId = useChainId();
  const {
    selectedPool,
    minPrice,
    setMinPrice,
    maxPrice,
    setTickUpper,
    setTickLower,
    setMaxPrice,
    direction,
    setDirection,
  } = useNewPositionStore();
  const token0 = selectedPool?.token0 as ERC20TokenInfo;
  const token1 = selectedPool?.token1 as ERC20TokenInfo;

  const { data: token0Price } = useTokenPrice(token0.address, chainId, 5000);
  const { data: token1Price } = useTokenPrice(token1.address, chainId, 5000);

  return (
    <section className="flex flex-col gap-4">
      <div className="mb-4">
        <Tabs
          value={direction}
          onValueChange={(value: string) => {
            setDirection(value as "0p1" | "1p0");
          }}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="0p1">{`${token1.symbol}/${token0.symbol}`}</TabsTrigger>
            <TabsTrigger value="1p0">{`${token0.symbol}/${token1.symbol}`}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {direction === "1p0" ? (
        <div>
          1 {token0.symbol} is worth{" "}
          {(Number(token0Price) / Number(token1Price)).toFixed(5)}{" "}
          {token1.symbol}
        </div>
      ) : (
        <div>
          1 {token1.symbol} is worth{" "}
          {(Number(token1Price) / Number(token0Price)).toFixed(5)}{" "}
          {token0.symbol}
        </div>
      )}

      {token0Price && token1Price && (
        <section className="flex flex-col gap-8 mb-4">
          <PriceRangeSetter
            min={minPrice}
            max={maxPrice}
            setMax={setMaxPrice}
            setMin={setMinPrice}
            setTickLower={setTickLower}
            setTickUpper={setTickUpper}
            isConcentrated={false}
          />
          <AmountSetter />
        </section>
      )}
    </section>
  );
};
