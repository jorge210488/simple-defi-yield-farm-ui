import { ethers } from "ethers";
import LPTokenABI from "../abis/LPToken.json";

const LP_TOKEN_ADDRESS = import.meta.env.VITE_LP_TOKEN_ADDRESS;

export const getLPTokenContract = (signer: ethers.Signer) => {
  if (!LP_TOKEN_ADDRESS) {
    throw new Error("❌ LP_TOKEN_ADDRESS no está definido en .env");
  }

  return new ethers.Contract(LP_TOKEN_ADDRESS, LPTokenABI, signer);
};

export const transferLPToken = async (
  signer: ethers.Signer,
  to: string,
  amount: string
) => {
  if (!LP_TOKEN_ADDRESS) {
    throw new Error("❌ LP_TOKEN_ADDRESS no está definido en .env");
  }

  if (!to || !ethers.isAddress(to)) {
    throw new Error("❌ Dirección destino inválida.");
  }

  const lpTokenContract = new ethers.Contract(
    LP_TOKEN_ADDRESS,
    LPTokenABI,
    signer
  );

  const amountInWei = ethers.parseUnits(amount, 18);

  const sender = await signer.getAddress();
  const balance = await lpTokenContract.balanceOf(sender);

  if (balance < amountInWei) {
    throw new Error("❌ No tienes suficientes tokens.");
  }

  const tx = await lpTokenContract.transfer(to, amountInWei);
  await tx.wait();

  return tx;
};
