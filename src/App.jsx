import { StakePanel } from "./components/StakePanel";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <main className="min-h-screen bg-gray-50">
      <h1 className="text-center text-3xl font-bold pt-6">
        🌾 DApp Yield Farm
      </h1>

      <StakePanel />

      {/* Aquí va el contenedor de Toast */}
      <ToastContainer />
    </main>
  );
}

export default App;
