import { ERC20TokenInfo } from "@/utils/constants";
import { cn } from "@/utils/shadcn";
import { useState } from "react";
import Image from "next/image";

interface TokenLogoProps {
  token?: ERC20TokenInfo;
  size?: number;
  className?: string;
  alt?: string;
  loading?: boolean;
}

export default function TokenLogo({
  token,
  size = 40,
  className = "",
  alt = "Token logo",
  loading = false,
}: TokenLogoProps) {
  const [imageError, setImageError] = useState(false);

  // Show loading state if explicitly loading or if no ID is provided
  const isLoading = loading || !token;

  if (isLoading) {
    return (
      <div
        className={`flex animate-pulse items-center justify-center rounded-full bg-gray-200 ${className}`}
        style={{ width: size, height: size }}
        aria-label="Loading profile picture"
      ></div>
    );
  }

  // Show symbol initials if no logoURI or if image failed to load
  const shouldShowInitials = !token.image || imageError;

  if (shouldShowInitials) {
    const initials = token.symbol?.slice(0, 2).toUpperCase() || "??";
    const fontSize = size * 0.4; // Scale font size based on container size

    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-purple-500 text-white font-semibold",
          className,
        )}
        style={{
          width: size,
          height: size,
          fontSize: `${fontSize}px`,
          minWidth: size,
          minHeight: size,
        }}
        aria-label={`${token.symbol} token logo`}
      >
        {initials}
      </div>
    );
  } else {
    return (
      <div
        className={cn("relative", className)}
        style={{ width: size, height: size }}
      >
        <Image
          src={token.image as string}
          alt={alt}
          width={size}
          height={size}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full`}
          style={{ width: size, height: size, minWidth: size, minHeight: size }}
          onError={() => {
            console.error("Failed to load avatar:", token.image);
            setImageError(true);
          }}
        />
      </div>
    );
  }
}
