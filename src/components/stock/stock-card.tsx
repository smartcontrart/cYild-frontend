import Link from "next/link";
import { Stamp } from "@/components/brand/stamp";
import { TickerBadge } from "@/components/brand/ticker-badge";
import { useEquityQuote } from "@/hooks/api/use-equity-quote";
import { cn } from "@/utils/shadcn";
import { StockFarm } from "@/utils/stocks";

const accentBars: Record<StockFarm["accent"], string[]> = {
  lime: ["#0A0A0A", "#FFFFFF", "#D8FF2A", "#FF2EC4", "#7CFF6B"],
  magenta: ["#0A0A0A", "#FF2EC4", "#FFFFFF", "#D8FF2A", "#0A0A0A"],
  mint: ["#0A0A0A", "#7CFF6B", "#FFFFFF", "#FF2EC4", "#D8FF2A"],
  white: ["#0A0A0A", "#FFFFFF", "#D8FF2A", "#FFFFFF", "#FF2EC4"],
};

const accentFill: Record<StockFarm["accent"], string> = {
  lime: "bg-yild-lime",
  magenta: "bg-yild-magenta",
  mint: "bg-yild-mint",
  white: "bg-white",
};

export const StockCard = ({ farm }: { farm: StockFarm }) => {
  const { data: quote } = useEquityQuote(farm.yahooTicker);
  const up = (quote?.changePercent ?? 0) >= 0;
  const hasQuote = quote?.price != null;

  return (
    <Link href={`/positions/new?stock=${farm.ticker}`} className="group block">
      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden border-[3px] border-border bg-card text-card-foreground shadow-[6px_6px_0_0_var(--comic-shadow)] transition-transform",
          "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[8px_8px_0_0_var(--comic-shadow)]",
        )}
      >
        <div className={cn("relative h-24 overflow-hidden", accentFill[farm.accent])}>
          <div className="absolute inset-0 opacity-40 mix-blend-multiply dark:mix-blend-soft-light halftone-lime" />
          <div className="absolute inset-x-4 bottom-0 flex h-20 items-end gap-1">
            {accentBars[farm.accent].map((color, index) => (
              <div
                key={index}
                className="flex-1 border-x-[3px] border-t-[3px] border-border"
                style={{
                  height: `${40 + ((index * 17) % 36)}%`,
                  background: color,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <TickerBadge ticker={farm.ticker} accent={farm.accent} />
            <Stamp tone={farm.accent === "magenta" ? "magenta" : "ink"}>
              {farm.quote.symbol}
            </Stamp>
          </div>

          <div>
            <h3 className="text-3xl font-black tracking-tight">{farm.ticker}</h3>
            <p className="text-sm text-muted-foreground">{farm.name}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              {farm.tagline}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between">
            <div>
              {hasQuote ? (
                <>
                  <div className="text-2xl font-black">
                    ${quote.price!.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div
                    className={cn(
                      "text-xs font-black uppercase",
                      up ? "text-emerald-700 dark:text-yild-mint" : "text-yild-magenta",
                    )}
                  >
                    {up ? "+" : ""}
                    {quote.changePercent!.toFixed(2)}%
                  </div>
                </>
              ) : (
                <div className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  Live on RH
                </div>
              )}
            </div>
            <span className="border-[3px] border-border bg-yild-magenta px-3 py-1.5 text-xs font-black uppercase tracking-widest text-yild-ink shadow-[3px_3px_0_0_var(--comic-shadow)] group-hover:bg-yild-lime">
              Farm
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};
