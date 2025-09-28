import { useAccount } from "wagmi";
import { useUserInvoices } from "./useInvoiceContract";

/**
 * Hook to fetch and cache all invoice details for a user
 * Note: This is a simplified version that just returns invoice IDs
 * Individual invoice details are fetched by components as needed
 */
export function useUserInvoiceData() {
  const { address } = useAccount();
  const { invoiceIds, isLoading, error, refetch } = useUserInvoices(address);

  return {
    invoiceIds: invoiceIds || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get invoice statistics for a user
 * Note: This is a simplified version that just returns the count
 */
export function useInvoiceStats() {
  const { invoiceIds, isLoading } = useUserInvoiceData();

  const stats = {
    total: invoiceIds.length,
    // These would need individual invoice fetching to calculate
    paid: 0,
    pending: 0,
    expired: 0,
  };

  return {
    stats,
    isLoading,
  };
}
