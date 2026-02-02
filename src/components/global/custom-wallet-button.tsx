"use client";

import { Button } from "@/components/ui/button"; // Using ShadCN button
import { Wallet, LogOut } from "lucide-react"; // Icons
import { ConnectKitButton } from "connectkit";
import { truncateAddress } from "@/utils/functions";
import Image from "next/image";
import { cn } from "@/utils/shadcn";

export default function CustomWalletButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, address, ensName }) => {
        return (
          <Button
            onClick={show}
            className={cn(
              "flex items-center gap-2 bg-background border-border border z-10",
              isConnected
                ? "text-background bg-foreground"
                : "text-foreground bg-background",
            )}
          >
            {isConnected ? (
              <>
                <LogOut />
                {ensName || truncateAddress(address || "")}
              </>
            ) : (
              <>
                <Wallet />
                <span>Connect Wallet</span>
              </>
            )}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
    // <ConnectButton.Custom>
    //   {({ account, chain, openAccountModal, openConnectModal, openChainModal, authenticationStatus, mounted }) => {
    //     const ready = mounted && authenticationStatus !== "loading";
    //     const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

    //     if (!connected) {
    //       return (
    //         <Button variant="outline" className="" onClick={openConnectModal}>
    //           <Wallet className="w-5 h-5" />
    //           <span className="ml-1 hidden md:block">Sign In</span>
    //         </Button>
    //       );
    //     }

    //     return (
    //       <div className="flex flex-row gap-2">
    //         <Button variant="outline" onClick={openChainModal}>
    //           <span>
    //             {chain.hasIcon && (
    //               <img src={chain.iconUrl} alt={chain.name} className="w-5 h-5 rounded-full" />
    //             )}
    //           </span>
    //           <span className="hidden md:block">
    //             {chain.name}
    //           </span>
    //         </Button>

    //         <Button variant="default" onClick={() => openAccountModal()}>
    //           <LogOut className="w-5 h-5" />
    //           <span className="hidden md:block">
    //             {account.displayName}
    //           </span>
    //         </Button>
    //       </div>
    //     );
    //   }}
    // </ConnectButton.Custom>
  );
}
