import { useMemo } from "react";
import { Token } from "@uniswap/sdk-core";
import {
  Pool,
  Position,
  nearestUsableTick,
  TickMath,
  TICK_SPACINGS,
  FeeAmount,
} from "@uniswap/v3-sdk";
import { roundDown } from "@/utils/functions";
import JSBI from "jsbi";
import { zeroAddress } from "viem";

interface UseInputConversionsProps {
  token0Decimals: number;
  token1Decimals: number;
  token0Price?: number;
  token1Price?: number;
  tickLower: number;
  tickUpper: number;
  token0Address: string;
  token1Address: string;
  chainId: number;
  feeTier: number;
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
  token0Address,
  token1Address,
  chainId,
  feeTier,
}: UseInputConversionsProps) => {
  const pool = useMemo(() => {
    if (
      !feeTier ||
      feeTier === 0 ||
      !token0Price ||
      !token1Price ||
      !chainId ||
      token0Address === zeroAddress ||
      token1Address === zeroAddress
    )
      return null;

    // Create Token instances
    const token0 = new Token(chainId, token0Address, token0Decimals);
    const token1 = new Token(chainId, token1Address, token1Decimals);

    // Calculate the current price ratio (price of token0 in terms of token1)
    const priceRatio = token0Price / token1Price;

    // Convert price to tick
    // Price = (1.0001)^tick * (10^(decimals0 - decimals1))
    const decimalsAdjustment = Math.pow(10, token0Decimals - token1Decimals);
    const rawPrice = priceRatio / decimalsAdjustment;
    const currentTick = Math.round(Math.log(rawPrice) / Math.log(1.0001));

    // Get tick spacing for the fee tier
    const tickSpacing = TICK_SPACINGS[feeTier as FeeAmount] || 60;
    const nearestTick = nearestUsableTick(currentTick, tickSpacing);

    // Calculate sqrtPriceX96 from tick
    const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(nearestTick);

    // Create Pool instance
    // We need liquidity, but for calculation purposes, we can use a placeholder
    // since Position.fromAmount0/fromAmount1 will calculate the needed liquidity
    const poolInstance = new Pool(
      token0,
      token1,
      feeTier,
      sqrtPriceX96.toString(),
      "0", // liquidity - not needed for our calculations
      nearestTick,
    );

    return poolInstance;
  }, [
    token0Decimals,
    token1Decimals,
    token0Price,
    token1Price,
    token0Address,
    token1Address,
    chainId,
    feeTier,
  ]);

  const convertToken0ToToken1 = (token0Value: string): ConversionResult => {
    if (!pool || !token0Value || token0Value === "" || token0Value === "0") {
      return {
        token0Amount: token0Value,
        token1Amount: "0",
      };
    }

    try {
      // Convert input to raw amount (considering decimals)
      const amount0 = JSBI.BigInt(
        Math.floor(parseFloat(token0Value) * Math.pow(10, token0Decimals)),
      );

      // Use SDK to calculate the position
      const position = Position.fromAmount0({
        pool,
        tickLower,
        tickUpper,
        amount0,
        useFullPrecision: false,
      });

      // Convert amount1 back to human-readable format
      const amount1Human = parseFloat(position.amount1.toExact());

      // If the value is unreasonably large (e.g. out-of-range position where the
      // SDK returns near-max uint256), treat the dependent token amount as 0.
      // An out-of-range position only requires one token, so 0 is correct here.
      if (!isFinite(amount1Human) || amount1Human > 1e15) {
        return {
          token0Amount: token0Value,
          token1Amount: "0",
        };
      }

      const roundedToken1Amount = roundDown(amount1Human, token1Decimals);

      return {
        token0Amount: token0Value,
        token1Amount: roundedToken1Amount.toString(),
      };
    } catch (error) {
      console.error("Error in convertToken0ToToken1:", error);
      return {
        token0Amount: token0Value,
        token1Amount: "0",
      };
    }
  };

  const convertToken1ToToken0 = (token1Value: string): ConversionResult => {
    if (!pool || !token1Value || token1Value === "" || token1Value === "0") {
      return {
        token0Amount: "0",
        token1Amount: token1Value,
      };
    }

    try {
      // Convert input to raw amount (considering decimals)
      const amount1 = JSBI.BigInt(
        Math.floor(parseFloat(token1Value) * Math.pow(10, token1Decimals)),
      );

      // Use SDK to calculate the position
      const position = Position.fromAmount1({
        pool,
        tickLower,
        tickUpper,
        amount1,
      });

      // Convert amount0 back to human-readable format
      const amount0Human = parseFloat(position.amount0.toExact());

      // If the value is unreasonably large (e.g. out-of-range position where the
      // SDK returns near-max uint256), treat the dependent token amount as 0.
      // An out-of-range position only requires one token, so 0 is correct here.
      if (!isFinite(amount0Human) || amount0Human > 1e15) {
        return {
          token0Amount: "0",
          token1Amount: token1Value,
        };
      }

      const roundedToken0Amount = roundDown(amount0Human, token0Decimals);

      return {
        token0Amount: roundedToken0Amount.toString(),
        token1Amount: token1Value,
      };
    } catch (error) {
      console.error("Error in convertToken1ToToken0:", error);
      return {
        token0Amount: "0",
        token1Amount: token1Value,
      };
    }
  };

  return {
    convertToken0ToToken1,
    convertToken1ToToken0,
    pool,
  };
};
