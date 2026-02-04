import { useState, useCallback } from "react";
import {
  ContractWriteParams,
  ContractExecutionError,
  ContractExecutionHook,
} from "@/utils/interfaces/contracts";
import { simulateContract, writeContract } from "@wagmi/core";
import { Hash } from "viem";
import { wagmiConfig } from "@/components/global/providers";
import { SUPPORTED_CHAINS } from "@/utils/constants";

export const useContractExecution = (): ContractExecutionHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ContractExecutionError | null>(null);
  const isSupportedChain = (chainId: number) => {
    return (
      SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId) !== undefined
    );
  };

  const execute = async (params: ContractWriteParams): Promise<Hash> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate required parameters
      if (
        !params.address ||
        !params.abi ||
        !params.functionName ||
        !params.chainId
      ) {
        const validationError: ContractExecutionError = {
          name: "ValidationError",
          message: "Missing required parameters: address, abi, or functionName",
          details:
            "All three parameters (address, abi, functionName) must be provided",
        };
        setError(validationError);
        throw validationError;
      }

      // Validate chain is supported
      if (!isSupportedChain(params.chainId)) {
        const chainError: ContractExecutionError = {
          name: "UnsupportedChainError",
          message: `Chain ID ${params.chainId} is not supported`,
          details: `Supported chains: ${SUPPORTED_CHAINS.map((chain) => chain.chainId).join(", ")}`,
        };
        setError(chainError);
        throw chainError;
      }

      // Attempt contract simulation first
      let request;
      try {
        const simulation = await simulateContract(wagmiConfig, {
          address: params.address,
          abi: params.abi,
          functionName: params.functionName,
          args: params.args,
          value: params.value,
          chainId: params.chainId,
        });
        request = simulation.request;
      } catch (simulationError: unknown) {
        // Handle different types of simulation errors
        let errorDetails = "Contract simulation failed";

        if (
          simulationError &&
          typeof simulationError === "object" &&
          "message" in simulationError &&
          typeof simulationError.message === "string"
        ) {
          if (simulationError.message.includes("insufficient funds")) {
            errorDetails = "Insufficient funds to execute this transaction";
          } else if (simulationError.message.includes("execution reverted")) {
            errorDetails =
              "Transaction would revert - check contract requirements";
          } else if (simulationError.message.includes("gas")) {
            errorDetails =
              "Gas estimation failed - transaction may be too complex";
          }
        } else if (
          simulationError &&
          typeof simulationError === "object" &&
          "shortMessage" in simulationError &&
          typeof simulationError.shortMessage === "string"
        ) {
          errorDetails = simulationError.shortMessage;
        }

        const simError: ContractExecutionError = {
          name: "SimulationError",
          message: "Contract simulation failed",
          cause: simulationError,
          details: errorDetails,
        };
        setError(simError);
        throw simError;
      }

      // Execute the contract write
      let hash: Hash;
      try {
        hash = await writeContract(wagmiConfig, request);
      } catch (writeError: unknown) {
        // Handle different types of write errors
        let errorMessage = "Transaction execution failed";
        let errorDetails = "An error occurred while executing the transaction";

        if (
          writeError &&
          typeof writeError === "object" &&
          "message" in writeError &&
          typeof writeError.message === "string"
        ) {
          if (writeError.message.includes("User rejected")) {
            errorMessage = "Transaction cancelled";
            errorDetails = "User cancelled the transaction in their wallet";
          } else if (writeError.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds";
            errorDetails = "Not enough funds to cover transaction costs";
          } else if (writeError.message.includes("nonce")) {
            errorMessage = "Nonce error";
            errorDetails = "Transaction nonce conflict - please try again";
          } else if (writeError.message.includes("gas")) {
            errorMessage = "Gas error";
            errorDetails = "Gas limit too low or gas price issues";
          }
        } else if (
          writeError &&
          typeof writeError === "object" &&
          "shortMessage" in writeError &&
          typeof writeError.shortMessage === "string"
        ) {
          errorDetails = writeError.shortMessage;
        }

        const execError: ContractExecutionError = {
          name:
            writeError &&
            typeof writeError === "object" &&
            "name" in writeError &&
            typeof writeError.name === "string"
              ? writeError.name
              : "TransactionError",
          message: errorMessage,
          cause: writeError,
          details: errorDetails,
        };
        setError(execError);
        throw execError;
      }

      return hash;
    } catch (error: unknown) {
      // If it's already a ContractExecutionError, re-throw it
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        "message" in error
      ) {
        throw error;
      }

      // Handle any other unexpected errors
      const unexpectedError: ContractExecutionError = {
        name: "UnexpectedError",
        message: "An unexpected error occurred",
        cause: error,
        details:
          error &&
          typeof error === "object" &&
          "message" in error &&
          typeof error.message === "string"
            ? error.message
            : "Unknown error during contract execution",
      };
      setError(unexpectedError);
      throw unexpectedError;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    execute,
    isLoading,
    error,
    reset,
  };
};
