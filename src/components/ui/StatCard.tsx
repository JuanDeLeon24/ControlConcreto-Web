import type { FC, ReactNode } from 'react';

export interface StatCardProps {
  /** Valor principal a mostrar */
  value: string | number;
  /** Etiqueta descriptiva */
  label: string;
  /** Icono opcional */
  icon?: ReactNode;
  /** Color del valor/icono */
  valueColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  /** Tendencia (opcional) */
  trend?: {
    value: number;
    label?: string;
    up?: boolean;
  };
  /** Acción secundaria */
  action?: ReactNode;
  /** Estado de carga */
  loading?: boolean;
  /** Clases adicionales */
  className?: string;
  /** Callback al hacer click */
  onClick?: () => void;
}

/**
 * StatCard - Tarjeta de estadística principal para dashboards
 * Siguiendo el diseño corporativo de El Cóndor S.A.
 */
export const StatCard: FC<StatCardProps> = ({
  value,
  label,
  icon,
  valueColor = 'primary',
  trend,
  action,
  loading = false,
  className = '',
  onClick,
}) => {
  const valueColorClasses = {
    primary: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
    neutral: 'text-neutral-900 dark:text-white',
  };

  const iconBgClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30',
    success: 'bg-green-100 dark:bg-green-900/30',
    warning: 'bg-amber-100 dark:bg-amber-900/30',
    danger: 'bg-red-100 dark:bg-red-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30',
    neutral: 'bg-neutral-100 dark:bg-neutral-800',
  };

  const baseClasses = `
    relative bg-white dark:bg-neutral-900
    border border-neutral-200 dark:border-neutral-700
    rounded-xl p-5
    transition-all duration-200
    ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700' : 'hover:border-neutral-300 dark:hover:border-neutral-600'}
    ${className}
  `;

  if (loading) {
    return (
      <div className={baseClasses} aria-busy="true">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-8 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
          {trend && <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded" />}
        </div>
      </div>
    );
  }

  return (
    <article className={baseClasses} onClick={onClick} tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tabular-nums ${valueColorClasses[valueColor]}`}>
              {value}
            </span>
            {trend && (
              <span className={`flex items-center gap-1 text-sm font-medium ${trend.up ? 'text-green-600' : 'text-red-600'}`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trend.up ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                </svg>
                <span>{trend.value >= 0 ? '+' : ''}{trend.value.toFixed(1)}%</span>
                {trend.label && <span className="text-neutral-500 dark:text-neutral-400">{trend.label}</span>}
              </span>
            )}
          </div>
        </div>

        {(icon || action) && (
          <div className="flex-shrink-0 flex items-center gap-2">
            {icon && (
              <div className={`p-2 rounded-lg ${iconBgClasses[valueColor]}`}>
                {icon}
              </div>
            )}
            {action}
          </div>
        )}
      </div>
    </article>
  );
};

/** Grid de StatCards responsive */
export interface StatGridProps {
  stats: StatCardProps[];
  className?: string;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const StatGrid: FC<StatGridProps> = ({
  stats,
  className = '',
  columns = { base: 1, sm: 2, md: 2, lg: 3, xl: 4 },
}) => {
  const gridClasses = `
    grid gap-4
    grid-cols-${columns.base}
    ${columns.sm ? `sm:grid-cols-${columns.sm}` : ''}
    ${columns.md ? `md:grid-cols-${columns.md}` : ''}
    ${columns.lg ? `lg:grid-cols-${columns.lg}` : ''}
    ${columns.xl ? `xl:grid-cols-${columns.xl}` : ''}
    ${className}
  `;

  return (
    <div className={gridClasses} role="list" aria-label="Indicadores clave">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

/** StatCard compacto para espacios reducidos */
export const CompactStatCard: FC<{
  value: string | number;
  label: string;
  valueColor?: StatCardProps['valueColor'];
  trend?: StatCardProps['trend'];
  className?: string;
}> = ({ value, label, valueColor = 'primary', trend, className = '' }) => {
  const valueColorClasses = {
    primary: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
    neutral: 'text-neutral-900 dark:text-white',
  };

  return (
    <div className={`flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg ${className}`}>
      <div className={`p-2 rounded-lg ${{
        primary: 'bg-primary-100 dark:bg-primary-900/30',
        success: 'bg-green-100 dark:bg-green-900/30',
        warning: 'bg-amber-100 dark:bg-amber-900/30',
        danger: 'bg-red-100 dark:bg-red-900/30',
        info: 'bg-blue-100 dark:bg-blue-900/30',
        neutral: 'bg-neutral-100 dark:bg-neutral-800',
      }[valueColor]}`}>
        <div className="w-5 h-5 bg-current/20 rounded" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 truncate">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-lg font-bold ${valueColorClasses[valueColor]}`}>{value}</span>
          {trend && (
            <span className={`text-xs font-medium ${trend.up ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};