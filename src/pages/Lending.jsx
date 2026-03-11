import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Loader, CheckCircle, AlertCircle, ExternalLink, Info } from 'lucide-react';
import ConnectGuard from '../components/ConnectGuard';
import { useWallet } from '../contexts/WalletContext';

const LENDING_CONTRACT = 'bcrt1p...';

const MARKETS = [
  { symbol: 'BTC', name: 'Bitcoin', supplyAPY: '2.4%', borrowAPY: '4.1%', totalSupply: '$1.2M', utilization: '68%', logo: '₿' },
  { symbol: 'MOTO', name: 'Motoswap Token', supplyAPY: '12.8%', borrowAPY: '18.3%', totalSupply: '$340K', utilization: '82%', logo: '🏍' },
  { symbol: 'WBTC', name: 'Wrapped BTC', supplyAPY: '3.1%', borrowAPY: '5.6%', totalSupply: '$890K', utilization: '74%', logo: '🔶' },
];

function LendingContent() {
  const { executeContract, address } = useWallet();
  const [activeTab, setActiveTab] = useState('supply');
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
  const [amount, setAmount] = useState('');
  const [txState, setTxState] = useState('idle');
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAction = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setTxState('signing'); setErrorMsg('');
    try {
      const amountSats = Math.floor(parseFloat(amount) * 1e8);
      const result = await executeContract(LENDING_CONTRACT, activeTab, [selectedMarket.symbol, amountSats, address],
        selectedMarket.symbol === 'BTC' && activeTab === 'supply' ? amountSats : 0);
      setTxHash(result?.txid || '');
      setTxState('success');
    } catch (err) {
      setErrorMsg(err.message || 'Transaction failed');
      setTxState('error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-in space-y-8">
      <div>
        <h1 className="font-display font-bold text-white text-3xl">Lending Protocol</h1>
        <p className="text-op-text mt-2">Supply assets to earn yield or borrow on Bitcoin L1</p>
      </div>
      <div className="bg-op-card border border-op-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-op-border">
          <h2 className="font-display font-semibold text-white">Markets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-op-border">
                {['Asset', 'Supply APY', 'Borrow APY', 'Total Supply', 'Utilization', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-op-text px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MARKETS.map((m) => (
                <tr key={m.symbol} onClick={() => setSelectedMarket(m)}
                  className={`border-b border-op-border/50 hover:bg-op-border/20 cursor-pointer transition-colors ${selectedMarket.symbol === m.symbol ? 'bg-bitcoin/5' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{m.logo}</span>
                      <div>
                        <p className="font-medium text-white text-sm">{m.symbol}</p>
                        <p className="text-op-text text-xs">{m.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="text-green-400 font-mono text-sm font-semibold">{m.supplyAPY}</span></td>
                  <td className="px-5 py-4"><span className="text-red-400 font-mono text-sm font-semibold">{m.borrowAPY}</span></td>
                  <td className="px-5 py-4 text-white font-mono text-sm">{m.totalSupply}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-op-border rounded-full overflow-hidden">
                        <div className="h-full bg-bitcoin rounded-full" style={{ width: m.utilization }} />
                      </div>
                      <span className="text-op-text text-xs">{m.utilization}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs ${selectedMarket.symbol === m.symbol ? 'text-bitcoin' : 'text-op-text'}`}>
                      {selectedMarket.symbol === m.symbol ? '● Selected' : 'Select'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-op-card border border-op-border rounded-2xl overflow-hidden">
          <div className="flex border-b border-op-border">
            {['supply', 'withdraw', 'borrow', 'repay'].map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setTxState('idle'); setAmount(''); }}
                className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-bitcoin border-b-2 border-bitcoin bg-bitcoin/5' : 'text-op-text hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-op-text">Amount ({selectedMarket.symbol})</label>
              </div>
              <div className="flex items-center gap-3 bg-op-darker border border-op-border rounded-xl px-4 py-3">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0"
                  className="flex-1 bg-transparent text-white text-xl font-display outline-none placeholder-op-border min-w-0" />
                <span className="text-white font-medium">{selectedMarket.symbol}</span>
              </div>
            </div>
            {txState === 'success' && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
                <CheckCircle size={15} className="text-green-400" />
                <p className="text-green-300 text-sm">Transaction submitted!</p>
              </div>
            )}
            {txState === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
                <AlertCircle size={15} className="text-red-400" />
                <p className="text-red-300 text-sm">{errorMsg}</p>
              </div>
            )}
            <button onClick={handleAction} disabled={!amount || txState === 'signing'}
              className="w-full bg-bitcoin hover:bg-bitcoin/90 disabled:opacity-40 text-white font-display font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 capitalize">
              {txState === 'signing' ? <><Loader size={16} className="animate-spin" />Waiting for OP_WALLET...</> : `${activeTab} ${selectedMarket.symbol}`}
            </button>
            <div className="flex items-center gap-2 justify-center">
              <Info size={12} className="text-op-text" />
              <p className="text-xs text-op-text">OP_WALLET will ask for your approval</p>
            </div>
          </div>
        </div>
        <div className="bg-op-card border border-op-border rounded-2xl p-5 space-y-4">
          <h3 className="font-display font-semibold text-white">Your Positions</h3>
          <div className="space-y-3">
            <div className="bg-op-darker rounded-xl p-4 border border-op-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-op-text text-sm">Total Supplied</span>
                <TrendingUp size={14} className="text-green-400" />
              </div>
              <p className="font-display font-bold text-2xl text-white">$0.00</p>
              <p className="text-op-text text-xs mt-1">Supply to earn yield</p>
            </div>
            <div className="bg-op-darker rounded-xl p-4 border border-op-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-op-text text-sm">Total Borrowed</span>
                <TrendingDown size={14} className="text-red-400" />
              </div>
              <p className="font-display font-bold text-2xl text-white">$0.00</p>
              <p className="text-op-text text-xs mt-1">Health factor: —</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Lending() {
  return <ConnectGuard title="Connect Wallet to Access Lending"><LendingContent /></ConnectGuard>;
}
