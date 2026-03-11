import React, { useState } from 'react';
import { Users, Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import ConnectGuard from '../components/ConnectGuard';
import { useWallet } from '../contexts/WalletContext';

const DAO_CONTRACT = 'bcrt1p...';

const PROPOSALS = [
  { id: 1, title: 'Increase Swap Fee to 0.3%', description: 'Increase protocol swap fee from 0.2% to 0.3% to fund development.', status: 'Active', votesFor: 2840, votesAgainst: 1120, deadline: 'Mar 15, 2026', quorum: '67%' },
  { id: 2, title: 'Add ORDI/BTC Lending Market', description: 'Open a new lending market for ORDI tokens with initial LTV of 50%.', status: 'Active', votesFor: 4210, votesAgainst: 830, deadline: 'Mar 20, 2026', quorum: '82%' },
  { id: 3, title: 'Deploy on Bitcoin Testnet4', description: 'Deploy all protocol contracts to Bitcoin Testnet4 for broader testing.', status: 'Passed', votesFor: 5500, votesAgainst: 200, deadline: 'Mar 5, 2026', quorum: '96%' },
];

function DAOContent() {
  const { executeContract, address } = useWallet();
  const [activeTab, setActiveTab] = useState('proposals');
  const [votingId, setVotingId] = useState(null);
  const [voteState, setVoteState] = useState({});
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [propState, setPropState] = useState('idle');
  const [propError, setPropError] = useState('');

  const handleVote = async (proposalId, support) => {
    setVotingId(`${proposalId}-${support}`);
    try {
      await executeContract(DAO_CONTRACT, 'castVote', [proposalId, support, address]);
      setVoteState((s) => ({ ...s, [proposalId]: support ? 'for' : 'against' }));
    } catch {
      setVoteState((s) => ({ ...s, [proposalId]: 'error' }));
    } finally { setVotingId(null); }
  };

  const handleCreate = async () => {
    if (!newTitle || !newDesc) return;
    setPropState('signing'); setPropError('');
    try {
      await executeContract(DAO_CONTRACT, 'propose', [newTitle, newDesc, address]);
      setPropState('success'); setNewTitle(''); setNewDesc('');
    } catch (err) { setPropError(err.message || 'Failed'); setPropState('error'); }
  };

  const statusColor = { Active: 'text-green-400 bg-green-400/10 border-green-400/20', Passed: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-white text-3xl">DAO Governance</h1>
          <p className="text-op-text mt-2">Vote on proposals on Bitcoin L1</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab('proposals')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'proposals' ? 'bg-bitcoin text-white' : 'bg-op-card border border-op-border text-op-text hover:text-white'}`}>Proposals</button>
          <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'create' ? 'bg-bitcoin text-white' : 'bg-op-card border border-op-border text-op-text hover:text-white'}`}>
            <Plus size={14} />New Proposal
          </button>
        </div>
      </div>
      {activeTab === 'proposals' ? (
        <div className="space-y-4">
          {PROPOSALS.map((prop) => {
            const total = prop.votesFor + prop.votesAgainst;
            const forPct = Math.round((prop.votesFor / total) * 100);
            const voted = voteState[prop.id];
            return (
              <div key={prop.id} className="bg-op-card border border-op-border rounded-2xl p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs border px-2 py-0.5 rounded-full ${statusColor[prop.status]}`}>{prop.status}</span>
                  </div>
                  <h3 className="font-display font-semibold text-white text-lg">{prop.title}</h3>
                  <p className="text-op-text text-sm mt-1">{prop.description}</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-green-400">For: {prop.votesFor.toLocaleString()} ({forPct}%)</span>
                    <span className="text-red-400">Against: {prop.votesAgainst.toLocaleString()} ({100 - forPct}%)</span>
                  </div>
                  <div className="h-2 bg-red-400/20 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${forPct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1.5 text-op-text">
                    <span>Quorum: {prop.quorum}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{prop.deadline}</span>
                  </div>
                </div>
                {prop.status === 'Active' && (
                  <div className="flex gap-3">
                    {voted ? (
                      <p className="text-sm text-op-text">You voted: <span className={voted === 'for' ? 'text-green-400' : 'text-red-400'}>{voted}</span></p>
                    ) : (
                      <>
                        <button onClick={() => handleVote(prop.id, true)} disabled={!!votingId}
                          className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                          {votingId === `${prop.id}-true` ? <Loader size={13} className="animate-spin" /> : <ThumbsUp size={13} />}Vote For
                        </button>
                        <button onClick={() => handleVote(prop.id, false)} disabled={!!votingId}
                          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                          {votingId === `${prop.id}-false` ? <Loader size={13} className="animate-spin" /> : <ThumbsDown size={13} />}Vote Against
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-op-card border border-op-border rounded-2xl p-6 max-w-lg space-y-5">
          <h2 className="font-display font-semibold text-white text-xl">Create Proposal</h2>
          <div>
            <label className="text-sm text-op-text mb-2 block">Title *</label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Proposal title"
              className="w-full bg-op-darker border border-op-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-bitcoin/40 placeholder-op-border" />
          </div>
          <div>
            <label className="text-sm text-op-text mb-2 block">Description *</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Explain your proposal..." rows={4}
              className="w-full bg-op-darker border border-op-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-bitcoin/40 placeholder-op-border resize-none" />
          </div>
          {propState === 'success' && <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-2"><CheckCircle size={15} className="text-green-400" /><p className="text-green-300 text-sm">Proposal created!</p></div>}
          {propState === 'error' && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2"><AlertCircle size={15} className="text-red-400" /><p className="text-red-300 text-sm">{propError}</p></div>}
          <button onClick={handleCreate} disabled={!newTitle || !newDesc || propState === 'signing'}
            className="w-full flex items-center justify-center gap-2 bg-bitcoin hover:bg-bitcoin/90 disabled:opacity-40 text-white font-display font-bold py-3.5 rounded-xl transition-all">
            {propState === 'signing' ? <><Loader size={16} className="animate-spin" />Waiting for OP_WALLET...</> : <><Users size={16} />Submit Proposal</>}
          </button>
        </div>
      )}
    </div>
  );
}

export default function DAO() {
  return <ConnectGuard title="Connect Wallet to Access DAO"><DAOContent /></ConnectGuard>;
}
