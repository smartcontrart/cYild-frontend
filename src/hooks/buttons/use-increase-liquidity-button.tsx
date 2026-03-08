import { useMemo } from "react";
import { useErc20Allowance } from "../contracts/read/use-erc20-allowance";
import { useErc20Balances } from "../contracts/read/use-erc20-balances";
import { useNewPositionStore } from "../store/use-new-position-store";
import { useConnection } from "wagmi";
import {
  ERC20TokenInfo,
  getManagerContractAddressFromChainId,
  SUPPORTED_CHAINS,
} from "@/utils/constants";
import { parseUnits } from "viem";

interface OpenPositionState {
  text: string;
  disabled: boolean;
  action: "approve" | "increase" | "switch" | null;
}

export const useIncreaseLiquidityButton = ({
  token0,
  token1,
  token0Amount,
  token1Amount,
}: {
  token0: ERC20TokenInfo;
  token1: ERC20TokenInfo;
  token0Amount: string;
  token1Amount: string;
}) => {
  const { address } = useConnection();

  const { balances } = useErc20Balances({
    tokens: [token0, token1].filter(Boolean),
    owner: address,
  });

  const { data: token0Allowance } = useErc20Allowance({
    token: token0,
    owner: address,
    spender: getManagerContractAddressFromChainId(
      token0?.chainId || SUPPORTED_CHAINS[0].chainId,
    ),
  });

  const { data: token1Allowance } = useErc20Allowance({
    token: token1,
    owner: address,
    spender: getManagerContractAddressFromChainId(
      token1?.chainId || SUPPORTED_CHAINS[0].chainId,
    ),
  });

  const buttonState = useMemo((): OpenPositionState => {
    if (!address) {
      return {
        text: `Connect Wallet`,
        disabled: true,
        action: null,
      };
    }

    // check if amounts are valid
    const token0Num = Number(token0Amount);
    const token1Num = Number(token1Amount);
    const hasValidAmounts =
      !isNaN(token0Num) &&
      !isNaN(token1Num) &&
      isFinite(token0Num) &&
      isFinite(token1Num) &&
      token1Amount !== "" &&
      token0Amount !== "" &&
      !token0Amount.toLowerCase().includes("e") &&
      !token1Amount.toLowerCase().includes("e");

    if (!hasValidAmounts) {
      return {
        text: "Invalid Amounts",
        disabled: true,
        action: null,
      };
    }

    // parse input amounts (safe to call now that we've validated the strings)
    const token0InputAmount = parseUnits(token0Amount, token0?.decimals || 18);
    const token1InputAmount = parseUnits(token1Amount, token1?.decimals || 18);

    // check if approvals are needed
    const token0NeedsApproval =
      token0Allowance !== undefined && token0InputAmount > token0Allowance;
    const token1NeedsApproval =
      token1Allowance !== undefined && token1InputAmount > token1Allowance;

    // check if user has sufficient token balances
    const token0Balance = balances[`${token0.symbol}-${token0.chainId}`];
    const token1Balance = balances[`${token1.symbol}-${token1.chainId}`];

    const hasInsufficientToken0 =
      token0Balance !== undefined && token0InputAmount > token0Balance;
    const hasInsufficientToken1 =
      token1Balance !== undefined && token1InputAmount > token1Balance;

    if (hasInsufficientToken0) {
      return {
        text: `Insufficient ${token0.symbol}`,
        disabled: true,
        action: null,
      };
    }

    if (hasInsufficientToken1) {
      return {
        text: `Insufficient ${token1.symbol}`,
        disabled: true,
        action: null,
      };
    }

    const needsApproval = token0NeedsApproval || token1NeedsApproval;

    if (needsApproval) {
      return {
        text: `Approve Tokens`,
        disabled: false,
        action: "approve",
      };
    }

    return {
      text: "Add Liquidity",
      disabled: false,
      action: "increase",
    };
  }, [
    address,
    token0?.decimals,
    token0Allowance,
    token0Amount,
    token1?.decimals,
    token1Allowance,
    token1Amount,
  ]);

  return buttonState;
};
