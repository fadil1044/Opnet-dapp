import { useState, useEffect, useCallback } from 'react';

const OP_NET_RPC = 'https://api.opnet.org';

export function useOPWallet() {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [walletInstalled, setWalletInstalled] = useState(false);

  useEffect(() => {
    const check = () => {
      if (typeof window !== 'undefined' && window.opnet) {
        setProvider(window.opnet);
        setWalletInstalled(true);
        return true;
      }
      return false;
    };
    check();
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    const wallet = window.opnet;
    if (!wallet) {
      setError('OP_WALLET not detected.');
      return false;
    }
    setIsConnecting(true);
    try {
      // Trying the most common OP_NET connection methods
      const result = await (wallet.connect ? wallet.connect() : wallet.requestAccounts());
      
      // CRITICAL FIX: Safely extracting the address to avoid the .length error
      let userAddress = "";
      if (typeof result === 'string') userAddress = result;
      else if (Array.isArray(result) && result.length > 0) userAddress = result[0].address || result[0];
      else if (result && result.address) userAddress = result.address;
      else if (result && result.accounts && result.accounts.length > 0) userAddress = result.accounts[0].address || result.accounts[0];

      if (!userAddress) throw new Error('No address found');

      setAddress(userAddress);
      setIsConnected(true);
      return true;
    } catch (err) {
      setError(err.message || 'Connection failed');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const executeContract = useCallback(async (contractAddress, method, params = [], value = 0) => {
    if (!window.opnet) throw new Error('Wallet not found');
    try {
      const wallet = window.opnet;
      // We check for the specific OP_NET interaction method
      if (wallet.signInteraction) {
        return await wallet.signInteraction({
          to: contractAddress,
          method: method,
          params: params,
          value: value
        });
      } 
      // Fallback for older extension versions
      return await wallet.sendBitcoin(contractAddress, value);
    } catch (err) {
      throw new Error(err.message || 'Transaction failed');
    }
  }, []);

  return {
    address, balance, isConnecting, isConnected, error, walletInstalled,
    connect, executeContract
  };
}
