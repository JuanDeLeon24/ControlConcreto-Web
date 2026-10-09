import { useState } from 'react';
import { Menu, X, LayoutDashboard, Mountain, ClipboardList, Upload, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tunel', label: 'Vista 3D', icon: Mountain },
  { id: 'registro', label: 'Registro', icon: ClipboardList },
  { id: 'importar', label: 'Importar', icon: Upload },
  { id: 'monitoreo', label: 'Monitoreo', icon: Activity },
];

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-fondo">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-superficie border-r border-borde z-50
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-borde">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-acento rounded-lg flex items-center justify-center">
                  <Mountain className="w-6 h-6 text-fondo" />
                </div>
                <div>
                  <h1 className="font-bold text-texto text-sm">ControlConcreto</h1>
                  <p className="text-xs text-texto-secundario">Túnel 0 - TOYOT2S1</p>
                </div>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-borde rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 hover:bg-borde rounded-lg transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-acento text-fondo font-semibold' 
                      : 'text-texto-secundario hover:bg-borde hover:text-texto'
                    }
                  `}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-borde">
              <div className="bg-tarjeta rounded-lg p-3">
                <p className="text-xs text-texto-secundario">Avance del proyecto</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-borde rounded-full overflow-hidden">
                    <div className="h-full bg-acento rounded-full" style={{ width: '52%' }} />
                  </div>
                  <span className="text-sm font-semibold text-acento">52%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className={`
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}>
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-superficie border-b border-borde px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-borde rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-acento rounded-lg flex items-center justify-center">
                <Mountain className="w-5 h-5 text-fondo" />
              </div>
              <span className="font-bold text-texto">ControlConcreto</span>
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
