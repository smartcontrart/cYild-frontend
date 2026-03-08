import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ERC20TokenInfo } from "@/utils/constants";
import { PositionInfo } from "@/utils/interfaces/misc";
import { tickToPrice, validateNumericInput } from "@/utils/functions";
import { Minus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export const ClosingPriceRange = ({
  token0Info,
  token1Info,
  position,
}: {
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  position: PositionInfo;
}) => {
  const decimals0 = token0Info?.decimals ?? 18;
  const decimals1 = token1Info?.decimals ?? 18;

  const initialLowerPrice = useMemo(
    () => tickToPrice(position.closingLowerTick, decimals0, decimals1),
    [position.closingLowerTick, decimals0, decimals1],
  );

  const initialUpperPrice = useMemo(
    () => tickToPrice(position.closingUpperTick, decimals0, decimals1),
    [position.closingUpperTick, decimals0, decimals1],
  );

  const sliderMin = useMemo(
    () => tickToPrice(position.lowerTick, decimals0, decimals1),
    [position.lowerTick, decimals0, decimals1],
  );

  const sliderMax = useMemo(
    () => tickToPrice(position.upperTick, decimals0, decimals1),
    [position.upperTick, decimals0, decimals1],
  );

  const [lowerPrice, setLowerPrice] = useState<number>(initialLowerPrice);
  const [upperPrice, setUpperPrice] = useState<number>(initialUpperPrice);

  const [lowerInputValue, setLowerInputValue] = useState<string>(
    initialLowerPrice.toFixed(6),
  );
  const [upperInputValue, setUpperInputValue] = useState<string>(
    initialUpperPrice.toFixed(6),
  );

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
  };

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

  return (
    <section>
      <Label className="block mb-3">Closing Price Range</Label>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">
            Lower Price
          </Label>
          <div className="relative">
            <Input
              className="w-full text-right pr-16"
              placeholder="0.000000"
              value={lowerInputValue}
              onChange={handleLowerInputChange}
              onBlur={() => {
                setLowerInputValue(lowerPrice.toFixed(6));
              }}
            />
          </div>
        </div>
        <Minus className="mt-5 shrink-0 text-muted-foreground" size={16} />
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">
            Upper Price
          </Label>
          <div className="relative">
            <Input
              className="w-full text-right pr-16"
              placeholder="0.000000"
              value={upperInputValue}
              onChange={handleUpperInputChange}
              onBlur={() => {
                setUpperInputValue(upperPrice.toFixed(6));
              }}
            />
          </div>
        </div>
      </div>
      <Slider
        min={0}
        max={1000}
        step={1}
        value={[lowerSliderValue, upperSliderValue]}
        onValueChange={handleSliderChange}
      />
      <div className="flex justify-between mt-1 mb-3">
        <span className="text-xs text-muted-foreground">
          {sliderMin.toFixed(6)}
        </span>
        <span className="text-xs text-muted-foreground">
          {sliderMax.toFixed(6)}
        </span>
      </div>
      <Button className="w-full">Update Buffer Range</Button>
    </section>
  );
};
