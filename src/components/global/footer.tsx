"use client";
import { Fuel } from "lucide-react";
import Link from "next/link";
import { useConnection, useGasPrice } from "wagmi";
import { formatUnits } from "viem";
import LazyLoader from "../ui/lazy-loader";
import { DEFAULT_CHAIN_ID } from "@/utils/robinhood-chain";
import { YildMark } from "@/components/brand/yild-mark";

export const Footer = () => {
  const { chainId } = useConnection();
  const userChainId = chainId || DEFAULT_CHAIN_ID;

  const { data: gasPrice, isLoading } = useGasPrice({
    chainId: userChainId,
  });

  const formattedGasPrice = gasPrice
    ? `${parseFloat(formatUnits(gasPrice, 9)).toFixed(2)} GWEI`
    : "-- GWEI";

  return (
    <footer className="mt-auto border-t-[3px] border-border bg-yild-ink text-yild-lime">
      <div className="mx-auto my-4 flex w-full max-w-6xl flex-row items-center justify-between">
        <Link href="/" className="hover:cursor-pointer">
          <div className="mx-4 mt-1 flex items-center gap-2 font-black tracking-wider">
            <YildMark className="h-6 w-6" />
            YILD
          </div>
        </Link>
        <div className="mx-4 flex flex-row items-center gap-2">
          <Fuel size={18} />
          <LazyLoader
            isLoading={isLoading}
            type="line"
            className="h-5 min-w-16"
          >
            <span className="mt-1 items-center">{formattedGasPrice}</span>
          </LazyLoader>
        </div>
      </div>
    </footer>
  );
};
