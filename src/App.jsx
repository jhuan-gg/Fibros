import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import TelaPrincipal from './pages/TelaPrincipal';
import Sidebar from './components/Sidebar';

// Componente de proteção de rota
function PrivateRoute({ isLogged }) {
  return isLogged ? <Outlet /> : <Navigate to="/" replace />;
}

// Wrapper para aplicar sidebar condicionalmente
function Layout({ isLogged, onLogout }) {
  const location = useLocation();
  const showSidebar = isLogged && location.pathname !== "/" && location.pathname !== "/login";
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {showSidebar && <Sidebar onLogout={onLogout} />}
      <main
        className="main-content"
        style={{
          flex: 1,
          minHeight: '100vh',
          paddingLeft: showSidebar ? undefined : 0,
          transition: 'padding-left 0.3s',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const [isLogged, setIsLogged] = useState(false);

  // Logout handler para sidebar
  const handleLogout = () => {
    setIsLogged(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isLogged
              ? <Navigate to="/principal" replace />
              : <Login onLogin={() => setIsLogged(true)} />
          }
        />
        <Route element={<Layout isLogged={isLogged} onLogout={handleLogout} />}>
          <Route element={<PrivateRoute isLogged={isLogged} />}>
            <Route path="/principal" element={<TelaPrincipal />} />
            {/* Adicione outras rotas privadas aqui */}
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={isLogged ? "/principal" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
