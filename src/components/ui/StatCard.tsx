import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'text-primario' }: StatCardProps) {
  return (
    <div className="bg-tarjeta rounded-xl border border-borde p-4 md:p-6 hover:border-primario/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-texto-secundario mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-texto">{value}</p>
          {subtitle && <p className="text-sm text-texto-secundario mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-exito' : 'text-peligro'}`}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-texto-secundario ml-1">vs semana anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-borde ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
