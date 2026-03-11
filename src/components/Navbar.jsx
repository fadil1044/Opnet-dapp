import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, ChevronDown, Copy, LogOut, ExternalLink, Menu, X } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import ConnectWalletModal from './ConnectWalletModal';

function truncate(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Navbar() {
  const { isConnected, address, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/swap', label: 'Swap' },
    { to: '/lending', label: 'Lending' },
    { to: '/nft', label: 'NFT Market' },
    { to: '/dao', label: 'DAO' },
    { to: '/raffle', label: 'Raffle' },
  ];

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-op-dark/95 backdrop-blur border-b border-op-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-bitcoin flex items-center justify-center shadow-lg shadow-bitcoin/30">
                <span className="text-white font-bold text-sm">₿</span>
              </div>
              <div>
                <span className="font-display font-bold text-white text-lg leading-none">Bitcoin</span>
                <span className="font-display font-bold text-bitcoin text-lg leading-none">DeFi</span>
              </div>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to ? 'bg-bitcoin/15 text-bitcoin' : 'text-op-text hover:text-white hover:bg-op-border'}`}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="relative">
                  <button onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 bg-op-card border border-bitcoin/30 hover:border-bitcoin/60 rounded-xl px-3 py-2 transition-all">
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="font-mono text-sm text-white">{truncate(address)}</span>
                    <ChevronDown size={14} className="text-op-text" />
                  </button>
                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-op-card border border-op-border rounded-xl shadow-2xl z-20 overflow-hidden">
                        <div className="p-4 border-b border-op-border">
                          <p className="text-xs text-op-text mb-1">Connected</p>
                          <p className="font-mono text-sm text-white">{truncate(address)}</p>
                        </div>
                        <div className="p-2">
                          <button onClick={() => { copyAddress(); setShowDropdown(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-op-text hover:text-white hover:bg-op-border transition-colors">
                            <Copy size={14} />{copied ? 'Copied!' : 'Copy Address'}
                          </button>
                          <a href={`https://opscan.org/address/${address}`} target="_blank" rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-op-text hover:text-white hover:bg-op-border transition-colors"
                            onClick={() => setShowDropdown(false)}>
                            <ExternalLink size={14} />View on OPScan
                          </a>
                          <button onClick={() => { disconnect(); setShowDropdown(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                            <LogOut size={14} />Disconnect
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-bitcoin hover:bg-bitcoin/90 text-white font-display font-semibold px-4 py-2 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-bitcoin/20">
                  <Wallet size={15} />Connect Wallet
                </button>
              )}
              <button className="lg:hidden text-op-text hover:text-white p-1" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden border-t border-op-border bg-op-dark">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to ? 'bg-bitcoin/15 text-bitcoin' : 'text-op-text hover:text-white'}`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      {showModal && <ConnectWalletModal onClose={() => setShowModal(false)} />}
    </>
  );
}
