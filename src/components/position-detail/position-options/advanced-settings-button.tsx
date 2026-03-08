import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useContractExecution } from "@/hooks/contracts/write/use-contract-execution";
import {
  ERC20TokenInfo,
  getManagerContractAddressFromChainId,
} from "@/utils/constants";
import { PositionInfo } from "@/utils/interfaces/misc";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { useConnection } from "wagmi";
import PositionManagerABI from "@/abi/PositionManager";
import { waitForTransactionReceipt } from "@wagmi/core";
import { getExplorerUrl, roundDown } from "@/utils/functions";
import { wagmiConfig } from "@/components/global/providers";
import { ToastLink } from "@/components/global/toast-link";
import { getPositionFundsInfo } from "@/utils/position-manage";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { fetchParaswapRoute } from "@/utils/requests";
import { ClosingPriceRange } from "./closing-price-range";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const AdvancedSettingsButton = ({
  token0Info,
  token1Info,
  position,
}: {
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
  position: PositionInfo;
}) => {
  const { address } = useConnection();
  const { execute: executeContract, isLoading: isContractExecuting } =
    useContractExecution();
  const { data: positionInfo } = useContractPositionInfo({
    positionTokenId: position?.activeTokenId as number,
    positionChainId: position?.chainId as number,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <Settings />
          Advanced Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <section className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Advanced Settings</DialogTitle>
            <DialogDescription>Modify your position settings</DialogDescription>
          </DialogHeader>
          <ClosingPriceRange
            token0Info={token0Info}
            token1Info={token1Info}
            position={position}
          />
          <ExampleSettings />
        </section>
      </DialogContent>
    </Dialog>
  );
};

const ExampleSettings = () => {
  return (
    <div>
      <Label>Hello</Label>
      <Input className="mb-3" />
      <Button className="w-full">Update</Button>
    </div>
  );
};
