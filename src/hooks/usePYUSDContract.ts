import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { sepolia } from "wagmi/chains";
import { CONTRACTS, ERC20_ABI } from "../utils/constants";
import { parsePYUSDAmount, formatPYUSDAmount } from "../utils/contractHelpers";

/**
 * Hook for interacting with the PYUSD token contract
 */
export function usePYUSDContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Approve PYUSD spending
   */
  const approve = async (spender: string, amount: string) => {
    const amountBigInt = parsePYUSDAmount(amount);
    
    return writeContract({
      address: CONTRACTS.PYUSD,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender as `0x${string}`, amountBigInt],
      chainId: sepolia.id,
    });
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook to get PYUSD balance
 */
export function usePYUSDBalance(userAddress: string | undefined) {
  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.PYUSD,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!userAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  return {
    balance: balance || 0n,
    balanceFormatted: balance ? formatPYUSDAmount(balance) : "0",
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get PYUSD allowance
 */
export function usePYUSDAllowance(
  ownerAddress: string | undefined,
  spenderAddress: string | undefined
) {
  const { data: allowance, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.PYUSD,
    abi: ERC20_ABI,
    functionName: "allowance",
    args:
      ownerAddress && spenderAddress
        ? [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`]
        : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!(ownerAddress && spenderAddress),
    },
  });

  return {
    allowance: allowance || 0n,
    allowanceFormatted: allowance ? formatPYUSDAmount(allowance) : "0",
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get PYUSD token info
 */
export function usePYUSDTokenInfo() {
  const { data: name } = useReadContract({
    address: CONTRACTS.PYUSD,
    abi: ERC20_ABI,
    functionName: "name",
    chainId: sepolia.id,
  });

  const { data: symbol } = useReadContract({
    address: CONTRACTS.PYUSD,
    abi: ERC20_ABI,
    functionName: "symbol",
    chainId: sepolia.id,
  });

  const { data: decimals } = useReadContract({
    address: CONTRACTS.PYUSD,
    abi: ERC20_ABI,
    functionName: "decimals",
    chainId: sepolia.id,
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.PYUSD,
    abi: ERC20_ABI,
    functionName: "totalSupply",
    chainId: sepolia.id,
  });

  return {
    name: name || "PayPal USD",
    symbol: symbol || "PYUSD",
    decimals: decimals || 6,
    totalSupply: totalSupply || 0n,
    totalSupplyFormatted: totalSupply ? formatPYUSDAmount(totalSupply) : "0",
  };
}

/**
 * Hook to check if user has sufficient balance and allowance for payment
 */
export function usePaymentValidation(
  userAddress: string | undefined,
  amount: string,
  spenderAddress: string | undefined
) {
  const { balance } = usePYUSDBalance(userAddress);
  const { allowance } = usePYUSDAllowance(userAddress, spenderAddress);

  const amountBigInt = amount ? parsePYUSDAmount(amount) : 0n;
  const hasSufficientBalance = balance >= amountBigInt;
  const hasSufficientAllowance = allowance >= amountBigInt;
  const needsApproval = !hasSufficientAllowance && hasSufficientBalance;

  return {
    hasSufficientBalance,
    hasSufficientAllowance,
    needsApproval,
    canPay: hasSufficientBalance && hasSufficientAllowance,
    balance,
    allowance,
    amountBigInt,
  };
}
