import { ethers } from "ethers";
import DAppTokenABI from "../abis/DAppToken.json";

const DAPP_TOKEN_ADDRESS = import.meta.env.VITE_DAPP_TOKEN_ADDRESS;
const TOKEN_FARM_ADDRESS = import.meta.env.VITE_TOKEN_FARM_ADDRESS;

export const getDappTokenContract = (signer: ethers.Signer) => {
  if (!DAPP_TOKEN_ADDRESS) {
    throw new Error("❌ DAPP_TOKEN_ADDRESS no está definido en .env");
  }

  return new ethers.Contract(DAPP_TOKEN_ADDRESS, DAppTokenABI, signer);
};

export const getDappBalanceOfContract = async (signer: ethers.Signer) => {
  const contract = getDappTokenContract(signer);
  const balance = await contract.balanceOf(TOKEN_FARM_ADDRESS);
  return ethers.formatEther(balance);
};
