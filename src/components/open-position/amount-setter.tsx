import { ERC20TokenInfo } from "@/utils/constants";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import {
  getRequiredToken0AmountFromToken1Amount,
  getRequiredToken1AmountFromToken0Amount,
  reArrangeTokensByContractAddress,
  roundDown,
  formatForDisplay,
  validateAndCleanNumber,
  tickToPrice,
} from "@/utils/functions";
import TokenLiveBalance from "../token/token-live-balance";
import { useAccount } from "wagmi";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { formatUnits, parseUnits } from "viem";
import SetPercentageButtons from "./set-percentage-buttons";

export const AmountSetter = ({
  tokens,
  tickLower,
  tickUpper,
  token0Price,
  token1Price,
  onAmountsChange,
  chainId,
}: {
  tokens: ERC20TokenInfo[];
  tickLower: number;
  tickUpper: number;
  token0Price: number;
  token1Price: number;
  onAmountsChange: Function;
  chainId: number;
}) => {
  const { address: userAddress } = useAccount();
  const [isUserEditingForToken0, setIsUserEditingForToken0] = useState(false);
  const [token0Amount, setToken0Amount] = useState("0");
  const [token1Amount, setToken1Amount] = useState("0");
  const { data: token0Balance } = useTokenBalance(
    userAddress || "",
    tokens[0].address,
    chainId
  );
  const { data: token1Balance } = useTokenBalance(
    userAddress || "",
    tokens[1].address,
    chainId
  );

  useEffect(() => {
    const [token0SortedByCA, token1SortedByCA] =
      reArrangeTokensByContractAddress(tokens);
    const priceForTickLower = tickToPrice(
      tickLower,
      token0SortedByCA.decimals,
      token1SortedByCA.decimals
    );
    const priceForTickUpper = tickToPrice(
      tickUpper,
      token0SortedByCA.decimals,
      token1SortedByCA.decimals
    );
    let priceLower =
      priceForTickLower < priceForTickUpper
        ? priceForTickLower
        : priceForTickUpper;
    let priceUpper =
      priceForTickLower < priceForTickUpper
        ? priceForTickUpper
        : priceForTickLower;

    // Use the correct price ratio based on sorted tokens
    let priceRatio = token0Price / token1Price;

    // Debug logging
    console.log("AmountSetter Debug:", {
      token0SortedByCA: token0SortedByCA.symbol,
      token1SortedByCA: token1SortedByCA.symbol,
      token0Price,
      token1Price,
      priceRatio,
      priceLower,
      priceUpper,
      tickLower,
      tickUpper,
      isUserEditingForToken0,
    });

    if (isUserEditingForToken0) {
      const newToken1Amount = getRequiredToken1AmountFromToken0Amount(
        priceRatio,
        priceLower,
        priceUpper,
        Number(token0Amount)
      );
      const roundedToken1Amount = roundDown(
        newToken1Amount,
        token1SortedByCA.decimals
      );
      console.log("Token0 -> Token1 calculation:", {
        inputToken0Amount: token0Amount,
        calculatedToken1Amount: newToken1Amount,
        roundedToken1Amount,
      });
      setToken1Amount(
        formatForDisplay(roundedToken1Amount, token1SortedByCA.decimals)
      );
      onAmountsChange({
        token0Amount: Number(token0Amount),
        token1Amount: roundedToken1Amount,
      });
    } else {
      const newToken0Amount = getRequiredToken0AmountFromToken1Amount(
        priceRatio,
        priceLower,
        priceUpper,
        Number(token1Amount)
      );
      const roundedToken0Amount = roundDown(
        newToken0Amount,
        token0SortedByCA.decimals
      );
      console.log("Token1 -> Token0 calculation:", {
        inputToken1Amount: token1Amount,
        calculatedToken0Amount: newToken0Amount,
        roundedToken0Amount,
      });
      setToken0Amount(
        formatForDisplay(roundedToken0Amount, token0SortedByCA.decimals)
      );
      onAmountsChange({
        token0Amount: roundedToken0Amount,
        token1Amount: Number(token1Amount),
      });
    }
  }, [token0Amount, token1Amount, tickLower, tickUpper]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="">{tokens[0].symbol}</label>
        <Input
          className={
            parseUnits(token0Amount, tokens[0].decimals) >
            (token0Balance || BigInt(0))
              ? "text-destructive"
              : ""
          }
          placeholder="0.0"
          value={token0Amount}
          onChange={(e) => {
            const cleanedValue = validateAndCleanNumber(
              e.target.value,
              tokens[0].decimals
            );
            setIsUserEditingForToken0(true);
            setToken0Amount(cleanedValue);
          }}
        />
        <SetPercentageButtons
          maxAmount={formatUnits(
            token0Balance || BigInt(0),
            tokens[0].decimals
          )}
          decimals={tokens[0].decimals}
          onSetAmount={(newValue: number) => {
            setIsUserEditingForToken0(true);
            setToken0Amount(newValue.toString() || "");
          }}
        />
        <div
          className={
            parseUnits(token0Amount, tokens[0].decimals) >
            (token0Balance || BigInt(0))
              ? "text-destructive"
              : ""
          }
        >
          <TokenLiveBalance
            userAddress={userAddress}
            token={tokens[0]}
            chainId={chainId}
          />
        </div>
        {parseUnits(token0Amount, tokens[0].decimals) >
        (token0Balance || BigInt(0)) ? (
          <div className="ml-2 text-sm text-destructive">
            You do not have enough funds to provide liquidity, opening position
            will fail...
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="">{tokens[1].symbol}</label>
        <Input
          className={
            parseUnits(token1Amount, tokens[1].decimals) >
            (token1Balance || BigInt(0))
              ? "text-destructive"
              : ""
          }
          placeholder="0.0"
          value={token1Amount}
          onChange={(e) => {
            const cleanedValue = validateAndCleanNumber(
              e.target.value,
              tokens[1].decimals
            );
            setIsUserEditingForToken0(false);
            setToken1Amount(cleanedValue);
          }}
        />
        <SetPercentageButtons
          maxAmount={formatUnits(
            token1Balance || BigInt(0),
            tokens[1].decimals
          )}
          decimals={tokens[1].decimals}
          onSetAmount={(newValue: number) => {
            setIsUserEditingForToken0(false);
            setToken1Amount(newValue.toString() || "");
          }}
        />
        <div
          className={
            parseUnits(token1Amount, tokens[1].decimals) >
            (token1Balance || BigInt(0))
              ? "text-destructive"
              : ""
          }
        >
          <TokenLiveBalance
            userAddress={userAddress}
            token={tokens[1]}
            chainId={chainId}
          />
        </div>
        {parseUnits(token1Amount, tokens[1].decimals) >
        (token1Balance || BigInt(0)) ? (
          <div className="ml-2 text-sm text-destructive">
            You do not have enough funds to provide liquidity, opening position
            will fail...
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
