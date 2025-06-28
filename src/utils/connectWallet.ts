import { ethers } from "ethers";

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("MetaMask no está instalado.");
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  return {
    provider,
    signer,
    address: accounts[0],
  };
};
