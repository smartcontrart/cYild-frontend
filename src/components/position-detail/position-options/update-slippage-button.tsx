import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ERC20TokenInfo, BACKEND_API_URL } from "@/utils/constants";
import { PositionInfo } from "@/utils/interfaces/misc";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { validateNumericInput } from "@/utils/functions";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActionTriggerButton } from "./action-trigger-button";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { useConnection } from "wagmi";

const MIN_BPS = 1;
const MAX_BPS = 10000;

const bpsToPercent = (bps: number) => (bps / 100).toFixed(2);
const percentToBps = (pct: number) => Math.round(pct * 100);

export const UpdateSlippageButton = ({
  position,
  open,
  onOpenChange,
}: {
  position: PositionInfo;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const isControlled = open !== undefined;
  const { address } = useConnection();

  const initialSlippage = position?.maxSlippage ?? 50;

  const [slippage, setSlippage] = useState<number>(initialSlippage);
  const [inputValue, setInputValue] = useState<string>(
    bpsToPercent(initialSlippage),
  );
  const [isPending, setIsPending] = useState(false);

  // Reset to the position's live maxSlippage each time the dialog opens
  useEffect(() => {
    if (open) {
      const current = position?.maxSlippage ?? 50;
      setSlippage(current);
      setInputValue(bpsToPercent(current));
    }
  }, [open, position?.maxSlippage]);

  const { refetch } = useApiPositionInfo({
    positionId: position?.positionId.toString(),
  });

  const handleSliderChange = (values: number[]) => {
    setSlippage(values[0]);
    setInputValue(bpsToPercent(values[0]));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateNumericInput(value)) {
      setInputValue(value);
      const pct = parseFloat(value);
      if (!isNaN(pct)) {
        const bps = percentToBps(pct);
        setSlippage(Math.min(Math.max(bps, MIN_BPS), MAX_BPS));
      }
    }
  };

  const handleInputBlur = () => {
    const pct = parseFloat(inputValue);
    if (isNaN(pct)) {
      setSlippage(initialSlippage);
      setInputValue(bpsToPercent(initialSlippage));
    } else {
      const clamped = Math.min(Math.max(percentToBps(pct), MIN_BPS), MAX_BPS);
      setSlippage(clamped);
      setInputValue(bpsToPercent(clamped));
    }
  };

  const updateSlippage = async () => {
    setIsPending(true);
    const loadingToast = toast.loading("Updating max slippage...");
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/positions/${position.positionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maxSlippage: slippage,
            ownerAddress: address,
          }),
        },
      );
      if (!response.ok) throw new Error("Request failed");
      await response.json();
      toast.success("Max slippage updated successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to update max slippage");
      console.error(error);
    } finally {
      toast.dismiss(loadingToast);
      setIsPending(false);
    }
  };

  const hasChanged = slippage !== initialSlippage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <ActionTriggerButton
            text="Update Slippage"
            icon={<SlidersHorizontal />}
          />
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Max Slippage</DialogTitle>
          <DialogDescription>
            Maximum slippage tolerance allowed when rebalancing this position.
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Max Slippage</Label>
              <div className="relative flex items-center">
                <Input
                  className="w-24 text-right pr-7"
                  placeholder="0.50"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleInputBlur();
                  }}
                />
                <span className="absolute right-3 text-xs text-muted-foreground pointer-events-none">
                  %
                </span>
              </div>
            </div>
            <Slider
              min={MIN_BPS}
              max={MAX_BPS}
              step={1}
              value={[slippage]}
              onValueChange={handleSliderChange}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {bpsToPercent(MIN_BPS)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {bpsToPercent(MAX_BPS)}%
              </span>
            </div>
          </div>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>New Max Slippage</CardTitle>
              <CardDescription>
                The updated slippage tolerance for this position
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {bpsToPercent(initialSlippage)}%
              </span>
              <ArrowRight className="shrink-0" size={14} />
              <span
                className={
                  slippage > initialSlippage
                    ? "text-destructive"
                    : slippage < initialSlippage
                      ? "text-green-600"
                      : ""
                }
              >
                {bpsToPercent(slippage)}%
              </span>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            onClick={updateSlippage}
            disabled={isPending || !hasChanged}
          >
            Update Max Slippage
          </Button>
        </section>
      </DialogContent>
    </Dialog>
  );
};
