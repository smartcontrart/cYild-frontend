import { Address, Hash } from "viem";

export interface ContractExecutionResult {
  txHash: Hash;
  blockNumber?: bigint;
  blockHash?: Hash;
  transactionIndex?: number;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
  status: "success" | "reverted";
}

export interface ContractExecutionError {
  name: string;
  message: string;
  cause?: unknown;
  details?: string;
}

export interface ContractExecutionState {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: ContractExecutionError | null;
  result: ContractExecutionResult | null;
}

export interface ContractWriteParams {
  address: Address;
  abi: unknown[];
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
  chainId?: number;
}

export interface ExecuteContractFunction {
  (params?: Partial<ContractWriteParams>): Promise<ContractExecutionResult>;
}

export interface ContractExecutionHook {
  execute: (params: ContractWriteParams) => Promise<Hash>;
  isLoading: boolean;
  error: ContractExecutionError | null;
  reset: () => void;
}
