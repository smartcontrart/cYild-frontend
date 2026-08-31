import { SUPPORTED_CHAINS } from "@/utils/constants";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import { cn } from "@/utils/shadcn";
import { Check } from "lucide-react";
import { NetworkInfo } from "@/utils/interfaces/misc";
import { Stamp } from "@/components/brand/stamp";
import { useChainId, useConnection, useSwitchChain } from "wagmi";

export const NetworkSwitch = () => {
  const productNetwork =
    SUPPORTED_CHAINS.find((network) => network.enabled) ?? SUPPORTED_CHAINS[0];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="capitalize">
          <Image
            src={productNetwork.image}
            width={18}
            height={18}
            alt={productNetwork.name}
          />
          <span className="hidden sm:inline">{productNetwork.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-100">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-widest">
            Networks
          </DialogTitle>
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

const NetworkDisplay = ({ network }: { network: NetworkInfo }) => {
  const { isConnected } = useConnection();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const disabled = Boolean(network.comingSoon) || !network.enabled;
  const isSelectedNetwork = network.enabled && chainId === network.chainId;

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={() => {
        if (disabled || !isConnected) return;
        if (chainId !== network.chainId) {
          switchChain({ chainId: network.chainId });
        }
      }}
      className={cn(
        "relative flex h-14 w-full items-center gap-3 border-[3px] border-border pl-2 text-left",
        disabled
          ? "cursor-not-allowed bg-muted text-muted-foreground opacity-80"
          : "cursor-pointer bg-yild-lime text-yild-ink",
      )}
    >
      <Image src={network.image} width={28} height={28} alt={network.name} />
      <span className="text-lg font-black capitalize">{network.name}</span>
      {network.comingSoon && (
        <Stamp tone="magenta" className="absolute right-3 rotate-3">
          Coming soon
        </Stamp>
      )}
      {isSelectedNetwork && (
        <Check className="absolute right-3 text-yild-ink" size={20} />
      )}
    </button>
  );
};
