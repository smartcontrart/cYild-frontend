import { Card, CardContent, CardHeader } from "../ui/card";
import { PositionInfo } from "@/utils/interfaces/misc";
import Link from "next/link";
import { useBatchFetchErc20Info } from "@/hooks/contracts/read/use-batch-fetch-erc20-info";
import { useEffect, useState } from "react";
import { ERC20TokenInfo, getNetworkDataFromChainId } from "@/utils/constants";
import TokenLogo from "../global/token-logo";
import { PositionValue } from "./position-value";
import { FeesEarned } from "./fees-earned";
import { RangeIndicator } from "./range-indicator";
import LazyLoader from "../ui/lazy-loader";
import { base } from "viem/chains";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import Image from "next/image";

export const PositionInfoCard = ({ position }: { position: PositionInfo }) => {
  const { data } = useContractPositionInfo({
    positionChainId: position.chainId || base.id,
    positionTokenId: position.activeTokenId,
  });
  const { fetchBatch } = useBatchFetchErc20Info();
  const [token0Info, setToken0Info] = useState<ERC20TokenInfo | undefined>();
  const [token1Info, setToken1Info] = useState<ERC20TokenInfo | undefined>();

  useEffect(() => {
    const fetchTokens = async () => {
      if (!data?.token0 || !data?.token1) return;

      const result = await fetchBatch(
        [data.token0, data.token1],
        position.chainId,
      );

      if (result.success.length > 0) {
        const token0 = result.success.find(
          (t) => t.address.toLowerCase() === data.token0.toLowerCase(),
        );
        const token1 = result.success.find(
          (t) => t.address.toLowerCase() === data.token1.toLowerCase(),
        );

        if (token0) setToken0Info(token0);
        if (token1) setToken1Info(token1);
      }
    };

    fetchTokens();
  }, [data?.token0, data?.token1, position.chainId, fetchBatch]);

  return (
    <Card>
      <Link href={`/positions/${position.positionId}`}>
        <CardContent className="cursor-pointer w-full">
          <Header
            position={position}
            token0Info={token0Info}
            token1Info={token1Info}
          />
          <div className="w-full h-px bg-border my-3" />
          <section className="flex gap-5 w-full">
            <PositionValue
              position={position}
              token0Info={token0Info}
              token1Info={token1Info}
              className="w-1/2 bg-secondary"
            />
            <FeesEarned
              position={position}
              token0Info={token0Info}
              token1Info={token1Info}
              className="w-1/2 bg-secondary"
            />
          </section>
          <RangeIndicator position={position} />
        </CardContent>
      </Link>
    </Card>
  );
};

const Header = ({
  position,
  token0Info,
  token1Info,
}: {
  position: PositionInfo;
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
}) => {
  const networkData = getNetworkDataFromChainId(position?.chainId || base.id);
  return (
    <CardHeader className="px-0 mb-0 pt-4 pb-0 flex items-start justify-start w-full flex-row gap-3">
      <section className="-space-x-4 flex">
        <TokenLogo token={token0Info} />
        <TokenLogo token={token1Info} />
      </section>
      <section className="flex flex-col relative w-full">
        <div className="flex gap-2">
          <div className="flex gap-1">
            <LazyLoader
              className="font-semibold min-w-8"
              isLoading={token0Info === undefined}
            >
              {token0Info?.symbol}
            </LazyLoader>
            <span>/</span>
            <LazyLoader
              className="font-semibold min-w-8"
              isLoading={token1Info === undefined}
            >
              {token1Info?.symbol}
            </LazyLoader>
          </div>
          <div className="text-xs px-2 flex items-center bg-secondary rounded-full">
            0.3%
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          #{position?.activeTokenId}
        </span>
        <Image
          src={networkData.image}
          width={25}
          height={25}
          alt={networkData.name}
          className="absolute right-0 top-1/2 -translate-y-1/2"
        />
      </section>
    </CardHeader>
  );
};
