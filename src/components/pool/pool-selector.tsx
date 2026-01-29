import { useEffect, useState } from "react";

import { ERC20TokenInfo, INVALID_FEE_TIER } from "@/utils/constants";
import { reArrangeTokensByContractAddress } from "@/utils/functions";
import { getAvailablePools } from "@/utils/pools";

import { PoolInfo } from "@/components/pool/pool-info";
import { useAvailablePools } from "@/hooks/use-available-pools";
import { NewPoolInfo } from "./new-pool-info";
import { useNewPositionStore } from "@/hooks/store/use-new-position-store";

export default function PoolSelector({ chainId }: { chainId: number }) {
  const { selectedToken0, selectedToken1 } = useNewPositionStore();
  const { data: availablePools } = useAvailablePools({
    token0: selectedToken0,
    token1: selectedToken1,
    chainId,
  });

  // useEffect(() => {
  //   onSelectPool(INVALID_FEE_TIER);
  //   const getPoolAddressFunc = async () => {
  //     if (!tokens || tokens.length != 2 || !tokens[0] || !tokens[1]) {
  //       setAvailableFeeTiers([]);
  //       return;
  //     }
  //     const [token0SortedByCA, token1SortedByCA] =
  //       reArrangeTokensByContractAddress(tokens);
  //     const [pool100, pool500, pool3000, pool10000] = await getAvailablePools(
  //       token0SortedByCA.address,
  //       token1SortedByCA.address,
  //       chainId,
  //     );
  //     let temp = [];
  //     if (pool100) temp.push(pool100);
  //     if (pool500) temp.push(pool500);
  //     if (pool3000) temp.push(pool3000);
  //     if (pool10000) temp.push(pool10000);
  //     setAvailableFeeTiers(temp);
  //   };
  //   getPoolAddressFunc();
  // }, [tokens[0], tokens[1]]);

  return (
    <>
      {(availablePools || []).length > 0 ? (
        <div>Select one of the pools below to provide liquidity</div>
      ) : (
        <></>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(availablePools || []).map((poolInfo) => (
          <NewPoolInfo key={poolInfo.poolAddress} poolInfo={poolInfo} />
        ))}
        {/*{availableFeeTiers.map((elem) => (
          <PoolInfo
            key={`FeeTier_${elem?.feeTier}`}
            tokens={tokens}
            address={elem?.poolAddress}
            feeTier={elem?.feeTier}
            token0BalanceInPool={
              Number(elem.balance0) / 10 ** tokens[0].decimals
            }
            token1BalanceInPool={
              Number(elem.balance1) / 10 ** tokens[1].decimals
            }
            chainId={chainId}
            selected={selectedFeeTier === elem.feeTier}
            onClickPool={() => onSelectPool(elem.feeTier)}
          />
        ))}*/}
        {(availablePools || []).length === 0 ? (
          <>No pools available for this pair. Please choose other tokens.</>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
