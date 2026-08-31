"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { RangeAndAmountSetter } from "@/components/open-position/range-and-amount-setter";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";
import { OpenPositionButton } from "@/components/open-position/open-position-button";
import { ROBINHOOD_CHAIN_ID } from "@/utils/robinhood-chain";
import { getStockByTicker } from "@/utils/stocks";
import { useAvailablePools } from "@/hooks/contracts/read/use-available-pools";
import { TickerBadge } from "@/components/brand/ticker-badge";
import { Stamp } from "@/components/brand/stamp";
import { useEquityQuote } from "@/hooks/api/use-equity-quote";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ERC20TokenInfo } from "@/utils/constants";

export default function NewPositionPage() {
  const router = useRouter();
  const farm = getStockByTicker(router.query.stock);
  const {
    selectedToken0,
    selectedToken1,
    selectedPool,
    setSelectedPool,
    setSelectedToken0,
    setSelectedToken1,
  } = useNewPositionStore();

  const { data: quote } = useEquityQuote(farm?.yahooTicker ?? null);

  useEffect(() => {
    if (!farm) return;
    setSelectedToken0(farm.token as ERC20TokenInfo);
    setSelectedToken1(farm.quote as ERC20TokenInfo);
  }, [farm, setSelectedToken0, setSelectedToken1]);

  const { data: availablePools, isLoading: isLoadingPools } = useAvailablePools(
    {
      token0: selectedToken0,
      token1: selectedToken1,
      chainId: ROBINHOOD_CHAIN_ID,
    },
  );

  useEffect(() => {
    if (!availablePools?.length) return;
    const preferred =
      availablePools.find((pool) => pool.feeTier === 3000) || availablePools[0];
    if (preferred) setSelectedPool(preferred);
  }, [availablePools, setSelectedPool]);

  useEffect(() => {
    return () => {
      setSelectedPool(undefined);
      setSelectedToken0(undefined);
      setSelectedToken1(undefined);
    };
  }, [setSelectedPool, setSelectedToken0, setSelectedToken1]);

  if (!farm) {
    return (
      <div className="space-y-4 border-[3px] border-border bg-card p-8 text-card-foreground shadow-[6px_6px_0_0_var(--comic-shadow)]">
        <h2 className="text-2xl font-black">Pick a stock first</h2>
        <p>Farms are ticker-locked. Head back to the floor.</p>
        <Link href="/" className="inline-block font-black uppercase underline">
          Back to floor
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground hover:underline"
      >
        <ArrowLeft size={13} />
        Back to floor
      </Link>

      <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <article className="border-[3px] border-border bg-yild-lime p-6 text-yild-ink shadow-[8px_8px_0_0_var(--comic-shadow)]">
          <div className="mb-4 flex items-start justify-between">
            <TickerBadge ticker={farm.ticker} accent={farm.accent} size="lg" />
            <Stamp tone="ink">{farm.quote.symbol} pair</Stamp>
          </div>
          <h1 className="text-5xl font-black tracking-tight">{farm.ticker}</h1>
          <p className="text-lg">{farm.name}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-yild-ink/60">
            {farm.tagline}
          </p>
          {quote?.price != null && (
            <div className="mt-6">
              <div className="text-3xl font-black">
                ${quote.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              {quote.changePercent != null && (
                <div className="font-black">
                  {quote.changePercent >= 0 ? "+" : ""}
                  {quote.changePercent.toFixed(2)}%
                </div>
              )}
            </div>
          )}
          {selectedPool && (
            <div className="mt-6 text-xs font-black uppercase tracking-widest">
              Fee {(selectedPool.feeTier / 10000).toFixed(2)}%
            </div>
          )}
        </article>

        <article className="border-[3px] border-border bg-card p-6 text-card-foreground shadow-[8px_8px_0_0_var(--comic-shadow)]">
          <h2 className="text-xl font-black uppercase tracking-wide">
            Set the range
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Yild rebalances for you. You pick the band and the size.
          </p>
          {isLoadingPools && (
            <div className="flex h-56 items-center justify-center font-black uppercase">
              Scanning pool...
            </div>
          )}
          {!isLoadingPools && !selectedPool && (
            <div className="flex h-56 items-center justify-center text-center font-black uppercase">
              Pool incoming on this pair
            </div>
          )}
          {selectedPool && (
            <>
              <RangeAndAmountSetter />
              <div className="mt-4">
                <OpenPositionButton />
              </div>
            </>
          )}
        </article>
      </section>
    </div>
  );
}
