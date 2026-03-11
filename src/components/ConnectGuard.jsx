import React, { useState } from 'react';
import { Wallet, Lock } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import ConnectWalletModal from './ConnectWalletModal';

export default function ConnectGuard({ children, title = 'Connect Your Wallet' }) {
  const { isConnected } = useWallet();
  const [showModal, setShowModal] = useState(false);

  if (isConnected) return <>{children}</>;

  return (
    <>
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-bitcoin/10 border border-bitcoin/20 flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-bitcoin" />
          </div>
          <h2 className="font-display font-bold text-white text-2xl mb-3">{title}</h2>
          <p className="text-op-text mb-8 leading-relaxed">Connect your OP_WALLET to interact with Bitcoin L1 smart contracts.</p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-bitcoin hover:bg-bitcoin/90 text-white font-display font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-bitcoin/20">
            <Wallet size={18} /> Connect OP_WALLET
          </button>
        </div>
      </div>
      {showModal && <ConnectWalletModal onClose={() => setShowModal(false)} />}
    </>
  );
}
