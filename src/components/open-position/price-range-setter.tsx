import { ERC20TokenInfo } from "@/utils/constants";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import {
  nearestValidTick,
  priceToTick,
  reArrangeTokensByContractAddress,
  tickToPrice,
  validateNumericInput,
} from "@/utils/functions";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useChainId } from "wagmi";

export const PriceRangeSetter = ({ direction }: { direction: string }) => {
  const chainId = useChainId();
  const {
    selectedPool,
    selectedToken0,
    selectedToken1,
    tickLower,
    tickUpper,
    setTickLower,
    setTickUpper,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
  } = useNewPositionStore();
  const tokens = [
    selectedToken0 as ERC20TokenInfo,
    selectedToken1 as ERC20TokenInfo,
  ];
  const { data: token0Price } = useTokenPrice(tokens[0].address, chainId);
  const { data: token1Price } = useTokenPrice(tokens[1].address, chainId);

  const getNearestValidPrice = (debouncedValue: number) => {
    let numericPrice = debouncedValue;
    const [token0SortedByCA, token1SortedByCA] =
      reArrangeTokensByContractAddress(tokens);
    if (
      (token0SortedByCA.address === tokens[0].address && direction === "1p0") ||
      (token0SortedByCA.address !== tokens[0].address && direction === "1p0")
    )
      numericPrice = 1 / numericPrice;

    const tick = priceToTick(
      numericPrice,
      token0SortedByCA.decimals,
      token1SortedByCA.decimals,
    );
    const feeTier = selectedPool?.feeTier as number;
    const validTick = nearestValidTick(tick, feeTier);
    let adjustedPrice = Number(
      tickToPrice(
        validTick,
        token0SortedByCA.decimals,
        token1SortedByCA.decimals,
      ),
    );
    if (
      (token0SortedByCA.address === tokens[0].address && direction === "1p0") ||
      (token0SortedByCA.address !== tokens[0].address && direction === "0p1")
    )
      adjustedPrice = 1 / adjustedPrice;
    return {
      validTick,
      adjustedPrice,
    };
  };

  useEffect(() => {
    const basePriceRatio =
      direction === "0p1"
        ? token0Price / token1Price
        : token1Price / token0Price;

    const { adjustedPrice: adjustedPriceMin, validTick: validTickLower } =
      getNearestValidPrice(basePriceRatio * 0.95);
    const { adjustedPrice: adjustedPriceMax, validTick: validTickUpper } =
      getNearestValidPrice(basePriceRatio * 1.05);

    // set initial min/max and ticks
    setMinPrice(adjustedPriceMin.toString());
    setMaxPrice(adjustedPriceMax.toString());
    setTickLower(validTickLower);
    setTickUpper(validTickUpper);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, selectedPool]);

  // listen for when user is done typing
  const handleInputChangeComplete = (value: string, isMin: boolean) => {
    if (validateNumericInput(value.toString())) {
      // get the valid tick and the nearest price to that tick
      const { validTick, adjustedPrice } = getNearestValidPrice(Number(value));
      // update values
      if (isMin) {
        setMinPrice(adjustedPrice.toString());
        setTickLower(validTick);
      } else {
        setMaxPrice(adjustedPrice.toString());
        setTickUpper(validTick);
      }
    }
  };

  const handleInputChange = (value: string, setter: Function) => {
    if (validateNumericInput(value.toString())) {
      setter(value);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="">Min Price</label>
        <Input
          placeholder="0.0"
          value={minPrice}
          onChange={(e) => handleInputChange(e.target.value, setMinPrice)}
          onBlur={(e) => handleInputChangeComplete(e.target.value, true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInputChangeComplete(e.currentTarget.value, true);
            }
          }}
        />
      </div>
      <div>
        <label htmlFor="">Max Price</label>
        <Input
          placeholder="0.0"
          value={maxPrice}
          onChange={(e) => handleInputChange(e.target.value, setMaxPrice)}
          onBlur={(e) => handleInputChangeComplete(e.target.value, false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInputChangeComplete(e.currentTarget.value, false);
            }
          }}
        />
      </div>
    </div>
  );
};
