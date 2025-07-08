import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ onLogout, ctoId }) {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fecha sidebar ao clicar fora (mobile)
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Fecha sidebar ao navegar (mobile)
  useEffect(() => {
    if (!open) return;
    function handleRoute() {
      setOpen(false);
    }
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, [open]);

  // Acessibilidade: fecha com ESC
  useEffect(() => {
    if (!open) return;
    function handleEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open]);

  // Foca no primeiro link ao abrir (mobile)
  useEffect(() => {
    if (open && sidebarRef.current) {
      const firstLink = sidebarRef.current.querySelector('a,button');
      if (firstLink) firstLink.focus();
    }
  }, [open]);

  // Título dinâmico para o cabeçalho mobile
  function getMobileTitle() {
    if (location.pathname.startsWith('/relatorios')) return 'Relatórios';
    if (location.pathname.startsWith('/ctos/')) return 'Editar CTO';
    if (location.pathname.startsWith('/principal')) return 'Dashboard';
    return 'Fibros';
  }

  // Navegação de links
  const navLinks = [
    { to: '/principal', label: 'Dashboard', icon: <span className="sidebar-icon">🏠</span> },
    { to: '/relatorios', label: 'Relatórios', icon: <span className="sidebar-icon">📊</span> },
    ctoId && {
      to: `/ctos/${ctoId}/editar`,
      label: 'Editar CTO',
      icon: <span className="sidebar-icon">🛠️</span>,
    },
  ].filter(Boolean);

  // Renderização
  return (
    <>
      {/* Cabeçalho mobile fixo com botão do menu */}
      <div className="mobile-header">
        <button
          className="sidebar-hamburger"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="sidebar-drawer"
          onClick={() => setOpen(v => !v)}
          tabIndex={0}
          type="button"
        >
          <Menu size={28} />
        </button>
        <span className="mobile-header-title">{getMobileTitle()}</span>
      </div>

      {/* Overlay escurecido */}
      <div
        className={`sidebar-overlay${open ? ' sidebar-overlay-active' : ''}`}
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        style={{ display: open ? 'block' : 'none' }}
      />

      {/* Sidebar drawer */}
      <nav
        ref={sidebarRef}
        id="sidebar-drawer"
        className={`sidebar${open ? ' sidebar-open' : ''}`}
        aria-label="Menu lateral"
        tabIndex={-1}
        style={{
          left: open ? 0 : undefined,
          transform: open ? 'translateX(0)' : undefined,
        }}
      >
        <div className="sidebar-top">
          <span className="sidebar-logo">
            <span className="fibros-logo">Fibros!</span>
          </span>
        </div>
        <div className="sidebar-menu" role="menu">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                'sidebar-link' + (isActive ? ' sidebar-link-active' : '')
              }
              tabIndex={0}
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              {link.icon}
              <span className="sidebar-label">{link.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button
            className="sidebar-link sidebar-logout"
            onClick={() => {
              setOpen(false);
              onLogout();
              navigate('/');
            }}
            tabIndex={0}
            role="menuitem"
          >
            <LogOut size={22} style={{ marginRight: 8 }} />
            Sair
          </button>
        </div>
      </nav>
    </>
  );
}
