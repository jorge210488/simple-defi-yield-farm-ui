import { Contract, ethers } from "ethers";
import { useState } from "react";
import TokenFarm from "../abis/TokenFarm.json";
import LPToken from "../abis/LPToken.json";
import { parseUnits } from "ethers";
import { toast } from "react-toastify";

const useTokenFarm = (signer: ethers.Signer | null, address: string | null) => {
  const [isStaking, setIsStaking] = useState(false);

  const getContracts = () => {
    if (!signer) throw new Error("Signer no disponible");

    const tokenFarmAddress = import.meta.env.VITE_TOKEN_FARM_ADDRESS;
    const lpTokenAddress = import.meta.env.VITE_LP_TOKEN_ADDRESS;

    if (!tokenFarmAddress || !lpTokenAddress) {
      throw new Error("❌ Direcciones de contrato no configuradas en .env");
    }

    const tokenFarmContract = new Contract(tokenFarmAddress, TokenFarm, signer);
    const lpTokenContract = new Contract(lpTokenAddress, LPToken, signer);

    return { tokenFarmContract, lpTokenContract };
  };

  const handleStake = async (amount: string) => {
    if (!signer || !address) {
      toast.error("❌ Conecta tu wallet primero.");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("⚠️ Ingresa una cantidad válida para hacer stake.");
      return;
    }

    setIsStaking(true);

    try {
      const { tokenFarmContract, lpTokenContract } = getContracts();
      const amountInWei = parseUnits(amount, 18);

      // 🔍 Verificar balance primero
      const balance = await lpTokenContract.balanceOf(address);
      if (balance < amountInWei) {
        toast.error("❌ No tienes suficientes LP tokens para stakear.");
        return;
      }

      // 🔐 Aprobar primero
      const approveTx = await lpTokenContract.approve(
        tokenFarmContract.target,
        amountInWei
      );
      toast.info("✅ Aprobando tokens...");
      await approveTx.wait();

      // 📥 Stakear tokens
      const stakeTx = await tokenFarmContract.deposit(amountInWei);
      toast.info("⏳ Enviando transacción de stake...");
      await stakeTx.wait();

      toast.success("🎉 Tokens stakeados correctamente.");
    } catch (error: any) {
      console.error("❌ Stake error:", error);
      const message =
        error?.reason ||
        error?.data?.message ||
        error?.message ||
        "Error al hacer stake.";
      toast.error(`🚫 ${message}`);
    } finally {
      setIsStaking(false);
    }
  };

  const getPendingRewards = async () => {
    if (!signer || !address) throw new Error("Wallet no conectada");

    try {
      const { tokenFarmContract } = getContracts();
      return await tokenFarmContract.pendingRewards(address);
    } catch (error: any) {
      console.error("❌ Error al obtener recompensas pendientes:", error);
      throw new Error(error?.reason || error?.message || "Error desconocido");
    }
  };

  const handleClaimRewards = async () => {
    if (!signer) {
      toast.error("❌ Wallet no conectada.");
      return;
    }

    try {
      const { tokenFarmContract } = getContracts();
      const tx = await tokenFarmContract.claimRewards();
      toast.info("⏳ Reclamando recompensa...");
      await tx.wait();
      toast.success("🎉 Recompensa reclamada exitosamente.");
    } catch (error: any) {
      console.error("❌ Claim error:", error);
      const message =
        error?.reason ||
        error?.data?.message ||
        error?.message ||
        "Error al reclamar recompensa.";
      toast.error(`🚫 ${message}`);
    }
  };

  // ✅ NUEVAS FUNCIONES DEL CONTRATO:

  const handleWithdraw = async (amount: string) => {
    if (!signer || !address) {
      toast.error("❌ Conecta tu wallet primero.");
      return;
    }

    try {
      const { tokenFarmContract } = getContracts();
      const amountInWei = parseUnits(amount, 18);
      const tx = await tokenFarmContract.withdraw(amountInWei);
      toast.info("⏳ Retirando tokens...");
      await tx.wait();
      toast.success("✅ Tokens retirados correctamente.");
    } catch (error: any) {
      console.error("❌ Withdraw error:", error);
      toast.error(
        `🚫 ${error?.reason || error?.message || "Error al retirar tokens."}`
      );
    }
  };

  const handleWithdrawFees = async () => {
    if (!signer) {
      toast.error("❌ Wallet no conectada.");
      return;
    }

    try {
      const { tokenFarmContract } = getContracts();
      const tx = await tokenFarmContract.withdrawFees();
      toast.info("⏳ Retirando fees...");
      await tx.wait();
      toast.success("✅ Fees retiradas correctamente.");
    } catch (error: any) {
      console.error("❌ Withdraw fees error:", error);
      const message =
        error?.reason ||
        error?.data?.message ||
        error?.message ||
        "Error al retirar fees.";
      throw error;
    }
  };

  const handleDistributeRewardsAll = async () => {
    if (!signer) {
      toast.error("❌ Wallet no conectada.");
      return;
    }

    try {
      const { tokenFarmContract } = getContracts();
      const tx = await tokenFarmContract.distributeRewardsAll();
      toast.info("⏳ Distribuyendo recompensas...");
      await tx.wait();
      toast.success("🎉 Recompensas distribuidas a todos.");
    } catch (error: any) {
      console.error("❌ Distribute rewards error:", error);
      throw error; // 👈 muy importante para que el frontend lo capture
    }
  };

  const handleSetRewardRate = async (ratePerSecond: string) => {
    if (!signer) {
      throw new Error("Wallet no conectada");
    }

    try {
      const { tokenFarmContract } = getContracts();
      const rate = parseUnits(ratePerSecond, 18);
      const tx = await tokenFarmContract.setRewardRate(rate);
      toast.info("⏳ Estableciendo tasa de recompensa...");
      await tx.wait();
      toast.success("✅ Tasa de recompensa actualizada.");
    } catch (error: any) {
      console.error("❌ Set reward rate error:", error);
      throw error; // 👈 importante: relanzar
    }
  };

  const getStakedBalance = async () => {
    if (!signer || !address) {
      throw new Error("Wallet no conectada");
    }

    try {
      const { tokenFarmContract } = getContracts();
      const staker = await tokenFarmContract.stakers(address);
      return staker.balance;
    } catch (error: any) {
      console.error("❌ Error al obtener balance staked:", error);
      throw new Error(
        error?.reason || error?.message || "Error al consultar el balance"
      );
    }
  };

  const getRewardPerMinute = async () => {
    if (!signer) throw new Error("Wallet no conectada");

    try {
      const { tokenFarmContract } = getContracts();

      // Obtener rewardRate actual (por bloque)
      const ratePerBlock = await tokenFarmContract.rewardRate(); // BigInt

      // Sepolia = ~5 bloques por minuto
      const blocksPerMinute = 5n;

      // Multiplicar por bloques por minuto
      const rewardPerMinute = ratePerBlock * blocksPerMinute;

      // Convertir de wei a tokens legibles
      return ethers.formatUnits(rewardPerMinute, 18); // retorna string como "5.0"
    } catch (error: any) {
      console.error("❌ Error al calcular reward por minuto:", error);
      throw new Error("No se pudo calcular reward por minuto");
    }
  };

  const getIsOwner = async () => {
    if (!signer || !address) return false;

    try {
      const { tokenFarmContract } = getContracts();
      const owner = await tokenFarmContract.owner();
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error("❌ Error al verificar owner:", error);
      return false;
    }
  };

  return {
    handleStake,
    handleClaimRewards,
    getPendingRewards,
    isStaking,
    handleWithdraw,
    handleWithdrawFees,
    handleDistributeRewardsAll,
    handleSetRewardRate,
    getStakedBalance,
    getRewardPerMinute,
    getIsOwner,
  };
};

export default useTokenFarm;
