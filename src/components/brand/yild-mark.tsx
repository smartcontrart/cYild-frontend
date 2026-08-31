import Image from "next/image";
import { cn } from "@/utils/shadcn";

export const YildMark = ({
  className = "h-9 w-9",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) => {
  return (
    <Image
      src="/logo_yild.png"
      alt="Yild"
      width={88}
      height={88}
      className={cn("border-[3px] border-black object-cover", className)}
      priority={priority}
    />
  );
};

export const YildWordmark = ({ className }: { className?: string }) => {
  return (
    <span
      className={cn(
        "font-display leading-[0.8] tracking-[-0.045em]",
        className,
      )}
    >
      YILD
    </span>
  );
};

export const YildLockup = ({
  markClassName = "h-[34px] w-[34px]",
  wordmarkClassName = "text-[21px] tracking-[-0.04em] text-yild-ink dark:text-yild-paper",
  className,
}: {
  markClassName?: string;
  wordmarkClassName?: string;
  className?: string;
}) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <YildMark className={markClassName} priority />
      <YildWordmark className={wordmarkClassName} />
    </div>
  );
};
