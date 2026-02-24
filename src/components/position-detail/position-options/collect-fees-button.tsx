import { Button } from "@/components/ui/button";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { useContractExecution } from "@/hooks/contracts/write/use-contract-execution";
import PositionManagerABI from "@/abi/PositionManager";
import { getManagerContractAddressFromChainId } from "@/utils/constants";
import { Coins } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { wagmiConfig } from "@/components/global/providers";
import { getExplorerUrl } from "@/utils/functions";
import { ToastLink } from "@/components/global/toast-link";
import { waitForTransactionReceipt } from "@wagmi/core";

export const CollectFeesButton = () => {
  const router = useRouter();
  const { id: positionId } = router.query;
  const { data: positionDetails } = useApiPositionInfo({
    positionId: positionId as string,
  });

  const { data: positionInfo } = useContractPositionInfo({
    positionTokenId: positionDetails?.activeTokenId as number,
    positionChainId: positionDetails?.chainId as number,
  });

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

  return (
    <Button variant={"outline"} onClick={collectClicked}>
      <Coins />
      Collect Fees
    </Button>
  );
};
