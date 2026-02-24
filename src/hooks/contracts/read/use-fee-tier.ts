import { Address } from "viem";
import { useReadContract } from "wagmi";

const abi = [
  {
    inputs: [],
    name: "fee",
    outputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const useFeeTier = ({
  poolAddress,
  chainId,
}: {
  poolAddress: Address | undefined;
  chainId?: number;
}) => {
  const { data, isLoading, error, refetch, ...rest } = useReadContract({
    address: poolAddress,
    abi: abi,
    functionName: "fee",
    chainId: chainId,
    query: {
      enabled:
        !!poolAddress &&
        poolAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  return {
    data: data as number | undefined,
    isLoading,
    error,
    refetch,
    ...rest,
  };
};
