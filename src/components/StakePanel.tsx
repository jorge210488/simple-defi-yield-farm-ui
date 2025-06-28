import { useEffect, useState } from "react";
import useTokenFarm from "../contracts/useTokenFarm";
import { getLPTokenContract, transferLPToken } from "../contracts/useLPToken";
import { getDappBalanceOfContract } from "../contracts/useDappToken";
import { connectWallet } from "../utils/connectWallet";
import { ethers } from "ethers";

export function StakePanel() {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [reward, setReward] = useState<string>("0");
  const [balance, setBalance] = useState<string>("0"); // 🆕 balance
  const [amountToStake, setAmountToStake] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [feesBalance, setFeesBalance] = useState<string>("0");
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [rewardPerMinute, setRewardPerMinute] = useState("0");
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleStake,
    handleClaimRewards,
    getPendingRewards,
    getStakedBalance,
    handleWithdraw,
    handleWithdrawFees,
    handleSetRewardRate,
    getRewardPerMinute,
    handleDistributeRewardsAll,
    getIsOwner,
    isStaking,
  } = useTokenFarm(signer, account);

  // 🔄 Ejecutar lógica después de conectar wallet
  useEffect(() => {
    if (signer && account) {
      fetchReward();
      fetchBalance();
      fetchFeesBalance();
      fetchStakedBalance();
      fetchRewardRate();
      checkOwner();
    }
  }, [signer, account]);

  const checkOwner = async () => {
    try {
      const result = await getIsOwner();
      setIsOwner(result);
    } catch (err) {
      console.error("❌ Error al verificar si es owner:", err);
    }
  };

  const handleConnect = async () => {
    alert("🔌 Conectando wallet...");
    const conn = await connectWallet();
    if (conn) {
      setSigner(conn.signer);
      setAccount(conn.address);
      alert(`✅ Wallet conectada: ${conn.address}`);
    } else {
      alert("❌ No se pudo conectar la wallet.");
    }
  };

  // 🔁 Detectar cambios de cuenta en Metamask
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const ethereum = window.ethereum as any;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const provider = new ethers.BrowserProvider(ethereum);
        provider.getSigner().then(setSigner);
        alert(`🔄 Cuenta cambiada: ${accounts[0]}`);
      } else {
        setAccount(null);
        setSigner(null);
        alert("❌ Cuenta desconectada.");
      }
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const fetchReward = async () => {
    if (!signer || !account) return;
    try {
      const earned = await getPendingRewards();
      setReward(ethers.formatEther(earned));
    } catch (error) {
      alert("⚠️ Error al obtener recompensas.");
      console.error(error);
    }
  };

  const fetchBalance = async () => {
    if (!signer || !account) return;
    try {
      const lpToken = getLPTokenContract(signer);
      const bal = await lpToken.balanceOf(account);
      setBalance(ethers.formatEther(bal));
    } catch (error) {
      console.error("⚠️ Error al obtener el balance:", error);
    }
  };

  const fetchStakedBalance = async () => {
    if (!signer || !account) return;
    try {
      const bal = await getStakedBalance();
      setStakedBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error("❌ Error al obtener balance stakeado:", err);
    }
  };

  const fetchFeesBalance = async () => {
    if (!signer) return;
    try {
      const bal = await getDappBalanceOfContract(signer);
      setFeesBalance(bal);
    } catch (err) {
      console.error("❌ Error al obtener comisiones del contrato:", err);
    }
  };

  const fetchRewardRate = async () => {
    if (!signer) return;
    try {
      const ratePerMinute = await getRewardPerMinute();
      setRewardPerMinute(ratePerMinute);
    } catch (err) {
      console.error("❌ Error al obtener rewardRate:", err);
    }
  };

  const handleStakeClick = async () => {
    if (!signer || !amountToStake) {
      alert("⚠️ Conecta la wallet e ingresa una cantidad.");
      return;
    }

    try {
      setIsLoading(true);
      await handleStake(amountToStake);
      await fetchReward();
      await fetchBalance();
      await fetchStakedBalance();
      alert("✅ Tokens stakeados exitosamente");
    } catch (err) {
      console.error("❌ Error en stake:", err);
      alert("❌ Error al stakear");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimClick = async () => {
    if (!signer) return;

    setIsLoading(true);
    try {
      await handleClaimRewards();
      await fetchReward();
      alert("✅ Recompensas reclamadas correctamente");
    } catch (error) {
      console.error("❌ Error al reclamar recompensas:", error);
      alert("❌ Error al reclamar recompensas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!signer || !account) return;

    try {
      setIsLoading(true);
      const lpToken = getLPTokenContract(signer);
      const tx = await lpToken.mint(account, ethers.parseEther("100"));
      await tx.wait();
      alert("✅ 100 LP Tokens minteados exitosamente");
      await fetchBalance();
    } catch (error) {
      alert("❌ Error al hacer mint de LP Tokens. Asegúrate de ser el owner.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferClick = async () => {
    if (!signer || !recipientAddress || !transferAmount) {
      alert("⚠️ Ingresa dirección y cantidad.");
      return;
    }

    try {
      setIsLoading(true);
      await transferLPToken(signer, recipientAddress, transferAmount);
      alert(`✅ Tokens transferidos a ${recipientAddress}`);
      await fetchBalance();
    } catch (err: any) {
      console.error("Error en transferencia:", err);
      alert(err?.message || "❌ Error al transferir tokens");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetRateClick = async () => {
    const rate = prompt(
      "📈 Ingresa la nueva tasa de recompensa por BLOQUE.\n\n⚠️ En Sepolia, 1 bloque ≈ 12 segundos.\n\nEj: 1 DAPP por bloque ≈ 5 DAPP por minuto."
    );

    if (!rate || isNaN(+rate) || +rate <= 0) {
      alert("⚠️ Ingresa un valor numérico válido.");
      return;
    }

    try {
      setIsLoading(true);
      await handleSetRewardRate(rate);
      await fetchRewardRate();
      alert("✅ Tasa actualizada correctamente");
    } catch (error) {
      alert("❌ Error al actualizar la tasa. Asegúrate de ser el owner.");
      console.error("❌ Error en setRewardRate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 mt-6 mb-20 pb-20">
      {!account ? (
        <button
          onClick={handleConnect}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Conectar Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">✅ Conectado: {account}</p>
          <p className="text-sm text-gray-800 font-medium">
            💰 LP Tokens disponibles: {balance}
          </p>
          <p className="text-sm text-gray-800 font-medium">
            🔒 LP Tokens en staking: {stakedBalance}
          </p>
          {parseFloat(stakedBalance) === 0 ? (
            <p className="text-sm text-red-600 font-medium">
              ⚠️ No estás generando recompensas. Haz staking para comenzar.
            </p>
          ) : (
            <p className="text-sm text-green-600 font-medium">
              ✅ Estás generando recompensas por staking.
            </p>
          )}

          <div>
            <label className="block text-sm mb-1">
              Cantidad a Stakear (LP)
            </label>
            <input
              type="number"
              value={amountToStake}
              onChange={(e) => setAmountToStake(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
          </div>

          <button
            onClick={handleStakeClick}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
          >
            {isLoading ? "Procesando..." : "Stakear Tokens"}
          </button>
          <button
            onClick={async () => {
              const amount = prompt("¿Cuántos LP Tokens deseas retirar?");
              if (!amount || isNaN(+amount)) {
                return alert("⚠️ Ingresa una cantidad válida.");
              }

              setIsLoading(true);
              try {
                await handleWithdraw(amount);
                await fetchReward();
                await fetchBalance();
                await fetchStakedBalance();
                alert("✅ Retiro exitoso");
              } catch (error) {
                console.error("❌ Error al retirar LP Tokens:", error);
                alert("❌ Error al retirar LP Tokens");
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 w-full mt-2"
          >
            {isLoading ? "Procesando..." : "Retirar LP Tokens"}
          </button>

          <div className="mt-4">
            <p className="text-sm">Recompensas acumuladas: {reward} DAPP</p>
            <p className="text-sm text-gray-800 font-medium">
              📈 Tasa actual de recompensa: {rewardPerMinute} DAPP/min
            </p>

            <button
              onClick={handleClaimClick}
              disabled={isLoading}
              className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
            >
              {isLoading ? "Procesando..." : "Reclamar Recompensa"}
            </button>
            <p className="text-sm text-gray-700">
              💼 Comisiones acumuladas (contrato): {feesBalance} DAPP
            </p>
            {isOwner && (
              <>
                <button
                  onClick={handleSetRateClick}
                  disabled={isLoading}
                  className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full"
                >
                  {isLoading
                    ? "Procesando..."
                    : "Establecer Tasa de Recompensa (solo owner)"}
                </button>

                <button
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      await handleWithdrawFees();
                      await fetchFeesBalance();
                      alert("✅ Comisiones retiradas correctamente");
                    } catch (error) {
                      alert(
                        "❌ Error al retirar comisiones. Asegúrate de ser el owner."
                      );
                      console.error("❌ Error al retirar comisiones:", error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
                >
                  {isLoading
                    ? "Procesando..."
                    : "Retirar Comisiones (solo owner)"}
                </button>

                <button
                  onClick={handleMintTokens}
                  disabled={isLoading}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                >
                  {isLoading
                    ? "Procesando..."
                    : "Mintear 100 LP Tokens (solo owner)"}
                </button>

                <button
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      await handleDistributeRewardsAll();
                      alert(
                        "🎉 Recompensas distribuidas a todos los usuarios."
                      );
                    } catch (error: any) {
                      console.error(
                        "❌ Error en distribución de recompensas:",
                        error
                      );

                      const msg =
                        error?.reason ||
                        error?.error?.message ||
                        error?.data?.message ||
                        error?.message ||
                        "❌ Error desconocido";

                      if (msg.includes("caller is not the owner")) {
                        alert("❌ Solo el owner puede distribuir recompensas.");
                      } else {
                        alert("🚫 " + msg);
                      }
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="mt-2 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 w-full"
                >
                  {isLoading
                    ? "Procesando..."
                    : "Distribuir Recompensas (solo owner)"}
                </button>
              </>
            )}
          </div>
          <div className="mt-4">
            <label className="block text-sm mb-1">Dirección de destino</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded mb-2"
            />

            <label className="block text-sm mb-1">Cantidad a transferir</label>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded mb-2"
            />

            <button
              onClick={handleTransferClick}
              disabled={isLoading}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 w-full"
            >
              {isLoading ? "Procesando..." : "Transferir LP Tokens"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
