import { roundDown, formatForDisplay } from "@/utils/functions";

export default function SetPercentageButtons({
  maxAmount,
  decimals,
  onSetAmount,
}: {
  maxAmount: string;
  decimals: number;
  onSetAmount: Function;
}) {
  const handleSetAmount = (percentage: number) => {
    const calculatedAmount = Number(maxAmount) * percentage;
    const roundedAmount = roundDown(calculatedAmount, decimals);
    const displayAmount = formatForDisplay(roundedAmount, decimals);
    onSetAmount(Number(displayAmount));
  };

  return (
    <div className="flex flex-row gap-1 items-center">
      <span
        className="px-2 py-1 text-sm border rounded-l cursor-pointer"
        onClick={() => handleSetAmount(0.25)}
      >
        25%
      </span>
      <span
        className="px-2 py-1 text-sm border rounded-l cursor-pointer"
        onClick={() => handleSetAmount(0.5)}
      >
        50%
      </span>
      <span
        className="px-2 py-1 text-sm border rounded-l cursor-pointer"
        onClick={() => handleSetAmount(0.75)}
      >
        75%
      </span>
      <span
        className="px-2 py-1 text-sm border rounded-l cursor-pointer"
        onClick={() => handleSetAmount(1.0)}
      >
        Max
      </span>
    </div>
  );
}
