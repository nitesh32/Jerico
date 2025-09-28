/**
 * Format PYUSD amount for display with proper decimals and currency symbol
 */
export function formatCurrency(amount: string | number, showSymbol = true): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return "0.00";
  
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(numAmount);
  
  return showSymbol ? `${formatted} PYUSD` : formatted;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(amount: string | number): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return "0";
  
  if (numAmount >= 1_000_000_000) {
    return `${(numAmount / 1_000_000_000).toFixed(1)}B`;
  } else if (numAmount >= 1_000_000) {
    return `${(numAmount / 1_000_000).toFixed(1)}M`;
  } else if (numAmount >= 1_000) {
    return `${(numAmount / 1_000).toFixed(1)}K`;
  }
  
  return numAmount.toString();
}

/**
 * Format date for form inputs (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Format date for display
 */
export function formatDisplayDate(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return "Invalid Date";
  
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (Math.abs(diffDay) >= 1) {
    const days = Math.abs(diffDay);
    const suffix = days === 1 ? "day" : "days";
    return diffDay > 0 ? `in ${days} ${suffix}` : `${days} ${suffix} ago`;
  } else if (Math.abs(diffHour) >= 1) {
    const hours = Math.abs(diffHour);
    const suffix = hours === 1 ? "hour" : "hours";
    return diffHour > 0 ? `in ${hours} ${suffix}` : `${hours} ${suffix} ago`;
  } else if (Math.abs(diffMin) >= 1) {
    const minutes = Math.abs(diffMin);
    const suffix = minutes === 1 ? "minute" : "minutes";
    return diffMin > 0 ? `in ${minutes} ${suffix}` : `${minutes} ${suffix} ago`;
  } else {
    return "just now";
  }
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string): string {
  if (!hash) return "";
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get minimum date for form input (tomorrow)
 */
export function getMinimumDueDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateForInput(tomorrow);
}

/**
 * Validate and format amount input
 */
export function formatAmountInput(value: string): string {
  // Remove any non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, "");
  
  // Ensure only one decimal point
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }
  
  // Limit decimal places to 6 (PYUSD precision)
  if (parts[1] && parts[1].length > 6) {
    return parts[0] + "." + parts[1].slice(0, 6);
  }
  
  return cleaned;
}
