import { useState, useEffect, useCallback } from 'react';

export function useOPWallet() {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [walletInstalled, setWalletInstalled] = useState(false);

  useEffect(() => {
    const check = () => {
      if (window.opnet) {
        setWalletInstalled(true);
        return true;
      }
      return false;
    };
    if (!check()) {
      const i = setInterval(() => { if (check()) clearInterval(i); }, 500);
      return () => clearInterval(i);
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    try {
      const wallet = window.opnet;
      if (!wallet) throw new Error('No Wallet');
      const res = await (wallet.connect ? wallet.connect() : wallet.requestAccounts());
      
      // ABSOLUTE PROTECTION AGAINST .LENGTH ERROR
      let addr = "";
      if (typeof res === 'string') addr = res;
      else if (res && res.address) addr = res.address;
      else if (Array.isArray(res) && res[0]) addr = res[0].address || res[0];
      
      if (!addr) throw new Error('No Address');
      setAddress(addr);
      setIsConnected(true);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  const executeContract = useCallback(async (to, method, params = [], value = 0) => {
    try {
      const wallet = window.opnet;
      if (!wallet) throw new Error('No Wallet');
      
      // Using signInteraction - the hackathon standard
      return await wallet.signInteraction({
        to,
        method,
        params: params || [],
        value: value || 0
      });
    } catch (err) {
      throw new Error(err.message);
    }
  }, []);

  return { address, isConnected, error, walletInstalled, connect, executeContract };
}
