import { ActionTriggerButton } from "./action-trigger-button";
import { useContractExecution } from "@/hooks/contracts/write/use-contract-execution";
import { getManagerContractAddressFromChainId } from "@/utils/constants";
import { getExplorerUrl, roundDown } from "@/utils/functions";
import { getPositionFundsInfo } from "@/utils/position-manage";
import PositionManagerABI from "@/abi/PositionManager";
import { fetchParaswapRoute } from "@/utils/requests";
import { X } from "lucide-react";
import { useRouter } from "next/router";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/components/global/providers";
import { toast } from "sonner";
import { ToastLink } from "@/components/global/toast-link";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { usePositions } from "@/hooks/api/use-positions";

export const ClosePositionButton = () => {
  const router = useRouter();
  const { id: positionId } = router.query;
  const { data: position } = useApiPositionInfo({
    positionId: positionId as string,
  });

  const { data: positionInfo } = useContractPositionInfo({
    positionTokenId: position?.activeTokenId as number,
    positionChainId: position?.chainId as number,
  });

  const { refetch: refetchPositions } = usePositions();

  const chainId = position?.chainId;

  const { execute: executeContract, isLoading: isContractExecuting } =
    useContractExecution();

  const closeClicked = async () => {
    const loadingToast = toast.loading(`Executing close position...`);
    try {
      if (!position || !positionInfo) {
        throw new Error("Position not found");
      }

      const userMaxSlippage = position?.maxSlippage as number;

      const fundsInfo = await getPositionFundsInfo(
        Number(position?.activeTokenId),
        chainId as number,
      );
      if (!fundsInfo) return false;
      const {
        token0: token0Address,
        token1: token1Address,
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
      } = positionInfo;

      let totalAmount0ToSwap = principal0 + feesEarned0 - protocolFee0;
      let totalAmount1ToSwap = principal1 + feesEarned1 - protocolFee1;

      let _pSwapData0 = "0x",
        _pSwapData1 = "0x",
        _minBuyAmount0 = BigInt(0),
        _minBuyAmount1 = BigInt(0);
      if (token0Address !== ownerAccountingUnit) {
        const {
          success: paraswapAPISuccess,
          data: paraswapData,
          destAmount,
        } = await fetchParaswapRoute(
          token0Address,
          token0Decimals,
          ownerAccountingUnit,
          ownerAccountingUnitDecimals,
          BigInt(totalAmount0ToSwap),
          chainId as number,
          userMaxSlippage,
          getManagerContractAddressFromChainId(chainId as number),
        );
        if (paraswapAPISuccess) {
          _pSwapData0 = paraswapData;
          _minBuyAmount0 = BigInt(
            roundDown(
              (Number(destAmount) * (10000 - userMaxSlippage)) / 10000,
              0,
            ),
          );
        }
      }
      if (token1Address !== ownerAccountingUnit) {
        const {
          success: paraswapAPISuccess,
          data: paraswapData,
          destAmount,
        } = await fetchParaswapRoute(
          token1Address,
          token1Decimals,
          ownerAccountingUnit,
          ownerAccountingUnitDecimals,
          BigInt(totalAmount1ToSwap),
          chainId as number,
          userMaxSlippage,
          getManagerContractAddressFromChainId(chainId as number),
        );
        if (paraswapAPISuccess) {
          _pSwapData1 = paraswapData;
          _minBuyAmount1 = BigInt(
            roundDown(
              (Number(destAmount) * (10000 - userMaxSlippage)) / 10000,
              0,
            ),
          );
        }
      }

      let params = [
        position.activeTokenId,
        _pSwapData0,
        _pSwapData1,
        _minBuyAmount0,
        _minBuyAmount1,
        userMaxSlippage,
        userMaxSlippage,
      ];

      const txHash = await executeContract({
        address: getManagerContractAddressFromChainId(chainId as number),
        abi: PositionManagerABI as unknown as unknown[],
        functionName: "closePosition",
        args: params,
        chainId: chainId,
      });

      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      const explorerUrl = getExplorerUrl(chainId as number, txHash);
      await refetchPositions();
      toast.success(() => (
        <ToastLink message="Position close successful!" url={explorerUrl} />
      ));
      router.push("/");
    } catch (error: unknown) {
      toast.error(`Close position failed`);
      console.error(`Close positiong failed:`, error);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <ActionTriggerButton
      text="Close Position"
      icon={<X />}
      variant="destructive"
      action={closeClicked}
      disabled={isContractExecuting}
    />
  );
};
