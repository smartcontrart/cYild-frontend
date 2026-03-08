import { Button } from "@/components/ui/button";
import { useContractExecution } from "@/hooks/contracts/write/use-contract-execution";
import {
  ERC20TokenInfo,
  getLiquidityMathContractAddressFromChainId,
  getManagerContractAddressFromChainId,
} from "@/utils/constants";
import { getExplorerUrl, roundDown } from "@/utils/functions";
import { getPositionFundsInfo } from "@/utils/position-manage";
import PositionManagerABI from "@/abi/PositionManager";
import { fetchParaswapRoute } from "@/utils/requests";
import { BadgeDollarSignIcon, X } from "lucide-react";
import { useRouter } from "next/router";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/components/global/providers";
import { toast } from "sonner";
import { ToastLink } from "@/components/global/toast-link";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { usePositions } from "@/hooks/api/use-positions";
import { readContract } from "viem/actions";
import LiquidityMathABI from "@/abi/LiquidityMath";
import { useTokenPrice } from "@/hooks/use-token-price";
import { formatUnits, zeroAddress } from "viem";
import { base } from "viem/chains";
import { PositionInfo } from "@/utils/interfaces/misc";

export const CompoundFeesButton = ({
  position,
  token0Info,
  token1Info,
}: {
  position: PositionInfo;
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
}) => {
  const router = useRouter();

  const { data: positionInfo } = useContractPositionInfo({
    positionTokenId: position?.activeTokenId as number,
    positionChainId: position?.chainId as number,
  });

  const { refetch: refetchPositions } = usePositions();

  const chainId = position?.chainId;

  const { execute: executeContract, isLoading: isContractExecuting } =
    useContractExecution();

  const { data: token0Price, isLoading: isLoadingToken0Price } = useTokenPrice(
    token0Info?.address || zeroAddress,
    position?.chainId || base.id,
  );
  const { data: token1Price, isLoading: isLoadingToken1Price } = useTokenPrice(
    token1Info?.address || zeroAddress,
    position?.chainId || base.id,
  );

  const token0FeesEarned = formatUnits(
    positionInfo?.feesEarned0 || BigInt(0),
    token0Info?.decimals || 18,
  );

  const token1FeesEarned = formatUnits(
    positionInfo?.feesEarned1 || BigInt(0),
    token1Info?.decimals || 18,
  );

  const token0Value = Number(token0FeesEarned) * Number(token0Price);
  const token1Value = Number(token1FeesEarned) * Number(token1Price);
  const totalFeesEarned = Number(token0Value) + Number(token1Value);

  const compoundClicked = async () => {
    const loadingToast = toast.loading(`Executing compound fees...`);
    try {
      if (!position || !positionInfo) {
        throw new Error("Position not found");
      }

      const userMaxSlippage = position.maxSlippage as number;
      const token0MaxSlippage = position.maxSlippage as number;
      const token1MaxSlippage = position.maxSlippage as number;

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
        ownerAccountingUnit,
        ownerAccountingUnitDecimals,
      } = positionInfo;

      const availableAmount0: bigint = feesEarned0 - protocolFee0;
      const availableAmount1: bigint = feesEarned1 - protocolFee1;
      console.log(positionInfo);

      const rebalanceData: any = await readContract(wagmiConfig.getClient(), {
        abi: LiquidityMathABI,
        address: getLiquidityMathContractAddressFromChainId(position.chainId),
        functionName: "calculateRebalanceData",
        args: [
          position.poolAddress,
          position.lowerTick,
          position.upperTick,
          availableAmount0,
          availableAmount1,
        ],
      });

      const { swapAmount0, swapAmount1, sell0For1 } = rebalanceData;

      let _pSwapData0 = "0x",
        _pSwapData1 = "0x",
        _minBuyAmount0 = BigInt(0),
        _minBuyAmount1 = BigInt(0);
      if (sell0For1) {
        const {
          success: paraswapAPISuccess,
          data: paraswapData,
          destAmount,
        } = await fetchParaswapRoute(
          token0Address,
          token0Decimals,
          ownerAccountingUnit,
          ownerAccountingUnitDecimals,
          swapAmount0,
          chainId as number,
          token0MaxSlippage,
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
      } else {
        const {
          success: paraswapAPISuccess,
          data: paraswapData,
          destAmount,
        } = await fetchParaswapRoute(
          token1Address,
          token1Decimals,
          ownerAccountingUnit,
          ownerAccountingUnitDecimals,
          swapAmount1,
          chainId as number,
          token1MaxSlippage,
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
        token0MaxSlippage,
        token1MaxSlippage,
      ];

      const txHash = await executeContract({
        address: getManagerContractAddressFromChainId(chainId as number),
        abi: PositionManagerABI as unknown as unknown[],
        functionName: "compoundPosition",
        args: params,
        chainId: chainId,
      });

      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      const explorerUrl = getExplorerUrl(chainId as number, txHash);
      await refetchPositions();
      toast.success(() => (
        <ToastLink message="Compound fees successful!" url={explorerUrl} />
      ));
      router.push("/");
    } catch (error: unknown) {
      toast.error(`Compound fees failed`);
      console.error(`Compound fees failed:`, error);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const isDisabled = isContractExecuting || totalFeesEarned < 1;

  return (
    <Button onClick={compoundClicked} disabled={isDisabled}>
      <BadgeDollarSignIcon />
      Compound Fees
    </Button>
  );
};
