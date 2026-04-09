import { useState, useEffect, useCallback } from "react";

// OpenGradient Testnet
export const OG_CHAIN = {
  chainId:         "0xA902",        // 43266 decimal
  chainName:       "OpenGradient Testnet",
  nativeCurrency:  { name: "OpenGradient", symbol: "OG", decimals: 18 },
  rpcUrls:         ["https://rpc.opengradient.ai"],
  blockExplorerUrls: ["https://explorer.opengradient.ai"],
};

export function useWallet() {
  const [address, setAddress]         = useState(null);
  const [chainId, setChainId]         = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError]             = useState(null);
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    setHasMetaMask(typeof window !== "undefined" && !!window.ethereum);
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accs) => {
        setAddress(accs[0] || null);
      });
      window.ethereum.on("chainChanged", (id) => {
        setChainId(parseInt(id, 16));
      });
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected. Install MetaMask to connect a real wallet.");
      return false;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);

      // Switch to / add OpenGradient network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: OG_CHAIN.chainId }],
        });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [OG_CHAIN],
          });
        }
      }

      const cid = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(parseInt(cid, 16));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  const isOnOGChain = chainId === parseInt(OG_CHAIN.chainId, 16);

  return {
    address,
    shortAddress,
    chainId,
    isOnOGChain,
    isConnecting,
    error,
    hasMetaMask,
    connect,
  };
}
