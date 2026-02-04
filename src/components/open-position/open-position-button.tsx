import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { ConfirmationDialog } from "../global/confirmation-dialog";
import { useOpenPositionButton } from "@/hooks/buttons/use-open-position-button";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import {
  ERC20TokenInfo,
  getManagerContractAddressFromChainId,
  SUPPORTED_CHAINS,
} from "@/utils/constants";
import { useContractExecution } from "@/hooks/contracts/write/use-contract-execution";
import { useErc20Approval } from "@/hooks/contracts/write/use-erc20-approval";
import { toast } from "sonner";
import { useErc20Allowance } from "@/hooks/contracts/read/use-erc20-allowance";
import { useConnection } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { getExplorerUrl, waitForAllowanceChange } from "@/utils/functions";
import { ToastLink } from "../global/toast-link";
import { wagmiConfig } from "../global/providers";
import { parseUnits } from "viem";
import { getBlock } from "@wagmi/core";
import { PositionManagerABI } from "@/abi/PositionManager";
import { useUserAccountingUnit } from "@/hooks/contracts/read/use-user-accounting-unit";
import { useRouter } from "next/router";

export const OpenPositionButton = () => {
  const {
    selectedPool,
    selectedToken0,
    selectedToken1,
    token0Amount,
    token1Amount,
    tickUpper,
    tickLower,
  } = useNewPositionStore();

  const router = useRouter();

  const { execute: executeContract, isLoading: isContractExecuting } =
    useContractExecution();
  const { approve, isLoading: isApprovalLoading } = useErc20Approval();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { address } = useConnection();

  const { accountingUnit } = useUserAccountingUnit();

  const buttonState = useOpenPositionButton();

  const token0 = selectedPool?.token0 as ERC20TokenInfo;
  const token1 = selectedPool?.token1 as ERC20TokenInfo;

  const { refetch: refetchToken0Allowance } = useErc20Allowance({
    token: token0,
    owner: address,
    spender: getManagerContractAddressFromChainId(
      token0?.chainId || SUPPORTED_CHAINS[0].chainId,
    ),
  });

  const { refetch: refetchToken1Allowance } = useErc20Allowance({
    token: token1,
    owner: address,
    spender: getManagerContractAddressFromChainId(
      token1?.chainId || SUPPORTED_CHAINS[0].chainId,
    ),
  });

  const approveToken0 = async () => {
    const loadingToast = toast.loading(
      `Executing ${token0.symbol} approval...`,
    );
    try {
      // Get current allowance before waiting for change
      const currentAllowanceResult = await refetchToken0Allowance();
      const initialAllowance = currentAllowanceResult.data || BigInt(0);
      const txHash = await approve({
        token: token0,
        spender: getManagerContractAddressFromChainId(
          token0?.chainId || SUPPORTED_CHAINS[0].chainId,
        ),
        amount: token0Amount,
      });
      // Wait for transaction confirmation
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      // Wait for allowance to change by polling
      await waitForAllowanceChange(async () => {
        const result = await refetchToken0Allowance();
        return result.data || BigInt(0);
      }, initialAllowance);
      const explorerUrl = getExplorerUrl(token0.chainId, txHash);
      toast.success(
        <ToastLink
          message={`${token0.symbol} approval successful!`}
          url={explorerUrl}
        />,
      );
    } catch (error: unknown) {
      toast.error(`${token0.symbol} approval failed`);
      console.error(`${token0.symbol} approval failed:`, error);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const approveToken1 = async () => {
    const loadingToast = toast.loading(
      `Executing ${token1.symbol} approval...`,
    );
    try {
      // Get current allowance before waiting for change
      const currentAllowanceResult = await refetchToken1Allowance();
      const initialAllowance = currentAllowanceResult.data || BigInt(0);
      const txHash = await approve({
        token: token1,
        spender: getManagerContractAddressFromChainId(
          token1?.chainId || SUPPORTED_CHAINS[0].chainId,
        ),
        amount: token1Amount,
      });
      // Wait for transaction confirmation
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      // Wait for allowance to change by polling
      await waitForAllowanceChange(async () => {
        const result = await refetchToken1Allowance();
        return result.data || BigInt(0);
      }, initialAllowance);
      const explorerUrl = getExplorerUrl(token1.chainId, txHash);
      toast.success(
        <ToastLink
          message={`${token1.symbol} approval successful!`}
          url={explorerUrl}
        />,
      );
    } catch (error: unknown) {
      toast.error(`${token1.symbol} approval failed`);
      console.error(`${token1.symbol} approval failed:`, error);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const openPosition = async () => {
    if (!selectedPool) return;

    const loadingToast = toast.loading("Creating position...");
    try {
      const block = await getBlock(wagmiConfig);
      const currentTimestamp = Number(block.timestamp);
      const deadlineTimestamp = currentTimestamp + 10 * 60; // Add 10 minutes in seconds

      const params = {
        _params: {
          token0: token0.address,
          token1: token1.address,
          fee: selectedPool.feeTier,
          tickUpper: tickUpper,
          tickLower: tickLower,
          amount0Desired: parseUnits(token0Amount, token0.decimals),
          amount1Desired: parseUnits(token1Amount, token1.decimals),
          amount0Min: 0,
          amount1Min: 0,
          recipient: getManagerContractAddressFromChainId(token0.chainId),
          deadline: deadlineTimestamp,
        },
      };

      const txHash = await executeContract({
        address: getManagerContractAddressFromChainId(token0.chainId),
        abi: PositionManagerABI as unknown as unknown[],
        functionName: "openPosition",
        args: [params._params, address],
        chainId: token0.chainId,
      });

      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      const explorerUrl = getExplorerUrl(token0.chainId, txHash);
      toast.success(() => (
        <ToastLink message="Position creation successful!" url={explorerUrl} />
      ));
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      toast.error("Position creation failed");
      console.log(error);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleClick = async () => {
    if (buttonState.action === "approve") {
      await approveToken0();
      await approveToken1();
    } else if (buttonState.action === "open") {
      // open position
      setIsDialogOpen(true);
    }
  };

  const showLoader = isContractExecuting || isApprovalLoading;

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <ConfirmationDialog
          title="Confirm your accounting unit for safety of your funds"
          description={`
              Your current accounting unit is ${accountingUnit?.symbol}.
              Please carefully check if pools exist for both
              ${accountingUnit?.symbol}/${selectedToken0?.symbol} and
              ${accountingUnit?.symbol}/${selectedToken1?.symbol}. If any
              of those pools does not exist, your position will not be protected
              by Yild fail-safe functions.
          `}
          action={openPosition}
          options={[
            {
              text: "Change accounting unit",
              action: () => {
                router.push("/settings");
              },
            },
          ]}
        />
      </Dialog>

      <Button
        disabled={buttonState.disabled || showLoader}
        onClick={handleClick}
      >
        {buttonState.text}
      </Button>
    </>
  );
};
