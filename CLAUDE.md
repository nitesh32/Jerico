# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PYUSD Invoice System - An ETHGlobal hackathon project that creates a decentralized invoice generation and payment system using PayPal USD (PYUSD). Built with Vite, React, TypeScript, and RainbowKit for Web3 integration.

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.x with hot reload
- **Styling**: TailwindCSS 4.x with responsive design
- **Web3 Stack**:
  - RainbowKit 2.2.8 for wallet connection UI
  - Wagmi 2.x for Web3 React hooks  
  - Viem 2.x for Ethereum interactions
  - TanStack Query for data fetching and caching
- **Blockchain**: Ethereum Sepolia testnet
- **Payment Token**: PYUSD (6 decimals, not 18)
- **Additional Libraries**: 
  - React Router for navigation
  - QRCode for payment link generation
  - Framer Motion for animations

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload  
npm run dev

# Build for production (includes TypeScript compilation)
npm run build

# Preview production build
npm run preview

# Lint code (ESLint with TypeScript)
npm run lint
```

## Code Architecture

### Application Structure

- **Router-based Navigation**: React Router handles 3 main routes:
  - `/` - Home page with invoice creation
  - `/history` - Invoice management dashboard  
  - `/pay/:invoiceId` - Payment processing page

### Smart Contract Integration

- **InvoiceFactory Contract** (`contracts/InvoiceManager.sol`): Manages invoice creation and payment processing
- **PYUSD Token Contract**: ERC20 token for payments (6 decimals)
- **Contract Addresses**: Configured in `src/utils/constants.ts` (Sepolia testnet)

### Key Components Architecture

- **InvoiceCreator** (`src/components/InvoiceCreator.tsx`): Form for creating new invoices
- **InvoiceHistory** (`src/components/InvoiceHistory.tsx`): Dashboard showing user's invoice history
- **PaymentPage** (`src/components/PaymentPage.tsx`): Interface for paying invoices  
- **QRGenerator** (`src/components/QRGenerator.tsx`): Generates QR codes for payment links
- **StatusBadge** (`src/components/StatusBadge.tsx`): Visual status indicators

### Custom Hooks Layer

- **useInvoiceContract** (`src/hooks/useInvoiceContract.ts`): Contract interactions for invoice operations
- **usePYUSDContract** (`src/hooks/usePYUSDContract.ts`): PYUSD token balance and approval operations
- **useInvoiceData** (`src/hooks/useInvoiceData.ts`): Data fetching with TanStack Query

### Web3 Provider Setup

- **Main Entry**: `src/main.tsx` wraps app with WagmiProvider, QueryClientProvider, and RainbowKitProvider
- **Chain Configuration**: Currently configured for Sepolia testnet only
- **WalletConnect**: Placeholder project ID needs replacement

## Critical Development Notes

### PYUSD Specifics
- **PYUSD uses 6 decimals, not 18** - All amount calculations must account for this
- **Contract addresses** in `src/utils/constants.ts` need to be updated before deployment
- **Approval flow required** for PYUSD payments (ERC20 pattern)

### Contract Deployment Requirements
- Deploy `InvoiceFactory` contract with PYUSD Sepolia address as constructor parameter
- Update `INVOICE_FACTORY` address in `src/utils/constants.ts`
- Verify contract on Etherscan for transparency

### Payment Flow Architecture
1. User creates invoice → Smart contract generates unique ID
2. Invoice creator shares payment link with QR code
3. Payer visits link → Connects wallet → Approves PYUSD → Pays invoice
4. Direct peer-to-peer PYUSD transfer (contract doesn't hold funds)

## Project Structure

```
src/
├── main.tsx                    # App entry with Web3 providers
├── App.tsx                     # Router and navigation setup
├── components/
│   ├── InvoiceCreator.tsx      # Invoice creation form
│   ├── InvoiceHistory.tsx      # User invoice dashboard  
│   ├── PaymentPage.tsx         # Payment processing UI
│   ├── QRGenerator.tsx         # QR code generation
│   ├── StatusBadge.tsx         # Status indicators
│   └── Navbar.tsx              # Navigation component
├── pages/
│   ├── Home.tsx               # Landing page
│   ├── History.tsx            # Invoice management
│   └── PayPage.tsx            # Payment page wrapper
├── hooks/
│   ├── useInvoiceContract.ts   # Invoice contract hooks
│   ├── usePYUSDContract.ts     # PYUSD token hooks
│   └── useInvoiceData.ts       # Data fetching hooks
├── utils/
│   ├── constants.ts            # Contract addresses and ABIs
│   ├── contractHelpers.ts      # Contract utility functions
│   └── formatters.ts           # Formatting utilities
└── assets/                     # Static assets
```

## Configuration Files

- **ESLint**: `eslint.config.js` with TypeScript and React rules
- **TypeScript**: Project references setup with `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- **Vite**: `vite.config.ts` with React and TailwindCSS plugins
