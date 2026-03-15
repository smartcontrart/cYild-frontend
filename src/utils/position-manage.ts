import { wagmiConfig } from "@/components/global/providers";
import { readContract } from "@wagmi/core";
import { getAddress, isAddress, zeroAddress } from "viem";
import PositionManagerABI from "@/abi/PositionManager";
import {
  ERC20TokenInfo,
  getManagerContractAddressFromChainId,
} from "./constants";
import { ERROR_CODES } from "./types";
import { getERC20TokenInfo } from "./erc20";

export const getPositionFundsInfo = async (
  tokenId: number,
  chainId: number,
) => {
  const res: any = await readContract(wagmiConfig, {
    abi: PositionManagerABI,
    address: getManagerContractAddressFromChainId(chainId),
    functionName: "getPositionInfo",
    args: [BigInt(tokenId)],
  });
  if (res.length !== 12) {
    console.log("Invalid data format from getPositionFundsInfo");
    return null;
  }
  const [
    token0Address,
    token1Address,
    token0Decimals,
    token1Decimals,
    feesEarned0,
    feesEarned1,
    protocolFee0,
    protocolFee1,
    principal0,
    principal1,
    ownerAccountingUnit,
    ownerAccountingUnitDecimals,
  ] = res;
  return {
    token0Address,
    token1Address,
    token0Decimals,
    token1Decimals,
    feesEarned0,
    feesEarned1,
    protocolFee0,
    protocolFee1,
    principal0,
    principal1,
    ownerAccountingUnit,
    ownerAccountingUnitDecimals,
  };
};

export const getAccountingUnitFromAddress = async (
  address: string,
  chainId: number,
) => {
  try {
    const res: any = await readContract(wagmiConfig, {
      abi: PositionManagerABI,
      address: getManagerContractAddressFromChainId(chainId),
      functionName: "accountingUnit",
      args: [getAddress(address)],
    });
    if (!res || !isAddress(res))
      return {
        name: "UNDEFINED",
        symbol: "UNDEFINED",
        decimals: 18,
        address: zeroAddress,
        chainId,
      } as ERC20TokenInfo;
    const tokenInfo = await getERC20TokenInfo(res, chainId);
    return tokenInfo;
  } catch (error) {
    return {
      name: "UNDEFINED",
      symbol: "UNDEFINED",
      decimals: 18,
      address: zeroAddress,
      chainId,
    } as ERC20TokenInfo;
  }
};

export const setAccountingUnit = async (
  unitAddress: string,
  chainId: number,
  walletClient?: any,
  publicClient?: any,
) => {
  if (!walletClient) {
    return {
      success: false,
      result:
        "Wallet client not available. Please ensure your wallet is connected.",
    };
  }

  if (!publicClient) {
    return {
      success: false,
      result: "Public client not available.",
    };
  }

  try {
    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: getManagerContractAddressFromChainId(chainId),
      abi: PositionManagerABI,
      functionName: "setAccountingUnit",
      args: [unitAddress],
    });

    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      success: true,
      result: hash,
    };
  } catch (error: any) {
    console.log(error);
    if (error?.message?.includes("User rejected") || error?.code === 4001) {
      return {
        success: false,
        result: ERROR_CODES.USER_REJECTED,
      };
    }
  }
  return {
    success: false,
    result: ERROR_CODES.UNKNOWN_ERROR,
  };
};
