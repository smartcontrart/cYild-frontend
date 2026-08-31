export const CityBars = () => {
  const bars = [
    { h: 28, color: "#0A0A0A" },
    { h: 44, color: "#FFFFFF" },
    { h: 36, color: "#FF2EC4" },
    { h: 58, color: "#0A0A0A" },
    { h: 72, color: "#7CFF6B" },
    { h: 40, color: "#FFFFFF" },
    { h: 64, color: "#FF2EC4" },
    { h: 32, color: "#0A0A0A" },
    { h: 50, color: "#FFFFFF" },
    { h: 22, color: "#7CFF6B" },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center gap-1.5 px-8 opacity-90"
      aria-hidden
    >
      {bars.map((bar, index) => (
        <div
          key={index}
          className="w-3.5 border-[3px] border-border"
          style={{ height: bar.h, background: bar.color }}
        />
      ))}
    </div>
  );
};
