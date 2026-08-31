"use client";

import { Button } from "@/components/ui/button";
import { ROBINHOOD_CHAIN_ID } from "@/utils/robinhood-chain";
import { useChainId, useConnection, useSwitchChain } from "wagmi";

export function SwitchRobinhoodButton({
  className,
}: {
  className?: string;
}) {
  const { isConnected } = useConnection();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === ROBINHOOD_CHAIN_ID) return null;

  return (
    <Button
      variant="secondary"
      className={className}
      disabled={isPending}
      onClick={() => switchChain({ chainId: ROBINHOOD_CHAIN_ID })}
    >
      {isPending ? "Switching..." : "Robinhood"}
    </Button>
  );
}
