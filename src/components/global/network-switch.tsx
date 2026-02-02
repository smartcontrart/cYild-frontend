import { getNetworkDataFromChainId, SUPPORTED_CHAINS } from "@/utils/constants";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import { useChainId } from "wagmi";
import { cn } from "@/utils/shadcn";
import { Check } from "lucide-react";
import { switchChain } from "@wagmi/core";
import { wagmiConfig } from "./providers";

export const NetworkSwitch = () => {
  const chainId = useChainId();
  const activeNetwork = getNetworkDataFromChainId(chainId);

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="bg-background text-foreground capitalize">
          <Image
            src={activeNetwork.image}
            width={20}
            height={20}
            alt={activeNetwork.name}
          />
          {activeNetwork.name}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-100">
        <DialogHeader>
          <DialogTitle>Switch Networks</DialogTitle>
        </DialogHeader>
        <section className="flex flex-col gap-2">
          {SUPPORTED_CHAINS.map((network) => (
            <NetworkDisplay network={network} key={network.name} />
          ))}
        </section>
      </DialogContent>
    </Dialog>
  );
};

const NetworkDisplay = ({
  network,
}: {
  network: { chainId: number; name: string; image: string };
}) => {
  const chainId = useChainId();
  const isSelectedNetwork = chainId === network.chainId;

  const networkClicked = async () => {
    await switchChain(wagmiConfig, { chainId: network.chainId });
  };

  return (
    <div
      className={cn(
        "flex gap-3 h-14 items-center cursor-pointer pl-2 rounded-lg relative transition-all",
        isSelectedNetwork
          ? "bg-primary text-primary-foreground"
          : "hover:bg-loader",
      )}
      onClick={networkClicked}
    >
      <Image src={network.image} width={30} height={30} alt={network.name} />
      <span className="capitalize text-lg">{network.name}</span>
      {isSelectedNetwork && (
        <Check className="absolute right-3 text-green-500" size={20} />
      )}
    </div>
  );
};
