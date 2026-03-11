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
    if (!check()) {
      const t = setTimeout(check, 1000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!provider) return;
    const onAccount = (accounts) => {
      if (accounts?.length > 0) setAddress(accounts[0]);
      else disconnect();
    };
    const onNetwork = (n) => setNetwork(n);
    provider.on?.('accountsChanged', onAccount);
    provider.on?.('networkChanged', onNetwork);
    return () => {
      provider.removeListener?.('accountsChanged', onAccount);
      provider.removeListener?.('networkChanged', onNetwork);
    };
  }, [provider]);

  const fetchBalance = useCallback(async (addr) => {
    const target = addr || address;
    if (!target) return;
    try {
      const res = await fetch(`${OP_NET_RPC}/api/v1/address/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: target }),
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data?.balance ?? data?.result ?? null);
      }
    } catch (e) {}
  }, [address]);

  const connect = useCallback(async () => {
    setError(null);
    if (!provider) {
      setError('OP_WALLET not installed.');
      return false;
    }
    setIsConnecting(true);
    try {
      let accounts;
      if (provider.requestAccounts) accounts = await provider.requestAccounts();
      else if (provider.connect) {
        const r = await provider.connect();
        accounts = r?.address ? [r.address] : r;
      } else if (provider.getAccounts) accounts = await provider.getAccounts();

      if (!accounts?.length) throw new Error('No accounts returned');
      const addr = typeof accounts[0] === 'string' ? accounts[0] : accounts[0]?.address;
      setAddress(addr);
      setIsConnected(true);
      try { if (provider.getNetwork) setNetwork(await provider.getNetwork()); } catch {}
      await fetchBalance(addr);
      return true;
    } catch (err) {
      setError(err.code === 4001 ? 'Rejected by user.' : err.message || 'Connection failed');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [provider, fetchBalance]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setNetwork(null);
    setIsConnected(false);
    setError(null);
    try { provider?.disconnect?.(); } catch {}
  }, [provider]);

  const signMessage = useCallback(async (message) => {
    if (!provider || !isConnected) throw new Error('Wallet not connected');
    try {
      if (provider.signMessage) return await provider.signMessage(message);
      throw new Error('signMessage not supported');
    } catch (err) {
      if (err.code === 4001) throw new Error('User rejected');
      throw err;
    }
  }, [provider, isConnected]);

  const sendTransaction = useCallback(async (txData) => {
    if (!provider || !isConnected) throw new Error('Wallet not connected');
    try {
      if (provider.sendBitcoin) return await provider.sendBitcoin(txData.to, txData.amount);
      if (provider.sendTransaction) return await provider.sendTransaction(txData);
      if (provider.signAndBroadcastTransaction) return await provider.signAndBroadcastTransaction(txData);
      throw new Error('No send method available');
    } catch (err) {
      if (err.code === 4001) throw new Error('Rejected by user');
      throw err;
    }
  }, [provider, isConnected]);

  const executeContract = useCallback(async (contractAddress, method, params = [], value = 0) => {
    if (!provider || !isConnected) throw new Error('Wallet not connected');
    try {
      if (provider.executeContract) return await provider.executeContract(contractAddress, method, params, value);
      return await sendTransaction({ to: contractAddress, data: JSON.stringify({ method, params }), value });
    } catch (err) {
      if (err.code === 4001) throw new Error('Rejected by user');
      throw err;
    }
  }, [provider, isConnected, sendTransaction]);

  const callContract = useCallback(async (contractAddress, method, params = []) => {
    try {
      const res = await fetch(`${OP_NET_RPC}/api/v1/contract/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress, method, params, from: address }),
      });
      return await res.json();
    } catch (err) {
      throw new Error(`Contract call failed: ${err.message}`);
    }
  }, [address]);

  return {
    provider, address, balance, network,
    isConnecting, isConnected, error, walletInstalled,
    connect, disconnect, signMessage, sendTransaction,
    executeContract, callContract, fetchBalance,
  };
}
