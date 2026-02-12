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
import { useInputConversions } from "@/hooks/misc/use-input-conversions";
import { useTokenPrice } from "@/hooks/use-token-price";
import { ERC20TokenInfo } from "@/utils/constants";
import { validateNumericInput } from "@/utils/functions";
import { PositionInfo } from "@/utils/interfaces/misc";
import { Plus } from "lucide-react";
import { useState } from "react";
import { zeroAddress } from "viem";
import { base } from "viem/chains";

export const IncreaseLiquidityButton = ({
  token0Info,
  token1Info,
  position,
}: {
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  position: PositionInfo;
}) => {
  const [token0Amount, setToken0Amount] = useState<string>("");
  const [token1Amount, setToken1Amount] = useState<string>("");

  const { data: token0Price } = useTokenPrice(
    token0Info?.address || zeroAddress,
    token0Info?.chainId || base.id,
  );
  const { data: token1Price } = useTokenPrice(
    token1Info?.address || zeroAddress,
    token1Info?.chainId || base.id,
  );

  const { convertToken0ToToken1, convertToken1ToToken0 } = useInputConversions({
    token0Decimals: token0Info?.decimals || 18,
    token1Decimals: token1Info?.decimals || 18,
    token0Price: token0Price as number,
    token1Price: token1Price as number,
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
            <Label>{token0Info?.symbol} Amount</Label>
            <Input
              value={token0Amount}
              onChange={(e) => handleToken0InputChange(e.target.value)}
            />
          </section>
          <section>
            <Label>{token1Info?.symbol} Amount</Label>
            <Input
              value={token1Amount}
              onChange={(e) => handleToken1InputChange(e.target.value)}
            />
          </section>
        </section>
        <Button>Add Liquidity</Button>
      </DialogContent>
    </Dialog>
  );
};
