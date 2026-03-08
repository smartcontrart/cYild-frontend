"use client";
import { Skeleton } from "@/components/ui/skeleton";

import { useErc20Balance } from "@/hooks/contracts/read/use-erc20-balance";
import { ERC20TokenInfo } from "@/utils/constants";
import { formatValue } from "@/utils/functions";
import { formatUnits } from "viem";

export default function TokenLiveBalance({
  userAddress,
  token,
  onClick,
}: {
  userAddress: `0x${string}` | undefined;
  token: ERC20TokenInfo;
  onClick?: (data: string) => void;
}) {
  const { data, isLoading } = useErc20Balance({
    token: token,
    owner: userAddress,
    refetchInterval: 10000, // refetch every 5 seconds for live balance
  });

  if (!userAddress || !token) return <></>;

  const balanceClicked = () => {
    if (onClick) {
      const formattedBalance = formatUnits(data || BigInt(0), token.decimals);
      onClick(formattedBalance);
    }
  };

  return (
    <div className="flex items-center">
      {userAddress && token && isLoading ? (
        <span className="text-sm text-muted-foreground">
          <Skeleton className="w-25 h-5 rounded" />
        </span>
      ) : (
        <span
          className="text-xs ml-2 text-muted-foreground cursor-pointer"
          onClick={balanceClicked}
        >
          Balance:{" "}
          {formatValue(
            Number(formatUnits(data || BigInt(0), token.decimals)),
          )}{" "}
        </span>
      )}
    </div>
  );
}
