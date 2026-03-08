"use client";
import { Fuel } from "lucide-react";
import Link from "next/link";
import { base } from "viem/chains";
import { useConnection, useGasPrice } from "wagmi";
import { formatUnits } from "viem";
import LazyLoader from "../ui/lazy-loader";

export const Footer = () => {
  const { chainId } = useConnection();
  const userChainId = chainId || base.id;

  const { data: gasPrice, isLoading } = useGasPrice({
    chainId: userChainId,
  });

  const formattedGasPrice = gasPrice
    ? `${parseFloat(formatUnits(gasPrice, 9)).toFixed(2)} GWEI`
    : "-- GWEI";

  return (
    <footer className="mt-auto border-t">
      <div className="w-full lg:w-7xl flex flex-row justify-between mx-auto my-4">
        <Link href="/" className="hover:cursor-pointer">
          <div className="mx-4 mt-1 font-black tracking-wider">
            Yild Finance
          </div>
        </Link>
        <div className="flex flex-row gap-2 mx-4 items-center">
          <Fuel size={18} />
          <LazyLoader
            isLoading={isLoading}
            type="line"
            className="h-5 min-w-16"
          >
            <span className="items-center mt-1">{formattedGasPrice}</span>
          </LazyLoader>
        </div>
      </div>
    </footer>
  );
};
