import React, { useState } from 'react';
import { ArrowUpDown, Loader, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import ConnectGuard from '../components/ConnectGuard';

const TOKENS = [
  { symbol: 'BTC', name: 'Bitcoin', isNative: true, logo: '₿' },
  { symbol: 'MOTO', name: 'Motoswap Token', isNative: false, logo: '🏍' },
  { symbol: 'ORDI', name: 'Ordinals Token', isNative: false, logo: '📜' },
];

function TokenSelect({ token, onSelect, tokens }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-op-darker border border-op-border hover:border-bitcoin/40 rounded-xl px-3 py-2 text-sm font-medium text-white transition-colors">
        <span>{token.logo}</span><span>{token.symbol}</span><span className="text-op-text text-xs">▼</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-48 bg-op-card border border-op-border rounded-xl z-20 overflow-hidden shadow-2xl">
            {tokens.map((t) => (
              <button key={t.symbol} onClick={() => { onSelect(t); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-op-border transition-colors ${t.symbol === token.symbol ? 'bg-bitcoin/10 text-bitcoin' : 'text-white'}`}>
                <span>{t.logo}</span>
                <div className="text-left">
                  <div className="font-medium">{t.symbol}</div>
                  <div className="text-op-text text-xs">{t.name}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SwapContent() {
  const { address } = useWallet();
  const [tokenIn, setTokenIn] = useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(TOKENS[1]);
  const [amountIn, setAmountIn] = useState('');
  const [txState, setTxState] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const estimatedOut = amountIn ? (parseFloat(amountIn) * 0.998).toFixed(8) : '';

  const handleSwap = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) return;
    setTxState('signing');
    setErrorMsg('');
    try {
      const wallet = window.opnet;
      if (!wallet) throw new Error('OP_WALLET not found');

      const amountSats = Math.floor(parseFloat(amountIn) * 1e8);

      // Try every possible method directly
      if (typeof wallet.signInteraction === 'function') {
        await wallet.signInteraction({
          to: 'bcrt1p...',
          method: 'swap',
          params: [amountSats],
          value: amountSats,
        });
      } else if (typeof wallet.executeContract === 'function') {
        await wallet.executeContract('bcrt1p...', 'swap', [amountSats], amountSats);
      } else if (typeof wallet.sendBitcoin === 'function') {
        await wallet.sendBitcoin(address, amountSats);
      } else {
        // Show what IS available
        const allKeys = [];
        for (let key in wallet) allKeys.push(key);
        throw new Error('Wallet methods: ' + allKeys.join(', '));
      }

      setTxState('success');
    } catch (err) {
      setErrorMsg(err.message || 'Failed');
      setTxState('error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-white text-3xl">Token Swap</h1>
        <p className="text-op-text mt-2">Swap OP-20 tokens on Bitcoin L1</p>
      </div>
      <div className="bg-op-card border border-op-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-op-border">
          <h2 className="font-display font-semibold text-white">Swap</h2>
        </div>
        <div className="p-5 space-y-2">
          <div className="bg-op-darker rounded-xl p-4 border border-op-border">
            <span className="text-xs text-op-text">You pay</span>
            <div className="flex items-center gap-3 mt-2">
              <input type="number" value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-display font-semibold text-white outline-none placeholder-op-border min-w-0" />
              <TokenSelect token={tokenIn} onSelect={setTokenIn} tokens={TOKENS} />
            </div>
          </div>

          <div className="flex items-center justify-center py-1">
            <button onClick={() => { setTokenIn(tokenOut); setTokenOut(tokenIn); }}
              className="w-9 h-9 rounded-xl bg-op-darker border border-op-border flex items-center justify-center text-op-text hover:text-bitcoin transition-all">
              <ArrowUpDown size={15} />
            </button>
          </div>

          <div className="bg-op-darker rounded-xl p-4 border border-op-border">
            <span className="text-xs text-op-text">You receive</span>
            <div className="flex items-center gap-3 mt-2">
              <input type="text" value={estimatedOut} readOnly placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-display font-semibold text-white outline-none placeholder-op-border min-w-0" />
              <TokenSelect token={tokenOut} onSelect={setTokenOut} tokens={TOKENS} />
            </div>
          </div>

          {amountIn && (
            <div className="bg-op-darker rounded-xl p-3 border border-op-border space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-op-text">Rate</span>
                <span className="text-white font-mono">1 {tokenIn.symbol} ≈ 0.998 {tokenOut.symbol}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-op-text">Network fee</span>
                <span className="text-white font-mono">~0.00001 BTC</span>
              </div>
            </div>
          )}

          {txState === 'success' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={16} className="text-green-400" />
              <p className="text-green-300 text-sm font-medium">Swap submitted!</p>
            </div>
          )}

          {txState === 'error' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm break-all">{errorMsg}</p>
            </div>
          )}

          <button onClick={handleSwap}
            disabled={!amountIn || txState === 'signing'}
            className="w-full bg-bitcoin hover:bg-bitcoin/90 disabled:opacity-40 text-white font-display font-bold py-4 rounded-xl text-lg transition-all flex items-center justify-center gap-2">
            {txState === 'signing'
              ? <><Loader size={18} className="animate-spin" />Waiting for OP_WALLET...</>
              : 'Swap'}
          </button>

          <div className="flex items-center gap-2 justify-center">
            <Info size={12} className="text-op-text" />
            <p className="text-xs text-op-text">OP_WALLET will ask for approval before signing</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Swap() {
  return <ConnectGuard title="Connect Wallet to Swap"><SwapContent /></ConnectGuard>;
}
