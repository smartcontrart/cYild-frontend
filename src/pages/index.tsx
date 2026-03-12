"use client";

import { WavesLadder } from "lucide-react";
import { useState } from "react";
import { useConnection } from "wagmi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePositions } from "@/hooks/api/use-positions";
import { PositionInfoCard } from "@/components/position-info-card/position-info-card";

export default function Home() {
  const { isConnected } = useConnection();
  const [openedSwitch, setOpenedSwitch] = useState("opened");

  const { data: userPositions, isLoading: isLoadingPositions } = usePositions();

  const openPositions = userPositions?.filter(
    (position) => position.status === "opened",
  );
  const closedPositions = userPositions?.filter(
    (position) => position.status === "closed",
  );

  const viewedPositions =
    openedSwitch === "opened" ? openPositions : closedPositions;

  const sortedPositions = viewedPositions?.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Sort by newest first
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center sm:min-h-[60vh] min-h-[80vh]">
        <h2 className="text-xl font-bold mb-4 text-center">
          Sign in with your wallet to continue
        </h2>
        <p className="text-muted-foreground sm:max-w-[60vw]">
          Yild Finance is a cutting-edge DeFi platform designed to automate
          Uniswap V3 liquidity provision. By leveraging smart algorithms and
          on-chain data, Yild Finance dynamically adjusts liquidity positions,
          optimizing yield generation while reducing impermanent loss. Whether
          you&apos;re a passive investor or an experienced liquidity provider,
          our platform simplifies LP management, allowing you to maximize
          profits with minimal effort.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-row gap-2">
          <WavesLadder className="self-center" />
          <h2 className="text-xl">Your Positions</h2>
        </div>
      </div>
      <Tabs
        value={openedSwitch}
        onValueChange={(value: string) => {
          setOpenedSwitch(value);
        }}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="opened">Open Positions</TabsTrigger>
          <TabsTrigger value="closed">Closed Positions</TabsTrigger>
        </TabsList>
      </Tabs>
      <section className="flex flex-col gap-7">
        {isLoadingPositions &&
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="w-full h-81.75 bg-loader rounded-xl animate-pulse"
            />
          ))}
        {!isLoadingPositions && (sortedPositions || []).length === 0 && (
          <section>
            <span>No Positions Found</span>
          </section>
        )}
        {(sortedPositions || []).map((position) => (
          <PositionInfoCard position={position} key={position.id} />
        ))}
      </section>
    </div>
  );
}
