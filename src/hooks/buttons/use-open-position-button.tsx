import { useMemo } from "react";
import { useErc20Allowance } from "../contracts/read/use-erc20-allowance";
import { useNewPositionStore } from "../store/use-new-position-store";
import { useConnection } from "wagmi";
import {
  ERC20TokenInfo,
  getManagerContractAddressFromChainId,
  SUPPORTED_CHAINS,
} from "@/utils/constants";
import { Address, parseUnits } from "viem";
import { useTokenBalance } from "../use-token-balance";
import { base } from "viem/chains";

interface OpenPositionState {
  text: string;
  disabled: boolean;
  action: "approve" | "open" | "switch" | null;
}

export const useOpenPositionButton = () => {
  const {
    selectedPool,
    token0Amount,
    token1Amount,
    selectedToken0,
    selectedToken1,
  } = useNewPositionStore();
  const { address, chainId } = useConnection();

  const token0 = selectedPool?.token0;
  const token1 = selectedPool?.token1;

  const { data: token0Balance } = useTokenBalance(
    address || "",
    token0?.address as Address,
    chainId || base.id,
  );

  const { data: token1Balance } = useTokenBalance(
    address || "",
    token1?.address as Address,
    chainId || base.id,
  );

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
    const hasValidAmounts =
      !isNaN(Number(token0Amount)) &&
      !isNaN(Number(token1Amount)) &&
      token1Amount !== "" &&
      token0Amount !== "" &&
      token1Amount !== "0" &&
      token1Amount !== "0";

    const hasValidTokens =
      selectedToken0 !== undefined && selectedToken1 !== undefined;

    // parse input amounts
    const token0InputAmount = parseUnits(token0Amount, token0?.decimals || 18);
    const token1InputAmount = parseUnits(token1Amount, token1?.decimals || 18);

    // check if balances are sufficient
    const token0InsufficientBalance =
      token0InputAmount > BigInt(0) &&
      token0InputAmount > (token0Balance ?? BigInt(0));
    const token1InsufficientBalance =
      token1InputAmount > BigInt(0) &&
      token1InputAmount > (token1Balance ?? BigInt(0));

    // check if approvals are needed
    const token0NeedsApproval =
      token0Allowance !== undefined && token0InputAmount > token0Allowance;
    const token1NeedsApproval =
      token1Allowance !== undefined && token1InputAmount > token1Allowance;

    const needsApproval = token0NeedsApproval || token1NeedsApproval;

    if (!hasValidTokens) {
      return {
        text: "Select Tokens",
        disabled: true,
        action: null,
      };
    }

    if (!selectedPool) {
      return {
        text: "Select Pool",
        disabled: true,
        action: null,
      };
    }

    if (!hasValidAmounts) {
      return {
        text: "Invalid Amounts",
        disabled: true,
        action: null,
      };
    }

    if (token0InsufficientBalance) {
      return {
        text: `Insufficient ${token0?.symbol} balance`,
        disabled: true,
        action: null,
      };
    }

    if (token1InsufficientBalance) {
      return {
        text: `Insufficient ${token1?.symbol} balance`,
        disabled: true,
        action: null,
      };
    }

    if (needsApproval) {
      return {
        text: `Approve Tokens`,
        disabled: false,
        action: "approve",
      };
    }

    return {
      text: "Create Position",
      disabled: false,
      action: "open",
    };
  }, [
    address,
    selectedPool,
    selectedToken0,
    selectedToken1,
    token0?.decimals,
    token0?.symbol,
    token0Allowance,
    token0Amount,
    token0Balance,
    token1?.decimals,
    token1?.symbol,
    token1Allowance,
    token1Amount,
    token1Balance,
  ]);

  return buttonState;
};
