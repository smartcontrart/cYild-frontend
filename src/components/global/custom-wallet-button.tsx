"use client";

import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import { truncateAddress } from "@/utils/functions";
import { cn } from "@/utils/shadcn";

export default function CustomWalletButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, address, ensName }) => {
        return (
          <Button
            onClick={show}
            variant={isConnected ? "outline" : "secondary"}
            className={cn(
              "z-10",
              isConnected &&
                "bg-yild-ink text-yild-lime hover:bg-yild-ink hover:text-yild-lime dark:bg-yild-lime dark:text-yild-ink dark:hover:bg-yild-lime dark:hover:text-yild-ink",
            )}
          >
            {isConnected ? (
              ensName || truncateAddress(address || "")
            ) : (
              <>
                <Wallet />
                <span className="hidden sm:inline">Connect</span>
              </>
            )}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
