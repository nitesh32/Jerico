import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { sepolia } from "wagmi/chains";
import { CONTRACTS, INVOICE_FACTORY_ABI, type Invoice } from "../utils/constants";
import { parsePYUSDAmount, dateToTimestamp } from "../utils/contractHelpers";

/**
 * Hook for interacting with the Invoice Factory contract
 */
export function useInvoiceContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Create a new invoice
   */
  const createInvoice = async (data: {
    orgName: string;
    workDescription: string;
    amount: string;
    dueDate: string;
  }) => {
    const amountBigInt = parsePYUSDAmount(data.amount);
    const dueDateTimestamp = dateToTimestamp(data.dueDate);

    return writeContract({
      address: CONTRACTS.INVOICE_FACTORY,
      abi: INVOICE_FACTORY_ABI,
      functionName: "createInvoice",
      args: [data.orgName, data.workDescription, amountBigInt, dueDateTimestamp],
      chainId: sepolia.id,
    });
  };

  /**
   * Pay an invoice
   */
  const payInvoice = async (invoiceId: string) => {
    return writeContract({
      address: CONTRACTS.INVOICE_FACTORY,
      abi: INVOICE_FACTORY_ABI,
      functionName: "payInvoice",
      args: [invoiceId as `0x${string}`],
      chainId: sepolia.id,
    });
  };

  return {
    createInvoice,
    payInvoice,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook to get invoice details
 */
export function useInvoiceDetails(invoiceId: string | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.INVOICE_FACTORY,
    abi: INVOICE_FACTORY_ABI,
    functionName: "getInvoice",
    args: invoiceId ? [invoiceId as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!invoiceId,
    },
  });

  const invoice: Invoice | null = data
    ? {
        id: invoiceId!,
        orgName: data[0],
        workDescription: data[1],
        amount: data[2],
        billDate: data[3],
        dueDate: data[4],
        receiver: data[5],
        isPaid: data[6],
      }
    : null;

  return {
    invoice,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get user's invoices
 */
export function useUserInvoices(userAddress: string | undefined) {
  const { data: invoiceIds, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.INVOICE_FACTORY,
    abi: INVOICE_FACTORY_ABI,
    functionName: "getUserInvoices",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    invoiceIds: invoiceIds || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if an invoice is paid
 */
export function useInvoicePaymentStatus(invoiceId: string | undefined) {
  const { data: isPaid, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.INVOICE_FACTORY,
    abi: INVOICE_FACTORY_ABI,
    functionName: "isInvoicePaid",
    args: invoiceId ? [invoiceId as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!invoiceId,
      refetchInterval: 5000, // Poll every 5 seconds for payment status
    },
  });

  return {
    isPaid: isPaid || false,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get user's invoice count
 */
export function useUserInvoiceCount(userAddress: string | undefined) {
  const { data: count, isLoading, error } = useReadContract({
    address: CONTRACTS.INVOICE_FACTORY,
    abi: INVOICE_FACTORY_ABI,
    functionName: "getUserInvoiceCount",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    count: count ? Number(count) : 0,
    isLoading,
    error,
  };
}
