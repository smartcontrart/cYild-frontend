import { Address } from "viem";
import { ERC20TokenInfo } from "../constants";

export type GetPositionInfoReturnType = {
  token0: Address;
  token1: Address;
  token0Decimals: number;
  token1Decimals: number;
  feesEarned0: bigint;
  feesEarned1: bigint;
  protocolFee0: bigint;
  protocolFee1: bigint;
  principal0: bigint;
  principal1: bigint;
  ownerAccountingUnit: Address;
  ownerAccountingUnitDecimals: number;
};

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

export type PositionInfo = {
  id: string;
  activeTokenId: number;
  burnedTokenIds: number[];
  positionId: number;
  poolAddress: Address;
  initialCapitalToken0: string;
  initialCapitalToken1: string;
  totalFeesToken0: string;
  totalFeesToken1: string;
  status: string;
  upperTick: number;
  lowerTick: number;
  closingUpperTick: number;
  closingLowerTick: number;
  lowerRangeDistribution: number;
  upperRangeDistribution: number;
  chainId: number;
  maxSlippage: number;
  ownerAddress: Address;
  createdAt: string;
  updatedAt: string;
};
