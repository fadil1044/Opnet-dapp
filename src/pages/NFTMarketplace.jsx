import React, { useState } from 'react';
import { Image, Plus, ShoppingCart, Loader, CheckCircle, AlertCircle, Tag } from 'lucide-react';
import ConnectGuard from '../components/ConnectGuard';
import { useWallet } from '../contexts/WalletContext';

const NFT_CONTRACT = 'bcrt1p...';

const NFTS = [
  { id: 1, name: 'Bitcoin Ordinal #001', collection: 'Genesis Collection', price: '0.05', image: '🟠', rarity: 'Rare' },
  { id: 2, name: 'OP_NET Pioneer #042', collection: 'Pioneer Pass', price: '0.12', image: '⚡', rarity: 'Epic' },
  { id: 3, name: 'Satoshi Fragment #007', collection: 'Satoshi Fragments', price: '0.02', image: '₿', rarity: 'Common' },
  { id: 4, name: 'BTC Maxi #099', collection: 'Bitcoin Maxis', price: '0.08', image: '🔶', rarity: 'Uncommon' },
  { id: 5, name: 'Lightning Rod #013', collection: 'Lightning Collection', price: '0.15', image: '🌩', rarity: 'Legendary' },
  { id: 6, name: 'UTXO Ghost #022', collection: 'UTXO Series', price: '0.03', image: '👻', rarity: 'Common' },
];

const rarityColor = {
  Common: 'text-gray-400 border-gray-400/30 bg-gray-400/10',
  Uncommon: 'text-green-400 border-green-400/30 bg-green-400/10',
  Rare: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  Epic: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  Legendary: 'text-bitcoin border-bitcoin/30 bg-bitcoin/10',
};

function NFTContent() {
  const { executeContract, address } = useWallet();
  const [activeTab, setActiveTab] = useState('browse');
  const [txState, setTxState] = useState({});
  const [mintName, setMintName] = useState('');
  const [mintDesc, setMintDesc] = useState('');
  const [mintPrice, setMintPrice] = useState('');
  const [mintState, setMintState] = useState('idle');
  const [mintError, setMintError] = useState('');

  const handleBuy = async (nft) => {
    setTxState((s) => ({ ...s, [nft.id]: 'signing' }));
    try {
      await executeContract(NFT_CONTRACT, 'purchase', [nft.id, address], Math.floor(parseFloat(nft.price) * 1e8));
      setTxState((s) => ({ ...s, [nft.id]: 'success' }));
    } catch (err) {
      setTxState((s) => ({ ...s, [nft.id]: 'error:' + err.message }));
    }
  };

  const handleMint = async () => {
    if (!mintName) return;
    setMintState('signing'); setMintError('');
    try {
      await executeContract(NFT_CONTRACT, 'mint', [address, mintName, mintDesc, 'ipfs://...'], mintPrice ? Math.floor(parseFloat(mintPrice) * 1e8) : 0);
      setMintState('success'); setMintName(''); setMintDesc(''); setMintPrice('');
    } catch (err) {
      setMintError(err.message || 'Mint failed'); setMintState('error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-white text-3xl">NFT Marketplace</h1>
          <p className="text-op-text mt-2">Trade OP-721 NFTs on Bitcoin L1</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab('browse')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'browse' ? 'bg-bitcoin text-white' : 'bg-op-card border border-op-border text-op-text hover:text-white'}`}>Browse</button>
          <button onClick={() => setActiveTab('mint')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'mint' ? 'bg-bitcoin text-white' : 'bg-op-card border border-op-border text-op-text hover:text-white'}`}>
            <Plus size={14} />Mint NFT
          </button>
        </div>
      </div>
      {activeTab === 'browse' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {NFTS.map((nft) => {
            const state = txState[nft.id];
            return (
              <div key={nft.id} className="bg-op-card border border-op-border rounded-2xl overflow-hidden hover:border-op-text/40 transition-all hover:-translate-y-0.5">
                <div className="h-44 bg-gradient-to-br from-op-darker to-op-border flex items-center justify-center">
                  <span className="text-6xl">{nft.image}</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display font-semibold text-white text-sm">{nft.name}</p>
                      <p className="text-op-text text-xs mt-0.5">{nft.collection}</p>
                    </div>
                    <span className={`text-xs border px-2 py-0.5 rounded-full flex-shrink-0 ${rarityColor[nft.rarity]}`}>{nft.rarity}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag size={12} className="text-bitcoin" />
                    <span className="font-display font-bold text-white">{nft.price} BTC</span>
                  </div>
                  {state === 'success' ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle size={14} /><span>Purchased!</span></div>
                  ) : (
                    <button onClick={() => handleBuy(nft)} disabled={state === 'signing'}
                      className="w-full flex items-center justify-center gap-2 bg-bitcoin/10 hover:bg-bitcoin/20 border border-bitcoin/30 text-bitcoin font-medium py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                      {state === 'signing' ? <><Loader size={13} className="animate-spin" />Waiting...</> : <><ShoppingCart size={13} />Buy for {nft.price} BTC</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="max-w-lg">
          <div className="bg-op-card border border-op-border rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-semibold text-white text-xl">Mint New NFT</h2>
            <div>
              <label className="text-sm text-op-text mb-2 block">NFT Name *</label>
              <input value={mintName} onChange={(e) => setMintName(e.target.value)} placeholder="My Bitcoin NFT"
                className="w-full bg-op-darker border border-op-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-bitcoin/40 transition-colors placeholder-op-border" />
            </div>
            <div>
              <label className="text-sm text-op-text mb-2 block">Description</label>
              <textarea value={mintDesc} onChange={(e) => setMintDesc(e.target.value)} placeholder="Describe your NFT..." rows={3}
                className="w-full bg-op-darker border border-op-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-bitcoin/40 transition-colors placeholder-op-border resize-none" />
            </div>
            <div>
              <label className="text-sm text-op-text mb-2 block">Listing Price (BTC)</label>
              <input type="number" value={mintPrice} onChange={(e) => setMintPrice(e.target.value)} placeholder="0.01"
                className="w-full bg-op-darker border border-op-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-bitcoin/40 transition-colors placeholder-op-border" />
            </div>
            {mintState === 'success' && <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-2"><CheckCircle size={15} className="text-green-400" /><p className="text-green-300 text-sm">NFT minted!</p></div>}
            {mintState === 'error' && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2"><AlertCircle size={15} className="text-red-400" /><p className="text-red-300 text-sm">{mintError}</p></div>}
            <button onClick={handleMint} disabled={!mintName || mintState === 'signing'}
              className="w-full flex items-center justify-center gap-2 bg-bitcoin hover:bg-bitcoin/90 disabled:opacity-40 text-white font-display font-bold py-3.5 rounded-xl transition-all">
              {mintState === 'signing' ? <><Loader size={16} className="animate-spin" />Waiting for OP_WALLET...</> : <><Image size={16} />Mint NFT</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NFTMarketplace() {
  return <ConnectGuard title="Connect Wallet for NFT Market"><NFTContent /></ConnectGuard>;
}
