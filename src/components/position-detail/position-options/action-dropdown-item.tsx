import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";

export const ActionDropdownItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  {
    text: ReactNode;
    icon: ReactNode;
    action?: () => void;
  } & ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ text, icon, action, onSelect, onClick, ...props }, ref) => {
  const handleSelect = (e: Event) => {
    onSelect?.(e);
    if (action) {
      // Defer to the next tick so the DropdownMenu fully completes its
      // pointer-events cleanup before the action (e.g. opening a Dialog) runs.
      // Without this, the two Radix components race on body pointer-events and
      // leave pointer-events: none stuck on <body> after the Dialog closes.
      setTimeout(action, 0);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
  };

  return (
    <DropdownMenuItem
      ref={ref}
      onSelect={handleSelect}
      onClick={handleClick}
      {...props}
    >
      {icon}
      {text}
    </DropdownMenuItem>
  );
});

ActionDropdownItem.displayName = "ActionDropdownItem";
