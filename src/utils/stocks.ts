import { Address } from "viem";
import { ROBINHOOD_CHAIN_ID } from "./robinhood-chain";

export type StockAccent = "lime" | "magenta" | "mint" | "white";

export type StockToken = {
  name: string;
  symbol: string;
  address: Address;
  decimals: number;
  chainId: number;
  image?: string;
};

export type StockFarm = {
  ticker: string;
  name: string;
  token: StockToken;
  quote: StockToken;
  accent: StockAccent;
  tagline: string;
  yahooTicker: string | null;
};

export const USDG_TOKEN: StockToken = {
  name: "Global Dollar",
  symbol: "USDG",
  address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
  decimals: 6,
  chainId: ROBINHOOD_CHAIN_ID,
};

export const WETH_ROBINHOOD: StockToken = {
  name: "Wrapped ETH",
  symbol: "WETH",
  address: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
  decimals: 18,
  chainId: ROBINHOOD_CHAIN_ID,
};

const rhStock = (
  symbol: string,
  name: string,
  address: Address,
  logo: string,
): StockToken => ({
  name,
  symbol,
  address,
  decimals: 18,
  chainId: ROBINHOOD_CHAIN_ID,
  image: logo,
});

export const STOCK_FARMS: StockFarm[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA",
    accent: "lime",
    tagline: "Green machine",
    yahooTicker: "NVDA",
    quote: USDG_TOKEN,
    token: rhStock(
      "NVDA",
      "NVIDIA",
      "0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC",
      "https://cdn.robinhood.com/ncw_assets/logos/0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec.png",
    ),
  },
  {
    ticker: "SPY",
    name: "S&P 500",
    accent: "white",
    tagline: "Index juice",
    yahooTicker: "SPY",
    quote: USDG_TOKEN,
    token: rhStock(
      "SPY",
      "SPDR S&P 500 ETF Trust",
      "0x117cc2133c37B721F49dE2A7a74833232B3B4C0C",
      "https://cdn.robinhood.com/ncw_assets/logos/0x117cc2133c37b721f49de2a7a74833232b3b4c0c.png",
    ),
  },
  {
    ticker: "GME",
    name: "GameStop",
    accent: "magenta",
    tagline: "Moon tickets",
    yahooTicker: "GME",
    quote: USDG_TOKEN,
    token: rhStock(
      "GME",
      "GameStop",
      "0x1b0E319c6A659F002271B69dB8A7df2F911c153E",
      "https://cdn.robinhood.com/ncw_assets/logos/0x1b0e319c6a659f002271b69db8a7df2f911c153e.png",
    ),
  },
  {
    ticker: "SPCX",
    name: "SpaceX",
    accent: "mint",
    tagline: "Private orbit",
    yahooTicker: null,
    quote: USDG_TOKEN,
    token: rhStock(
      "SPCX",
      "Space Exploration Technologies",
      "0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa",
      "https://cdn.robinhood.com/ncw_assets/logos/0x4a0e65a3eccec6dbe60ae065f2e7bb85fae35eea.png",
    ),
  },
  {
    ticker: "QQQ",
    name: "Nasdaq 100",
    accent: "lime",
    tagline: "Nasdaq drip",
    yahooTicker: "QQQ",
    quote: USDG_TOKEN,
    token: rhStock(
      "QQQ",
      "Invesco QQQ",
      "0xD5f3879160bc7c32ebb4dC785F8a4F505888de68",
      "https://cdn.robinhood.com/ncw_assets/logos/0xd5f3879160bc7c32ebb4dc785f8a4f505888de68.png",
    ),
  },
  {
    ticker: "GLD",
    name: "Gold",
    accent: "white",
    tagline: "Hard metal",
    yahooTicker: "GLD",
    quote: USDG_TOKEN,
    token: rhStock(
      "GLD",
      "SPDR Gold Trust",
      "0xC9a981FEE1F9DEc688bb123ccDeCc63D0deBFC4e",
      "https://cdn.robinhood.com/ncw_assets/logos/0xc9a981fee1f9dec688bb123ccdecc63d0debfc4e.png",
    ),
  },
  {
    ticker: "MSTR",
    name: "Strategy",
    accent: "magenta",
    tagline: "Bitcoin proxy",
    yahooTicker: "MSTR",
    quote: USDG_TOKEN,
    token: rhStock(
      "MSTR",
      "Strategy Inc.",
      "0xec262a75e413fAfD0dF80480274532C79D42da09",
      "https://cdn.robinhood.com/ncw_assets/logos/0xec262a75e413fafd0df80480274532c79d42da09.png",
    ),
  },
  {
    ticker: "RDDT",
    name: "Reddit",
    accent: "mint",
    tagline: "Upvote yield",
    yahooTicker: "RDDT",
    quote: USDG_TOKEN,
    token: rhStock(
      "RDDT",
      "Reddit",
      "0x05b37Fb53A299a1b874A619e1c4C404D52C36F4C",
      "https://cdn.robinhood.com/ncw_assets/logos/0x05b37fb53a299a1b874a619e1c4c404d52c36f4c.png",
    ),
  },
  {
    ticker: "HIMS",
    name: "Hims & Hers",
    accent: "lime",
    tagline: "Wellness drip",
    yahooTicker: "HIMS",
    quote: USDG_TOKEN,
    token: rhStock(
      "HIMS",
      "Hims & Hers Health",
      "0xCceE82fE024c36fA15E1005edE3E9e4787e23D09",
      "https://cdn.robinhood.com/ncw_assets/logos/0xccee82fe024c36fa15e1005ede3e9e4787e23d09.png",
    ),
  },
];

export const getStockByTicker = (ticker?: string | string[]) => {
  if (!ticker || Array.isArray(ticker)) return undefined;
  return STOCK_FARMS.find(
    (farm) => farm.ticker.toLowerCase() === ticker.toLowerCase(),
  );
};

export const getStockByTokenAddress = (address?: string) => {
  if (!address) return undefined;
  return STOCK_FARMS.find(
    (farm) => farm.token.address.toLowerCase() === address.toLowerCase(),
  );
};
