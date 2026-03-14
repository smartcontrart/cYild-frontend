import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useContractExecution } from "@/hooks/contracts/write/use-contract-execution";
import {
  ERC20TokenInfo,
  getManagerContractAddressFromChainId,
} from "@/utils/constants";
import { PositionInfo } from "@/utils/interfaces/misc";
import { ArrowRight, Minus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PositionManagerABI from "@/abi/PositionManager";
import { waitForTransactionReceipt } from "@wagmi/core";
import {
  getExplorerUrl,
  roundDown,
  validateNumericInput,
} from "@/utils/functions";
import { wagmiConfig } from "@/components/global/providers";
import { ToastLink } from "@/components/global/toast-link";
import { getPositionFundsInfo } from "@/utils/position-manage";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { fetchParaswapRoute } from "@/utils/requests";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { formatUnits, zeroAddress } from "viem";
import { useTokenPrice } from "@/hooks/use-token-price";
import { base } from "viem/chains";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActionTriggerButton } from "./action-trigger-button";

export const DecreaseLiquidityButton = ({
  token0Info,
  token1Info,
  position,
}: {
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  position: PositionInfo;
}) => {
  const { execute: executeContract, isLoading: isContractExecuting } =
    useContractExecution();
  const { data: positionInfo } = useContractPositionInfo({
    positionTokenId: position?.activeTokenId as number,
    positionChainId: position?.chainId as number,
  });

  const [selectedPercentage, setSelectedPercentage] = useState<number>(25);
  const [inputValue, setInputValue] = useState<string>("25");

  const token0Amount = formatUnits(
    positionInfo?.principal0 || BigInt(0),
    positionInfo?.token0Decimals || 18,
  );

  const token1Amount = formatUnits(
    positionInfo?.principal1 || BigInt(0),
    positionInfo?.token1Decimals || 18,
  );

  const { data: token0Price } = useTokenPrice(
    token0Info?.address || zeroAddress,
    position?.chainId || base.id,
  );
  const { data: token1Price } = useTokenPrice(
    token1Info?.address || zeroAddress,
    position?.chainId || base.id,
  );

  const token0Value = Number(token0Amount) * Number(token0Price);
  const token1Value = Number(token1Amount) * Number(token1Price);
  const positionValue = token0Value + token1Value;

  const updatedPositionValue =
    positionValue - positionValue * (selectedPercentage / 100);

  const decreaseClicked = async () => {
    const loadingToast = toast.loading(`Executing decrease liquidity...`);
    try {
      if (!token0Info || !token1Info || !positionInfo) {
        throw new Error("Tokens not found");
      }

      const amountInBPS = Math.round(roundDown(selectedPercentage * 100, 0));

      const userMaxSlippage = position?.maxSlippage as number;

      const fundsInfo = await getPositionFundsInfo(
        Number(position?.activeTokenId),
        position.chainId as number,
      );
      if (!fundsInfo) return false;
      const {
        token0: token0Address,
        token1: token1Address,
        token0Decimals,
        token1Decimals,
        principal0,
        principal1,
        ownerAccountingUnit,
        ownerAccountingUnitDecimals,
      } = positionInfo;

      let _pSwapData0 = "0x",
        _pSwapData1 = "0x",
        minAmount0 = 0,
        minAmount1 = 0;
      if (token0Address !== ownerAccountingUnit) {
        const totalAmount0ToSwap = roundDown(
          (parseInt(principal0.toString()) / 10000) * amountInBPS,
          0,
        );
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
          position.chainId,
          userMaxSlippage,
          getManagerContractAddressFromChainId(position.chainId),
        );
        minAmount0 = Math.round(
          roundDown(
            Number(destAmount) * ((10000 - userMaxSlippage) / 10000),
            0,
          ),
        );
        if (paraswapAPISuccess) {
          _pSwapData0 = paraswapData;
        }
      }
      if (token1Address !== ownerAccountingUnit) {
        const totalAmount1ToSwap = roundDown(
          (parseInt(principal1.toString()) / 10000) * amountInBPS,
          0,
        );
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
          position.chainId,
          userMaxSlippage,
          getManagerContractAddressFromChainId(position.chainId),
        );
        minAmount1 = Math.round(
          roundDown(
            Number(destAmount) * ((10000 - userMaxSlippage) / 10000),
            0,
          ),
        );

        if (paraswapAPISuccess) {
          _pSwapData1 = paraswapData;
        }
      }

      let params = [
        position.activeTokenId,
        amountInBPS,
        _pSwapData0,
        _pSwapData1,
        minAmount0,
        minAmount1,
        userMaxSlippage,
        userMaxSlippage,
      ];

      const txHash = await executeContract({
        address: getManagerContractAddressFromChainId(
          position.chainId as number,
        ),
        abi: PositionManagerABI as unknown as unknown[],
        functionName: "decreaseLiquidity",
        args: params,
        chainId: position.chainId,
      });
      // Wait for transaction confirmation
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      const explorerUrl = getExplorerUrl(position.chainId, txHash);
      toast.success(
        <ToastLink
          message={`Decrease liquidity successful!`}
          url={explorerUrl}
        />,
      );
    } catch (error) {
      toast.error(`Decrease liquidity failed`);
      console.error(`Decrease liquidity failed:`, error);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const isDisabled = isContractExecuting;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ActionTriggerButton text="Decrease Liquidity" icon={<Minus />} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Liquidity</DialogTitle>
          <DialogDescription>
            Remove tokens from your position
          </DialogDescription>
        </DialogHeader>
        <section>
          <section className="flex items-center justify-between mb-3">
            <Label className="block">Percentage to Remove</Label>
            <div className="w-20 flex items-center relative">
              <Input
                className="w-20 text-right pr-7"
                placeholder="0"
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (validateNumericInput(value)) {
                    setInputValue(value);
                    const numValue = parseFloat(value);
                    if (numValue > 100) {
                      setSelectedPercentage(100);
                    } else if (numValue < 1) {
                      setSelectedPercentage(1);
                    } else if (isNaN(numValue)) {
                      setSelectedPercentage(1);
                    } else {
                      setSelectedPercentage(Math.round(numValue));
                    }
                  }
                }}
              />
              <span className="absolute right-2 text-sm text-muted-foreground">
                %
              </span>
            </div>
          </section>
          <Slider
            min={1}
            max={100}
            value={[selectedPercentage]}
            onValueChange={(value) => {
              setSelectedPercentage(value[0]);
              setInputValue(value[0].toString());
            }}
            className="mb-5"
          />
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>New Amount</CardTitle>
              <CardDescription>
                The value of what your new position will be
              </CardDescription>
            </CardHeader>
            <CardContent className="flex text-2xl items-center">
              ${positionValue.toFixed(2)} <ArrowRight className="mx-3" /> $
              {updatedPositionValue.toFixed(2)}
            </CardContent>
          </Card>
        </section>
        <Button onClick={decreaseClicked} disabled={isDisabled}>
          Remove {selectedPercentage}%
        </Button>
      </DialogContent>
    </Dialog>
  );
};
