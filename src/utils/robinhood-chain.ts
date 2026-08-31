import { defineChain } from "viem";

export const ROBINHOOD_CHAIN_ID = 4663;
export const DEFAULT_CHAIN_ID = ROBINHOOD_CHAIN_ID;

export const robinhood = defineChain({
  id: ROBINHOOD_CHAIN_ID,
  name: "Robinhood",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.chain.robinhood.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
});
