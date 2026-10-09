import { useState } from 'react';
import { Menu, X, LayoutDashboard, Mountain, ClipboardList, Upload, Activity } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-fondo">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Flotante y compacto */}
      <aside className={`
        fixed top-0 left-0 h-full bg-superficie/95 backdrop-blur-md border-r border-borde z-50
        transition-all duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-borde">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-acento to-peligro rounded-xl flex items-center justify-center flex-shrink-0">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <h1 className="font-bold text-texto text-sm truncate">ControlConcreto</h1>
                  <p className="text-xs text-texto-secundario truncate">Túnel 0 - TOYOT2S1</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-borde rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
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
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-acento to-acento/80 text-fondo font-semibold shadow-lg shadow-acento/20' 
                      : 'text-texto-secundario hover:bg-borde/50 hover:text-texto'
                    }
                  `}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Footer - Solo cuando está abierto */}
          {sidebarOpen && (
            <div className="p-3 border-t border-borde">
              <div className="bg-tarjeta rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-texto-secundario">Avance</span>
                  <span className="text-sm font-bold text-acento">52%</span>
                </div>
                <div className="w-full h-2 bg-borde rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-acento to-peligro rounded-full transition-all" style={{ width: '52%' }} />
                </div>
                <p className="text-xs text-texto-secundario mt-2">7/137 módulos revestidos</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content - Margen solo en desktop */}
      <main className="lg:ml-20 min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-superficie/95 backdrop-blur-md border-b border-borde px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-borde rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-acento to-peligro rounded-lg flex items-center justify-center">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-texto text-sm">ControlConcreto</span>
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
