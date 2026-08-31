import { cn } from "@/utils/shadcn";
import { StockAccent } from "@/utils/stocks";

const palettes: Record<StockAccent, { bg: string; fg: string }> = {
  lime: { bg: "bg-yild-lime", fg: "text-yild-ink" },
  magenta: { bg: "bg-yild-magenta", fg: "text-yild-ink" },
  mint: { bg: "bg-yild-mint", fg: "text-yild-ink" },
  white: { bg: "bg-white", fg: "text-yild-ink" },
};

export const TickerBadge = ({
  ticker,
  accent,
  size = "md",
}: {
  ticker: string;
  accent: StockAccent;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center border-[3px] border-border font-black shadow-[4px_4px_0_0_var(--comic-shadow)]",
        palettes[accent].bg,
        palettes[accent].fg,
        sizes[size],
      )}
    >
      {ticker.slice(0, 1)}
    </div>
  );
};
