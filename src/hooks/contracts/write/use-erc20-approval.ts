import { Address, erc20Abi, parseUnits, Hash } from "viem";
import { ContractExecutionError } from "@/utils/interfaces/contracts";
import { ERC20TokenInfo } from "@/utils/constants";
import { useContractExecution } from "./use-contract-execution";

interface Erc20ApprovalParams {
  token: ERC20TokenInfo;
  spender: Address;
  amount: string | bigint;
}

interface Erc20ApprovalHook {
  approve: (params: Erc20ApprovalParams) => Promise<Hash>;
  isLoading: boolean;
  error: ContractExecutionError | null;
  reset: () => void;
}

export const useErc20Approval = (): Erc20ApprovalHook => {
  const { execute, isLoading, error, reset } = useContractExecution();

  const approve = async (params: Erc20ApprovalParams): Promise<Hash> => {
    const { token, spender, amount } = params;

    // Convert amount to proper units if it's a string
    const approvalAmount =
      typeof amount === "string" ? parseUnits(amount, token.decimals) : amount;

    // Use maximum uint256 value for unlimited approval
    // const maxAmount = BigInt(
    //   "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    // );

    return execute({
      address: token.address,
      abi: erc20Abi as unknown as unknown[],
      functionName: "approve",
      args: [spender, approvalAmount],
      chainId: token.chainId,
    });
  };

  return {
    approve,
    isLoading,
    error,
    reset,
  };
};
