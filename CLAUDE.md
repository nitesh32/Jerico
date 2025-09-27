# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ETHGlobal hackathon frontend project built with Vite, React, TypeScript, and RainbowKit. The project provides a modern Web3 development foundation with wallet connection capabilities and multi-chain support.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7.x for fast development and building
- **Web3 Stack**:
  - RainbowKit 2.2.8 for wallet connection UI
  - Wagmi 2.x for Web3 React hooks
  - Viem 2.x for Ethereum interactions
  - TanStack Query for data fetching
- **Supported Chains**: Ethereum, Polygon, Optimism, Arbitrum, Base

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Code Architecture

### Main Entry Point

- `src/main.tsx`: Application entry point with Web3 providers setup
- `src/App.tsx`: Main application component with wallet connection logic

### Web3 Configuration

- RainbowKit providers wrap the entire app in `main.tsx`
- WalletConnect projectId needs to be set (currently placeholder)
- Multi-chain configuration supports major L1 and L2 networks

### Key Components

- ConnectButton from RainbowKit provides wallet connection UI
- useAccount and useBalance hooks from Wagmi for wallet state
- Responsive design with custom CSS animations

## Development Notes

- **WalletConnect Setup**: Replace `YOUR_PROJECT_ID` in `src/main.tsx` with actual project ID from https://cloud.walletconnect.com
- **Chain Configuration**: Modify chains array in `main.tsx` for different network support
- **Styling**: Custom CSS with gradient animations for ETHGlobal branding
- **TypeScript**: Full TypeScript setup with proper Web3 type safety

## Common Development Tasks

- Add new chains: Update the chains array in `src/main.tsx`
- Customize RainbowKit theme: Add theme config to RainbowKitProvider
- Add new Web3 hooks: Import from wagmi and use in components
- Deploy: Build with `npm run build` and deploy the `dist` folder

## Project Structure

```
src/
├── main.tsx          # App entry point with Web3 providers
├── App.tsx           # Main app component
├── App.css           # Custom styles with animations
├── index.css         # Global styles
└── assets/           # Static assets
```
