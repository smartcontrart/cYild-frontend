import { useRouter } from "next/router";
import { PositionInfo as PositionInfoInterface } from "@/utils/interfaces/misc";
import { ERC20TokenInfo } from "@/utils/constants";
import { useBatchFetchErc20Info } from "@/hooks/contracts/read/use-batch-fetch-erc20-info";
import { useEffect, useState } from "react";
import { useContractPositionInfo } from "@/hooks/contracts/read/use-contract-position-info";
import { IncreaseLiquidityButton } from "@/components/position-detail/position-options/increase-liquidity-button";
import { DecreaseLiquidityButton } from "@/components/position-detail/position-options/decrease-liquidity-button";
import { CollectFeesButton } from "@/components/position-detail/position-options/collect-fees-button";
import { ClosePositionButton } from "@/components/position-detail/position-options/close-position-button";
import { CompoundFeesButton } from "@/components/position-detail/position-options/compound-fees-button";
import { usePoolData } from "@/hooks/contracts/read/use-pool-data";
import { UpdateBufferButton } from "@/components/position-detail/position-options/update-buffer-button";
import { UpdateSlippageButton } from "./update-slippage-button";
import { useApiPositionInfo } from "@/hooks/api/use-api-position-info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ellipsis, Edit, Minus, GaugeIcon, Scale } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionDropdownItem } from "./action-dropdown-item";
import { UpdateRebalancingSplitButton } from "./update-rebalancing-split-button";

export const PositionOptions = () => {
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

  const [updateBufferOpen, setUpdateBufferOpen] = useState<boolean>(false);
  const [updateSlippageOpen, setUpdateSlippageOpen] = useState<boolean>(false);
  const [updateRebalancingOpen, setUpdateRebalancingOpen] =
    useState<boolean>(false);

  const { token0: contractToken0, token1: contractToken1 } = usePoolData({
    poolAddress: position?.poolAddress,
    chainId: position?.chainId,
    enabled: !position || position?.status !== "closed ",
  });

  useEffect(() => {
    const fetchTokens = async () => {
      let result = undefined;
      let token0;
      let token1;
      if (!position) return;

      if (position.status === "closed") {
        if (!contractToken0 || !contractToken1) return;
        result = await fetchBatch(
          [contractToken0, contractToken1],
          position.chainId,
        );
        token0 = contractToken0;
        token1 = contractToken1;
      } else {
        if (!positionInfo) return;
        result = await fetchBatch(
          [positionInfo.token0, positionInfo.token1],
          position.chainId,
        );
        token0 = positionInfo.token0;
        token1 = positionInfo.token1;
      }

      if (result.success.length > 0) {
        const foundToken0 = result.success.find(
          (t) => t.address.toLowerCase() === token0.toLowerCase(),
        );
        const foundToken1 = result.success.find(
          (t) => t.address.toLowerCase() === token1.toLowerCase(),
        );

        if (foundToken0) setToken0Info(foundToken0);
        if (foundToken1) setToken1Info(foundToken1);
      }
    };

    fetchTokens();
  }, [positionInfo, fetchBatch, contractToken0, contractToken1, position]);

  return (
    <>
      {/* Controlled dialogs rendered outside DropdownMenuContent to avoid
          Radix pointer-events conflict between DropdownMenu and Dialog */}
      <UpdateBufferButton
        open={updateBufferOpen}
        onOpenChange={setUpdateBufferOpen}
        position={position as PositionInfoInterface}
        token0Info={token0Info}
        token1Info={token1Info}
      />
      <UpdateSlippageButton
        open={updateSlippageOpen}
        onOpenChange={setUpdateSlippageOpen}
        position={position as PositionInfoInterface}
      />
      <UpdateRebalancingSplitButton
        open={updateRebalancingOpen}
        onOpenChange={setUpdateRebalancingOpen}
        position={position as PositionInfoInterface}
        token0Info={token0Info}
        token1Info={token1Info}
      />

      <Card>
        <CardHeader className="flex flex-row justify-between items-center -mb-5">
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Position Actions
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} size={"sm"}>
                <Ellipsis />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <ActionDropdownItem
                text="Update Closing Prices"
                icon={<Edit />}
                action={() => setUpdateBufferOpen(true)}
              />
              <ActionDropdownItem
                text="Update Slippage"
                icon={<GaugeIcon />}
                action={() => setUpdateSlippageOpen(true)}
              />
              <ActionDropdownItem
                text="Update Rebalancing Split"
                icon={<Scale />}
                action={() => setUpdateRebalancingOpen(true)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="py-4 flex gap-5">
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
          <CollectFeesButton
            position={position as PositionInfoInterface}
            token0Info={token0Info}
            token1Info={token1Info}
          />
          <CompoundFeesButton
            position={position as PositionInfoInterface}
            token0Info={token0Info}
            token1Info={token1Info}
          />
          <ClosePositionButton />
        </CardContent>
      </Card>
    </>
  );
};
