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
    const checkWallet = () => {
      if (window.opnet) {
        setProvider(window.opnet);
        setWalletInstalled(true);
        return true;
      }
      return false;
    };
    if (!checkWallet()) {
      const t1 = setTimeout(checkWallet, 500);
      const t2 = setTimeout(checkWallet, 1500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    const wallet = window.opnet;
    if (!wallet) {
      setError('OP_WALLET not found. Please install it.');
      return false;
    }
    setIsConnecting(true);
    try {
      let result;
      if (typeof wallet.connect === 'function') result = await wallet.connect();
      else if (typeof wallet.requestAccounts === 'function') result = await wallet.requestAccounts();
      else if (typeof wallet.enable === 'function') result = await wallet.enable();
      else throw new Error('No connect method found');

      // Handle ALL possible return formats safely
      let userAddress = null;
      if (!result) throw new Error('No response from wallet');
      if (typeof result === 'string') userAddress = result;
      else if (Array.isArray(result) && result.length > 0) {
        userAddress = typeof result[0] === 'string' ? result[0] : result[0]?.address;
      } else if (result?.address) userAddress = result.address;
      else if (result?.accounts && result.accounts.length > 0) {
        userAddress = typeof result.accounts[0] === 'string' ? result.accounts[0] : result.accounts[0]?.address;
      } else if (result?.p2tr) userAddress = result.p2tr;
      else if (result?.taproot) userAddress = result.taproot;
      else if (result?.nativeSegwit) userAddress = result.nativeSegwit;

      if (!userAddress) throw new Error('Could not get address from wallet response');

      setAddress(userAddress);
      setProvider(wallet);
      setWalletInstalled(true);
      setIsConnected(true);

      try { if (wallet.getNetwork) setNetwork(await wallet.getNetwork()); } catch (e) {}

      try {
        const res = await fetch(`${OP_NET_RPC}/api/v1/address/balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: userAddress }),
        });
        if (res.ok) { const data = await res.json(); setBalance(data?.balance ?? data?.result ?? '0'); }
      } catch (e) {}

      return true;
    } catch (err) {
      setError(err.code === 4001 ? 'Rejected by user.' : err.message || 'Connection failed');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null); setBalance(null); setNetwork(null);
    setIsConnected(false); setError(null);
    try { window.opnet?.disconnect?.(); } catch (e) {}
  }, []);

  const signMessage = useCallback(async (message) => {
    if (!isConnected) throw new Error('Wallet not connected');
    try { return await window.opnet.signMessage(message); }
    catch (err) { if (err.code === 4001) throw new Error('User rejected'); throw err; }
  }, [isConnected]);

  const sendTransaction = useCallback(async (txData) => {
    if (!isConnected) throw new Error('Wallet not connected');
    const wallet = window.opnet;
    try {
      if (typeof wallet.signInteraction === 'function') return await wallet.signInteraction(txData);
      if (typeof wallet.signAndSend === 'function') return await wallet.signAndSend(txData);
      if (typeof wallet.sendBitcoin === 'function') return await wallet.sendBitcoin(txData.to, txData.amount);
      if (typeof wallet.sendTransaction === 'function') return await wallet.sendTransaction(txData);
      throw new Error('Update OP_WALLET to latest version');
    } catch (err) {
      if (err.code === 4001) throw new Error('Transaction rejected by user');
      throw err;
    }
  }, [isConnected]);

  const executeContract = useCallback(async (contractAddress, method, params = [], value = 0) => {
    if (!isConnected) throw new Error('Wallet not connected');
    const wallet = window.opnet;
    try {
      if (typeof wallet.signInteraction === 'function')
        return await wallet.signInteraction({ to: contractAddress, method, params, value });
      if (typeof wallet.executeContract === 'function')
        return await wallet.executeContract(contractAddress, method, params, value);
      if (typeof wallet.signAndSend === 'function')
        return await wallet.signAndSend({ to: contractAddress, data: { method, params }, value });
      return await sendTransaction({ to: contractAddress, data: JSON.stringify({ method, params }), value });
    } catch (err) {
      if (err.code === 4001) throw new Error('Transaction rejected by user');
      throw err;
    }
  }, [isConnected, sendTransaction]);

  const callContract = useCallback(async (contractAddress, method, params = []) => {
    try {
      const res = await fetch(`${OP_NET_RPC}/api/v1/contract/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress, method, params, from: address }),
      });
      return await res.json();
    } catch (err) { throw new Error(`Contract call failed: ${err.message}`); }
  }, [address]);

  return {
    provider, address, balance, network,
    isConnecting, isConnected, error, walletInstalled,
    connect, disconnect, signMessage, sendTransaction,
    executeContract, callContract,
  };
}
