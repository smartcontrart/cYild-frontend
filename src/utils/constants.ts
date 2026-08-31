import { Address } from "viem";
import { NetworkInfo } from "./interfaces/misc";
import { ROBINHOOD_CHAIN_ID } from "./robinhood-chain";
import { STOCK_FARMS, USDG_TOKEN, WETH_ROBINHOOD } from "./stocks";

export const VALID_FEE_TIERS = [100, 500, 3000, 10000];
export const INVALID_FEE_TIER = null;

export const TOKEN_LIVE_PRICE_FETCH_INTERVAL = 15000;
export const USER_ERC_TOKEN_BALANCE_FETCH_INTERVAL = 15000;
export const POSITION_INFO_FETCH_INTERVAL = 60000;
export const POOL_DATA_FETCH_INTERVAL = 300000;

export const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://api.yild.finance";
export const PARASWAP_API_URL = "https://api.paraswap.io/swap?version=6.2";
export const COINGECKO_PUBLIC_API_URL = "https://api.coingecko.com/api/v3";
export const UNISWAP_GITHUB_CLOUD_URL =
  "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains";
export const TRUSTWALLET_GITHUB_CLOUD_URL =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains";
export const FALLBACK_ERC20_IMAGE_URL = "/favicon.png";

const ROBINHOOD_DEFAULT_TOKENS = [
  USDG_TOKEN,
  WETH_ROBINHOOD,
  ...STOCK_FARMS.map((farm) => farm.token),
];

export const SUPPORTED_CHAINS: NetworkInfo[] = [
  {
    chainId: ROBINHOOD_CHAIN_ID,
    name: "robinhood",
    secondaryRPC: "https://rpc.mainnet.chain.robinhood.com",
    explorerURL: "https://robinhoodchain.blockscout.com",
    image: "/chainIcons/4663.png",
    positionManager: (process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS ||
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    liquidityMath:
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
    uniswapFactory:
      "0x1f7d7550B1b028f7571E69A784071F0205FD2EfA" as `0x${string}`,
    enabled: true,
    defaultTokens: ROBINHOOD_DEFAULT_TOKENS,
  },
  {
    chainId: 8453,
    name: "base",
    secondaryRPC: "https://rpc.ankr.com/base",
    explorerURL: "https://basescan.org",
    image: "/networkIcons/base.svg",
    positionManager:
      "0x565666e18c625da4913b1ae7991f0459f20c33ed" as `0x${string}`,
    liquidityMath:
      "0x354e7c3d6473afed1a740de7a3ec46bc9eb0cde4" as `0x${string}`,
    uniswapFactory:
      "0x33128a8fC17869897dcE68Ed026d694621f6FDfD" as `0x${string}`,
    enabled: false,
    comingSoon: true,
    defaultTokens: [],
  },
  {
    chainId: 42161,
    name: "arbitrum",
    secondaryRPC: "https://rpc.ankr.com/arbitrum",
    explorerURL: "https://arbiscan.io",
    image: "/networkIcons/arbitrum.svg",
    positionManager:
      "0xad0CA4223CB8b7B1A18BD6AF99Dc942251d227Aa" as `0x${string}`,
    liquidityMath:
      "0x3cf31d8a2F2504111EEbc6281777D0Fc3a07B156" as `0x${string}`,
    uniswapFactory:
      "0x1F98431c8aD98523631AE4a59f267346ea31F984" as `0x${string}`,
    enabled: false,
    comingSoon: true,
    defaultTokens: [],
  },
];

export const getNetworkDataFromChainId = (chainId: number) => {
  const filtered = SUPPORTED_CHAINS.filter(
    (elem: NetworkInfo) => elem.chainId === chainId,
  );
  return filtered.length > 0 ? filtered[0] : SUPPORTED_CHAINS[0];
};

export const getNetworkNameFromChainId = (chainId: number) => {
  const filtered = SUPPORTED_CHAINS.filter(
    (elem: NetworkInfo) => elem.chainId === chainId,
  );
  return filtered.length > 0 ? filtered[0]["name"] : "robinhood";
};

export const getSecondaryRPCFromChainId = (chainId: number) => {
  const filtered = SUPPORTED_CHAINS.filter(
    (elem: NetworkInfo) => elem.chainId === chainId,
  );
  return filtered.length > 0
    ? filtered[0]["secondaryRPC"]
    : "https://rpc.mainnet.chain.robinhood.com";
};

export const getExplorerURLFromChainId = (chainId: number) => {
  const filtered = SUPPORTED_CHAINS.filter(
    (elem: NetworkInfo) => elem.chainId === chainId,
  );
  return filtered.length > 0
    ? filtered[0]["explorerURL"]
    : "https://robinhoodchain.blockscout.com";
};

export const getUniswapV3FactoryContractAddressFromChainId = (
  chainId: number,
) => {
  const filtered = SUPPORTED_CHAINS.filter(
    (elem: NetworkInfo) => elem.chainId === chainId,
  );
  return filtered.length > 0 ? filtered[0]["uniswapFactory"] : "0x";
};

export const getManagerContractAddressFromChainId = (chainId: number) => {
  const filtered = SUPPORTED_CHAINS.filter(
    (elem: NetworkInfo) => elem.chainId === chainId,
  );
  return filtered.length > 0 ? filtered[0]["positionManager"] : "0x";
};

export const getLiquidityMathContractAddressFromChainId = (chainId: number) => {
  const filtered = SUPPORTED_CHAINS.filter(
    (elem: NetworkInfo) => elem.chainId === chainId,
  );
  return filtered.length > 0 ? filtered[0]["liquidityMath"] : "0x";
};

export const getDefaultTokensFromChainId = (chainId: number) => {
  const filtered = SUPPORTED_CHAINS.filter(
    (elem: NetworkInfo) => elem.chainId === chainId,
  );
  return filtered.length > 0 ? filtered[0]["defaultTokens"] : [];
};

export interface ERC20TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address: Address;
  chainId: number;
  image?: string;
  data?: unknown;
}
