import React, { useState } from 'react';
import { Ticket, Trophy, Clock, Users, Loader, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import ConnectGuard from '../components/ConnectGuard';
import { useWallet } from '../contexts/WalletContext';

const RAFFLE_CONTRACT = 'bcrt1p...';

const RAFFLES = [
  { id: 1, title: 'Bitcoin Block Raffle', prize: '0.5 BTC', ticketPrice: '0.001', totalTickets: 500, soldTickets: 347, deadline: 'Mar 14, 2026', participants: 189 },
  { id: 2, title: 'OP_NET Genesis NFT', prize: 'Genesis NFT + 0.05 BTC', ticketPrice: '0.0005', totalTickets: 1000, soldTickets: 612, deadline: 'Mar 18, 2026', participants: 412 },
  { id: 3, title: 'Weekly MOTO Prize Pool', prize: '10,000 MOTO', ticketPrice: '0.0001', totalTickets: 2000, soldTickets: 1823, deadline: 'Mar 13, 2026', participants: 901 },
];

function RaffleContent() {
  const { executeContract, address } = useWallet();
  const [ticketCounts, setTicketCounts] = useState({});
  const [buyState, setBuyState] = useState({});

  const handleBuy = async (raffle) => {
    const count = ticketCounts[raffle.id] || 1;
    setBuyState((s) => ({ ...s, [raffle.id]: 'signing' }));
    try {
      await executeContract(RAFFLE_CONTRACT, 'buyTickets', [raffle.id, count, address], Math.floor(parseFloat(raffle.ticketPrice) * 1e8 * count));
      setBuyState((s) => ({ ...s, [raffle.id]: 'success' }));
    } catch (err) {
      setBuyState((s) => ({ ...s, [raffle.id]: 'error:' + err.message }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in space-y-8">
      <div>
        <h1 className="font-display font-bold text-white text-3xl">Raffle / Lottery</h1>
        <p className="text-op-text mt-2">Provably fair on-chain lottery — randomness from Bitcoin blocks</p>
      </div>
      <div className="bg-bitcoin/5 border border-bitcoin/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-bitcoin/20 flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-bitcoin" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-white mb-1">Provably Fair</h3>
          <p className="text-op-text text-sm">Winner selection uses Bitcoin block hashes as randomness — fully verifiable on-chain.</p>
        </div>
      </div>
      <div className="space-y-5">
        {RAFFLES.map((raffle) => {
          const pct = Math.round((raffle.soldTickets / raffle.totalTickets) * 100);
          const state = buyState[raffle.id];
          const count = ticketCounts[raffle.id] || 1;
          const totalCost = (parseFloat(raffle.ticketPrice) * count).toFixed(6);
          return (
            <div key={raffle.id} className="bg-op-card border border-op-border rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-display font-semibold text-white text-xl">{raffle.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Trophy size={14} className="text-bitcoin" />
                    <span className="text-bitcoin font-semibold">{raffle.prize}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-op-text text-xs">Ticket price</p>
                  <p className="font-display font-bold text-white">{raffle.ticketPrice} BTC</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-op-text">{raffle.soldTickets} / {raffle.totalTickets} sold</span>
                  <span className="text-bitcoin font-medium">{pct}% full</span>
                </div>
                <div className="h-2 bg-op-darker rounded-full overflow-hidden border border-op-border">
                  <div className="h-full bg-bitcoin rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-op-darker rounded-xl p-3 text-center border border-op-border">
                  <Users size={14} className="text-op-text mx-auto mb-1" />
                  <p className="text-white text-sm font-semibold">{raffle.participants}</p>
                  <p className="text-op-text text-xs">Participants</p>
                </div>
                <div className="bg-op-darker rounded-xl p-3 text-center border border-op-border">
                  <Ticket size={14} className="text-op-text mx-auto mb-1" />
                  <p className="text-white text-sm font-semibold">{raffle.totalTickets - raffle.soldTickets}</p>
                  <p className="text-op-text text-xs">Remaining</p>
                </div>
                <div className="bg-op-darker rounded-xl p-3 text-center border border-op-border">
                  <Clock size={14} className="text-op-text mx-auto mb-1" />
                  <p className="text-white text-xs font-semibold">{raffle.deadline}</p>
                  <p className="text-op-text text-xs">Deadline</p>
                </div>
              </div>
              {state === 'success' ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle size={16} className="text-green-400" />
                  <p className="text-green-300 text-sm font-medium">Tickets purchased! Good luck! 🍀</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-op-darker border border-op-border rounded-xl overflow-hidden">
                    <button onClick={() => setTicketCounts((s) => ({ ...s, [raffle.id]: Math.max(1, (s[raffle.id] || 1) - 1) }))}
                      className="px-3 py-2.5 text-op-text hover:text-white hover:bg-op-border transition-colors text-lg">−</button>
                    <span className="px-4 text-white font-mono font-semibold text-sm">{count}</span>
                    <button onClick={() => setTicketCounts((s) => ({ ...s, [raffle.id]: (s[raffle.id] || 1) + 1 }))}
                      className="px-3 py-2.5 text-op-text hover:text-white hover:bg-op-border transition-colors text-lg">+</button>
                  </div>
                  <button onClick={() => handleBuy(raffle)} disabled={state === 'signing'}
                    className="flex-1 flex items-center justify-center gap-2 bg-bitcoin hover:bg-bitcoin/90 disabled:opacity-50 text-white font-display font-semibold py-2.5 rounded-xl transition-all text-sm">
                    {state === 'signing' ? <><Loader size={14} className="animate-spin" />Waiting for OP_WALLET...</> : <><Ticket size={14} />Buy {count} ticket{count > 1 ? 's' : ''} ({totalCost} BTC)</>}
                  </button>
                </div>
              )}
              {state?.startsWith('error:') && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-400" />
                  <p className="text-red-300 text-sm">{state.replace('error:', '')}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Raffle() {
  return <ConnectGuard title="Connect Wallet to Enter Raffle"><RaffleContent /></ConnectGuard>;
}
