import { Address } from "viem";
import { ERC20TokenInfo } from "./constants";

export type PoolInfo = {
  token0: ERC20TokenInfo;
  token1: ERC20TokenInfo;
  poolAddress: Address;
  feeTier: number;
};
