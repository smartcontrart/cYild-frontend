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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useErc20Balances } from "@/hooks/contracts/read/use-erc20-balances";
import { useContractExecution } from "@/hooks/contracts/write/use-contract-execution";
import { useInputConversions } from "@/hooks/misc/use-input-conversions";
import { useTokenPrice } from "@/hooks/use-token-price";
import {
  ERC20TokenInfo,
  getManagerContractAddressFromChainId,
  SUPPORTED_CHAINS,
} from "@/utils/constants";
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
import { useIncreaseLiquidityButton } from "@/hooks/buttons/use-increase-liquidity-button";
import { useErc20Approval } from "@/hooks/contracts/write/use-erc20-approval";
import { useErc20Allowance } from "@/hooks/contracts/read/use-erc20-allowance";
import {
  formatValue,
  getExplorerUrl,
  waitForAllowanceChange,
  validateNumericInput,
} from "@/utils/functions";
import TokenLiveBalance from "@/components/token/token-live-balance";
import TokenLogo from "@/components/global/token-logo";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { ActionTriggerButton } from "./action-trigger-button";

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

  const { approve, isLoading: isExecutingApproval } = useErc20Approval();

  const [token0Amount, setToken0Amount] = useState<string>("");
  const [token1Amount, setToken1Amount] = useState<string>("");

  const { data: contractPositionInfo } = useContractPositionInfo({
    positionTokenId: position?.activeTokenId,
    positionChainId: position?.chainId || base.id,
  });

  const buttonState = useIncreaseLiquidityButton({
    token0: token0Info as ERC20TokenInfo,
    token1: token1Info as ERC20TokenInfo,
    token0Amount,
    token1Amount,
  });

  const { refetch: refetchToken0Allowance } = useErc20Allowance({
    token: token0Info,
    owner: address,
    spender: getManagerContractAddressFromChainId(
      token0Info?.chainId || SUPPORTED_CHAINS[0].chainId,
    ),
  });

  const { refetch: refetchToken1Allowance } = useErc20Allowance({
    token: token1Info,
    owner: address,
    spender: getManagerContractAddressFromChainId(
      token1Info?.chainId || SUPPORTED_CHAINS[0].chainId,
    ),
  });

  const tokensReady = !!token0Info && !!token1Info;

  // Fetch token balances from the pool
  const {
    balances,
    isLoading: isLoadingBalances,
    refetch: refetchBalances,
  } = useErc20Balances({
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

  // Calculate current position amounts from principal0 and principal1
  const currentToken0Amount = formatUnits(
    contractPositionInfo?.principal0 || BigInt(0),
    token0Info?.decimals ?? 18,
  );
  const currentToken1Amount = formatUnits(
    contractPositionInfo?.principal1 || BigInt(0),
    token1Info?.decimals ?? 18,
  );

  // Calculate updated amounts after increase
  const updatedToken0Amount =
    Number(currentToken0Amount) + Number(token0Amount || 0);
  const updatedToken1Amount =
    Number(currentToken1Amount) + Number(token1Amount || 0);

  // Calculate values
  const token0Value = updatedToken0Amount * Number(token0Price || 0);
  const token1Value = updatedToken1Amount * Number(token1Price || 0);
  const totalValue = token0Value + token1Value;

  // Calculate current total value
  const currentToken0Value =
    Number(currentToken0Amount) * Number(token0Price || 0);
  const currentToken1Value =
    Number(currentToken1Amount) * Number(token1Price || 0);
  const currentTotalValue = currentToken0Value + currentToken1Value;

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

  const approveToken0 = async () => {
    if (!token0Info) return;
    const loadingToast = toast.loading(
      `Executing ${token0Info?.symbol} approval...`,
    );
    try {
      // Get current allowance before waiting for change
      const currentAllowanceResult = await refetchToken0Allowance();
      const initialAllowance = currentAllowanceResult.data || BigInt(0);
      const txHash = await approve({
        token: token0Info,
        spender: getManagerContractAddressFromChainId(
          token0Info?.chainId || SUPPORTED_CHAINS[0].chainId,
        ),
        amount: token0Amount,
      });
      // Wait for transaction confirmation
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      // Wait for allowance to change by polling
      await waitForAllowanceChange(async () => {
        const result = await refetchToken0Allowance();
        return result.data || BigInt(0);
      }, initialAllowance);
      const explorerUrl = getExplorerUrl(token0Info.chainId, txHash);
      toast.success(
        <ToastLink
          message={`${token0Info.symbol} approval successful!`}
          url={explorerUrl}
        />,
      );
    } catch (error: unknown) {
      toast.error(`${token0Info.symbol} approval failed`);
      console.error(`${token0Info.symbol} approval failed:`, error);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const approveToken1 = async () => {
    if (!token1Info) return;
    const loadingToast = toast.loading(
      `Executing ${token1Info.symbol} approval...`,
    );
    try {
      // Get current allowance before waiting for change
      const currentAllowanceResult = await refetchToken1Allowance();
      const initialAllowance = currentAllowanceResult.data || BigInt(0);
      const txHash = await approve({
        token: token1Info,
        spender: getManagerContractAddressFromChainId(
          token1Info?.chainId || SUPPORTED_CHAINS[0].chainId,
        ),
        amount: token1Amount,
      });
      // Wait for transaction confirmation
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      // Wait for allowance to change by polling
      await waitForAllowanceChange(async () => {
        const result = await refetchToken1Allowance();
        return result.data || BigInt(0);
      }, initialAllowance);
      const explorerUrl = getExplorerUrl(token1Info.chainId, txHash);
      toast.success(
        <ToastLink
          message={`${token1Info.symbol} approval successful!`}
          url={explorerUrl}
        />,
      );
    } catch (error: unknown) {
      toast.error(`${token1Info.symbol} approval failed`);
      console.error(`${token1Info.symbol} approval failed:`, error);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const executeIncreaseLiquidity = async () => {
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
      await refetchBalances();
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

  const buttonClicked = async () => {
    if (buttonState.action === "approve") {
      await approveToken0();
      await approveToken1();
    } else if (buttonState.action === "increase") {
      await executeIncreaseLiquidity();
    }
  };

  const isDisabled =
    buttonState.disabled || isContractExecuting || isExecutingApproval;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ActionTriggerButton text="Increase Liquidity" icon={<Plus />} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Increase Liquidity</DialogTitle>
          <DialogDescription>
            Add more tokens to your position
          </DialogDescription>
        </DialogHeader>
        <section className="flex flex-col gap-4">
          <section>
            <section className="flex items-center justify-between mb-2">
              <Label>{token0Info?.symbol} Amount</Label>
              <TokenLiveBalance
                token={token0Info as ERC20TokenInfo}
                userAddress={address}
                onClick={(value) => handleToken0InputChange(value)}
              />
            </section>
            <Input
              value={token0Amount}
              onChange={(e) => handleToken0InputChange(e.target.value)}
            />
          </section>
          <section>
            <section className="flex items-center justify-between mb-2">
              <Label>{token1Info?.symbol} Amount</Label>
              <TokenLiveBalance
                token={token1Info as ERC20TokenInfo}
                userAddress={address}
                onClick={(value) => handleToken1InputChange(value)}
              />
            </section>
            <Input
              value={token1Amount}
              onChange={(e) => handleToken1InputChange(e.target.value)}
            />
          </section>
        </section>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Updated Position</CardTitle>
          </CardHeader>
          <CardContent className="gap-5 flex flex-col">
            <section className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <TokenLogo token={token0Info} />
                <span>{token0Info?.symbol}</span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span>{formatValue(updatedToken0Amount)}</span>
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
                <span>{formatValue(updatedToken1Amount)}</span>
                <span className="text-muted-foreground">
                  ${token1Value.toFixed(3)}
                </span>
              </div>
            </section>
            <div className="h-px w-full bg-border" />
            <section className="flex justify-between items-center">
              <span>Total</span>
              <span className="">
                ${formatValue(currentTotalValue)} → ${formatValue(totalValue)}
              </span>
            </section>
          </CardContent>
        </Card>
        <Button onClick={buttonClicked} disabled={isDisabled}>
          {buttonState.text}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
