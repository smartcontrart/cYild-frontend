import { ERC20TokenInfo } from "@/utils/constants";
import { setAccountingUnit } from "@/utils/position-manage";
import { useState } from "react";
import {
  useChainId,
  useWalletClient,
  usePublicClient,
  useConnection,
} from "wagmi";
import { toast } from "sonner";
import { getExplorerUrl } from "@/utils/functions";
import { ToastLink } from "@/components/global/toast-link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";
import { TokenSelector } from "@/components/token/token-selector";
import { YildLoading } from "@/components/global/yild-loading";
import { useUserAccountingUnit } from "@/hooks/contracts/read/use-user-accounting-unit";
import TokenLogo from "@/components/global/token-logo";

export default function Settings() {
  const { isConnected, address, isDisconnected } = useConnection();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [newUnitAddress, setNewUnitAddress] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { accountingUnit, refetch } = useUserAccountingUnit();
  console.log(accountingUnit);

  const updateAccountingUnit = async () => {
    if (!address || !newUnitAddress || !chainId) return;

    const loadingToast = toast.loading("Updating accounting unit...");
    setIsLoading(true);
    try {
      const result = await setAccountingUnit(
        newUnitAddress,
        chainId,
        walletClient,
        publicClient,
      );
      if (result?.success) {
        const explorerUrl = getExplorerUrl(chainId, result.result as string);
        await refetch();
        toast.success(
          <ToastLink
            message="Accounting unit updated successfully!"
            url={explorerUrl}
          />,
        );
      } else {
        toast.error(`Update failed: ${result?.result ?? "Unknown error"}`);
      }
    } catch (error: unknown) {
      toast.error("Failed to update accounting unit");
      console.error("updateAccountingUnit error:", error);
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  if (!isDisconnected && !isConnected) {
    return <YildLoading loading={!isDisconnected && !isConnected} />;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">
          Connect your wallet to continue
        </h2>
        <p className="text-muted-foreground">
          Please connect your wallet to manage your settings on YildFinance
          smart contract
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[60vh]">
      <div className="flex flex-col gap-4 md:flex-row">
        <h2 className="text-xl font-bold">Current Accounting Unit</h2>
        <div className="flex flex-row gap-2 items-center text-center mx-auto">
          {accountingUnit && (
            <TokenLogo
              token={accountingUnit as ERC20TokenInfo}
              badge={true}
              size={25}
            />
          )}
          <span>{accountingUnit ? accountingUnit?.symbol : "N/A"}</span>
        </div>
      </div>
      <h3 className="text-l">
        The accounting unit is the token you will get when collecting fees or
        getting liquidity out of the position.
      </h3>
      <Dialog
        open={dialogOpen}
        onOpenChange={() => setDialogOpen(!dialogOpen)}
        modal
      >
        <DialogTrigger asChild>
          <Button
            onClick={() => setDialogOpen(true)}
            className="mt-4 md:mt-0"
            variant="outline"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Update Accounting Unit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Update Accounting Unit</DialogTitle>
            <DialogDescription>
              Please select new accounting unit and update with connected
              wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-row justify-between items-center">
            <Label htmlFor="name" className="text-right">
              Current Unit
            </Label>
            {accountingUnit ? (
              <div className="flex flex-row gap-2">
                <TokenLogo
                  token={accountingUnit as ERC20TokenInfo}
                  badge={true}
                  size={25}
                />
                <span>{accountingUnit.symbol}</span>
              </div>
            ) : (
              "N/A"
            )}
          </div>
          <div className="flex flex-row justify-between items-center">
            <Label htmlFor="name" className="text-right">
              New Unit
            </Label>
            <div className="w-50">
              <TokenSelector
                chainId={chainId}
                onSelectionChange={(info) => {
                  if (
                    info &&
                    info.address &&
                    info.address !== accountingUnit?.address
                  ) {
                    setNewUnitAddress(info.address);
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={updateAccountingUnit}
              disabled={isLoading || !newUnitAddress}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
