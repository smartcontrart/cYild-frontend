import { Button } from "@/components/ui/button";
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

export const UpdateBufferButton = ({
  token0Info,
  token1Info,
  position,
}: {
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  position: PositionInfo;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <Edit />
          Update Position Buffer
        </Button>
      </DialogTrigger>
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
