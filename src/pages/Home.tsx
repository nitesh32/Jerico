import { useAccount, useBalance } from "wagmi";

function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌈 ETHGlobal Frontend</h1>
        <p>Built with Vite + React + TypeScript + RainbowKit</p>
      </header>

      <main className="app-main">
        {isConnected ? (
          <div className="wallet-info">
            <h2>✅ Wallet Connected</h2>
            <div className="info-card">
              <p>
                <strong>Address:</strong> {address}
              </p>
              {balance && (
                <p>
                  <strong>Balance:</strong> {balance.formatted} {balance.symbol}
                </p>
              )}
            </div>
            <div className="features">
              <h3>🚀 Ready for ETHGlobal Development</h3>
              <ul>
                <li>✅ Wallet connection with RainbowKit</li>
                <li>✅ Multi-chain support (Ethereum, Polygon, Optimism, Arbitrum, Base)</li>
                <li>✅ TypeScript for type safety</li>
                <li>✅ Vite for fast development</li>
                <li>🔄 Ready to build your dApp!</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="connect-prompt">
            <h2>👆 Connect your wallet to get started</h2>
            <p>This ETHGlobal frontend is ready for Web3 development!</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
