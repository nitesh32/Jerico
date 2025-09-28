import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUserInvoices, useInvoiceDetails } from "../hooks/useInvoiceContract";
import { usePYUSDBalance } from "../hooks/usePYUSDContract";
import { 
  formatPYUSDAmount, 
  getInvoiceStatus, 
  generatePaymentUrl, 
  copyToClipboard
} from "../utils/contractHelpers";
import { formatDisplayDate, formatCurrency } from "../utils/formatters";
import StatusBadge from "./StatusBadge";

type FilterType = "all" | "paid" | "pending" | "expired";

interface InvoiceRowProps {
  invoiceId: string;
  onCopyLink: (url: string) => void;
}

function InvoiceRow({ invoiceId, onCopyLink }: InvoiceRowProps) {
  const { invoice, isLoading } = useInvoiceDetails(invoiceId);

  if (isLoading) {
    return (
      <tr className="animate-pulse">
        <td className="px-3 sm:px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="px-3 sm:px-6 py-4 w-96">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </td>
        <td className="px-3 sm:px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="px-3 sm:px-6 py-4 hidden sm:table-cell"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="px-3 sm:px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
        <td className="px-3 sm:px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
      </tr>
    );
  }

  if (!invoice) {
    return (
      <tr>
        <td colSpan={6} className="px-3 sm:px-6 py-4 text-center text-gray-500">
          Failed to load invoice
        </td>
      </tr>
    );
  }

  const status = getInvoiceStatus(invoice);
  const paymentUrl = generatePaymentUrl(invoiceId);

  return (
    <tr className="hover:bg-white/10 hover:backdrop-blur-sm transition-colors">
      <td className="px-3 sm:px-6 py-4 align-top">
        <StatusBadge status={status} />
      </td>
      <td className="px-3 sm:px-6 py-4 align-top w-96">
        <div className="text-sm font-medium text-gray-900 mb-1">{invoice.orgName}</div>
        <div className="text-sm text-gray-600 whitespace-normal leading-relaxed">{invoice.workDescription}</div>
      </td>
      <td className="px-3 sm:px-6 py-4 align-top whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(formatPYUSDAmount(invoice.amount))}
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4 align-top whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
        {formatDisplayDate(new Date(Number(invoice.billDate) * 1000))}
      </td>
      <td className="px-3 sm:px-6 py-4 align-top whitespace-nowrap text-sm text-gray-600">
        {formatDisplayDate(new Date(Number(invoice.dueDate) * 1000))}
      </td>
      <td className="px-3 sm:px-6 py-4 align-top whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopyLink(paymentUrl)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Copy payment link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Open payment page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </td>
    </tr>
  );
}

export default function InvoiceHistory() {
  const { address, isConnected } = useAccount();
  const { invoiceIds, isLoading, error, refetch } = useUserInvoices(address);
  const { balanceFormatted } = usePYUSDBalance(address);
  
  const [filter, setFilter] = useState<FilterType>("all");
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopyLink = async (url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopySuccess(url);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const filterButtons: { key: FilterType; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "paid", label: "Paid" },
    { key: "expired", label: "Expired" },
  ];

  if (!isConnected) {
    return (
      <div className="w-full">
        <div className="text-center bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg shadow-xl p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoice History</h2>
          <p className="text-gray-600 mb-6">Connect your wallet to view your invoice history</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice History</h1>
            <p className="text-gray-600 mt-1">Manage and track your PYUSD invoices</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg px-4 py-2">
              <div className="text-sm text-gray-700">PYUSD Balance</div>
              <div className="text-lg font-semibold text-gray-900">{balanceFormatted}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg p-4 lg:p-6">
          <div className="text-sm font-medium text-gray-700">Total Invoices</div>
          <div className="text-xl lg:text-2xl font-bold text-gray-900">{invoiceIds?.length || 0}</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg p-4 lg:p-6">
          <div className="text-sm font-medium text-gray-700">Pending</div>
          <div className="text-xl lg:text-2xl font-bold text-yellow-600">-</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg p-4 lg:p-6">
          <div className="text-sm font-medium text-gray-700">Paid</div>
          <div className="text-xl lg:text-2xl font-bold text-green-600">-</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg p-4 lg:p-6">
          <div className="text-sm font-medium text-gray-700">Expired</div>
          <div className="text-xl lg:text-2xl font-bold text-red-600">-</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg shadow-xl mb-6 text-white">
        <div className="px-4 sm:px-6 py-4 border-b border-white/20">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((button) => (
              <button
                key={button.key}
                onClick={() => setFilter(button.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === button.key
                    ? "bg-gray-100 text-white"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
              >
                {button.label}
                {button.count !== undefined && (
                  <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                    {button.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filter === "all" ? "all" : filter} invoices
            </div>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-sm text-white/80 hover:text-white disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Copy Success Message */}
        {copySuccess && (
          <div className="px-4 sm:px-6 py-2 bg-green-500/10 backdrop-blur-sm border-b border-green-300/30">
            <p className="text-sm text-green-800">✅ Payment link copied to clipboard!</p>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading invoices...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">Failed to load invoices</p>
              <p className="text-gray-600 text-sm mt-1">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : !invoiceIds || invoiceIds.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-600 mb-4">Create your first invoice to get started</p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:text-white transition-colors"
              >
                Create Invoice
              </a>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/10 backdrop-blur-sm">
                <tr>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-96">
                    Organization & Description
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                    Created
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {invoiceIds.map((invoiceId) => (
                  <InvoiceRow
                    key={invoiceId}
                    invoiceId={invoiceId}
                    onCopyLink={handleCopyLink}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
