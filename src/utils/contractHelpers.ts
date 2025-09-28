import { formatUnits, parseUnits } from "viem";
import { PYUSD_CONFIG, type Invoice, type InvoiceStatus } from "./constants";

/**
 * Parse PYUSD amount from string to bigint (6 decimals)
 */
export function parsePYUSDAmount(amount: string): bigint {
  return parseUnits(amount, PYUSD_CONFIG.decimals);
}

/**
 * Format PYUSD amount from bigint to string (6 decimals)
 */
export function formatPYUSDAmount(amount: bigint): string {
  return formatUnits(amount, PYUSD_CONFIG.decimals);
}

/**
 * Format date from timestamp to readable string
 */
export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date and time from timestamp
 */
export function formatDateTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get invoice status based on payment state and due date
 */
export function getInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.isPaid) {
    return "paid";
  }
  
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now > invoice.dueDate) {
    return "expired";
  }
  
  return "pending";
}

/**
 * Generate payment URL for an invoice
 */
export function generatePaymentUrl(invoiceId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/pay/${invoiceId}`;
}

/**
 * Validate invoice form data
 */
export function validateInvoiceForm(data: {
  orgName: string;
  workDescription: string;
  amount: string;
  dueDate: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate organization name
  if (!data.orgName.trim()) {
    errors.orgName = "Organization name is required";
  } else if (data.orgName.trim().length < 2) {
    errors.orgName = "Organization name must be at least 2 characters";
  }

  // Validate work description
  if (!data.workDescription.trim()) {
    errors.workDescription = "Work description is required";
  } else if (data.workDescription.trim().length < 10) {
    errors.workDescription = "Work description must be at least 10 characters";
  }

  // Validate amount
  if (!data.amount.trim()) {
    errors.amount = "Amount is required";
  } else {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.amount = "Amount must be a positive number";
    } else if (amount > 1000000) {
      errors.amount = "Amount cannot exceed 1,000,000 PYUSD";
    }
  }

  // Validate due date
  if (!data.dueDate) {
    errors.dueDate = "Due date is required";
  } else {
    const dueDate = new Date(data.dueDate);
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    if (dueDate <= now) {
      errors.dueDate = "Due date must be in the future";
    } else if (dueDate < minDate) {
      errors.dueDate = "Due date must be at least 24 hours from now";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Convert date string to Unix timestamp
 */
export function dateToTimestamp(dateString: string): bigint {
  return BigInt(Math.floor(new Date(dateString).getTime() / 1000));
}

/**
 * Check if invoice is expired
 */
export function isInvoiceExpired(dueDate: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return now > dueDate;
}

/**
 * Get time remaining until due date
 */
export function getTimeRemaining(dueDate: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const diff = Number(dueDate - now);
  
  if (diff <= 0) {
    return "Expired";
  }
  
  const days = Math.floor(diff / (24 * 60 * 60));
  const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);
  
  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
  } else {
    return `${minutes} minute${minutes > 1 ? "s" : ""} remaining`;
  }
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}
