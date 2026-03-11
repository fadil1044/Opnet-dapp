import React, { useState } from 'react';
import { X, ExternalLink, Zap, Shield, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const INSTALL_URL = 'https://chromewebstore.google.com/detail/opwallet/pmbjpcmaaladnfpacpmhmnfmpklgbdjb';

export default function ConnectWalletModal({ onClose }) {
  const { connect, isConnecting, error, walletInstalled } = useWallet();
  const [step, setStep] = useState('idle');

  const handleConnect = async () => {
    setStep('connecting');
    const ok = await connect();
    if (ok) { setStep('success'); setTimeout(onClose, 1200); }
    else setStep('error');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-op-card border border-op-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-op-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-bitcoin/20 flex items-center justify-center">
                <span className="text-bitcoin font-bold text-sm">₿</span>
              </div>
              <h2 className="font-display font-semibold text-white text-lg">Connect Wallet</h2>
            </div>
            <button onClick={onClose} className="text-op-text hover:text-white p-1 rounded-lg hover:bg-op-border transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div
              className={`border rounded-xl p-5 transition-all ${walletInstalled ? 'border-bitcoin/40 bg-bitcoin/5 hover:border-bitcoin/70 cursor-pointer' : 'border-op-border bg-op-darker opacity-60'}`}
              onClick={walletInstalled && step === 'idle' ? handleConnect : undefined}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-bitcoin/20 border border-bitcoin/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🟠</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-white">OP_WALLET</span>
                    {walletInstalled && <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">Installed</span>}
                  </div>
                  <p className="text-op-text text-sm mt-0.5">Bitcoin L1 • Powered by OP_NET</p>
                </div>
                <div className="flex-shrink-0">
                  {step === 'idle' && walletInstalled && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
                  {step === 'connecting' && <Loader size={18} className="text-bitcoin animate-spin" />}
                  {step === 'success' && <CheckCircle size={18} className="text-green-400" />}
                  {step === 'error' && <AlertCircle size={18} className="text-red-400" />}
                </div>
              </div>
              {step === 'connecting' && (
                <div className="mt-4 pt-4 border-t border-bitcoin/20">
                  <p className="text-sm text-bitcoin text-center animate-pulse">Waiting for OP_WALLET approval...</p>
                  <p className="text-xs text-op-text text-center mt-1">Check the OP_WALLET popup and approve</p>
                </div>
              )}
              {step === 'success' && (
                <div className="mt-4 pt-4 border-t border-green-500/20">
                  <p className="text-sm text-green-400 text-center">✓ Connected successfully!</p>
                </div>
              )}
            </div>
            {!walletInstalled && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-orange-300 font-medium">OP_WALLET not detected</p>
                    <p className="text-xs text-orange-400/70 mt-1">Install the Chrome extension to connect.</p>
                    <a href={INSTALL_URL} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-bitcoin hover:text-bitcoin/80">
                      <ExternalLink size={12} /> Install OP_WALLET
                    </a>
                  </div>
                </div>
              </div>
            )}
            {error && step === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-300">{error}</p>
                    <button onClick={() => setStep('idle')} className="text-xs text-red-400 hover:text-red-300 mt-2 underline">Try again</button>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-op-darker rounded-lg p-3">
                <Shield size={14} className="text-bitcoin" />
                <span className="text-xs text-op-text">Non-custodial</span>
              </div>
              <div className="flex items-center gap-2 bg-op-darker rounded-lg p-3">
                <Zap size={14} className="text-bitcoin" />
                <span className="text-xs text-op-text">Bitcoin L1</span>
              </div>
            </div>
            {walletInstalled && step === 'idle' && (
              <button onClick={handleConnect}
                className="w-full bg-bitcoin hover:bg-bitcoin/90 text-white font-display font-semibold py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-bitcoin/20">
                Connect OP_WALLET
              </button>
            )}
          </div>
          <div className="px-6 pb-6">
            <p className="text-xs text-op-text text-center">
              By connecting you agree to interact with Bitcoin L1 smart contracts.{' '}
              <a href="https://docs.opnet.org" target="_blank" rel="noopener noreferrer" className="text-bitcoin/70 hover:text-bitcoin">Learn more</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
