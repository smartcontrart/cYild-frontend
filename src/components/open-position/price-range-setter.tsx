import { ERC20TokenInfo } from "@/utils/constants";
import { Input } from "../ui/input";
import { useEffect } from "react";
import {
  formatValue,
  nearestValidTick,
  priceToTick,
  reArrangeTokensByContractAddress,
  tickToPrice,
  validateNumericInput,
} from "@/utils/functions";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useChainId } from "wagmi";

export const PriceRangeSetter = ({
  min,
  setMin,
  max,
  setMax,
  setTickLower,
  setTickUpper,
  isConcentrated = false,
}: {
  min: string;
  setMin: (min: string) => void;
  max: string;
  setMax: (max: string) => void;
  setTickLower: (tickLower: number) => void;
  setTickUpper: (tickUpper: number) => void;
  isConcentrated?: boolean;
}) => {
  const chainId = useChainId();
  const { selectedPool, selectedToken0, selectedToken1, direction } =
    useNewPositionStore();
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
        ? Number(token0Price ?? 0) / Number(token1Price ?? 1)
        : Number(token1Price ?? 0) / Number(token0Price ?? 1);

    // Use wider range for concentrated liquidity
    const minMultiplier = isConcentrated ? 0.8 : 0.95;
    const maxMultiplier = isConcentrated ? 1.2 : 1.05;

    const { adjustedPrice: adjustedPriceMin, validTick: validTickLower } =
      getNearestValidPrice(basePriceRatio * minMultiplier);
    const { adjustedPrice: adjustedPriceMax, validTick: validTickUpper } =
      getNearestValidPrice(basePriceRatio * maxMultiplier);

    // set initial min/max and ticks
    setMin(formatValue(adjustedPriceMin));
    setMax(formatValue(adjustedPriceMax));
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
        setMin(formatValue(adjustedPrice));
        setTickLower(validTick);
      } else {
        setMax(formatValue(adjustedPrice));
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
      <div className="flex flex-col gap-2">
        <label htmlFor="">Min Price</label>
        <Input
          placeholder="0.0"
          value={min}
          onChange={(e) => handleInputChange(e.target.value, setMin)}
          onBlur={(e) => handleInputChangeComplete(e.target.value, true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInputChangeComplete(e.currentTarget.value, true);
            }
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="">Max Price</label>
        <Input
          placeholder="0.0"
          value={max}
          onChange={(e) => handleInputChange(e.target.value, setMax)}
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
