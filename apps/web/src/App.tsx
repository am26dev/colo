import { Route, Routes } from "react-router-dom";
import { PainelLayout } from "./components/gestao/PainelLayout";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import ContaPage from "./pages/gestao/ContaPage";
import DashboardPage from "./pages/gestao/DashboardPage";
import InformacoesPage from "./pages/gestao/InformacoesPage";
import Login from "./pages/gestao/Login";
import PedidosPage from "./pages/gestao/PedidosPage";
import { RequireAuth } from "./pages/gestao/RequireAuth";
import SemanaEditorPage from "./pages/gestao/SemanaEditorPage";
import SemanasPage from "./pages/gestao/SemanasPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gestao/login" element={<Login />} />
        <Route
          path="/gestao"
          element={
            <RequireAuth>
              <PainelLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="pedidos" element={<PedidosPage />} />
          <Route path="semanas" element={<SemanasPage />} />
          <Route path="semanas/nova" element={<SemanaEditorPage />} />
          <Route path="semanas/:id" element={<SemanaEditorPage />} />
          <Route path="informacoes" element={<InformacoesPage />} />
          <Route path="conta" element={<ContaPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
