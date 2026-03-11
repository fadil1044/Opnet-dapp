import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, TrendingUp, Image, Users, Ticket, ChevronRight, Zap, Globe, Lock, ExternalLink, Wallet } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import ConnectWalletModal from '../components/ConnectWalletModal';

const FEATURES = [
  { to: '/swap', icon: ArrowRightLeft, title: 'Token Swap', description: 'Swap OP-20 tokens instantly on Bitcoin L1 with real-time pricing.', color: 'bitcoin' },
  { to: '/lending', icon: TrendingUp, title: 'Lending Protocol', description: 'Supply BTC and OP-20 tokens to earn yield or borrow against collateral.', color: 'green' },
  { to: '/nft', icon: Image, title: 'NFT Marketplace', description: 'Mint, buy, and sell OP-721 NFTs secured by Bitcoin proof-of-work.', color: 'blue' },
  { to: '/dao', icon: Users, title: 'DAO Governance', description: 'Create and vote on proposals to govern protocols on Bitcoin L1.', color: 'purple' },
  { to: '/raffle', icon: Ticket, title: 'Raffle / Lottery', description: 'Provably fair on-chain lottery powered by Bitcoin randomness.', color: 'bitcoin' },
];

const STATS = [
  { label: 'Total Value Locked', value: '$2.4M', sub: '+12.4% this week' },
  { label: 'Total Transactions', value: '48,291', sub: 'On Bitcoin L1' },
  { label: 'Active Users', value: '3,812', sub: 'Connected wallets' },
  { label: 'Contracts Deployed', value: '127', sub: 'OP-NET smart contracts' },
];

export default function Dashboard() {
  const { isConnected, address } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const colorIcon = {
    bitcoin: 'text-bitcoin bg-bitcoin/10 border-bitcoin/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-op-card border border-bitcoin/20 p-8 lg:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-bitcoin/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-bitcoin/10 border border-bitcoin/30 rounded-full px-4 py-1.5 mb-6">
            <Zap size={13} className="text-bitcoin" />
            <span className="text-bitcoin text-xs font-medium">Powered by OP_NET — Bitcoin L1</span>
          </div>
          <h1 className="font-display font-bold text-white text-4xl lg:text-5xl leading-tight mb-4">
            The Programmable<br /><span className="text-bitcoin">Bitcoin Era</span>
          </h1>
          <p className="text-op-text text-lg max-w-xl leading-relaxed mb-8">
            Everything that ran on ETH and SOL — now on Bitcoin. Real smart contracts. Real BTC. No sidechains.
          </p>
          <div className="flex flex-wrap gap-4">
            {!isConnected ? (
              <button onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-bitcoin hover:bg-bitcoin/90 text-white font-display font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-xl hover:shadow-bitcoin/30">
                <Wallet size={18} />Connect OP_WALLET
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 font-medium px-4 py-3 rounded-xl text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {address?.slice(0, 8)}...{address?.slice(-6)} connected
              </div>
            )}
            <a href="https://docs.opnet.org" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-op-darker border border-op-border hover:border-op-text text-op-text hover:text-white font-medium px-6 py-3 rounded-xl transition-all text-sm">
              <Globe size={15} />OP_NET Docs<ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-white text-xl mb-5">Protocol Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-op-card border border-op-border rounded-2xl p-5">
              <p className="text-op-text text-sm mb-3">{s.label}</p>
              <p className="font-display font-bold text-white text-2xl">{s.value}</p>
              <p className="text-op-text text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-white text-xl mb-5">DeFi Modules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link key={feat.to} to={feat.to}
                className="group bg-op-card border border-op-border hover:border-op-text/40 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${colorIcon[feat.color]}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{feat.title}</h3>
                <p className="text-op-text text-sm leading-relaxed mb-4">{feat.description}</p>
                <div className="flex items-center gap-1 text-bitcoin text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open</span><ChevronRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="bg-op-card border border-op-border rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-bitcoin/10 border border-bitcoin/20 flex items-center justify-center">
            <Lock size={20} className="text-bitcoin" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white">Secured by Bitcoin's Proof-of-Work</h3>
            <p className="text-op-text text-sm mt-0.5">All transactions settle on Bitcoin L1.</p>
          </div>
        </div>
        <a href="https://opnet.org" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-bitcoin/10 hover:bg-bitcoin/20 text-bitcoin border border-bitcoin/30 font-medium px-4 py-2.5 rounded-xl text-sm transition-all flex-shrink-0">
          Learn about OP_NET<ExternalLink size={13} />
        </a>
      </div>

      {showModal && <ConnectWalletModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
