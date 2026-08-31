export const YildMark = ({
  className = "w-11 h-11",
}: {
  className?: string;
}) => {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d="M12 78V10h28c16 0 28 10 28 25 0 10-5 18-14 22l18 21H50L34 54H28v24H12z" fill="#0A0A0A" />
      <path d="M8 74V6h28c16 0 28 10 28 25 0 10-5 18-14 22l18 21H46L30 50H24v24H8z" fill="white" />
      <path d="M24 22h10c7 0 12 4 12 9s-5 9-12 9H24V22z" fill="#D8FF2A" />
    </svg>
  );
};
