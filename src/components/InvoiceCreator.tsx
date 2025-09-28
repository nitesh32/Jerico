import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useInvoiceContract } from "../hooks/useInvoiceContract";
import { validateInvoiceForm, generatePaymentUrl } from "../utils/contractHelpers";
import { formatAmountInput, getMinimumDueDate } from "../utils/formatters";
import QRGenerator from "./QRGenerator";
import type { InvoiceFormData } from "../utils/constants";

interface InvoiceCreatorProps {
  onSuccess?: (invoiceId: string) => void;
}

export default function InvoiceCreator({ onSuccess }: InvoiceCreatorProps) {
  const { address, isConnected } = useAccount();
  const { createInvoice, isPending, isConfirming, isConfirmed, hash, error } = useInvoiceContract();

  const [formData, setFormData] = useState<InvoiceFormData>({
    orgName: "",
    workDescription: "",
    amount: "",
    dueDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: keyof InvoiceFormData, value: string) => {
    let processedValue = value;
    
    // Special handling for amount field
    if (field === "amount") {
      processedValue = formatAmountInput(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateInvoiceForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await createInvoice(formData);
    } catch (err) {
      console.error("Failed to create invoice:", err);
    }
  };

  // Handle successful transaction
  if (isConfirmed && hash && !showSuccess) {
    // In a real implementation, you'd extract the invoice ID from the transaction logs
    // For now, we'll simulate it with the transaction hash
    const invoiceId = hash;
    setCreatedInvoiceId(invoiceId);
    setShowSuccess(true);
    onSuccess?.(invoiceId);
  }

  const handleCreateAnother = () => {
    setFormData({
      orgName: "",
      workDescription: "",
      amount: "",
      dueDate: "",
    });
    setErrors({});
    setCreatedInvoiceId(null);
    setShowSuccess(false);
  };

  if (showSuccess && createdInvoiceId) {
    const paymentUrl = generatePaymentUrl(createdInvoiceId);

    return (
      <div className="max-w-2xl mx-auto p-6 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Created Successfully!</h2>
          <p className="text-gray-600">Your invoice has been created and stored on the blockchain.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Organization:</label>
              <p className="text-gray-900">{formData.orgName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Amount:</label>
              <p className="text-gray-900">{formData.amount} PYUSD</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Due Date:</label>
              <p className="text-gray-900">{new Date(formData.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-300/30 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Payment Link</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                value={paymentUrl}
                readOnly
                className="w-full px-3 py-2 border border-white/30 rounded-md bg-white/20 backdrop-blur-sm text-sm"
              />
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(paymentUrl)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Copy Link
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <QRGenerator value={paymentUrl} size={200} />
          <p className="text-sm text-gray-600 mt-2">Scan QR code to pay on mobile</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCreateAnother}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Create Another Invoice
          </button>
          <button
            onClick={() => window.open(paymentUrl, "_blank")}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Payment Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 rounded-lg shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Invoice</h2>
        <p className="text-gray-600">Fill out the details below to create a PYUSD invoice</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name *
          </label>
          <input
            type="text"
            id="orgName"
            value={formData.orgName}
            onChange={(e) => handleInputChange("orgName", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.orgName ? "border-red-500" : "border-white/30"
            }`}
            placeholder="Enter your organization name"
            disabled={isPending || isConfirming}
          />
          {errors.orgName && <p className="mt-1 text-sm text-red-600">{errors.orgName}</p>}
        </div>

        <div>
          <label htmlFor="workDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Work Description *
          </label>
          <textarea
            id="workDescription"
            value={formData.workDescription}
            onChange={(e) => handleInputChange("workDescription", e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.workDescription ? "border-red-500" : "border-white/30"
            }`}
            placeholder="Describe the work or services provided"
            disabled={isPending || isConfirming}
          />
          {errors.workDescription && <p className="mt-1 text-sm text-red-600">{errors.workDescription}</p>}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (PYUSD) *
          </label>
          <div className="relative">
            <input
              type="text"
              id="amount"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className={`w-full px-3 py-2 pr-16 border rounded-md shadow-sm bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.amount ? "border-red-500" : "border-white/30"
              }`}
              placeholder="0.00"
              disabled={isPending || isConfirming}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 text-sm">PYUSD</span>
            </div>
          </div>
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            type="date"
            id="dueDate"
            value={formData.dueDate}
            onChange={(e) => handleInputChange("dueDate", e.target.value)}
            min={getMinimumDueDate()}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.dueDate ? "border-red-500" : "border-white/30"
            }`}
            disabled={isPending || isConfirming}
          />
          {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              Failed to create invoice: {error.message || "Unknown error"}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending
            ? "Creating Invoice..."
            : isConfirming
            ? "Confirming Transaction..."
            : "Create Invoice"}
        </button>
      </form>

    </div>
  );
}
