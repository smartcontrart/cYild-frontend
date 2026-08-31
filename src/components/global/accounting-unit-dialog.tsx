"use client";

import { useState } from "react";
import { useChainId, useConnection, usePublicClient, useWalletClient } from "wagmi";
import { toast } from "sonner";
import { ERC20TokenInfo } from "@/utils/constants";
import { setAccountingUnit } from "@/utils/position-manage";
import { getExplorerUrl } from "@/utils/functions";
import { ToastLink } from "@/components/global/toast-link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TokenSelector } from "@/components/token/token-selector";
import { useUserAccountingUnit } from "@/hooks/contracts/read/use-user-accounting-unit";
import TokenLogo from "@/components/global/token-logo";
import CustomWalletButton from "@/components/global/custom-wallet-button";
import { useAccountingUnitDialogStore } from "@/hooks/store/use-accounting-unit-dialog-store";
import { DEFAULT_CHAIN_ID } from "@/utils/robinhood-chain";

export function AccountingUnitDialog() {
  const { open, setOpen } = useAccountingUnitDialogStore();
  const { isConnected, address } = useConnection();
  const chainId = useChainId() || DEFAULT_CHAIN_ID;
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [newUnitAddress, setNewUnitAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { accountingUnit, refetch } = useUserAccountingUnit();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setNewUnitAddress("");
  };

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
        handleOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Update Accounting Unit</DialogTitle>
          <DialogDescription>
            The token you receive when collecting fees or withdrawing liquidity.
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to change the accounting unit.
            </p>
            <CustomWalletButton />
          </div>
        ) : (
          <>
            <div className="flex flex-row items-center justify-between">
              <Label className="text-right">Current Unit</Label>
              {accountingUnit ? (
                <div className="flex flex-row items-center gap-2">
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
            <div className="flex flex-row items-center justify-between">
              <Label className="text-right">New Unit</Label>
              <div className="w-50">
                <TokenSelector
                  chainId={chainId}
                  onSelectionChange={(info) => {
                    if (
                      info?.address &&
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
