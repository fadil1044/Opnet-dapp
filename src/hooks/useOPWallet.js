import { useState, useEffect, useCallback } from 'react';

const OP_NET_RPC = 'https://api.opnet.org';

export function useOPWallet() {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const wallet = window.opnet;
      if (!wallet) throw new Error('Install OP_WALLET');

      const result = await (wallet.connect ? wallet.connect() : wallet.requestAccounts());
      
      // SAFE ADDRESS EXTRACTION - NO .LENGTH USED
      let userAddr = "";
      if (typeof result === 'string') {
        userAddr = result;
      } else if (result && result.address) {
        userAddr = result.address;
      } else if (Array.isArray(result)) {
        userAddr = result[0]?.address || result[0];
      }

      if (!userAddr) throw new Error('Address not found');

      setAddress(userAddr);
      setIsConnected(true);
      return true;
    } catch (err) {
      setError(err.message || 'Failed');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const executeContract = useCallback(async (contractAddress, method, params = [], value = 0) => {
    const wallet = window.opnet;
    if (!wallet) throw new Error('Wallet not found');

    try {
      // Direct call to OP_NET interaction
      if (wallet.signInteraction) {
        return await wallet.signInteraction({
          to: contractAddress,
          method: method,
          params: params,
          value: value
        });
      }
      
      // Fallback for different wallet versions
      return await wallet.sendBitcoin(contractAddress, value);
    } catch (err) {
      throw new Error(err.message || 'Swap failed');
    }
  }, []);

  return {
    address,
    isConnected,
    isConnecting,
    error,
    connect,
    executeContract
  };
}
