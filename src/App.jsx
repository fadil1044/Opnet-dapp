import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Swap from './pages/Swap';
import Lending from './pages/Lending';
import NFTMarketplace from './pages/NFTMarketplace';
import DAO from './pages/DAO';
import Raffle from './pages/Raffle';

function Footer() {
  return (
    <footer className="border-t border-op-border mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-op-text">
        <div className="flex items-center gap-2">
          <span className="text-bitcoin font-bold text-base">₿</span>
          <span>BitcoinDeFi — Built on Bitcoin L1 with OP_NET</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://opnet.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">OP_NET</a>
          <a href="https://docs.opnet.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a>
          <a href="https://opscan.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">OPScan</a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-op-darker text-white font-display">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/lending" element={<Lending />} />
              <Route path="/nft" element={<NFTMarketplace />} />
              <Route path="/dao" element={<DAO />} />
              <Route path="/raffle" element={<Raffle />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
}
