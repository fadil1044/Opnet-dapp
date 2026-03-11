import React, { useState } from 'react';
import { ArrowUpDown, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import ConnectGuard from '../components/ConnectGuard';

const TOKENS = [
  { symbol: 'BTC', name: 'Bitcoin', isNative: true, logo: '₿' },
  { symbol: 'MOTO', name: 'Motoswap', isNative: false, logo: '🏍' }
];

function SwapContent() {
  const { executeContract } = useWallet();
  const [amountIn, setAmountIn] = useState('');
  const [txState, setTxState] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSwap = async () => {
    if (!amountIn) return;
    setTxState('signing');
    setErrorMsg('');
    try {
      // Passing real values to the hook
      const sats = Math.floor(parseFloat(amountIn) * 1e8);
      await executeContract('bcrt1p...', 'swap', [sats], sats);
      setTxState('success');
    } catch (err) {
      setErrorMsg(err.message || 'Swap Failed');
      setTxState('error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-op-card border border-op-border rounded-2xl mt-10">
      <h2 className="text-xl font-bold mb-4">Swap</h2>
      <div className="space-y-4">
        <div className="bg-op-darker p-4 rounded-xl border border-op-border">
          <input 
            type="number" 
            value={amountIn} 
            onChange={(e) => setAmountIn(e.target.value)}
            className="bg-transparent text-2xl w-full outline-none"
            placeholder="0.0"
          />
        </div>
        
        {txState === 'error' && (
          <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-lg flex gap-2">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {txState === 'success' && (
          <div className="text-green-400 text-sm p-3 bg-green-400/10 rounded-lg flex gap-2">
            <CheckCircle size={16} /> Swap Successful!
          </div>
        )}

        <button 
          onClick={handleSwap}
          disabled={txState === 'signing'}
          className="w-full py-4 bg-bitcoin rounded-xl font-bold hover:opacity-90 disabled:opacity-50"
        >
          {txState === 'signing' ? 'Signing...' : 'Swap'}
        </button>
      </div>
    </div>
  );
}

export default function Swap() {
  return <ConnectGuard title="Connect Wallet to Swap"><SwapContent /></ConnectGuard>;
}
