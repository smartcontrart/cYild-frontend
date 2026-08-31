"use client";

import { useChainId, useConnection } from "wagmi";
import { usePositions } from "@/hooks/api/use-positions";
import { PositionInfoCard } from "@/components/position-info-card/position-info-card";
import { StockGrid } from "@/components/stock/stock-grid";
import { YildMark } from "@/components/brand/yild-mark";
import CustomWalletButton from "@/components/global/custom-wallet-button";
import { SwitchRobinhoodButton } from "@/components/global/switch-robinhood-button";
import { Stamp } from "@/components/brand/stamp";
import { ROBINHOOD_CHAIN_ID } from "@/utils/robinhood-chain";

export default function Home() {
  const { isConnected } = useConnection();
  const chainId = useChainId();
  const { data: userPositions, isLoading: isLoadingPositions } = usePositions();

  const openPositions = (userPositions ?? []).filter(
    (position) => position.status === "opened",
  );

  return (
    <div className="space-y-10">
      {!isConnected && <ConnectHero />}
      {isConnected && chainId !== ROBINHOOD_CHAIN_ID && <WrongNetworkBanner />}

      {isConnected && (isLoadingPositions || openPositions.length > 0) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yild-magenta">
                Live farms
              </p>
              <h2 className="text-2xl font-black tracking-tight">Your positions</h2>
            </div>
            <Stamp tone="lime">{openPositions.length} open</Stamp>
          </div>
          {isLoadingPositions && (
            <div className="grid gap-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="h-48 animate-pulse border-[3px] border-border bg-loader"
                />
              ))}
            </div>
          )}
          {!isLoadingPositions && (
            <div className="flex flex-col gap-4">
              {openPositions.map((position) => (
                <PositionInfoCard position={position} key={position.id} />
              ))}
            </div>
          )}
        </section>
      )}

      <StockGrid />
    </div>
  );
}

const WrongNetworkBanner = () => {
  return (
    <div className="flex flex-col items-start justify-between gap-3 border-[3px] border-border bg-yild-magenta p-4 text-yild-ink shadow-[6px_6px_0_0_var(--comic-shadow)] sm:flex-row sm:items-center">
      <div>
        <Stamp tone="ink">Wrong chain</Stamp>
        <p className="mt-2 font-black uppercase">Switch to Robinhood to farm.</p>
      </div>
      <SwitchRobinhoodButton />
    </div>
  );
};

const ConnectHero = () => {
  return (
    <section className="relative overflow-hidden border-[3px] border-border bg-yild-lime p-6 text-yild-ink shadow-[8px_8px_0_0_var(--comic-shadow)] sm:p-10">
      <div className="absolute inset-0 opacity-50 halftone-lime" />
      <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl space-y-3">
          <div className="flex items-center gap-3">
            <YildMark className="h-14 w-14" />
            <Stamp tone="magenta">Robinhood chain</Stamp>
          </div>
          <h1 className="text-4xl font-black leading-none tracking-tight sm:text-5xl">
            Farm stocks.
            <br />
            Comic timing.
          </h1>
          <p className="max-w-md text-sm font-medium text-yild-ink/80">
            Automated Uniswap ranges on tokenized names like NVDA, GME and
            SPCX. Connect, pick a ticker, farm.
          </p>
        </div>
        <CustomWalletButton />
      </div>
    </section>
  );
};
