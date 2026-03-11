import { ERC20TokenInfo, getNetworkDataFromChainId } from "./constants";

export function getRequiredToken1AmountFromToken0Amount(
  currentPrice: number,
  priceLower: number,
  priceUpper: number,
  token0Amount: number,
): number {
  // Uniswap V3 formula: L = amount0 * (sqrt(P) * sqrt(Pb)) / (sqrt(Pb) - sqrt(P))
  // where P is current price, Pb is price upper, and we solve for amount1
  const sqrtPrice = Math.sqrt(currentPrice);
  const sqrtPriceLower = Math.sqrt(priceLower);
  const sqrtPriceUpper = Math.sqrt(priceUpper);

  // Calculate liquidity from token0 amount
  const liquidity =
    (token0Amount * (sqrtPrice * sqrtPriceUpper)) /
    (sqrtPriceUpper - sqrtPrice);

  // Calculate required token1 amount
  const token1Amount =
    (liquidity * (sqrtPrice - sqrtPriceLower)) / (sqrtPrice * sqrtPriceLower);

  return token1Amount;
}

export function getRequiredToken0AmountFromToken1Amount(
  currentPrice: number,
  priceLower: number,
  priceUpper: number,
  token1Amount: number,
): number {
  // Uniswap V3 formula: L = amount1 / (sqrt(P) - sqrt(Pa))
  // where P is current price, Pa is price lower, and we solve for amount0
  const sqrtPrice = Math.sqrt(currentPrice);
  const sqrtPriceLower = Math.sqrt(priceLower);
  const sqrtPriceUpper = Math.sqrt(priceUpper);

  // Calculate liquidity from token1 amount
  const liquidity = token1Amount / (sqrtPrice - sqrtPriceLower);

  // Calculate required token0 amount
  const token0Amount =
    (liquidity * (sqrtPriceUpper - sqrtPrice)) / (sqrtPrice * sqrtPriceUpper);

  return token0Amount;
}

/**
 * Converts a tick to a price
 * @param tick The tick to convert
 * @param decimalsToken0 Number of decimals for token0
 * @param decimalsToken1 Number of decimals for token1
 * @param invert If true, returns price of token1 in token0, otherwise returns price of token0 in token1
 * @returns The price corresponding to the tick
 */
export function tickToPrice(
  tick: number,
  decimalsToken0: number,
  decimalsToken1: number,
): any {
  const rawPrice = Math.pow(1.0001, tick);
  const decimalsAdjustment = Math.pow(10, decimalsToken0 - decimalsToken1);
  const adjustedPrice = rawPrice * decimalsAdjustment;

  return adjustedPrice;
}

/**
 * Converts a price to the nearest tick
 * @param price The price to convert
 * @returns The nearest tick for the given price
 */
export function priceToTick(
  price: number,
  decimalsToken0: number,
  decimalsToken1: number,
): number {
  const adjustedPrice = price;
  const decimalsAdjustment = Math.pow(10, decimalsToken0 - decimalsToken1);
  const rawPrice = adjustedPrice / decimalsAdjustment;
  return Math.round(Math.log(rawPrice) / Math.log(1.0001));
}

/**
 * Gets the tick spacing for a given fee tier
 * @param fee The fee tier (500 = 0.05%, 3000 = 0.3%, 10000 = 1%)
 * @returns The tick spacing for that fee tier
 */
export function getTickSpacing(fee: number | null): number {
  switch (fee) {
    case 100: // 0.01%
      return 1;
    case 500: // 0.05%
      return 10;
    case 3000: // 0.3%
      return 60;
    case 10000: // 1%
      return 200;
    default:
      return 10000;
  }
}

/**
 * Ensures a tick is spaced correctly for the given fee tier
 * @param tick The tick to check
 * @param fee The fee tier
 * @returns The nearest valid tick for that fee tier
 */
export function nearestValidTick(tick: number, fee: number | null): number {
  const tickSpacing = getTickSpacing(fee);
  return Math.round(tick / tickSpacing) * tickSpacing;
}

export const reArrangeTokensByContractAddress = (tokens: ERC20TokenInfo[]) => {
  if (tokens.length === 0) return [];
  const token0Address = tokens[0].address;
  const token1Address = tokens[1].address;
  if (!token0Address || !token1Address || token0Address < token1Address)
    return tokens;
  else {
    const result = [tokens[1], tokens[0]];
    return result;
  }
};

export const visualizeFeeTier = (feeTier: number) => {
  switch (feeTier) {
    case 100:
      return "0.01 %";
    case 500:
      return "0.05 %";
    case 1000:
      return "0.1 %";
    case 3000:
      return "0.3 %";
    case 5000:
      return "0.5 %";
    case 10000:
      return "1 %";
  }
  return "0.00%";
};

export const formatNumber = (
  value: number | string | undefined | null,
  precision: number = 2,
): string => {
  if (value == null) return String(value);

  let number: number;

  if (typeof value === "string") {
    number = Number(value);
    if (isNaN(number)) {
      return value;
    }
  } else {
    number = value;
  }

  const absNumber = Math.abs(number);

  if (absNumber >= 1_000_000_000_000) {
    return `${(number / 1_000_000_000_000).toFixed(precision)}T`;
  }
  if (absNumber >= 1_000_000_000) {
    return `${(number / 1_000_000_000).toFixed(precision)}B`;
  }
  if (absNumber >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(precision)}M`;
  }
  if (absNumber >= 1_000) {
    return `${(number / 1_000).toFixed(precision)}K`;
  }

  return number.toFixed(precision);
};

export const multiplyBigIntWithFloat = (big: bigint, num: number): bigint => {
  if (num === 0) return BigInt(0); // If multiplying by zero, return zero

  // Convert float to a string to determine decimal places
  const numStr = num.toExponential(); // Scientific notation (e.g., "2.34234e-8" or "3.456e+8")
  const [coefficientStr, exponentStr] = numStr.split("e");

  const coefficient = parseFloat(coefficientStr);
  const exponent = parseInt(exponentStr, 10);

  // Scale factor based on exponent (avoid using BigInt exponentiation)
  const scaleFactor = Math.pow(10, Math.max(0, -exponent + 20)); // Ensures precision
  const scaledNum = BigInt(Math.round(coefficient * scaleFactor)); // Convert to BigInt

  return (big * scaledNum) / BigInt(scaleFactor); // Multiply and adjust back
};

export const roundDown = (num: number, decimals: number): number => {
  // Handle edge cases
  if (num === 0) return 0;
  if (decimals < 0) decimals = 0;
  if (decimals > 18) decimals = 18; // Prevent excessive precision

  const factor = Math.pow(10, decimals);
  const rounded = Math.floor(num * factor) / factor;

  // Ensure we don't return numbers with more decimal places than requested
  return Number(rounded.toFixed(decimals));
};

export const formatForDisplay = (num: number, decimals: number): string => {
  if (num === 0) return "0";
  if (decimals < 0) decimals = 0;
  if (decimals > 18) decimals = 18;

  // For display, we want to show meaningful decimal places
  // but not excessive precision that clutters the UI
  const maxDisplayDecimals = Math.min(decimals, 6); // Cap at 6 decimal places for display

  return Number(num.toFixed(maxDisplayDecimals)).toString();
};

export const validateAndCleanNumber = (
  value: string,
  decimals: number,
): string => {
  // Remove any non-numeric characters except decimal point
  let cleaned = value.replace(/[^0-9.]/g, "");

  // Ensure only one decimal point
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = parts[0] + "." + parts.slice(1).join("");
  }

  // Limit decimal places
  if (parts.length === 2 && parts[1].length > decimals) {
    cleaned = parts[0] + "." + parts[1].substring(0, decimals);
  }

  return cleaned;
};

/**
 * Validates and filters numeric input, allowing intermediate states during typing
 * @param value - The input value to validate
 * @returns true if the input is valid, false otherwise
 */
export const validateNumericInput = (value: string): boolean => {
  // Allow empty string, numbers, and decimal points in valid positions
  const regex = /^(\d*\.?\d*)$/;

  // Check if the input matches the pattern or is empty
  if (value === "" || regex.test(value)) {
    // Additional validation to prevent multiple decimal points
    const decimalCount = (value.match(/\./g) || []).length;
    return decimalCount <= 1;
  }

  return false;
};

export const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// sleep method
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Returns the explorer URL for a block explorer based on the chain and hash
 * @param chain - The chain ID (e.g., 1 for Ethereum Mainnet, 8453 for Base)
 * @param hash - The address or transaction hash
 * @returns The full URL to the block explorer
 */
export const getExplorerUrl = (chain: number, hash: string) => {
  const networkData = getNetworkDataFromChainId(chain);
  const baseUrl = networkData.explorerURL;

  if (!hash) {
    return baseUrl;
  }

  // Typically, transaction hashes are 66 characters (0x + 64 hex chars)
  // Addresses are 42 characters (0x + 40 hex chars)
  if (hash.length >= 66) {
    return `${baseUrl}/tx/${hash}`;
  } else {
    return `${baseUrl}/address/${hash}`;
  }
};

/**
 * Waits for an allowance value to change by polling every interval
 * @param getAllowance - Function that returns a Promise<bigint> to fetch current allowance
 * @param initialAllowance - The initial allowance value to compare against
 * @param options - Configuration options
 * @param options.maxWaitTime - Maximum time to wait in milliseconds (default: 8000)
 * @param options.pollInterval - Interval between polls in milliseconds (default: 500)
 * @returns Promise<bigint> - The new allowance value, or throws if timeout reached
 */
export const waitForAllowanceChange = async (
  getAllowance: () => Promise<bigint>,
  initialAllowance: bigint,
  options: {
    maxWaitTime?: number;
    pollInterval?: number;
  } = {},
): Promise<bigint> => {
  const { maxWaitTime = 10000, pollInterval = 500 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const currentAllowance = await getAllowance();

      // If allowance has changed, return the new value
      if (currentAllowance !== initialAllowance) {
        return currentAllowance;
      }
    } catch (error) {
      console.warn("Error checking allowance:", error);
      // Continue polling even if there's an error
    }

    // Wait before next poll
    await sleep(pollInterval);
  }

  // Timeout reached - throw error
  throw new Error(`Allowance did not change within ${maxWaitTime}ms`);
};

export const formatValue = (value: number): string => {
  if (value === 0) return "0";
  if (value >= 1) return value.toFixed(4);

  // Count the number of leading zeros after the decimal point
  // e.g. 0.0005 → 3 leading zeros, 0.5 → 0 leading zeros
  const leadingZeros = Math.max(0, Math.ceil(-Math.log10(Math.abs(value))) - 1);
  // Show at least 3 significant digits past the leading zeros, with a minimum of 6 total decimal places
  const decimalPlaces = Math.max(leadingZeros + 3, 6);

  return value.toFixed(decimalPlaces);
};
