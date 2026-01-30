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
    setSelectedPool,
  } = useNewPositionStore();

  const tokenSelected = (tokenInfo: ERC20TokenInfo, setter: Function) => {
    setter(tokenInfo);
    setSelectedPool(undefined);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <TokenSelector
          chainId={chainId}
          onSelectionChange={(tokenInfo: ERC20TokenInfo) => {
            tokenSelected(tokenInfo, setSelectedToken0);
          }}
        />
        <TokenLivePrice address={selectedToken0?.address} chainId={chainId} />
      </div>
      <div>
        <TokenSelector
          chainId={chainId}
          onSelectionChange={(tokenInfo: ERC20TokenInfo) => {
            tokenSelected(tokenInfo, setSelectedToken1);
          }}
        />
        <TokenLivePrice address={selectedToken1?.address} chainId={chainId} />
      </div>
    </div>
  );
};
