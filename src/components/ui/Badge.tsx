import type { FC } from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
  dotColor?: string;
}

/**
 * Badge component following El Cóndor brand guidelines
 * Variants match the corporate color palette
 */
export const Badge: FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  dot = false,
  dotColor,
}) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    gray: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const baseClasses = `
    inline-flex items-center gap-1.5
    font-semibold uppercase tracking-wider rounded-full
    ${variantClasses[variant]} ${sizeClasses[size]} ${className}
  `;

  return (
    <span className={baseClasses}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColor || 'currentColor' }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

/** Badge con contador numérico */
export const CountBadge: FC<{ count: number; max?: number; variant?: BadgeProps['variant']; className?: string }> = ({
  count,
  max = 99,
  variant = 'primary',
  className = '',
}) => {
  const displayCount = count > max ? `${max}+` : count;
  
  return (
    <Badge variant={variant} className={`${className} min-w-[1.25rem] justify-center`}>
      {displayCount}
    </Badge>
  );
};

/** Badge de estado para módulos/elementos */
export const StatusBadge: FC<{ 
  status: 'done' | 'active' | 'late' | 'idle' | 'pending' | 'error';
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ status, label, size = 'md', className = '' }) => {
  const statusConfig = {
    done: { variant: 'success' as const, label: label ?? 'Completado', dot: true, size },
    active: { variant: 'warning' as const, label: label ?? 'En ejecución', dot: true, size },
    late: { variant: 'danger' as const, label: label ?? 'Retrasado', dot: true, size },
    idle: { variant: 'neutral' as const, label: label ?? 'Sin iniciar', dot: false, size },
    pending: { variant: 'info' as const, label: label ?? 'Pendiente', dot: true, size },
    error: { variant: 'danger' as const, label: label ?? 'Error', dot: true, size },
  };

  const config = statusConfig[status];
  
  return (
    <Badge {...config} className={className}>
      {config.label}
    </Badge>
  );
};