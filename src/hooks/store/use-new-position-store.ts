import { ERC20TokenInfo } from "@/utils/constants";
import { PoolInfo } from "@/utils/interfaces";
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
  token0Input: number;
  setToken0Input: (token0Input: number) => void;
  token1Input: number;
  setToken1Input: (token0Input: number) => void;
};

export const useNewPositionStore = create<NewPositionStore>((set, get) => ({
  selectedToken0: undefined,
  setSelectedToken0: (selectedToken0: ERC20TokenInfo | undefined) =>
    set({ selectedToken0 }),
  selectedToken1: undefined,
  setSelectedToken1: (selectedToken1: ERC20TokenInfo | undefined) =>
    set({ selectedToken1 }),
  selectedPool: undefined,
  setSelectedPool: (selectedPool: PoolInfo | undefined) =>
    set({ selectedPool }),
  tickLower: 0,
  tickUpper: 0,
  setTickLower: (tickLower: number) => set({ tickLower }),
  setTickUpper: (tickUpper: number) => set({ tickUpper }),
  token0Input: 0,
  setToken0Input: (token0Input: number) => set({ token0Input }),
  token1Input: 0,
  setToken1Input: (token1Input: number) => set({ token1Input }),
}));
