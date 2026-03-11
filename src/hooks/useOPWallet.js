const sendTransaction = useCallback(async (txData) => {
    if (!isConnected) throw new Error('Wallet not connected');
    const wallet = window.opnet;
    try {
      // Log all available methods to console for debugging
      console.log('OP_WALLET methods:', Object.keys(wallet));
      
      if (wallet.sendBitcoin) return await wallet.sendBitcoin(txData.to, txData.amount);
      if (wallet.sendTransaction) return await wallet.sendTransaction(txData);
      if (wallet.signAndBroadcastTransaction) return await wallet.signAndBroadcastTransaction(txData);
      if (wallet.broadcast) return await wallet.broadcast(txData);
      if (wallet.send) return await wallet.send(txData);
      if (wallet.transfer) return await wallet.transfer(txData.to, txData.amount);
      
      // Fallback — just log what's available
      throw new Error(`Wallet methods available: ${Object.keys(wallet).join(', ')}`);
    } catch (err) {
      if (err.code === 4001) throw new Error('Transaction rejected by user');
      throw err;
    }
  }, [isConnected]);
