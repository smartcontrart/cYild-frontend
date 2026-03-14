import { Button } from "@/components/ui/button";
import { ActionTriggerButton } from "./action-trigger-button";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { useContractExecution } from "@/hooks/contracts/write/use-contract-execution";
import PositionManagerABI from "@/abi/PositionManager";
import {
  ERC20TokenInfo,
  getManagerContractAddressFromChainId,
} from "@/utils/constants";
import { Coins } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { wagmiConfig } from "@/components/global/providers";
import { formatValue, getExplorerUrl } from "@/utils/functions";
import { ToastLink } from "@/components/global/toast-link";
import { waitForTransactionReceipt } from "@wagmi/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUnits, zeroAddress } from "viem";
import { useTokenPrice } from "@/hooks/use-token-price";
import { PositionInfo } from "@/utils/interfaces/misc";
import { base } from "viem/chains";
import TokenLogo from "@/components/global/token-logo";

export const CollectFeesButton = ({
  position,
  token0Info,
  token1Info,
}: {
  position: PositionInfo;
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
}) => {
  const router = useRouter();
  const { id: positionId } = router.query;
  const { data: positionDetails } = useApiPositionInfo({
    positionId: positionId as string,
  });

  const { data: positionInfo } = useContractPositionInfo({
    positionTokenId: positionDetails?.activeTokenId as number,
    positionChainId: positionDetails?.chainId as number,
  });

  const token0FeesEarned = formatUnits(
    positionInfo?.feesEarned0 || BigInt(0),
    positionInfo?.token0Decimals || 18,
  );

  const token1FeesEarned = formatUnits(
    positionInfo?.feesEarned1 || BigInt(0),
    positionInfo?.token1Decimals || 18,
  );

  const { data: token0Price, isLoading: isLoadingToken0Price } = useTokenPrice(
    token0Info?.address || zeroAddress,
    positionDetails?.chainId || base.id,
  );

  const { data: token1Price, isLoading: isLoadingToken1Price } = useTokenPrice(
    token1Info?.address || zeroAddress,
    positionDetails?.chainId || base.id,
  );

  const token0Value = Number(token0FeesEarned) * Number(token0Price);
  const token1Value = Number(token1FeesEarned) * Number(token1Price);
  const totalFeesEarned = Number(token0Value) + Number(token1Value);

  // const { refetch: refetchPositions } = usePositions();

  const chainId = positionDetails?.chainId;

  const { execute: executeContract, isLoading: isContractExecuting } =
    useContractExecution();

  const collectClicked = async () => {
    const loadingToast = toast.loading(`Executing collect fees...`);
    try {
      if (!positionDetails || !positionInfo) {
        throw new Error("Position not found");
      }

      const txHash = await executeContract({
        address: getManagerContractAddressFromChainId(chainId as number),
        abi: PositionManagerABI as unknown as unknown[],
        functionName: "collectFees",
        args: [positionDetails.activeTokenId],
        chainId: chainId,
      });
      // Wait for transaction confirmation
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      const explorerUrl = getExplorerUrl(positionDetails.chainId, txHash);
      toast.success(
        <ToastLink message={`Collect fees successful!`} url={explorerUrl} />,
      );
    } catch (error) {
      toast.error(`Collect fees failed`);
      console.error(`Collect fees failed:`, error);
    } finally {
      toast.dismiss(loadingToast);
    }
    // account: walletClient.account,
    // address: getManagerContractAddressFromChainId(chainId),
    // abi: PositionManagerABI,
    // functionName: "collectFees",
    // args: [tokenId],
  };

  const isDisabled = isContractExecuting;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ActionTriggerButton
          text="Collect Fees"
          icon={<Coins />}
          disabled={isDisabled}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Collect Fees</DialogTitle>
          <DialogDescription>
            Collect accumulated fees from your position
          </DialogDescription>
        </DialogHeader>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Uncollected Fees</CardTitle>
          </CardHeader>
          <CardContent className="gap-5 flex flex-col">
            <section className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <TokenLogo token={token0Info} />
                <span>{token0Info?.symbol}</span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span>{formatValue(Number(token0FeesEarned || 0))}</span>
                <span className="text-muted-foreground">
                  ${token0Value.toFixed(3)}
                </span>
              </div>
            </section>
            <section className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <TokenLogo token={token1Info} />
                <span>{token1Info?.symbol}</span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span>{formatValue(Number(token1FeesEarned || 0))}</span>
                <span className="text-muted-foreground">
                  ${token1Value.toFixed(3)}
                </span>
              </div>
            </section>
            <div className="h-px w-full bg-border" />
            <section className="flex justify-between items-center">
              <span>Total</span>
              <span className="">${formatValue(Number(totalFeesEarned))}</span>
            </section>
          </CardContent>
        </Card>
        <Button onClick={collectClicked} disabled={isDisabled}>
          Collect
        </Button>
      </DialogContent>
    </Dialog>
  );
};
