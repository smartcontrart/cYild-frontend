import { useCallback } from "react";
import { Address, erc20Abi } from "viem";
import { readContracts } from "@wagmi/core";
import {
  ERC20TokenInfo,
  SUPPORTED_CHAINS,
  getDefaultTokensFromChainId,
} from "@/utils/constants";
import { wagmiConfig } from "@/components/global/providers";

const isSupportedChain = (chainId: number) => {
  return (
    SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId) !== undefined
  );
};

interface BatchTokenResult {
  success: ERC20TokenInfo[];
  failed: { address: Address; error: string }[];
}

export const useBatchFetchErc20Info = () => {
  const fetchBatch = useCallback(
    async (
      tokenAddresses: Address[],
      chainId: number,
    ): Promise<BatchTokenResult> => {
      const result: BatchTokenResult = {
        success: [],
        failed: [],
      };

      if (tokenAddresses.length === 0) {
        return result;
      }

      if (!isSupportedChain(chainId)) {
        // Mark all tokens as failed if unsupported chain
        tokenAddresses.forEach((address) => {
          result.failed.push({
            address,
            error: `Unsupported chain ID: ${chainId}`,
          });
        });
        return result;
      }

      // Get default tokens from constants for this chain
      const defaultTokens = getDefaultTokensFromChainId(chainId);

      // Separate tokens into those found in constants and those that need fetching
      const tokensToFetch: Address[] = [];

      tokenAddresses.forEach((address) => {
        const existingToken = defaultTokens.find(
          (token) => token.address.toLowerCase() === address.toLowerCase(),
        );

        if (existingToken) {
          // Token found in constants, add to success immediately
          result.success.push({
            ...existingToken,
            data: {
              isBatchFetched: false,
              fetchedFromConstants: true,
              fetchedAt: Date.now(),
            },
          });
        } else {
          // Token not found, needs to be fetched
          tokensToFetch.push(address);
        }
      });

      // If all tokens were found in constants, return early
      if (tokensToFetch.length === 0) {
        return result;
      }

      try {
        // Build contracts array for multicall (only for tokens not in constants)
        const contracts = tokensToFetch.flatMap((address) => [
          {
            address,
            abi: erc20Abi,
            functionName: "name" as const,
            chainId: chainId,
          },
          {
            address,
            abi: erc20Abi,
            functionName: "symbol" as const,
            chainId: chainId,
          },
          {
            address,
            abi: erc20Abi,
            functionName: "decimals" as const,
            chainId: chainId,
          },
        ]);

        const contractResults = await readContracts(wagmiConfig, { contracts });

        // Process results in groups of 3 (name, symbol, decimals for each token)
        for (let i = 0; i < tokensToFetch.length; i++) {
          const address = tokensToFetch[i];
          const baseIndex = i * 3;

          const nameResult = contractResults[baseIndex];
          const symbolResult = contractResults[baseIndex + 1];
          const decimalsResult = contractResults[baseIndex + 2];

          // Check if all three calls were successful
          if (
            nameResult?.status === "success" &&
            symbolResult?.status === "success" &&
            decimalsResult?.status === "success"
          ) {
            const tokenInfo: ERC20TokenInfo = {
              address,
              chainId,
              name: nameResult.result as string,
              symbol: symbolResult.result as string,
              decimals: decimalsResult.result as number,
              image: undefined,
              data: {
                isBatchFetched: true,
                fetchedAt: Date.now(),
              },
            };
            result.success.push(tokenInfo);
          } else {
            // Determine the specific error
            let error = "Unknown error occurred";
            if (nameResult?.status === "failure") {
              error = `Failed to fetch name: ${nameResult.error?.message || "Unknown error"}`;
            } else if (symbolResult?.status === "failure") {
              error = `Failed to fetch symbol: ${symbolResult.error?.message || "Unknown error"}`;
            } else if (decimalsResult?.status === "failure") {
              error = `Failed to fetch decimals: ${decimalsResult.error?.message || "Unknown error"}`;
            }

            result.failed.push({
              address,
              error,
            });
          }
        }
      } catch (error) {
        console.error("Batch fetch error:", error);
        // Mark all tokens that needed fetching as failed if the entire batch fails
        tokensToFetch.forEach((address) => {
          result.failed.push({
            address,
            error: `Batch fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        });
      }

      return result;
    },
    [],
  );

  return { fetchBatch };
};
