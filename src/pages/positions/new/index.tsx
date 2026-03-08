"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect } from "react";
import PoolSelector from "@/components/pool/pool-selector";
import { RangeAndAmountSetter } from "@/components/open-position/range-and-amount-setter";
import { HandCoins, Undo2 } from "lucide-react";
import { TokenSelectorWrapper } from "@/components/token/token-selector-wrapper";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { OpenPositionButton } from "@/components/open-position/open-position-button";
import { useChainId } from "wagmi";

export default function NewPositionPage() {
  const chainId = useChainId();
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

  const selectedTokens = selectedToken0 && selectedToken1;

  return (
    <div className="space-y-6">
      <div className="flex flex-row gap-2 items-center">
        <HandCoins />
        <h2 className="text-xl font-bold">Open Position</h2>
      </div>

      <Card className="p-6">
        <TokenSelectorWrapper />
        <div className="space-y-8 flex md:flex-row flex-col md:gap-8 mt-5 items-start">
          {selectedToken0 && selectedToken1 && (
            <PoolSelector chainId={chainId} />
          )}
          {selectedTokens && (
            <Card className="flex flex-col md:w-2/3 shadow-none">
              <CardHeader>
                <CardTitle>Set your position parameters</CardTitle>
                <CardDescription>
                  Customize the parameters of your pool with the options below
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedPool ? (
                  <div className="w-full h-56 flex items-center justify-center">
                    <span>Select a pool to continue</span>
                  </div>
                ) : (
                  <>
                    {selectedPool && <RangeAndAmountSetter />}
                    <div className="flex justify-start gap-4 mt-4">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          // router.push("/");
                        }}
                      >
                        <Undo2 /> Cancel
                      </Button>
                      <OpenPositionButton />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}
