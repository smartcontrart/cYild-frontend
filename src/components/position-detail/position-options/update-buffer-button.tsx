import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ERC20TokenInfo } from "@/utils/constants";
import { PositionInfo } from "@/utils/interfaces/misc";
import { Edit } from "lucide-react";
import { ClosingPriceRange } from "./closing-price-range";
import { ActionTriggerButton } from "./action-trigger-button";

export const UpdateBufferButton = ({
  token0Info,
  token1Info,
  position,
  open,
  onOpenChange,
}: {
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  position: PositionInfo;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const isControlled = open !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <ActionTriggerButton text="Update Closing Prices" icon={<Edit />} />
        </DialogTrigger>
      )}
      <DialogContent>
        <section className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Closing Price Range</DialogTitle>
            <DialogDescription>
              Modify the closing range for your position
            </DialogDescription>
          </DialogHeader>
          <ClosingPriceRange
            token0Info={token0Info}
            token1Info={token1Info}
            position={position}
          />
        </section>
      </DialogContent>
    </Dialog>
  );
};
