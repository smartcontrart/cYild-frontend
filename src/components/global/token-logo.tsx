import {
  ERC20TokenInfo,
  getNetworkDataFromChainId,
  getNetworkNameFromChainId,
  UNISWAP_GITHUB_CLOUD_URL,
  TRUSTWALLET_GITHUB_CLOUD_URL,
} from "@/utils/constants";
import { cn } from "@/utils/shadcn";
import { useState } from "react";
import Image from "next/image";
import { getAddress } from "viem";
import { getCoinGeckoImageURLFromTokenAddress } from "@/utils/requests";

interface TokenLogoProps {
  token?: ERC20TokenInfo;
  size?: number;
  className?: string;
  alt?: string;
  loading?: boolean;
  badge?: boolean;
}

export default function TokenLogo({
  token,
  size = 40,
  className = "",
  alt = "Token logo",
  loading = false,
  badge = false,
}: TokenLogoProps) {
  const getInitialSrc = (t: ERC20TokenInfo | undefined) => {
    if (!t?.address) return "";
    const networkName = getNetworkNameFromChainId(t.chainId);
    const checksummed = getAddress(t.address);
    return (
      t.image ||
      `${UNISWAP_GITHUB_CLOUD_URL}/${networkName}/assets/${checksummed}/logo.png`
    );
  };

  const tokenKey = `${token?.address}-${token?.chainId}-${token?.image}`;
  const [prevTokenKey, setPrevTokenKey] = useState<string>(tokenKey);
  const [src, setSrc] = useState<string>(() => getInitialSrc(token));
  const [errorCount, setErrorCount] = useState(0);
  const [showInitials, setShowInitials] = useState(false);

  // Reset image state when the token changes (during-render pattern, per React docs)
  if (prevTokenKey !== tokenKey) {
    setPrevTokenKey(tokenKey);
    setSrc(getInitialSrc(token));
    setErrorCount(0);
    setShowInitials(false);
  }

  const networkData =
    badge && token?.chainId ? getNetworkDataFromChainId(token.chainId) : null;
  const badgeSize = Math.round(size * 0.5);

  const isLoading = loading || !token;

  const handleImageError = async () => {
    if (!token?.address) {
      setShowInitials(true);
      return;
    }

    const networkName = getNetworkNameFromChainId(token.chainId);
    const checksummed = getAddress(token.address);
    const uniswapURL = `${UNISWAP_GITHUB_CLOUD_URL}/${networkName}/assets/${checksummed}/logo.png`;
    const trustWalletURL = `${TRUSTWALLET_GITHUB_CLOUD_URL}/${networkName}/assets/${checksummed}/logo.png`;

    const hasProvidedImage = !!token.image;
    const step = hasProvidedImage ? errorCount : errorCount + 1;

    if (step === 0) {
      setSrc(uniswapURL);
    } else if (step === 1) {
      setSrc(trustWalletURL);
    } else if (step === 2) {
      const cgUrl = await getCoinGeckoImageURLFromTokenAddress(
        token.address,
        token.chainId,
      );
      if (cgUrl) {
        setSrc(cgUrl);
      } else {
        setShowInitials(true);
      }
    } else {
      setShowInitials(true);
    }

    setErrorCount((c) => c + 1);
  };

  if (isLoading) {
    return (
      <div
        className={`flex animate-pulse items-center justify-center rounded-full bg-gray-200 ${className}`}
        style={{ width: size, height: size }}
        aria-label="Loading profile picture"
      />
    );
  }

  const initials = token.symbol?.slice(0, 2).toUpperCase() || "??";
  const fontSize = size * 0.4;

  return (
    <div
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {showInitials ? (
        <div
          className="flex items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-purple-500 text-white font-semibold"
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
      ) : (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="rounded-full object-cover"
          style={{ width: size, height: size, minWidth: size, minHeight: size }}
          onError={handleImageError}
        />
      )}
      {networkData && (
        <NetworkBadge
          image={networkData.image}
          name={networkData.name}
          size={badgeSize}
        />
      )}
    </div>
  );
}

const NetworkBadge = ({
  image,
  name,
  size,
}: {
  image: string;
  name: string;
  size: number;
}) => (
  <div
    className="absolute -bottom-1 -right-1 rounded-full overflow-hidden bg-background"
    style={{ width: size, height: size }}
  >
    <Image
      src={image}
      alt={name}
      width={size}
      height={size}
      className="w-full h-full object-contain"
    />
  </div>
);
