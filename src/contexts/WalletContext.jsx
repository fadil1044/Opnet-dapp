import React, { createContext, useContext } from 'react';
import { useOPWallet } from '../hooks/useOPWallet';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const wallet = useOPWallet();
  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
