import { ERC20TokenInfo } from "@/utils/constants";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
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
  } = useNewPositionStore();
  const tokens = [
    selectedToken0 as ERC20TokenInfo,
    selectedToken1 as ERC20TokenInfo,
  ];
  const feeTier = selectedPool?.feeTier as number;
  const { data: token0Price } = useTokenPrice(selectedToken0.address, chainId);
  const { data: token1Price } = useTokenPrice(selectedToken1.address, chainId);

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

  const setNearestValidPrice = (debouncedValue: number, isMin: boolean) => {
    const { validTick, adjustedPrice } = getNearestValidPrice(debouncedValue);
    if (validTick === 0 || validTick === Infinity || validTick === -Infinity)
      return;

    if (isMin) {
      setMinPriceInput(adjustedPrice.toString());
      // onTickChange({ tickLower: validTick, tickUpper });
    } else {
      setMaxPriceInput(adjustedPrice.toString());
      // onTickChange({ tickLower, tickUpper: validTick });
    }
  };

  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");

  const debouncedMinPrice = useDebounce(minPriceInput, 2000);
  const debouncedMaxPrice = useDebounce(maxPriceInput, 2000);

  useEffect(() => {
    if (direction && token0Price && token1Price) {
      const basePriceRatio =
        direction === "0p1"
          ? token0Price / token1Price
          : token1Price / token0Price;
      const { adjustedPrice: adjustedPriceMin, validTick: validTickLower } =
        getNearestValidPrice(basePriceRatio * 0.95);
      const { adjustedPrice: adjustedPriceMax, validTick: validTickUpper } =
        getNearestValidPrice(basePriceRatio * 1.05);
      setMinPriceInput(adjustedPriceMin.toString());
      setMaxPriceInput(adjustedPriceMax.toString());
      // onTickChange({ tickLower: validTickLower, tickUpper: validTickUpper });
    }
  }, [feeTier, direction]);

  useEffect(() => {
    setNearestValidPrice(Number(debouncedMinPrice), true);
  }, [debouncedMinPrice]);

  useEffect(() => {
    setNearestValidPrice(Number(debouncedMaxPrice), false);
  }, [debouncedMaxPrice]);

  const handleTickChange = (value: string, setter: Function) => {
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
          value={tickLower}
          onChange={(e) => handleTickChange(e.target.value, setTickLower)}
        />
      </div>
      <div>
        <label htmlFor="">Max Price</label>
        <Input
          placeholder="0.0"
          value={tickUpper}
          onChange={(e) => handleTickChange(e.target.value, setTickUpper)}
        />
      </div>
    </div>
  );
};
