import { useState, createContext, useContext, type ReactNode, type FC } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronLeft, ChevronRight, LayoutDashboard, FolderOpen, Bell, User, Activity, Mountain, ClipboardList, Upload, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import type { Permission } from '../../auth/permissions';
import { ROLE_LABELS } from '../../shared/types';
import { Logo, Slogan } from '../brand/Logo';
import './Header.css';

interface HeaderContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const HeaderContext = createContext<HeaderContextValue | null>(null);

export const useHeader = () => {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error('useHeader must be used within HeaderProvider');
  return ctx;
};

export const HeaderProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <HeaderContext.Provider value={{ sidebarOpen, toggleSidebar: () => setSidebarOpen(s => !s), closeSidebar: () => setSidebarOpen(false) }}>
      {children}
    </HeaderContext.Provider>
  );
};

const allNavItems: { id: string; label: string; icon: typeof LayoutDashboard; to: string; permission: Permission }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', permission: 'dashboard:view' },
  { id: 'tunnel', label: 'Túnel 3D', icon: Mountain, to: '/tunnel', permission: 'tunnel:view' },
  { id: 'monitoring', label: 'Monitoreo', icon: Activity, to: '/monitoreo', permission: 'monitoring:view' },
  { id: 'registro', label: 'Registro', icon: ClipboardList, to: '/registro', permission: 'registro:create' },
  { id: 'importar', label: 'Importar', icon: Upload, to: '/importar', permission: 'import:run' },
  { id: 'projects', label: 'Proyectos', icon: FolderOpen, to: '/projects', permission: 'projects:view' },
];

/** Ítems del menú visibles para el rol del usuario actual. */
const useNavItems = () => {
  const { can } = useAuth();
  return allNavItems.filter((item) => can(item.permission));
};

/** Cierra la sesión y vuelve al login. */
const useLogout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return async () => {
    await signOut();
    navigate('/login', { replace: true });
  };
};

/** Header principal - responsive con navegación adaptativa */
export const AppHeader: FC = () => {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useHeader();
  const navItems = useNavItems();
  const logout = useLogout();

  return (
    <header className="app-header" role="banner">
      <div className="app-header__inner">
        {/* Brand / Logo */}
        <div className="app-header__brand">
          <Logo variant="horizontal" withTagline={false} />
          <Slogan className="app-header__slogan" />
        </div>

        {/* Desktop Navigation */}
        <nav className="app-nav" aria-label="Navegación principal">
          <ul className="app-nav__list">
            {navItems.map(item => (
              <li key={item.id} className="app-nav__item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `app-nav__link ${isActive ? 'app-nav__link--active' : ''}`}
                  onClick={closeSidebar}
                >
                  <item.icon className="app-nav__icon" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Mobile menu toggle */}
          <button
            className="app-nav__toggle"
            onClick={toggleSidebar}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
            aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* User actions - desktop only */}
        <div className="flex items-center gap-2 md:flex">
          <button className="btn btn--ghost btn--icon" aria-label="Notificaciones">
            <Bell size={20} />
          </button>
          <div className="w-px h-6 bg-neutral-300 hidden lg:block" />
          <button className="btn btn--ghost btn--icon" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={logout}>
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        id="app-sidebar"
        className={`app-sidebar ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
        role="navigation"
        aria-label="Menú principal"
      >
        <div className="app-sidebar__header">
          <Logo variant="default" withTagline={true} />
          <button
            onClick={closeSidebar}
            className="btn btn--ghost btn--icon"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="app-sidebar__nav">
          {navItems.map(item => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) => `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`}
              onClick={closeSidebar}
            >
              <item.icon className="app-sidebar__icon" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </header>
  );
};

/** Layout principal que coordina Header + Sidebar + Main + Outlet */
export const AppLayout: FC = () => {
  return (
    <HeaderProvider>
      <div className="app-layout">
        <AppHeader />
        <DesktopSidebar />
        <main className="app-main" role="main">
          <div className="app-main__inner">
            <Outlet />
          </div>
        </main>
        <AppBottomNav />
        <AppFooter />
      </div>
    </HeaderProvider>
  );
};

/** Sidebar persistente para desktop (>=1024px) */
const DesktopSidebar: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navItems = useNavItems();
  const { user } = useAuth();

  return (
    <aside
      className={`app-sidebar ${collapsed ? 'w-16' : ''}`}
      aria-label="Navegación lateral"
    >
      <div className="app-sidebar__header">
        {!collapsed && <Logo variant="default" withTagline={true} />}
        {collapsed && <Logo variant="compact" />}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="btn btn--ghost btn--icon"
            aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>
      <nav className="app-sidebar__nav">
        {navItems.map(item => (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) => `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <item.icon className="app-sidebar__icon" aria-hidden="true" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      
      {/* User section at bottom */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <User size={18} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name ?? '—'}</p>
              <p className="text-xs text-neutral-500 truncate">{user ? ROLE_LABELS[user.role] : ''}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

/** Navegación inferior para móviles (<768px) */
const AppBottomNav: FC = () => {
  const navItems = useNavItems();
  return (
  <nav className="app-bottom-nav" aria-label="Navegación principal móvil">
    <ul className="app-bottom-nav__list">
      {navItems.map(item => (
        <li key={item.id}>
          <NavLink
            to={item.to}
            className={({ isActive }) => `app-bottom-nav__link ${isActive ? 'app-bottom-nav__link--active' : ''}`}
          >
            <item.icon className="app-bottom-nav__icon" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
  );
};

/** Footer corporativo */
const AppFooter: FC = () => (
  <footer className="app-footer" role="contentinfo">
    <div className="app-footer__inner">
      <Logo variant="horizontal" color="white" withTagline={false} className="app-footer__logo" />
      <p className="app-footer__copyright">
        © {new Date().getFullYear()} Construcciones El Cóndor S.A. - Ingeniería de Infraestructura e Inversiones
      </p>
    </div>
  </footer>
);