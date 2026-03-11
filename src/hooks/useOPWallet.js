import { useState, useEffect, useCallback } from 'react';

export function useOPWallet() {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [walletInstalled, setWalletInstalled] = useState(false);

  // This part makes the popup work again by finding window.opnet
  useEffect(() => {
    const checkWallet = () => {
      if (typeof window !== 'undefined' && window.opnet) {
        setWalletInstalled(true);
        return true;
      }
      return false;
    };

    if (!checkWallet()) {
      const interval = setInterval(() => {
        if (checkWallet()) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    
    try {
      const wallet = window.opnet;
      if (!wallet) throw new Error('OP_WALLET not found. Please refresh.');

      // Standard OP_NET connect call
      const result = await (wallet.connect ? wallet.connect() : wallet.requestAccounts());
      
      // THE "LENGTH" FIX: We use optional chaining and checks to prevent the crash
      let userAddr = "";
      if (typeof result === 'string') {
        userAddr = result;
      } else if (result && result.address) {
        userAddr = result.address;
      } else if (Array.isArray(result) && result.length > 0) {
        userAddr = result[0]?.address || result[0];
      } else if (result && result.accounts && result.accounts[0]) {
        userAddr = result.accounts[0].address || result.accounts[0];
      }

      if (!userAddr) throw new Error('No address returned from wallet');

      setAddress(userAddr);
      setIsConnected(true);
      return true;
    } catch (err) {
      console.error("Connect error:", err);
      setError(err.message || 'Connection failed');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const executeContract = useCallback(async (contractAddress, method, params = [], value = 0) => {
    const wallet = window.opnet;
    if (!wallet) throw new Error('Wallet not found');

    try {
      // Use the standard interaction method for OP_NET
      if (wallet.signInteraction) {
        return await wallet.signInteraction({
          to: contractAddress,
          method: method,
          params: params,
          value: value
        });
      }
      
      // Final fallback
      return await wallet.sendBitcoin(contractAddress, value);
    } catch (err) {
      throw new Error(err.message || 'Transaction failed');
    }
  }, []);

  return {
    address,
    isConnected,
    isConnecting,
    error,
    walletInstalled,
    connect,
    executeContract
  };
}
