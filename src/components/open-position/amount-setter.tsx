import { ERC20TokenInfo } from "@/utils/constants";
import { Input } from "../ui/input";
import {
  getRequiredToken0AmountFromToken1Amount,
  getRequiredToken1AmountFromToken0Amount,
  roundDown,
  tickToPrice,
  validateNumericInput,
} from "@/utils/functions";
import TokenLiveBalance from "../token/token-live-balance";
import { useChainId, useConnection } from "wagmi";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { formatUnits, parseUnits } from "viem";
import SetPercentageButtons from "./set-percentage-buttons";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { useTokenPrice } from "@/hooks/use-token-price";

export const AmountSetter = () => {
  const {
    selectedPool,
    tickLower,
    tickUpper,
    token0Amount,
    setToken0Amount,
    token1Amount,
    setToken1Amount,
  } = useNewPositionStore();
  const { address: userAddress } = useConnection();
  const chainId = useChainId();

  const token0 = selectedPool?.token0 as ERC20TokenInfo;
  const token1 = selectedPool?.token1 as ERC20TokenInfo;

  const { data: token0Price } = useTokenPrice(token0.address, chainId);
  const { data: token1Price } = useTokenPrice(token1.address, chainId);

  const { data: token0Balance } = useTokenBalance(
    userAddress || "",
    token0.address,
    chainId,
  );
  const { data: token1Balance } = useTokenBalance(
    userAddress || "",
    token1.address,
    chainId,
  );

  const getRatioInfo = () => {
    const priceForTickLower = tickToPrice(
      tickLower,
      token0.decimals,
      token1.decimals,
    );
    const priceForTickUpper = tickToPrice(
      tickUpper,
      token0.decimals,
      token1.decimals,
    );
    const priceLower =
      priceForTickLower < priceForTickUpper
        ? priceForTickLower
        : priceForTickUpper;
    const priceUpper =
      priceForTickLower < priceForTickUpper
        ? priceForTickUpper
        : priceForTickLower;

    // Use the correct price ratio based on sorted tokens
    const priceRatio = Number(token0Price ?? 0) / Number(token1Price ?? 0);

    // console.log("AmountSetter Debug:", {
    //   token0: token0.symbol,
    //   token1: token1.symbol,
    //   token0Price,
    //   token1Price,
    //   priceRatio,
    //   priceLower,
    //   priceUpper,
    //   tickLower,
    //   tickUpper,
    // });

    return {
      priceRatio,
      priceLower,
      priceUpper,
    };
  };

  const handleToken0InputChange = (value: string) => {
    if (validateNumericInput(value.toString())) {
      const { priceRatio, priceLower, priceUpper } = getRatioInfo();
      const token1 = selectedPool?.token1 as ERC20TokenInfo;
      const newToken1Amount = getRequiredToken1AmountFromToken0Amount(
        priceRatio,
        priceLower,
        priceUpper,
        Number(value),
      );
      const roundedToken1Amount = roundDown(newToken1Amount, token1.decimals);
      setToken0Amount(value);
      setToken1Amount(roundedToken1Amount.toString());
    }
  };

  const handleToken1InputChange = (value: string) => {
    if (validateNumericInput(value.toString())) {
      const { priceRatio, priceLower, priceUpper } = getRatioInfo();
      const token0 = selectedPool?.token0 as ERC20TokenInfo;
      const newToken0Amount = getRequiredToken0AmountFromToken1Amount(
        priceRatio,
        priceLower,
        priceUpper,
        Number(value),
      );
      const roundedToken0Amount = roundDown(newToken0Amount, token0.decimals);
      setToken1Amount(value);
      setToken0Amount(roundedToken0Amount.toString());
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="">{token0.symbol}</label>
        <Input
          className={
            parseUnits(token0Amount, token0.decimals) >
            (token0Balance || BigInt(0))
              ? "text-destructive"
              : ""
          }
          placeholder="0.0"
          value={token0Amount}
          onChange={(e) => handleToken0InputChange(e.target.value)}
        />
        <SetPercentageButtons
          maxAmount={formatUnits(token0Balance || BigInt(0), token0.decimals)}
          decimals={token0.decimals}
          onSetAmount={(newValue: number) => {
            handleToken0InputChange(newValue.toString());
          }}
        />
        <div
          className={
            parseUnits(token0Amount, token0.decimals) >
            (token0Balance || BigInt(0))
              ? "text-destructive"
              : ""
          }
        >
          <TokenLiveBalance
            userAddress={userAddress}
            token={token0}
            chainId={chainId}
          />
        </div>
        {parseUnits(token0Amount, token0.decimals) >
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
        <label htmlFor="">{token1.symbol}</label>
        <Input
          className={
            parseUnits(token1Amount, token1.decimals) >
            (token1Balance || BigInt(0))
              ? "text-destructive"
              : ""
          }
          placeholder="0.0"
          value={token1Amount}
          onChange={(e) => handleToken1InputChange(e.target.value)}
        />
        <SetPercentageButtons
          maxAmount={formatUnits(token1Balance || BigInt(0), token1.decimals)}
          decimals={token1.decimals}
          onSetAmount={(newValue: number) => {
            handleToken1InputChange(newValue.toString());
          }}
        />
        <div
          className={
            parseUnits(token1Amount, token1.decimals) >
            (token1Balance || BigInt(0))
              ? "text-destructive"
              : ""
          }
        >
          <TokenLiveBalance
            userAddress={userAddress}
            token={token1}
            chainId={chainId}
          />
        </div>
        {parseUnits(token1Amount, token1.decimals) >
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
