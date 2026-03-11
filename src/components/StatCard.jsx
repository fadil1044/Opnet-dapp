import React from 'react';

export default function StatCard({ label, value, sub, icon: Icon, color = 'bitcoin' }) {
  const iconStyle = {
    bitcoin: 'text-bitcoin bg-bitcoin/10 border-bitcoin/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };
  return (
    <div className="bg-op-card border border-op-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-op-text text-sm font-medium">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${iconStyle[color]}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <p className="font-display font-bold text-white text-2xl">{value}</p>
      {sub && <p className="text-op-text text-xs mt-1">{sub}</p>}
    </div>
  );
}
