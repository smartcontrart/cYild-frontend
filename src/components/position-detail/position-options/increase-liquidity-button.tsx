import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useErc20Balances } from "@/hooks/contracts/read/use-erc20-balances";
import { useContractExecution } from "@/hooks/contracts/write/use-contract-execution";
import { useInputConversions } from "@/hooks/misc/use-input-conversions";
import { useTokenPrice } from "@/hooks/use-token-price";
import {
  ERC20TokenInfo,
  getManagerContractAddressFromChainId,
} from "@/utils/constants";
import { getExplorerUrl, validateNumericInput } from "@/utils/functions";
import { PositionInfo } from "@/utils/interfaces/misc";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { base } from "viem/chains";
import { useConnection } from "wagmi";
import PositionManagerABI from "@/abi/PositionManager";
import { wagmiConfig } from "@/components/global/providers";
import { ToastLink } from "@/components/global/toast-link";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useFeeTier } from "@/hooks/contracts/read/use-fee-tier";

export const IncreaseLiquidityButton = ({
  token0Info,
  token1Info,
  position,
}: {
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  position: PositionInfo;
}) => {
  const { address } = useConnection();

  const { execute: executeContract, isLoading: isContractExecuting } =
    useContractExecution();

  const [token0Amount, setToken0Amount] = useState<string>("");
  const [token1Amount, setToken1Amount] = useState<string>("");

  const tokensReady = !!token0Info && !!token1Info;

  // Fetch token balances from the pool
  const { balances, isLoading: isLoadingBalances } = useErc20Balances({
    tokens: tokensReady ? [token0Info, token1Info] : [],
    owner: address,
  });

  const token0Balance = token0Info
    ? (balances[`${token0Info.symbol}-${token0Info.chainId}`] as bigint)
    : BigInt(0);
  const token1Balance = token1Info
    ? (balances[`${token1Info.symbol}-${token1Info.chainId}`] as bigint)
    : BigInt(0);

  const formattedToken0Balance = formatUnits(
    token0Balance || BigInt(0),
    token0Info?.decimals ?? 18,
  );
  const formattedToken1Balance = formatUnits(
    token1Balance || BigInt(0),
    token1Info?.decimals ?? 18,
  );

  const { data: token0Price } = useTokenPrice(
    token0Info?.address || zeroAddress,
    token0Info?.chainId || base.id,
  );
  const { data: token1Price } = useTokenPrice(
    token1Info?.address || zeroAddress,
    token1Info?.chainId || base.id,
  );

  const { data: feeTier } = useFeeTier({
    poolAddress: position?.poolAddress,
  });

  const { convertToken0ToToken1, convertToken1ToToken0 } = useInputConversions({
    token0Decimals: token0Info?.decimals || 18,
    token1Decimals: token1Info?.decimals || 18,
    token0Price: token0Price as number,
    token1Price: token1Price as number,
    token0Address: token0Info?.address || zeroAddress,
    token1Address: token1Info?.address || zeroAddress,
    chainId: position?.chainId || base.id,
    feeTier: feeTier || 0,
    tickLower: position?.lowerTick || 0,
    tickUpper: position?.upperTick || 0,
  });

  const handleToken0InputChange = (value: string) => {
    if (validateNumericInput(value.toString())) {
      const { token0Amount, token1Amount } = convertToken0ToToken1(value);
      setToken0Amount(token0Amount);
      setToken1Amount(token1Amount);
    }
  };

  const handleToken1InputChange = (value: string) => {
    if (validateNumericInput(value.toString())) {
      const { token0Amount, token1Amount } = convertToken1ToToken0(value);
      setToken0Amount(token0Amount);
      setToken1Amount(token1Amount);
    }
  };

  const increaseClicked = async () => {
    const loadingToast = toast.loading(`Executing increase liquidity...`);
    try {
      if (!token0Info || !token1Info) {
        throw new Error("Tokens not found");
      }

      const txHash = await executeContract({
        address: getManagerContractAddressFromChainId(
          position.chainId as number,
        ),
        abi: PositionManagerABI as unknown as unknown[],
        functionName: "increaseLiquidity",
        args: [
          position.activeTokenId,
          parseUnits(token0Amount, token0Info?.decimals),
          parseUnits(token1Amount, token1Info?.decimals),
          5000,
          5000,
        ],
        chainId: position.chainId,
      });
      // Wait for transaction confirmation
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      const explorerUrl = getExplorerUrl(position.chainId, txHash);
      toast.success(
        <ToastLink
          message={`Increase liquidity successful!`}
          url={explorerUrl}
        />,
      );
    } catch (error) {
      toast.error(`Increase position failed`);
      console.error(`Increase position failed:`, error);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <Plus />
          Increase Liquidity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Increase Liquidity</DialogTitle>
          <DialogDescription>
            Add more tokens to your position
          </DialogDescription>
        </DialogHeader>
        <section className="flex flex-col gap-3">
          <section>
            <section className="flex items-center justify-between mb-1">
              <Label>{token0Info?.symbol} Amount</Label>
              <Label
                className="text-sm text-secondary-foreground cursor-pointer"
                onClick={() => handleToken0InputChange(formattedToken0Balance)}
              >
                Balance: {Number(formattedToken0Balance).toFixed(5)}
              </Label>
            </section>
            <Input
              value={token0Amount}
              onChange={(e) => handleToken0InputChange(e.target.value)}
            />
          </section>
          <section>
            <section className="flex items-center justify-between mb-1">
              <Label>{token1Info?.symbol} Amount</Label>
              <Label
                className="text-sm text-secondary-foreground cursor-pointer"
                onClick={() => handleToken1InputChange(formattedToken1Balance)}
              >
                Balance: {Number(formattedToken1Balance).toFixed(5)}
              </Label>
            </section>
            <Input
              value={token1Amount}
              onChange={(e) => handleToken1InputChange(e.target.value)}
            />
          </section>
        </section>
        <Button onClick={increaseClicked}>Add Liquidity</Button>
      </DialogContent>
    </Dialog>
  );
};
