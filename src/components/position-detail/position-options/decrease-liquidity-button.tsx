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
import { cn } from "@/utils/shadcn";
import { Minus } from "lucide-react";
import { useState } from "react";

export const DecreaseLiquidityButton = () => {
  const [selectedPercentage, setSelectedPercentage] = useState<number>(25);

  const executeDecrease = () => {
    dec;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <Minus />
          Decrease Liquidity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Liquidity</DialogTitle>
          <DialogDescription>
            Remove tokens from your position
          </DialogDescription>
        </DialogHeader>
        <section>
          <Label className="mb-3 block">Percentage to Remove</Label>
          <div className="flex justify-between gap-3">
            {[25, 50, 75, 100].map((value) => (
              <Button
                className={cn(
                  "w-1/4 bg-muted",
                  selectedPercentage === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
                key={value}
                onClick={() => setSelectedPercentage(value)}
              >
                {value}%
              </Button>
            ))}
          </div>
        </section>
        <Button>Remove {selectedPercentage}%</Button>
      </DialogContent>
    </Dialog>
  );
};
