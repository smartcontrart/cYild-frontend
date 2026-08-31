import { cn } from "@/utils/shadcn";
import type { ReactNode } from "react";

export const Stamp = ({
  children,
  tone = "lime",
  className,
}: {
  children: ReactNode;
  tone?: "lime" | "magenta" | "mint" | "ink" | "paper";
  className?: string;
}) => {
  const tones = {
    lime: "bg-yild-lime text-yild-ink",
    magenta: "bg-yild-magenta text-yild-ink",
    mint: "bg-yild-mint text-yild-ink",
    ink: "bg-yild-ink text-yild-lime",
    paper: "bg-card text-card-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center border-[3px] border-border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_var(--comic-shadow)] -rotate-2",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
};
