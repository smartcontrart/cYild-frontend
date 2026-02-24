"use client";

import { useRouter } from "next/router";
import { PositionInfo as PositionInfoInterface } from "@/utils/interfaces/misc";
import { ERC20TokenInfo, getNetworkDataFromChainId } from "@/utils/constants";
import TokenLogo from "@/components/global/token-logo";
import LazyLoader from "@/components/ui/lazy-loader";
import { useBatchFetchErc20Info } from "@/hooks/contracts/read/use-batch-fetch-erc20-info";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { FeesEarned } from "@/components/position-info-card/fees-earned";
import { PositionValue } from "@/components/position-info-card/position-value";
import { Card, CardContent } from "@/components/ui/card";
import { IncreaseLiquidityButton } from "@/components/position-detail/position-options/increase-liquidity-button";
import { DecreaseLiquidityButton } from "@/components/position-detail/position-options/decrease-liquidity-button";
import { CollectFeesButton } from "@/components/position-detail/position-options/collect-fees-button";
import { ClosePositionButton } from "@/components/position-detail/position-options/close-position-button";
import { PositionRangeDisplay } from "@/components/position-detail/position-range-display";
import { PositionInfo } from "@/components/position-detail/position-info";
import Link from "next/link";
import { base } from "viem/chains";
import Image from "next/image";
import { useFeeTier } from "@/hooks/contracts/read/use-fee-tier";
import { CompoundFeesButton } from "@/components/position-detail/position-options/compound-fees-button";

export default function PositionPage() {
  const router = useRouter();
  const { id: positionId } = router.query;

  const { data: position } = useApiPositionInfo({
    positionId: positionId as string,
  });

  const { data: positionInfo } = useContractPositionInfo({
    positionChainId: position?.chainId as number,
    positionTokenId: position?.activeTokenId as number,
  });

  const { fetchBatch } = useBatchFetchErc20Info();
  const [token0Info, setToken0Info] = useState<ERC20TokenInfo | undefined>();
  const [token1Info, setToken1Info] = useState<ERC20TokenInfo | undefined>();

  useEffect(() => {
    const fetchTokens = async () => {
      if (!position || !positionInfo?.token0 || !positionInfo?.token1) return;

      const result = await fetchBatch(
        [positionInfo.token0, positionInfo.token1],
        position.chainId,
      );

      if (result.success.length > 0) {
        const token0 = result.success.find(
          (t) => t.address.toLowerCase() === positionInfo.token0.toLowerCase(),
        );
        const token1 = result.success.find(
          (t) => t.address.toLowerCase() === positionInfo.token1.toLowerCase(),
        );

        if (token0) setToken0Info(token0);
        if (token1) setToken1Info(token1);
      }
    };

    fetchTokens();
  }, [positionInfo, fetchBatch, position]);

  return (
    <div className="space-y-6">
      <Header
        position={position as PositionInfoInterface}
        token0Info={token0Info}
        token1Info={token1Info}
      />

      <section className="flex gap-3 flex-col md:flex-row">
        <Card className="md:w-1/2 p-0 overflow-hidden">
          <CardContent className="w-full p-0 overflow-hidden">
            <PositionValue
              position={position as PositionInfoInterface}
              token0Info={token0Info}
              token1Info={token1Info}
            />
          </CardContent>
        </Card>
        <Card className="md:w-1/2 p-0 overflow-hidden">
          <CardContent className="w-full p-0 overflow-hidden">
            <FeesEarned
              position={position as PositionInfoInterface}
              token0Info={token0Info}
              token1Info={token1Info}
            />
          </CardContent>
        </Card>
      </section>
      <PositionRangeDisplay
        position={position as PositionInfoInterface}
        token0Info={token0Info}
        token1Info={token1Info}
      />
      <PositionInfo
        position={position as PositionInfoInterface}
        token0Info={token0Info}
        token1Info={token1Info}
      />
      <Card>
        <CardContent className="py-4 flex flex-wrap gap-5">
          <IncreaseLiquidityButton
            position={position as PositionInfoInterface}
            token0Info={token0Info}
            token1Info={token1Info}
          />
          <DecreaseLiquidityButton
            position={position as PositionInfoInterface}
            token0Info={token0Info}
            token1Info={token1Info}
          />
          <CollectFeesButton />
          <CompoundFeesButton />
          <ClosePositionButton />
        </CardContent>
      </Card>
      {/*<YildLoading loading={!isDisconnected && !isConnected} />
      {
        (!Number(router.query.id) || !(Number(router.query.chain)))
        ? <>Loading Panel...</>
        :
        <>
          <PositionInfo positionId={Number(router.query.id)} chainId={Number(router.query.chain)} />
          <PositionControlPanel
            positionId={Number(router.query.id)}
            chainId={(Number(router.query.chain))}
            setPageStatus={(newPageStatus: any) => setPageStatus(newPageStatus)}
          />
        </>
      }

      <AlertDialog
        open={
          pageStatus === POSITION_DETAIL_PAGE_STATE.APPROVING_TOKENS ||
          pageStatus === POSITION_DETAIL_PAGE_STATE.CLOSING_POSITION ||
          pageStatus === POSITION_DETAIL_PAGE_STATE.COLLECTING_FEES ||
          pageStatus === POSITION_DETAIL_PAGE_STATE.COMPOUNDING_POSITION ||
          pageStatus === POSITION_DETAIL_PAGE_STATE.DECREASING_LIQUIDITY ||
          pageStatus === POSITION_DETAIL_PAGE_STATE.INCREASING_LIQUIDITY ||
          pageStatus === POSITION_DETAIL_PAGE_STATE.SETTING_MAX_SLIPPAGE
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>wt Heck</AlertDialogTitle>
            <AlertDialogDescription>
              {pageStatus === POSITION_DETAIL_PAGE_STATE.APPROVING_TOKENS
                ? "Approving tokens, proceed with your wallet."
                : pageStatus === POSITION_DETAIL_PAGE_STATE.CLOSING_POSITION
                ? "Closing your position, proceed with your wallet."
                : pageStatus === POSITION_DETAIL_PAGE_STATE.COLLECTING_FEES
                ? "Collecting fees earned, proceed with your wallet."
                : pageStatus === POSITION_DETAIL_PAGE_STATE.COMPOUNDING_POSITION
                ? "Compounding your position, proceed with your wallet."
                : pageStatus === POSITION_DETAIL_PAGE_STATE.DECREASING_LIQUIDITY
                ? "Decreasing liquidity, proceed with your wallet."
                : pageStatus === POSITION_DETAIL_PAGE_STATE.INCREASING_LIQUIDITY
                ? "Increasing liquidity, proceed with your wallet."
                : pageStatus === POSITION_DETAIL_PAGE_STATE.SETTING_MAX_SLIPPAGE
                ? "Updating advanced settings, this might take a second."
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <WaitingAnimation />
        </AlertDialogContent>
      </AlertDialog>*/}
    </div>
  );
}

const Header = ({
  position,
  token0Info,
  token1Info,
}: {
  position: PositionInfoInterface;
  token0Info?: ERC20TokenInfo;
  token1Info?: ERC20TokenInfo;
}) => {
  const networkData = getNetworkDataFromChainId(position?.chainId || base.id);
  const { data: feeTier } = useFeeTier({
    poolAddress: position?.poolAddress,
  });

  return (
    <div className="flex flex-col gap-2 items-start relative">
      <Link
        href={"/"}
        className="flex text-xs items-center gap-2 font-normal mb-2 text-muted-foreground cursor-pointer hover:underline"
      >
        <ArrowLeft size={13} className="-translate-y-0.5" />
        Back to Positions
      </Link>
      <section className="flex gap-3">
        <section className="-space-x-4 flex">
          <TokenLogo token={token0Info} />
          <TokenLogo token={token1Info} />
        </section>
        <section className="flex flex-col">
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
              {(feeTier || 0) / 1000}%
            </div>
          </div>
          <span className="text-xs text-muted-foreground flex items-center">
            #{position?.activeTokenId}
            <ExternalLink size={10} className="ml-2 cursor-pointer" />
          </span>
        </section>
        <Image
          src={networkData.image}
          width={30}
          height={20}
          alt={networkData.name}
          className="absolute right-0 top-1/2"
        />
      </section>
    </div>
  );
};
