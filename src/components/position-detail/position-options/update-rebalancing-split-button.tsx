import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ERC20TokenInfo, BACKEND_API_URL } from "@/utils/constants";
import { PositionInfo } from "@/utils/interfaces/misc";
import { Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ActionTriggerButton } from "./action-trigger-button";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { useConnection } from "wagmi";
import TokenLogo from "@/components/global/token-logo";
import { cn } from "@/utils/shadcn";

const PRESETS = [
  { label: "50/50", token0: 50 },
  { label: "60/40", token0: 60 },
  { label: "70/30", token0: 70 },
  { label: "80/20", token0: 80 },
];

export const UpdateRebalancingSplitButton = ({
  position,
  open,
  onOpenChange,
  token0Info,
  token1Info,
}: {
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  position: PositionInfo;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const isControlled = open !== undefined;
  const { address } = useConnection();

  const rebalanceSplit: number = (position as any)?.rebalanceSplit;
  const initialSplit: number = rebalanceSplit ?? 50;

  const [token0Split, setToken0Split] = useState<number>(initialSplit);
  const [token0Input, setToken0Input] = useState<string>(String(initialSplit));
  const [token1Input, setToken1Input] = useState<string>(
    String(100 - initialSplit),
  );
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (open) {
      const current: number = rebalanceSplit ?? 50;
      setToken0Split(current);
      setToken0Input(String(current));
      setToken1Input(String(100 - current));
    }
  }, [open, rebalanceSplit]);

  const { refetch } = useApiPositionInfo({
    positionId: position?.positionId.toString(),
  });

  const applyValues = (token0Pct: number) => {
    const clamped = Math.min(Math.max(Math.round(token0Pct), 0), 100);
    setToken0Split(clamped);
    setToken0Input(String(clamped));
    setToken1Input(String(100 - clamped));
  };

  const handleSliderChange = (values: number[]) => applyValues(values[0]);

  const handleToken0InputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!/^\d{0,3}$/.test(raw)) return;
    setToken0Input(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setToken0Split(num);
      setToken1Input(String(100 - num));
    }
  };

  const handleToken0Blur = () => {
    const num = parseInt(token0Input, 10);
    applyValues(isNaN(num) ? token0Split : num);
  };

  const handleToken1InputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!/^\d{0,3}$/.test(raw)) return;
    setToken1Input(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setToken0Split(100 - num);
      setToken0Input(String(100 - num));
    }
  };

  const handleToken1Blur = () => {
    const num = parseInt(token1Input, 10);
    const clamped = isNaN(num)
      ? 100 - token0Split
      : Math.min(Math.max(num, 0), 100);
    applyValues(100 - clamped);
  };

  const activePreset = PRESETS.find((p) => p.token0 === token0Split);

  const saveSplit = async () => {
    setIsPending(true);
    const loadingToast = toast.loading("Updating rebalancing split...");
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/positions/${position.positionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rebalanceSplit: token0Split,
            ownerAddress: address,
          }),
        },
      );
      if (!response.ok) throw new Error("Request failed");
      await response.json();
      toast.success("Rebalancing split updated successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to update rebalancing split");
      console.error(error);
    } finally {
      toast.dismiss(loadingToast);
      setIsPending(false);
    }
  };

  const hasChanged = token0Split !== initialSplit;

  const token0Symbol = token0Info?.symbol ?? "Token 0";
  const token1Symbol = token1Info?.symbol ?? "Token 1";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <ActionTriggerButton
            text="Update Rebalancing Split"
            icon={<Scale />}
          />
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rebalance Split</DialogTitle>
          <DialogDescription>
            Set the target allocation ratio for auto-rebalancing.
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-5 mt-1">
          {/* Quick Presets */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Quick Presets</span>
            <div className="flex gap-2">
              {PRESETS.map((preset) => {
                const isActive = activePreset?.token0 === preset.token0;
                return (
                  <button
                    key={preset.label}
                    onClick={() => applyValues(preset.token0)}
                    className={cn(
                      "flex-1 rounded-full border py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Split */}
          <div className="flex flex-col gap-3">
            <span className="text-sm text-muted-foreground">Custom Split</span>

            {/* Token cards */}
            <div className="flex gap-3">
              {/* Token 0 card */}
              <div className="flex-1 rounded-xl bg-muted/30 border border-border p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <TokenLogo token={token0Info} size={24} />
                  <span className="text-sm font-medium">{token0Symbol}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    className="h-8 w-full border-none bg-transparent p-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                    value={token0Input}
                    onChange={handleToken0InputChange}
                    onBlur={handleToken0Blur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleToken0Blur();
                    }}
                    inputMode="numeric"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              {/* Token 1 card */}
              <div className="flex-1 rounded-xl bg-muted/30 border border-border p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <TokenLogo token={token1Info} size={24} />
                  <span className="text-sm font-medium">{token1Symbol}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    className="h-8 w-full border-none bg-transparent p-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                    value={token1Input}
                    onChange={handleToken1InputChange}
                    onBlur={handleToken1Blur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleToken1Blur();
                    }}
                    inputMode="numeric"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Visual split bar */}
            <div className="mt-1">
              <div className="relative h-2 w-full overflow-hidden rounded-full">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) ${token0Split}%, hsl(var(--primary) / 0.2) ${token0Split}%)`,
                  }}
                />
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[token0Split]}
                onValueChange={handleSliderChange}
                className="mt-1"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {token0Split}% {token0Symbol}
                </span>
                <span className="text-xs text-muted-foreground">
                  {100 - token0Split}% {token1Symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={saveSplit}
            disabled={isPending || !hasChanged}
          >
            Update Split
          </Button>
        </section>
      </DialogContent>
    </Dialog>
  );
};
