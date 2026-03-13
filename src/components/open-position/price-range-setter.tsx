import { ERC20TokenInfo } from "@/utils/constants";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
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
import { cn } from "@/utils/shadcn";

type InputMode = "price" | "percent";

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
  const { selectedPool, direction, tickLower, tickUpper } =
    useNewPositionStore();
  const tokens = [
    selectedPool?.token0 as ERC20TokenInfo,
    selectedPool?.token1 as ERC20TokenInfo,
  ];
  const { data: token0Price } = useTokenPrice(tokens[0].address, chainId);
  const { data: token1Price } = useTokenPrice(tokens[1].address, chainId);

  const [inputMode, setInputMode] = useState<InputMode>("price");
  const [minPercent, setMinPercent] = useState<string>("");
  const [maxPercent, setMaxPercent] = useState<string>("");

  const getNearestValidPrice = (debouncedValue: number) => {
    let numericPrice = debouncedValue;
    const [token0SortedByCA, token1SortedByCA] =
      reArrangeTokensByContractAddress(tokens);
    if (
      (token0SortedByCA.address === tokens[0].address && direction === "0p1") ||
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
      (token0SortedByCA.address === tokens[0].address && direction === "0p1") ||
      (token0SortedByCA.address !== tokens[0].address && direction === "1p0")
    )
      adjustedPrice = 1 / adjustedPrice;
    return {
      validTick,
      adjustedPrice,
    };
  };

  const getMidPriceRatio = () =>
    direction === "1p0"
      ? Number(token0Price ?? 0) / Number(token1Price ?? 1)
      : Number(token1Price ?? 0) / Number(token0Price ?? 1);

  const priceToPercent = (displayPrice: number): string => {
    const mid = getMidPriceRatio();
    if (!mid || mid <= 0) return "0.00";
    return ((displayPrice / mid - 1) * 100).toFixed(2);
  };

  useEffect(() => {
    const basePriceRatio =
      direction === "1p0"
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

    // keep percent values in sync regardless of current mode
    setMinPercent(priceToPercent(adjustedPriceMin));
    setMaxPercent(priceToPercent(adjustedPriceMax));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, selectedPool]);

  // listen for when user is done typing (price mode)
  const handleInputChangeComplete = (value: string, isMin: boolean) => {
    if (validateNumericInput(value.toString())) {
      const { validTick, adjustedPrice } = getNearestValidPrice(Number(value));
      if (isMin) {
        setMin(formatValue(adjustedPrice));
        setTickLower(validTick);
        setMinPercent(priceToPercent(adjustedPrice));
      } else {
        setMax(formatValue(adjustedPrice));
        setTickUpper(validTick);
        setMaxPercent(priceToPercent(adjustedPrice));
      }
    }
  };

  const handleInputChange = (value: string, setter: (v: string) => void) => {
    if (validateNumericInput(value.toString())) {
      setter(value);
    }
  };

  // percent input allows an optional leading minus sign
  const validatePercentInput = (value: string): boolean => {
    if (value === "" || value === "-") return true;
    if (!/^-?\d*\.?\d*$/.test(value)) return false;
    return (value.match(/\./g) || []).length <= 1;
  };

  const handlePercentChange = (value: string, setter: (v: string) => void) => {
    if (validatePercentInput(value)) setter(value);
  };

  const handlePercentChangeComplete = (value: string, isMin: boolean) => {
    if (value === "" || value === "-") return;
    const percent = parseFloat(value);
    if (isNaN(percent)) return;

    const basePriceRatio = getMidPriceRatio();
    if (!basePriceRatio || basePriceRatio <= 0) return;

    const targetPrice = basePriceRatio * (1 + percent / 100);
    const { validTick, adjustedPrice } = getNearestValidPrice(targetPrice);

    // snap the displayed percent back to the nearest valid tick
    const snappedPercent = priceToPercent(adjustedPrice);

    if (isMin) {
      setMin(formatValue(adjustedPrice));
      setTickLower(validTick);
      setMinPercent(snappedPercent);
    } else {
      setMax(formatValue(adjustedPrice));
      setTickUpper(validTick);
      setMaxPercent(snappedPercent);
    }
  };

  const toggleInputMode = () => {
    if (inputMode === "price") {
      // compute live percentages from the current display prices before switching
      setMinPercent(priceToPercent(Number(min)));
      setMaxPercent(priceToPercent(Number(max)));
      setInputMode("percent");
    } else {
      setInputMode("price");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <section className="flex items-center justify-between">
          <label htmlFor="">Min Price</label>
          <label htmlFor="" className="text-xs text-muted-foreground">
            {tickLower}
          </label>
        </section>
        <div className="relative">
          <Input
            placeholder={inputMode === "price" ? "0.0" : "e.g. -5"}
            value={inputMode === "price" ? min : minPercent}
            className="pr-10"
            onChange={(e) =>
              inputMode === "price"
                ? handleInputChange(e.target.value, setMin)
                : handlePercentChange(e.target.value, setMinPercent)
            }
            onBlur={(e) =>
              inputMode === "price"
                ? handleInputChangeComplete(e.target.value, true)
                : handlePercentChangeComplete(e.target.value, true)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                inputMode === "price"
                  ? handleInputChangeComplete(e.currentTarget.value, true)
                  : handlePercentChangeComplete(e.currentTarget.value, true);
              }
            }}
          />
          <InputModeToggle mode={inputMode} onClick={toggleInputMode} />
        </div>
        <MidPriceDistance
          price={Number(min)}
          midPrice={getMidPriceRatio()}
          mode={inputMode}
        />
      </div>
      <div className="flex flex-col gap-2">
        <section className="flex items-center justify-between">
          <label htmlFor="">Max Price</label>
          <label htmlFor="" className="text-xs text-muted-foreground">
            {tickUpper}
          </label>
        </section>
        <div className="relative">
          <Input
            placeholder={inputMode === "price" ? "0.0" : "e.g. 5"}
            value={inputMode === "price" ? max : maxPercent}
            className="pr-10"
            onChange={(e) =>
              inputMode === "price"
                ? handleInputChange(e.target.value, setMax)
                : handlePercentChange(e.target.value, setMaxPercent)
            }
            onBlur={(e) =>
              inputMode === "price"
                ? handleInputChangeComplete(e.target.value, false)
                : handlePercentChangeComplete(e.target.value, false)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                inputMode === "price"
                  ? handleInputChangeComplete(e.currentTarget.value, false)
                  : handlePercentChangeComplete(e.currentTarget.value, false);
              }
            }}
          />
          <InputModeToggle mode={inputMode} onClick={toggleInputMode} />
        </div>
        <MidPriceDistance
          price={Number(max)}
          midPrice={getMidPriceRatio()}
          mode={inputMode}
        />
      </div>
    </div>
  );
};

const InputModeToggle = ({
  mode,
  onClick,
}: {
  mode: InputMode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono select-none",
      "bg-muted aspect-square w-6 rounded cursor-pointer",
    )}
  >
    {mode === "percent" ? "%" : "$"}
  </button>
);

const MidPriceDistance = ({
  price,
  midPrice,
  mode,
}: {
  price: number;
  midPrice: number;
  mode: InputMode;
}) => {
  if (mode === "percent") {
    return (
      <label htmlFor="" className="text-xs text-muted-foreground">
        {price > 0 ? `$${price.toPrecision(6)}` : "—"}
      </label>
    );
  }

  const percentage = midPrice > 0 ? (price / midPrice - 1) * 100 : 0;
  const formatted =
    percentage >= 0
      ? `+${percentage.toFixed(2)}%`
      : `${percentage.toFixed(2)}%`;

  return (
    <label htmlFor="" className="text-xs text-muted-foreground">
      {formatted} from current price
    </label>
  );
};
