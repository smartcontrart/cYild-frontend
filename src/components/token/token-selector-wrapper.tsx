import { ERC20TokenInfo } from "@/utils/constants";
import { TokenSelector } from "./token-selector";
import { useChainId } from "wagmi";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import TokenLivePrice from "./token-live-price";

export const TokenSelectorWrapper = () => {
  const chainId = useChainId();
  const {
    setSelectedToken0,
    setSelectedToken1,
    selectedToken0,
    selectedToken1,
  } = useNewPositionStore();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <TokenSelector
          chainId={chainId}
          onSelectionChange={(info: ERC20TokenInfo) => {
            setSelectedToken0(info);
          }}
        />
        <TokenLivePrice address={selectedToken0?.address} chainId={chainId} />
      </div>
      <div>
        <TokenSelector
          chainId={chainId}
          onSelectionChange={(info: ERC20TokenInfo) => {
            setSelectedToken1(info);
          }}
        />
        <TokenLivePrice address={selectedToken1?.address} chainId={chainId} />
      </div>
    </div>
  );
};
