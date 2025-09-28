import type { InvoiceStatus } from "../utils/constants";

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return {
          text: "Paid",
          icon: "✅",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
        };
      case "pending":
        return {
          text: "Pending",
          icon: "⏳",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-200",
        };
      case "expired":
        return {
          text: "Expired",
          icon: "❌",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
        };
      default:
        return {
          text: "Unknown",
          icon: "❓",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      <span className="text-xs">{config.icon}</span>
      {config.text}
    </span>
  );
}

// Alternative version with more detailed status information
interface DetailedStatusBadgeProps {
  status: InvoiceStatus;
  dueDate?: bigint;
  className?: string;
}

export function DetailedStatusBadge({ status, dueDate, className = "" }: DetailedStatusBadgeProps) {
  const config = getStatusConfig(status);
  
  const getTimeInfo = () => {
    if (!dueDate) return null;
    
    const now = BigInt(Math.floor(Date.now() / 1000));
    const diff = Number(dueDate - now);
    
    if (status === "expired") {
      const daysPast = Math.floor(Math.abs(diff) / (24 * 60 * 60));
      return daysPast > 0 ? `${daysPast}d overdue` : "Just expired";
    } else if (status === "pending") {
      const daysLeft = Math.floor(diff / (24 * 60 * 60));
      const hoursLeft = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
      
      if (daysLeft > 0) {
        return `${daysLeft}d left`;
      } else if (hoursLeft > 0) {
        return `${hoursLeft}h left`;
      } else {
        return "Due soon";
      }
    }
    
    return null;
  };

  const timeInfo = getTimeInfo();

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
      >
        <span className="text-xs">{config.icon}</span>
        {config.text}
      </span>
      {timeInfo && (
        <span className="text-xs text-gray-500 mt-1 text-center">
          {timeInfo}
        </span>
      )}
    </div>
  );
}

function getStatusConfig(status: InvoiceStatus) {
  switch (status) {
    case "paid":
      return {
        text: "Paid",
        icon: "✅",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-200",
      };
    case "pending":
      return {
        text: "Pending",
        icon: "⏳",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
      };
    case "expired":
      return {
        text: "Expired",
        icon: "❌",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        borderColor: "border-red-200",
      };
    default:
      return {
        text: "Unknown",
        icon: "❓",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        borderColor: "border-gray-200",
      };
  }
}
