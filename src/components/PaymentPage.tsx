import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useInvoiceDetails, useInvoiceContract } from "../hooks/useInvoiceContract";
import { usePYUSDContract, usePaymentValidation } from "../hooks/usePYUSDContract";
import { formatPYUSDAmount, getInvoiceStatus, truncateAddress } from "../utils/contractHelpers";
import { formatDisplayDate, formatCurrency } from "../utils/formatters";
import { CONTRACTS } from "../utils/constants";
import StatusBadge from "./StatusBadge";
import QRGenerator from "./QRGenerator";

export default function PaymentPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();

  const { invoice, isLoading: isLoadingInvoice, error: invoiceError, refetch } = useInvoiceDetails(invoiceId);
  const { payInvoice, isPending: isPayingInvoice, isConfirming, isConfirmed, error: paymentError } = useInvoiceContract();
  const { approve, isPending: isApproving, isConfirmed: isApprovalConfirmed } = usePYUSDContract();

  const invoiceAmount = invoice ? formatPYUSDAmount(invoice.amount) : "0";
  const {
    hasSufficientBalance,
    needsApproval,
    canPay,
  } = usePaymentValidation(address, invoiceAmount, CONTRACTS.INVOICE_FACTORY);

  const [paymentStep, setPaymentStep] = useState<"approval" | "payment" | "success">("approval");
  const [showQR, setShowQR] = useState(false);

  // Handle approval confirmation
  useEffect(() => {
    if (isApprovalConfirmed && paymentStep === "approval") {
      setPaymentStep("payment");
    }
  }, [isApprovalConfirmed, paymentStep]);

  // Handle payment confirmation
  useEffect(() => {
    if (isConfirmed && paymentStep === "payment") {
      setPaymentStep("success");
      refetch(); // Refresh invoice data to show paid status
    }
  }, [isConfirmed, paymentStep, refetch]);

  const handleApprove = async () => {
    if (!invoice) return;
    
    try {
      await approve(CONTRACTS.INVOICE_FACTORY, invoiceAmount);
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handlePayment = async () => {
    if (!invoiceId) return;
    
    try {
      await payInvoice(invoiceId);
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  const currentUrl = window.location.href;

  if (isLoadingInvoice) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (invoiceError || !invoice) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600 mb-4">
            The invoice you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const status = getInvoiceStatus(invoice);
  const isExpired = status === "expired";
  const isPaid = status === "paid";

  if (paymentStep === "success" || isPaid) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your payment of {formatCurrency(invoiceAmount)} has been processed successfully.
          </p>
          <div className="bg-white rounded-lg p-4 mb-6">
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Organization:</span>
                <span className="font-medium">{invoice.orgName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{formatCurrency(invoiceAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <StatusBadge status="paid" />
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Invoice Payment</h1>
          <p className="text-blue-100">Pay with PYUSD on Ethereum Sepolia</p>
        </div>

        {/* Invoice Details */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Invoice Details</h2>
            <StatusBadge status={status} />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Organization</label>
                <p className="text-gray-900 font-medium">{invoice.orgName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(invoiceAmount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Due Date</label>
                <p className="text-gray-900">{formatDisplayDate(new Date(Number(invoice.dueDate) * 1000))}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Recipient</label>
                <p className="text-gray-900 font-mono text-sm">{truncateAddress(invoice.receiver)}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700">Work Description</label>
            <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">{invoice.workDescription}</p>
          </div>

          {/* QR Code Section */}
          <div className="mb-6 text-center">
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showQR ? "Hide" : "Show"} QR Code for Mobile Payment
            </button>
            {showQR && (
              <div className="mt-4">
                <QRGenerator value={currentUrl} size={200} />
                <p className="text-sm text-gray-600 mt-2">Scan with mobile wallet</p>
              </div>
            )}
          </div>

          {/* Payment Section */}
          {isExpired ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-medium">This invoice has expired</p>
              <p className="text-red-600 text-sm">Contact the organization to request a new invoice</p>
            </div>
          ) : !isConnected ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Connect your wallet to pay this invoice</p>
              <ConnectButton />
            </div>
          ) : !hasSufficientBalance ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 font-medium">Insufficient PYUSD Balance</p>
              <p className="text-yellow-600 text-sm">You need {formatCurrency(invoiceAmount)} to pay this invoice</p>
            </div>
          ) : (
            <div className="space-y-4">
              {needsApproval && paymentStep === "approval" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Step 1: Approve PYUSD Spending</h3>
                  <p className="text-blue-700 text-sm mb-4">
                    You need to approve the contract to spend your PYUSD tokens first.
                  </p>
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isApproving ? "Approving..." : `Approve ${formatCurrency(invoiceAmount)}`}
                  </button>
                </div>
              )}

              {(canPay || paymentStep === "payment") && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">
                    {paymentStep === "payment" ? "Step 2: " : ""}Pay Invoice
                  </h3>
                  <p className="text-green-700 text-sm mb-4">
                    Complete the payment of {formatCurrency(invoiceAmount)} to {invoice.orgName}
                  </p>
                  <button
                    onClick={handlePayment}
                    disabled={isPayingInvoice || isConfirming}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPayingInvoice
                      ? "Processing Payment..."
                      : isConfirming
                      ? "Confirming Transaction..."
                      : `Pay ${formatCurrency(invoiceAmount)}`}
                  </button>
                </div>
              )}

              {(paymentError || invoiceError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    {(paymentError as any)?.message || (invoiceError as any)?.message || "An error occurred"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
