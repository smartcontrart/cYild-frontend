import { useMemo } from "react";
import {
  getRequiredToken0AmountFromToken1Amount,
  getRequiredToken1AmountFromToken0Amount,
  roundDown,
  tickToPrice,
} from "@/utils/functions";

interface UseInputConversionsProps {
  token0Decimals: number;
  token1Decimals: number;
  token0Price?: number;
  token1Price?: number;
  tickLower: number;
  tickUpper: number;
}

interface ConversionResult {
  token0Amount: string;
  token1Amount: string;
}

export const useInputConversions = ({
  token0Decimals,
  token1Decimals,
  token0Price,
  token1Price,
  tickLower,
  tickUpper,
}: UseInputConversionsProps) => {
  const ratioInfo = useMemo(() => {
    const priceForTickLower = tickToPrice(
      tickLower,
      token0Decimals,
      token1Decimals,
    );
    const priceForTickUpper = tickToPrice(
      tickUpper,
      token0Decimals,
      token1Decimals,
    );
    const priceLower =
      priceForTickLower < priceForTickUpper
        ? priceForTickLower
        : priceForTickUpper;
    const priceUpper =
      priceForTickLower < priceForTickUpper
        ? priceForTickUpper
        : priceForTickLower;

    // Use the correct price ratio based on sorted tokens
    const priceRatio = Number(token0Price ?? 0) / Number(token1Price ?? 0);

    return {
      priceRatio,
      priceLower,
      priceUpper,
    };
  }, [
    token0Decimals,
    token1Decimals,
    token0Price,
    token1Price,
    tickLower,
    tickUpper,
  ]);

  const convertToken0ToToken1 = (token0Value: string): ConversionResult => {
    const { priceRatio, priceLower, priceUpper } = ratioInfo;
    const newToken1Amount = getRequiredToken1AmountFromToken0Amount(
      priceRatio,
      priceLower,
      priceUpper,
      Number(token0Value),
    );
    const roundedToken1Amount = roundDown(newToken1Amount, token1Decimals);

    return {
      token0Amount: token0Value,
      token1Amount: roundedToken1Amount.toString(),
    };
  };

  const convertToken1ToToken0 = (token1Value: string): ConversionResult => {
    const { priceRatio, priceLower, priceUpper } = ratioInfo;
    const newToken0Amount = getRequiredToken0AmountFromToken1Amount(
      priceRatio,
      priceLower,
      priceUpper,
      Number(token1Value),
    );
    const roundedToken0Amount = roundDown(newToken0Amount, token0Decimals);

    return {
      token0Amount: roundedToken0Amount.toString(),
      token1Amount: token1Value,
    };
  };

  return {
    convertToken0ToToken1,
    convertToken1ToToken0,
    ratioInfo,
  };
};
