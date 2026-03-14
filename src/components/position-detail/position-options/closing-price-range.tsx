import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ERC20TokenInfo } from "@/utils/constants";
import { PositionInfo } from "@/utils/interfaces/misc";
import {
  tickToPrice,
  priceToTick,
  validateNumericInput,
} from "@/utils/functions";
import { BACKEND_API_URL } from "@/utils/constants";
import { toast } from "sonner";
import { ArrowRight, Minus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConnection } from "wagmi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTokenPrice } from "@/hooks/use-token-price";
import { zeroAddress } from "viem";
import { base } from "viem/chains";
import LazyLoader from "@/components/ui/lazy-loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { cn } from "@/utils/shadcn";

type InputMode = "price" | "percent";

export const ClosingPriceRange = ({
  token0Info,
  token1Info,
  position,
}: {
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  position: PositionInfo;
}) => {
  const { address } = useConnection();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [direction, setDirection] = useState<"0p1" | "1p0">("0p1");
  const [inputMode, setInputMode] = useState<InputMode>("price");
  const decimals0 = token0Info?.decimals ?? 18;
  const decimals1 = token1Info?.decimals ?? 18;

  const { refetch } = useApiPositionInfo({
    positionId: position.positionId.toString(),
  });

  const { data: token0Price } = useTokenPrice(
    token0Info?.address || zeroAddress,
    position?.chainId || base.id,
  );
  const { data: token1Price } = useTokenPrice(
    token1Info?.address || zeroAddress,
    position?.chainId || base.id,
  );

  const currentPrice =
    direction === "0p1"
      ? Number(token0Price ?? 0) / Number(token1Price ?? 1)
      : Number(token1Price ?? 0) / Number(token0Price ?? 1);

  const getFractionDigits = (value: number) => (value >= 1 ? 2 : 5);

  const formattedCurrentPrice = currentPrice.toLocaleString(undefined, {
    minimumFractionDigits: getFractionDigits(currentPrice),
    maximumFractionDigits: getFractionDigits(currentPrice),
  });

  const isPriceLoading =
    token0Price === undefined ||
    token1Price === undefined ||
    token0Info === undefined ||
    token1Info === undefined;

  const SLIDER_BUFFER = 0.05;

  // Raw prices always in 0p1 (token1/token0) terms
  const rawClosingLowerPrice = useMemo(
    () => tickToPrice(position.closingLowerTick, decimals0, decimals1),
    [position.closingLowerTick, decimals0, decimals1],
  );

  const rawClosingUpperPrice = useMemo(
    () => tickToPrice(position.closingUpperTick, decimals0, decimals1),
    [position.closingUpperTick, decimals0, decimals1],
  );

  const rawSliderMin = useMemo(
    () =>
      tickToPrice(position.lowerTick, decimals0, decimals1) *
      (1 - SLIDER_BUFFER),
    [position.lowerTick, decimals0, decimals1],
  );

  const rawSliderMax = useMemo(
    () =>
      tickToPrice(position.upperTick, decimals0, decimals1) *
      (1 + SLIDER_BUFFER),
    [position.upperTick, decimals0, decimals1],
  );

  // Direction-aware initial display prices (for the Card)
  const initialLowerPrice = useMemo(
    () =>
      direction === "1p0" ? 1 / rawClosingUpperPrice : rawClosingLowerPrice,
    [direction, rawClosingLowerPrice, rawClosingUpperPrice],
  );

  const initialUpperPrice = useMemo(
    () =>
      direction === "1p0" ? 1 / rawClosingLowerPrice : rawClosingUpperPrice,
    [direction, rawClosingLowerPrice, rawClosingUpperPrice],
  );

  // Direction-aware slider bounds
  const sliderMin = direction === "1p0" ? 1 / rawSliderMax : rawSliderMin;
  const sliderMax = direction === "1p0" ? 1 / rawSliderMin : rawSliderMax;

  const [lowerPrice, setLowerPrice] = useState<number>(initialLowerPrice);
  const [upperPrice, setUpperPrice] = useState<number>(initialUpperPrice);

  const [lowerInputValue, setLowerInputValue] = useState<string>(
    initialLowerPrice.toFixed(6),
  );
  const [upperInputValue, setUpperInputValue] = useState<string>(
    initialUpperPrice.toFixed(6),
  );

  const [lowerPercent, setLowerPercent] = useState<string>("");
  const [upperPercent, setUpperPercent] = useState<string>("");

  const priceToPercent = (displayPrice: number): string => {
    if (!currentPrice || currentPrice <= 0) return "0.00";
    return ((displayPrice / currentPrice - 1) * 100).toFixed(2);
  };

  // When direction changes, recompute display prices (invert + swap for 1p0)
  useEffect(() => {
    const newLower =
      direction === "1p0" ? 1 / rawClosingUpperPrice : rawClosingLowerPrice;
    const newUpper =
      direction === "1p0" ? 1 / rawClosingLowerPrice : rawClosingUpperPrice;
    setLowerPrice(newLower);
    setUpperPrice(newUpper);
    setLowerInputValue(newLower.toFixed(6));
    setUpperInputValue(newUpper.toFixed(6));
    setLowerPercent(priceToPercent(newLower));
    setUpperPercent(priceToPercent(newUpper));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, rawClosingLowerPrice, rawClosingUpperPrice]);

  const priceRange = sliderMax - sliderMin || 1;

  const lowerSliderValue = Math.round(
    ((lowerPrice - sliderMin) / priceRange) * 1000,
  );
  const upperSliderValue = Math.round(
    ((upperPrice - sliderMin) / priceRange) * 1000,
  );

  const handleSliderChange = (values: number[]) => {
    const newLower = sliderMin + (values[0] / 1000) * priceRange;
    const newUpper = sliderMin + (values[1] / 1000) * priceRange;
    setLowerPrice(newLower);
    setUpperPrice(newUpper);
    setLowerInputValue(newLower.toFixed(6));
    setUpperInputValue(newUpper.toFixed(6));
    setLowerPercent(priceToPercent(newLower));
    setUpperPercent(priceToPercent(newUpper));
  };

  // --- price mode handlers ---

  const handleLowerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateNumericInput(value)) {
      setLowerInputValue(value);
      const num = parseFloat(value);
      if (!isNaN(num)) {
        const clamped = Math.min(Math.max(num, sliderMin), upperPrice);
        setLowerPrice(clamped);
      }
    }
  };

  const handleUpperInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateNumericInput(value)) {
      setUpperInputValue(value);
      const num = parseFloat(value);
      if (!isNaN(num)) {
        const clamped = Math.max(Math.min(num, sliderMax), lowerPrice);
        setUpperPrice(clamped);
      }
    }
  };

  const handlePriceBlur = (isMin: boolean) => {
    const price = isMin ? lowerPrice : upperPrice;
    const formatted = price.toFixed(6);
    if (isMin) {
      setLowerInputValue(formatted);
      setLowerPercent(priceToPercent(price));
    } else {
      setUpperInputValue(formatted);
      setUpperPercent(priceToPercent(price));
    }
  };

  // --- percent mode handlers ---

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
    if (!currentPrice || currentPrice <= 0) return;

    const targetPrice = currentPrice * (1 + percent / 100);

    if (isMin) {
      const clamped = Math.min(Math.max(targetPrice, sliderMin), upperPrice);
      setLowerPrice(clamped);
      setLowerInputValue(clamped.toFixed(6));
      setLowerPercent(priceToPercent(clamped));
    } else {
      const clamped = Math.max(Math.min(targetPrice, sliderMax), lowerPrice);
      setUpperPrice(clamped);
      setUpperInputValue(clamped.toFixed(6));
      setUpperPercent(priceToPercent(clamped));
    }
  };

  const toggleInputMode = () => {
    if (inputMode === "price") {
      setLowerPercent(priceToPercent(lowerPrice));
      setUpperPercent(priceToPercent(upperPrice));
      setInputMode("percent");
    } else {
      setInputMode("price");
    }
  };

  // --- save ---

  const updateBuffer = async () => {
    // Convert display prices back to raw (0p1) before deriving ticks
    const rawLower = direction === "1p0" ? 1 / upperPrice : lowerPrice;
    const rawUpper = direction === "1p0" ? 1 / lowerPrice : upperPrice;
    const closingLowerTick = priceToTick(rawLower, decimals0, decimals1);
    const closingUpperTick = priceToTick(rawUpper, decimals0, decimals1);

    setIsPending(true);

    const loadingToast = toast.loading("Updating buffer range...");
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/positions/${position.positionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            closingUpperTick,
            closingLowerTick,
            ownerAddress: address,
          }),
        },
      );
      const result = await response.json();
      toast.success("Buffer range updated successfully!");
      refetch();
      return result;
    } catch (error) {
      toast.error("Failed to update buffer range");
      console.error(error);
    } finally {
      toast.dismiss(loadingToast);
      setIsPending(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Current Price</span>
          <LazyLoader isLoading={isPriceLoading} className="min-w-24 min-h-5">
            <span className="text-sm font-medium">{formattedCurrentPrice}</span>
          </LazyLoader>
        </div>
        <Tabs
          defaultValue="0p1"
          onValueChange={(value) => setDirection(value as "0p1" | "1p0")}
        >
          <TabsList>
            <TabsTrigger value="0p1">{`${token0Info?.symbol}/${token1Info?.symbol}`}</TabsTrigger>
            <TabsTrigger value="1p0">{`${token1Info?.symbol}/${token0Info?.symbol}`}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">
            Lower Price
          </Label>
          <div className="relative">
            <Input
              className="w-full text-left pr-10"
              placeholder={inputMode === "price" ? "0.000000" : "e.g. -5"}
              value={inputMode === "price" ? lowerInputValue : lowerPercent}
              onChange={
                inputMode === "price"
                  ? handleLowerInputChange
                  : (e) => handlePercentChange(e.target.value, setLowerPercent)
              }
              onBlur={
                inputMode === "price"
                  ? () => handlePriceBlur(true)
                  : () => handlePercentChangeComplete(lowerPercent, true)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputMode === "price"
                    ? handlePriceBlur(true)
                    : handlePercentChangeComplete(lowerPercent, true);
                }
              }}
            />
            <InputModeToggle mode={inputMode} onClick={toggleInputMode} />
          </div>
          <MidPriceDistance
            price={lowerPrice}
            midPrice={currentPrice}
            mode={inputMode}
          />
        </div>
        <Minus className="shrink-0 text-muted-foreground" size={16} />
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">
            Upper Price
          </Label>
          <div className="relative">
            <Input
              className="w-full text-left pr-10"
              placeholder={inputMode === "price" ? "0.000000" : "e.g. 5"}
              value={inputMode === "price" ? upperInputValue : upperPercent}
              onChange={
                inputMode === "price"
                  ? handleUpperInputChange
                  : (e) => handlePercentChange(e.target.value, setUpperPercent)
              }
              onBlur={
                inputMode === "price"
                  ? () => handlePriceBlur(false)
                  : () => handlePercentChangeComplete(upperPercent, false)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputMode === "price"
                    ? handlePriceBlur(false)
                    : handlePercentChangeComplete(upperPercent, false);
                }
              }}
            />
            <InputModeToggle mode={inputMode} onClick={toggleInputMode} />
          </div>
          <MidPriceDistance
            price={upperPrice}
            midPrice={currentPrice}
            mode={inputMode}
          />
        </div>
      </div>
      <div className="mb-3 mt-5">
        <Slider
          min={0}
          max={1000}
          step={1}
          value={[lowerSliderValue, upperSliderValue]}
          onValueChange={handleSliderChange}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {sliderMin.toFixed(6)}
          </span>
          <span className="text-xs text-muted-foreground">
            {sliderMax.toFixed(6)}
          </span>
        </div>
      </div>
      <Card className="shadow-none mb-3">
        <CardHeader>
          <CardTitle>New Closing Prices</CardTitle>
          <CardDescription>
            The updated closing price range for your position
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-16">Lower</span>
            <span>{initialLowerPrice.toFixed(6)}</span>
            <ArrowRight className="mx-1 shrink-0" size={14} />
            <span>{lowerPrice.toFixed(6)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-16">Upper</span>
            <span>{initialUpperPrice.toFixed(6)}</span>
            <ArrowRight className="mx-1 shrink-0" size={14} />
            <span>{upperPrice.toFixed(6)}</span>
          </div>
        </CardContent>
      </Card>
      <Button className="w-full" onClick={updateBuffer} disabled={isPending}>
        Update Buffer Range
      </Button>
    </section>
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
      <label className="text-xs text-muted-foreground">
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
    <label className="text-xs text-muted-foreground">
      {formatted} from current price
    </label>
  );
};
