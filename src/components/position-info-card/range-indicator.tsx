import { PositionInfo } from "@/utils/interfaces/misc";

export const RangeIndicator = ({ position }: { position: PositionInfo }) => {
  return (
    <div className="mt-5">
      <section className="w-full flex justify-between text-muted-foreground text-xs mb-2">
        <span>Min: {position.closingLowerTick}</span>
        <span>Current: 2,000</span>
        <span>Max: {position.closingUpperTick}</span>
      </section>
      <div className="w-full h-2 bg-primary/20 rounded-full relative">
        {/* needs to be programatically sized*/}
        <div className="h-full bg-primary rounded-full absolute left-10 right-20" />
      </div>
    </div>
  );
};
