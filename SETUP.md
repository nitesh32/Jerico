# PYUSD Invoice System Setup Guide

This guide will help you set up and deploy the complete PYUSD invoice generation and payment system.

## 🏗️ Architecture Overview

- **Frontend**: React + TypeScript + Vite + TailwindCSS + RainbowKit
- **Blockchain**: Ethereum Sepolia testnet
- **Smart Contract**: Invoice Factory pattern with PYUSD integration
- **Payment Flow**: Direct peer-to-peer PYUSD transfers

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **MetaMask** or compatible Web3 wallet
4. **Sepolia ETH** for gas fees
5. **PYUSD on Sepolia** for testing payments

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Contract Addresses

Edit `src/utils/constants.ts` and update the contract addresses:

```typescript
export const CONTRACTS = {
  // Get PYUSD Sepolia address from official documentation
  PYUSD: "0x[PYUSD_SEPOLIA_ADDRESS]", 
  
  // Deploy your InvoiceFactory contract and update this
  INVOICE_FACTORY: "0x[YOUR_DEPLOYED_CONTRACT_ADDRESS]",
} as const;
```

### 3. Configure WalletConnect (Optional)

Edit `src/main.tsx` and replace the placeholder project ID:

```typescript
const config = getDefaultConfig({
  appName: "PYUSD Invoice System",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // Get from https://cloud.walletconnect.com
  chains: [sepolia, mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Smart Contract Deployment

### 1. Deploy InvoiceFactory Contract

The contract is located at `contracts/InvoiceManager.sol`. Deploy it with the PYUSD Sepolia address as constructor parameter.

**Constructor Parameters:**
- `_pyusd`: PYUSD token contract address on Sepolia

### 2. Verify Contract on Etherscan

After deployment, verify your contract on Sepolia Etherscan for transparency.

### 3. Update Frontend Configuration

Update the `INVOICE_FACTORY` address in `src/utils/constants.ts` with your deployed contract address.

## 💰 Getting Test Tokens

### Sepolia ETH
- Use [Sepolia Faucet](https://sepoliafaucet.com/)
- Or [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

### PYUSD on Sepolia
- Check PayPal's official documentation for Sepolia PYUSD faucet
- Or bridge from mainnet if available

## 🎯 Core Features

### ✅ Invoice Creation
- Form validation with proper error handling
- On-chain storage via smart contract
- Automatic payment link generation
- QR code generation for mobile payments

### ✅ Payment Processing
- PYUSD balance validation
- Automatic approval flow handling
- Real-time transaction status updates
- Mobile-responsive payment interface

### ✅ Invoice Management
- User invoice history dashboard
- Payment status tracking
- Copy payment links functionality
- Filter by payment status

### ✅ Mobile Support
- Responsive design for all screen sizes
- QR code scanning for mobile wallets
- Touch-friendly interface

## 🔄 User Flow

### Creating an Invoice
1. Connect wallet with RainbowKit
2. Fill out invoice form (org name, description, amount, due date)
3. Submit transaction to create invoice on-chain
4. Get shareable payment link and QR code

### Paying an Invoice
1. Visit payment link (`/pay/:invoiceId`)
2. View invoice details
3. Connect wallet
4. Approve PYUSD spending (if needed)
5. Complete payment transaction
6. Receive confirmation

### Managing Invoices
1. Visit history page (`/history`)
2. View all created invoices
3. Check payment status
4. Copy payment links
5. Filter by status

## 🛠️ Development

### Project Structure

```
src/
├── components/
│   ├── InvoiceCreator.tsx      # Invoice creation form
│   ├── InvoiceHistory.tsx      # Invoice management dashboard
│   ├── PaymentPage.tsx         # Payment processing interface
│   ├── QRGenerator.tsx         # QR code component
│   └── StatusBadge.tsx         # Payment status indicators
├── hooks/
│   ├── useInvoiceContract.ts   # Invoice contract interactions
│   ├── usePYUSDContract.ts     # PYUSD token interactions
│   └── useInvoiceData.ts       # Data fetching and caching
├── utils/
│   ├── constants.ts            # Contract addresses and ABIs
│   ├── contractHelpers.ts      # Contract utility functions
│   └── formatters.ts           # Formatting utilities
├── pages/
│   ├── Home.tsx               # Landing page with invoice creation
│   ├── History.tsx            # Invoice management page
│   └── PayPage.tsx            # Payment processing page
└── App.tsx                    # Main app with routing
```

### Key Technologies

- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript Ethereum library
- **RainbowKit**: Wallet connection UI
- **TanStack Query**: Data fetching and caching
- **React Router**: Client-side routing
- **QRCode**: QR code generation
- **TailwindCSS**: Utility-first CSS framework

### Environment Variables

Create a `.env.local` file for any sensitive configuration:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
VITE_PYUSD_CONTRACT_ADDRESS=0x...
VITE_INVOICE_FACTORY_ADDRESS=0x...
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Wallet connection works
- [ ] Invoice creation form validation
- [ ] Invoice creation transaction
- [ ] Payment link generation
- [ ] QR code generation
- [ ] Payment page loads correctly
- [ ] PYUSD balance checking
- [ ] Approval transaction flow
- [ ] Payment transaction flow
- [ ] Invoice history loading
- [ ] Status updates after payment
- [ ] Mobile responsiveness

### Test Scenarios

1. **Happy Path**: Create invoice → Share link → Pay invoice → Verify payment
2. **Insufficient Balance**: Try to pay with insufficient PYUSD
3. **Expired Invoice**: Try to pay an expired invoice
4. **Already Paid**: Try to pay an already paid invoice
5. **Wrong Network**: Try to use on wrong network

## 🚨 Important Notes

### PYUSD Decimals
PYUSD uses **6 decimals**, not 18 like ETH. Make sure all amount calculations use the correct decimals.

### Gas Optimization
The contract is optimized for gas efficiency:
- Minimal storage usage
- Efficient data structures
- Direct transfers without holding funds

### Security Considerations
- Contract doesn't hold funds (direct peer-to-peer transfers)
- Input validation on both frontend and contract
- Proper error handling for all edge cases

## 📱 Mobile Optimization

The app is fully responsive and optimized for mobile:
- Touch-friendly buttons and forms
- QR code scanning support
- Mobile wallet integration
- Responsive table layouts

## 🔍 Troubleshooting

### Common Issues

**"Invoice not found"**
- Check if the invoice ID is correct
- Verify the contract address is correct
- Ensure you're on the right network (Sepolia)

**"Insufficient allowance"**
- The approval transaction may have failed
- Try the approval step again
- Check PYUSD balance

**"Transaction failed"**
- Check gas settings
- Verify network connection
- Ensure sufficient ETH for gas

**QR codes not generating**
- Check browser console for errors
- Ensure the qrcode library is installed
- Verify the URL format is correct

### Getting Help

1. Check browser console for errors
2. Verify network and contract addresses
3. Test with small amounts first
4. Check Sepolia Etherscan for transaction details

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

The built files in `dist/` can be deployed to any static hosting service.

### Environment Variables for Production

Set these in your hosting platform:
- `VITE_WALLETCONNECT_PROJECT_ID`
- Any other environment-specific variables

## 📄 License

This project is built for ETHGlobal hackathon purposes. Please check individual dependencies for their licenses.
