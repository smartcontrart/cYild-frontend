import { STOCK_FARMS } from "@/utils/stocks";
import { StockCard } from "./stock-card";

export const StockGrid = () => {
  return (
    <section id="farms" className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yild-magenta">
            The floor
          </p>
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">
            Pick a stock. Farm it.
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {STOCK_FARMS.map((farm) => (
          <StockCard key={farm.ticker} farm={farm} />
        ))}
      </div>
    </section>
  );
};
