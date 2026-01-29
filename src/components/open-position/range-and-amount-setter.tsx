"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useTokenPrice } from "@/hooks/use-token-price";
import { PriceRangeSetter } from "./price-range-setter";
import { reArrangeTokensByContractAddress } from "@/utils/functions";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { useChainId } from "wagmi";
import { ERC20TokenInfo } from "@/utils/constants";

export const RangeAndAmountSetter = () => {
  const chainId = useChainId();
  const { tickLower, tickUpper, token0Input, token1Input, selectedPool } =
    useNewPositionStore();
  const token0 = selectedPool?.token0 as ERC20TokenInfo;
  const token1 = selectedPool?.token1 as ERC20TokenInfo;
  const [direction, setDirection] = useState<"0p1" | "1p0">("0p1");

  const { data: token0Price } = useTokenPrice(token0.address, chainId);
  const { data: token1Price } = useTokenPrice(token1.address, chainId);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
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

      {direction === "0p1" ? (
        <div>
          1 {token0.symbol} is worth {Number(token0Price) / Number(token1Price)}{" "}
          {token1.symbol}
        </div>
      ) : (
        <div>
          1 {token1.symbol} is worth {Number(token1Price) / Number(token0Price)}{" "}
          {token0.symbol}
        </div>
      )}

      {token0Price && token1Price ? (
        <>
          <PriceRangeSetter direction={direction} />
          {/*<AmountSetter
            tokens={sortedTokensByCA}
            tickLower={tickLower}
            tickUpper={tickUpper}
            token0Price={Number(token0Price)}
            token1Price={Number(token1Price)}
            onAmountsChange={(data: any) => {
              data.token0Amount &&
                onInfoChange({ token0Amount: data.token0Amount });
              data.token1Amount &&
                onInfoChange({ token1Amount: data.token1Amount });
            }}
            chainId={chainId}
          />*/}
        </>
      ) : (
        <></>
      )}
    </>
  );
};
