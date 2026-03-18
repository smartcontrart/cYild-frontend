import { PositionInfo } from "@/utils/interfaces/misc";
import { ERC20TokenInfo } from "@/utils/constants";
import { tickToPrice } from "@/utils/functions";
import { useTokenPrice } from "@/hooks/use-token-price";
import { zeroAddress } from "viem";
import { base } from "viem/chains";

/**
 * Determines the number of fraction digits to display based on the value size.
 * Returns 2 for values >= 1, and 5 for smaller values.
 */
const getFractionDigits = (value: number): number => {
  if (value >= 1) {
    return 2;
  }
  return 5;
};

export const RangeIndicator = ({
  position,
  token0Info,
  token1Info,
  withText = true,
}: {
  position: PositionInfo;
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  withText?: boolean;
}) => {
  const direction = "0p1";

  const { data: token0Price } = useTokenPrice(
    token0Info?.address || zeroAddress,
    position?.chainId || base.id,
  );
  const { data: token1Price } = useTokenPrice(
    token1Info?.address || zeroAddress,
    position?.chainId || base.id,
  );

  // If data is not loaded yet, show loading state
  if (
    withText &&
    (!token0Info ||
      !token1Info ||
      token0Price === undefined ||
      token1Price === undefined)
  ) {
    return (
      <div className="mt-5">
        <section className="w-full flex justify-between text-muted-foreground text-xs mb-2">
          <span>Min: ...</span>
          <span>Current: ...</span>
          <span>Max: ...</span>
        </section>
        <div className="w-full h-2 bg-primary/20 rounded-full relative" />
        <div className="text-xs text-muted-foreground text-center mt-1">
          Loading...
        </div>
      </div>
    );
  }

  // Calculate prices from ticks
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

  const closingLowerPrice = tickToPrice(
    position?.closingLowerTick || 0,
    token0Info?.decimals || 18,
    token1Info?.decimals || 18,
  );

  const closingUpperPrice = tickToPrice(
    position?.closingUpperTick || 0,
    token0Info?.decimals || 18,
    token1Info?.decimals || 18,
  );

  // Adjust prices based on direction
  const adjustedLowerPrice = direction === "0p1" ? lowerPrice : 1 / lowerPrice;

  const adjustedUpperPrice = direction === "0p1" ? upperPrice : 1 / upperPrice;

  const adjustedClosingLowerPrice =
    direction === "0p1" ? closingLowerPrice : 1 / closingLowerPrice;

  const adjustedClosingUpperPrice =
    direction === "0p1" ? closingUpperPrice : 1 / closingUpperPrice;

  const currentPrice =
    direction === "0p1"
      ? Number(token0Price ?? 0) / Number(token1Price ?? 1)
      : Number(token1Price ?? 0) / Number(token0Price ?? 1);

  // Format prices
  // const formattedlowerprice = number(adjustedlowerprice).tolocalestring(
  //   undefined,
  //   {
  //     minimumfractiondigits: getfractiondigits(adjustedlowerprice),
  //     maximumfractiondigits: getfractiondigits(adjustedlowerprice),
  //   },
  // );

  // const formattedupperprice = number(adjustedupperprice).tolocalestring(
  //   undefined,
  //   {
  //     minimumfractiondigits: getfractiondigits(adjustedupperprice),
  //     maximumfractiondigits: getfractiondigits(adjustedupperprice),
  //   },
  // );

  const formattedClosingLowerPrice = Number(
    adjustedClosingLowerPrice,
  ).toLocaleString(undefined, {
    minimumFractionDigits: getFractionDigits(adjustedClosingLowerPrice),
    maximumFractionDigits: getFractionDigits(adjustedClosingLowerPrice),
  });

  const formattedClosingUpperPrice = Number(
    adjustedClosingUpperPrice,
  ).toLocaleString(undefined, {
    minimumFractionDigits: getFractionDigits(adjustedClosingUpperPrice),
    maximumFractionDigits: getFractionDigits(adjustedClosingUpperPrice),
  });

  const formattedCurrentPrice = Number(currentPrice).toLocaleString(undefined, {
    minimumFractionDigits: getFractionDigits(currentPrice),
    maximumFractionDigits: getFractionDigits(currentPrice),
  });

  // Calculate positions for visual representation
  const totalRange = adjustedClosingUpperPrice - adjustedClosingLowerPrice;
  const concentratedStartPercent =
    ((adjustedLowerPrice - adjustedClosingLowerPrice) / totalRange) * 100;
  const concentratedEndPercent =
    ((adjustedUpperPrice - adjustedClosingLowerPrice) / totalRange) * 100;
  const currentPricePercent =
    ((currentPrice - adjustedClosingLowerPrice) / totalRange) * 100;

  // Clamp values between 0 and 100
  const clampedConcentratedStart = Math.max(
    0,
    Math.min(100, concentratedStartPercent),
  );
  const clampedConcentratedEnd = Math.max(
    0,
    Math.min(100, concentratedEndPercent),
  );
  const clampedCurrentPrice = Math.max(0, Math.min(100, currentPricePercent));

  return (
    <div className="mt-5">
      {withText && (
        <section className="w-full flex justify-between text-muted-foreground text-xs mb-2">
          <span>Min: {formattedClosingLowerPrice}</span>
          <span>Current: {formattedCurrentPrice}</span>
          <span>Max: {formattedClosingUpperPrice}</span>
        </section>
      )}
      <div className="w-full h-2 bg-muted rounded-full relative">
        {/* Concentrated range colored bar */}
        <div
          className="h-full bg-primary/30 rounded-full absolute"
          style={{
            left: `${clampedConcentratedStart}%`,
            right: `${100 - clampedConcentratedEnd}%`,
          }}
        />
        {/* Current price indicator line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary"
          style={{
            left: `${clampedCurrentPrice}%`,
          }}
        />
      </div>
    </div>
  );
};
