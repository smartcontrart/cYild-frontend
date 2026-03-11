import { ERC20TokenInfo } from "@/utils/constants";
import { PoolInfo } from "@/utils/interfaces/misc";
import { create } from "zustand";

type NewPositionStore = {
  selectedToken0: ERC20TokenInfo | undefined;
  setSelectedToken0: (token: ERC20TokenInfo | undefined) => void;
  selectedToken1: ERC20TokenInfo | undefined;
  setSelectedToken1: (token: ERC20TokenInfo | undefined) => void;
  selectedPool: PoolInfo | undefined;
  setSelectedPool: (selectedPool: PoolInfo | undefined) => void;
  tickLower: number;
  setTickLower: (tickLower: number) => void;
  tickUpper: number;
  setTickUpper: (tickUpper: number) => void;
  token0Amount: string;
  setToken0Amount: (token0Amount: string) => void;
  token1Amount: string;
  setToken1Amount: (token1Amount: string) => void;
  minPrice: string;
  setMinPrice: (minPrice: string) => void;
  maxPrice: string;
  setMaxPrice: (maxPrice: string) => void;
  direction: string;
  setDirection: (direction: string) => void;
};

export const useNewPositionStore = create<NewPositionStore>((set) => ({
  selectedToken0: undefined,
  setSelectedToken0: (selectedToken0: ERC20TokenInfo | undefined) =>
    set({ selectedToken0, token0Amount: "", token1Amount: "" }),
  selectedToken1: undefined,
  setSelectedToken1: (selectedToken1: ERC20TokenInfo | undefined) =>
    set({ selectedToken1, token0Amount: "", token1Amount: "" }),
  selectedPool: undefined,
  setSelectedPool: (selectedPool: PoolInfo | undefined) =>
    set({ selectedPool, token0Amount: "", token1Amount: "" }),
  tickLower: 0,
  tickUpper: 0,
  setTickLower: (tickLower: number) => set({ tickLower }),
  setTickUpper: (tickUpper: number) => set({ tickUpper }),
  token0Amount: "",
  setToken0Amount: (token0Amount: string) => set({ token0Amount }),
  token1Amount: "",
  setToken1Amount: (token1Amount: string) => set({ token1Amount }),
  minPrice: "",
  setMinPrice: (minPrice: string) => set({ minPrice }),
  maxPrice: "",
  setMaxPrice: (maxPrice: string) => set({ maxPrice }),
  direction: "0p1",
  setDirection: (direction: string) =>
    set({ direction, token0Amount: "", token1Amount: "" }),
}));
