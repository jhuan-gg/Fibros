import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
// Lucide icons (https://lucide.dev/icons)
import {
  LayoutDashboard,
  BarChart2,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';
import './Sidebar.css';

const MENU = [
  {
    label: 'Dashboard',
    path: '/principal',
    icon: <LayoutDashboard size={22} />,
  },
  {
    label: 'Relatórios',
    path: '/relatorios',
    icon: <BarChart2 size={22} />,
  },
  {
    label: 'Configurações',
    path: '/configuracoes',
    icon: <Settings size={22} />,
  },
];

export default function Sidebar({ onLogout }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fecha sidebar ao navegar em mobile
  const handleNav = (path) => {
    navigate(path);
    setOpen(false);
  };

  // Responsivo: sidebar aberta em desktop, colapsável em mobile
  return (
    <>
      {/* Overlay para mobile */}
      <div
        className={`sidebar-overlay${open ? ' sidebar-overlay-active' : ''}`}
        onClick={() => setOpen(false)}
        tabIndex={-1}
        aria-hidden={!open}
      />
      {/* Botão hamburger mobile */}
      <button
        className="sidebar-hamburger"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>
      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <span className="fibros-logo">Fibros!</span>
          </div>
        </div>
        <nav className="sidebar-menu">
          {MENU.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                'sidebar-link' + (isActive ? ' sidebar-link-active' : '')
              }
              onClick={() => handleNav(item.path)}
              tabIndex={0}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-link sidebar-logout" onClick={onLogout}>
            <span className="sidebar-icon"><LogOut size={22} /></span>
            <span className="sidebar-label">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
