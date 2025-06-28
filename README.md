# 🌾 Token Farm UI - Interfaz React para Proyecto DeFi de Yield Farming

## 🎯 Descripción

Este proyecto implementa una **interfaz en React + TypeScript** que permite interactuar con el contrato inteligente **TokenFarm** desplegado en la testnet **Sepolia**.

Permite a los usuarios:

- Conectarse con Metamask y ver su dirección.
- Hacer staking de tokens LP (depositar).
- Retirar tokens LP (unstake).
- Reclamar recompensas acumuladas en DAPP Token.
- Ver su balance de tokens LP y DAPP.
- Transferir LP tokens a otras direcciones.
- Ver si es el `owner` del contrato.
- Acceder a funciones exclusivas del owner:

  - Mintear tokens LP.
  - Establecer la tasa de recompensa.
  - Retirar las comisiones del contrato.
  - Distribuir recompensas a todos los usuarios.

Incluye:

- Estados de carga (`loading`) mientras se procesan transacciones.
- Botones bloqueados durante las operaciones.
- Validación de errores (por ejemplo, si no eres el owner).
- Mensajes de éxito y errores con `alert()` y `console.log()`.

---

## 🚀 Tecnologías

- React + Vite
- TypeScript
- Ethers.js
- Sepolia testnet
- Metamask

---

## 🛠️ Instalación

1️⃣ Clona el repositorio:

```bash
git clone https://github.com/jorge210488/simple-defi-yield-farm-ui.git
cd simple-defi-yield-farm-ui
```

2️⃣ Instala dependencias:

```bash
npm install
```

3️⃣ Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
VITE_TOKEN_FARM_ADDRESS=0x...
VITE_LP_TOKEN_ADDRESS=0x...
VITE_DAPP_TOKEN_ADDRESS=0x...
```

> ⚠️ **Importante**: no subas el archivo `.env` al repositorio público. Asegúrate de agregarlo a `.gitignore`.

---

## 📦 Scripts disponibles

### 👉 Iniciar la app en desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:5173
```

### 👉 Build de producción:

```bash
npm run build
```

### 👉 Previsualizar build:

```bash
npm run preview
```

---

## ⚙️ Funcionalidades de la UI

- ✅ Conexión con Metamask (ver cuenta conectada).
- ✅ Staking y Unstaking de tokens LP.
- ✅ Reclamo de recompensas acumuladas.
- ✅ Transferencia de tokens LP.
- ✅ Lectura del balance de tokens DAPP y LP.
- ✅ Detección si el usuario es el owner.
- ✅ Funciones exclusivas del owner:

  - Mintear LP Tokens.
  - Establecer nueva tasa de recompensa.
  - Retirar comisiones acumuladas del contrato.
  - Distribuir recompensas a todos los stakers.

- ✅ Spinner de carga y botones bloqueados mientras se espera una transacción.
- ✅ Manejo de errores con mensajes específicos (por ejemplo: “caller is not the owner”).

---

## 🧠 Lógica interna (resumen)

- `deposit()`: bloquea tokens LP para comenzar a generar recompensas.
- `withdraw()`: retira tokens LP del staking.
- `claimRewards()`: transfiere los tokens DAPP acumulados al usuario.
- `distributeRewardsAll()`: actualiza las recompensas pendientes de todos los usuarios. Solo el owner puede hacerlo.
- `setRewardRate()`: permite cambiar la tasa de recompensas por bloque.
- `withdrawFees()`: permite al owner retirar las comisiones acumuladas.

---

## 💻 Autor

- **Jorge Martínez**
- GitHub: [jorge210488](https://github.com/jorge210488)
