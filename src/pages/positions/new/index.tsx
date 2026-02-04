"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PoolSelector from "@/components/pool/pool-selector";
import { RangeAndAmountSetter } from "@/components/open-position/range-and-amount-setter";
import { HandCoins, Undo2 } from "lucide-react";
import { TokenSelectorWrapper } from "@/components/token/token-selector-wrapper";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { OpenPositionButton } from "@/components/open-position/open-position-button";
import { useChainId } from "wagmi";

export default function NewPositionPage() {
  const chainId = useChainId();
  const router = useRouter();
  const {
    selectedToken0,
    selectedToken1,
    selectedPool,
    setSelectedPool,
    setSelectedToken0,
    setSelectedToken1,
  } = useNewPositionStore();

  useEffect(() => {
    // reset values when component is unmounted
    return () => {
      setSelectedPool(undefined);
      setSelectedToken0(undefined);
      setSelectedToken1(undefined);
    };
  }, [setSelectedPool, setSelectedToken0, setSelectedToken1, chainId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-row gap-2 items-center">
        <HandCoins />
        <h2 className="text-xl font-bold">Open Position</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-8">
          <TokenSelectorWrapper />
          {selectedToken0 && selectedToken1 && (
            <PoolSelector chainId={chainId} />
          )}
          {selectedPool && <RangeAndAmountSetter />}
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
            }}
          >
            <Undo2 /> Cancel
          </Button>
          <OpenPositionButton />
        </div>
      </Card>
    </div>
  );
}
