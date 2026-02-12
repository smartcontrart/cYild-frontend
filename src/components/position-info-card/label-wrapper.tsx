import { ReactNode } from "react";
import LazyLoader from "../ui/lazy-loader";

export const LabelWrapper = ({
  label,
  amount,
  value,
  isLabelLoading,
  isAmountLoading,
  isValueLoading,
}: {
  label: ReactNode;
  amount: ReactNode;
  value: ReactNode;
  isLabelLoading?: boolean;
  isAmountLoading?: boolean;
  isValueLoading?: boolean;
}) => {
  return (
    <div className="flex w-full justify-between items-center">
      <LazyLoader
        isLoading={isLabelLoading}
        className="h-5 min-w-20 text-muted-foreground"
      >
        {label}
      </LazyLoader>
      <div className="flex gap-1 justify-end">
        <LazyLoader
          isLoading={isAmountLoading}
          className="h-5 min-w-20 text-right"
        >
          {amount}
        </LazyLoader>
        <LazyLoader
          isLoading={isValueLoading}
          className="h-5 min-w-8 text-right text-muted-foreground"
        >
          (${value})
        </LazyLoader>
      </div>
    </div>
  );
};
