import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/shadcn";
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";
import { VariantProps } from "class-variance-authority";

export const ActionTriggerButton = forwardRef<
  HTMLButtonElement,
  {
    text: ReactNode;
    icon: ReactNode;
    className?: string;
    action?: () => void;
  } & VariantProps<typeof buttonVariants> &
    ComponentPropsWithoutRef<"button">
>(
  (
    {
      text,
      icon,
      action,
      onClick,
      className,
      variant = "outline",
      size,
      ...props
    },
    ref,
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      action?.();
      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        variant={variant || "outline"}
        size={size}
        onClick={handleClick}
        {...props}
        className={cn(
          "w-full md:w-1/5 h-auto rounded-lg flex-col gap-5 py-5 bg-muted border-none text-foreground",
          className,
        )}
      >
        <div className="rounded-full bg-secondary h-12 aspect-square flex items-center justify-center">
          {icon}
        </div>
        {text}
      </Button>
    );
  },
);

ActionTriggerButton.displayName = "ActionTriggerButton";
