import { Address } from "viem";
import { ERC20TokenInfo } from "../constants";

export type PoolInfo = {
  token0: ERC20TokenInfo;
  token1: ERC20TokenInfo;
  poolAddress: Address;
  feeTier: number;
};

export type NetworkInfo = {
  chainId: number;
  name: string;
  secondaryRPC: string;
  explorerURL: string;
  image: string;
  positionManager: Address;
  liquidityMath: Address;
  uniswapFactory: Address;
  defaultTokens: Array<{
    name: string;
    symbol: string;
    address: Address;
    decimals: number;
    chainId: number;
    image?: string;
  }>;
};
