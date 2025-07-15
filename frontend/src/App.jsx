import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import Layout from "./components/layout";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";

// Importe as páginas que serão renderizadas dentro do Layout
import Dashboard from "./pages/dashboard";
import Expenses from "./pages/expenses";
import New_entry from "./components/new_entry";
// import Budgets from "./pages/Budgets";
// import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      {/* O BrowserRouter pode ficar aqui ou no main.jsx, como fizemos antes */}
      {/* <BrowserRouter> */}
      <Routes>
        {/* Rota pública de Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rota "pai" que protege e renderiza o Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Estas são as rotas filhas. Elas serão renderizadas no <Outlet /> do Layout. */}
          {/* Redireciona a rota raiz ("/") para o dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="new_entry" element={<New_entry />} />
          {/* <Route path="budgets" element={<Budgets />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}

          {/* Adicione uma rota "catch-all" para redirecionar URLs não encontradas */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      {/* </BrowserRouter> */}
    </AuthProvider>
  );
}

export default App;
