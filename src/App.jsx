import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import TelaPrincipal from './pages/TelaPrincipal';
import Relatorios from './pages/Relatorios';
import EditarCTO from './pages/EditarCTO';
import UploadCSV from './pages/UploadCSV';
import Mapa from './pages/Mapa';

// Componente de proteção de rota
function PrivateRoute({ isLogged }) {
  return isLogged ? <Outlet /> : <Navigate to="/" replace />;
}

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [ctoId, setCtoId] = useState(null);

  const handleLogout = () => {
    setIsLogged(false);
    setUsuario(null);
    setCtoId(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isLogged
              ? <Navigate to="/principal" replace />
              : <Login
                  onLogin={() => setIsLogged(true)}
                  setUsuario={setUsuario}
                />
          }
        />
        <Route element={<Layout isLogged={isLogged} onLogout={handleLogout} ctoId={ctoId} usuario={usuario} />}>
          <Route element={<PrivateRoute isLogged={isLogged} />}>
            <Route
              path="/principal"
              element={
                <TelaPrincipal setCtoId={setCtoId} />
              }
            />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/ctos/:id/editar" element={<EditarCTO usuario={usuario} />} />
            <Route path="/upload-csv" element={<UploadCSV />} />
            <Route path="/mapa" element={<Mapa />} />
          </Route>
        </Route>
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

// Header com navegação por rotas
function Layout({ isLogged, onLogout, usuario }) {
  const location = useLocation();
  const navigate = useNavigate();
  const showHeader = isLogged && location.pathname !== "/" && location.pathname !== "/login";

  // Detecta mobile (até 600px)
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;

  // Handler para select de navegação mobile
  const handleMobileNav = (e) => {
    const value = e.target.value;
    if (value) {
      navigate(value);
    }
  };

  // Define a tela selecionada no select
  let selectedValue = '/principal';
  if (location.pathname.startsWith('/relatorios')) selectedValue = '/relatorios';
  if (location.pathname.startsWith('/ctos/')) selectedValue = location.pathname;
  if (location.pathname.startsWith('/upload-csv')) selectedValue = '/upload-csv';
  if (location.pathname.startsWith('/mapa')) selectedValue = '/mapa';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showHeader && (
        <header className="main-header">
          <div className="main-header-row">
            <span className="fibros-highlight painel-logo">Fibros!</span>
            {/* No mobile, o botão sair vai no select, no desktop vai no nav */}
            {isMobile && (
              <button
                className="nav-link nav-logout"
                onClick={onLogout}
              >
                Sair
              </button>
            )}
          </div>
          {/* Navegação mobile: select */}
          {isMobile ? (
            <select
              className="main-nav-select"
              value={selectedValue}
              onChange={handleMobileNav}
              aria-label="Navegação"
            >
              <option value="/principal">Home</option>
              <option value="/relatorios">Relatórios</option>
              <option value="/upload-csv">Upload CSV</option>
              <option value="/mapa">Mapa</option>
            </select>
          ) : (
            <nav className="main-nav">
              <NavLink to="/principal" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Home
              </NavLink>
              <NavLink to="/relatorios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Relatórios
              </NavLink>
              <NavLink to="/upload-csv" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Upload CSV
              </NavLink>
              <NavLink to="/mapa" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Mapa
              </NavLink>
              <button className="nav-link nav-logout" onClick={onLogout}>Sair</button>
            </nav>
          )}
        </header>
      )}
      <main className="main-content" style={{ flex: 1, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
