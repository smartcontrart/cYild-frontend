export default [
  { inputs: [], name: "T", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "_priceX96", type: "uint256" },
      { internalType: "uint256", name: "_feesToken0", type: "uint256" },
      { internalType: "uint256", name: "_feesToken1", type: "uint256" },
      { internalType: "uint256", name: "_targetTokenRatio", type: "uint256" },
      { internalType: "bool", name: "_sell0For1", type: "bool" },
    ],
    name: "_getSwapAmounts",
    outputs: [
      { internalType: "uint256", name: "_swapAmount0", type: "uint256" },
      { internalType: "uint256", name: "_swapAmount1", type: "uint256" },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_feesToken0", type: "uint256" },
      { internalType: "uint256", name: "_feesToken1", type: "uint256" },
      { internalType: "uint256", name: "_targetTokenRatio", type: "uint256" },
    ],
    name: "_getSwapDirection",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint160", name: "_sqrtPriceX96", type: "uint160" },
      { internalType: "int24", name: "_tickLower", type: "int24" },
      { internalType: "int24", name: "_tickUpper", type: "int24" },
    ],
    name: "_getTargetAmounts",
    outputs: [
      { internalType: "uint256", name: "_targetAmount0", type: "uint256" },
      { internalType: "uint256", name: "_targetAmount1", type: "uint256" },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_targetAmount0", type: "uint256" },
      { internalType: "uint256", name: "_targetAmount1", type: "uint256" },
    ],
    name: "_getTargetTokenRatio",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "maxSlippage", type: "uint256" },
    ],
    name: "applySlippage",
    outputs: [{ internalType: "uint256", name: "minAmount", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "int24", name: "tickLower", type: "int24" },
      { internalType: "int24", name: "tickUpper", type: "int24" },
      { internalType: "uint256", name: "feesToken0", type: "uint256" },
      { internalType: "uint256", name: "feesToken1", type: "uint256" },
    ],
    name: "calculateRebalanceData",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "swapAmount0", type: "uint256" },
          { internalType: "uint256", name: "swapAmount1", type: "uint256" },
          { internalType: "bool", name: "sell0For1", type: "bool" },
          { internalType: "uint256", name: "priceX96", type: "uint256" },
        ],
        internalType: "struct RebalanceData",
        name: "rebalanceData",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "factory", type: "address" },
      { internalType: "address", name: "tokenIn", type: "address" },
      { internalType: "address", name: "tokenOut", type: "address" },
      { internalType: "uint24", name: "fee", type: "uint24" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "maxSlippage", type: "uint256" },
    ],
    name: "getMinAmountOut",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenIn", type: "address" },
      { internalType: "address", name: "tokenOut", type: "address" },
    ],
    name: "getZeroForOne",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "pure",
    type: "function",
  },
] as const;
