"use client";

import { useTokenPrice } from "@/hooks/use-token-price";
import { zeroAddress } from "viem";
import LazyLoader from "../ui/lazy-loader";
import { cn } from "@/utils/shadcn";

export default function TokenLivePrice({
  address,
  chainId,
}: {
  address: `0x${string}` | undefined;
  chainId: number;
}) {
  const { data, isLoading } = useTokenPrice(address || zeroAddress, chainId);

  const style = "h-6";

  if (!address) {
    return <div className={style} />;
  }

  return (
    <LazyLoader className={cn("text-sm mt-2", style)} isLoading={isLoading}>
      Current Price: ${data || "???"} USD
    </LazyLoader>
  );
}
