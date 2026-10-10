import type { FC } from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  min?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  labelPosition?: 'inside' | 'outside' | 'overlay';
  striped?: boolean;
  animated?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * ProgressBar component following El Cóndor design system
 * Supports multiple variants, sizes, and label positions
 */
export const ProgressBar: FC<ProgressBarProps> = ({
  value,
  max = 100,
  min = 0,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  labelPosition = 'outside',
  striped = false,
  animated = false,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const clampedValue = Math.max(min, Math.min(max, value));
  const percentage = ((clampedValue - min) / (max - min)) * 100;
  const displayLabel = label ?? `${Math.round(percentage)}%`;

  const variantClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
    info: 'bg-blue-600',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const trackClasses = `
    w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden
    ${sizeClasses[size]}
    ${className}
  `;

  const barClasses = `
    h-full rounded-full transition-all duration-500 ease-out
    ${variantClasses[variant]}
    ${striped ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%]' : ''}
    ${animated && striped ? 'animate-progress-stripe' : ''}
  `;

  const labelClasses = {
    inside: 'absolute inset-0 flex items-center justify-center text-xs font-medium text-white',
    outside: 'mt-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400',
    overlay: 'absolute right-0 top-0 h-full flex items-center pr-2 text-xs font-medium text-white',
  };

  return (
    <div role="progressbar" aria-valuenow={clampedValue} aria-valuemin={min} aria-valuemax={max} aria-label={ariaLabel} className="w-full">
      <div className={trackClasses}>
        <div
          className={barClasses}
          style={{ width: `${percentage}%` }}
          role="presentation"
        >
          {showLabel && labelPosition === 'inside' && percentage >= 15 && (
            <span className={labelClasses.inside} aria-hidden="true">{displayLabel}</span>
          )}
          {showLabel && labelPosition === 'overlay' && (
            <span className={labelClasses.overlay} aria-hidden="true">{displayLabel}</span>
          )}
        </div>
      </div>
      {showLabel && labelPosition === 'outside' && (
        <div className={labelClasses.outside} aria-hidden="true">
          {displayLabel}
        </div>
      )}
    </div>
  );
};

/** ProgressBar circular para dashboards */
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  showValue?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const CircularProgress: FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  variant = 'primary',
  showValue = true,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const clampedValue = Math.max(0, Math.min(max, value));
  const percentage = (clampedValue / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantClasses = {
    primary: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-amber-500',
    danger: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-neutral-200 dark:text-neutral-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${variantClasses[variant]} transition-all duration-500 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-neutral-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

/** Progress steps - para flujos de trabajo */
export interface ProgressStep {
  id: string;
  label: string;
  completed?: boolean;
  active?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
}

export interface ProgressStepsProps {
  steps: ProgressStep[];
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export const ProgressSteps: FC<ProgressStepsProps> = ({
  steps,
  variant = 'horizontal',
  className = '',
}) => {
  const stepClasses = variant === 'horizontal' ? 'flex items-center' : 'flex flex-col items-start gap-6';

  return (
    <div className={`${stepClasses} ${className}`} role="list" aria-label="Pasos del proceso">
      {steps.map((step, index) => (
        <div key={step.id} className="relative flex items-start gap-3" role="listitem">
          {/* Línea conectora */}
          {index > 0 && variant === 'horizontal' && (
            <div
              className="absolute left-0 top-3 w-full h-0.5 -z-10"
              style={{ background: step.completed ? 'var(--color-success)' : 'var(--border-color)' }}
            />
          )}
          {index > 0 && variant === 'vertical' && (
            <div
              className="absolute left-5 top-0 bottom-0 w-0.5 -z-10"
              style={{ background: step.completed ? 'var(--color-success)' : 'var(--border-color)' }}
            />
          )}

          {/* Círculo del paso */}
          <div
            className={`
              relative flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-300
              ${step.completed ? 'bg-green-600 border-green-600' : step.active ? 'bg-primary-600 border-primary-600' : step.error ? 'bg-red-600 border-red-600' : 'bg-white border-neutral-300 dark:bg-neutral-800 dark:border-neutral-600'}
            `}
          >
            {step.completed ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : step.error ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : step.icon ? (
              step.icon
            ) : (
              <span className={`
                text-xs font-bold
                ${step.active ? 'text-white' : step.error ? 'text-white' : 'text-neutral-400'}
              `}>
                {index + 1}
              </span>
            )}
          </div>

          {/* Etiqueta */}
          <div className={variant === 'horizontal' ? 'hidden sm:block text-center' : 'w-full text-left'}>
            <p className={`
              text-sm font-medium
              ${step.active ? 'text-primary-600' : step.error ? 'text-red-600' : step.completed ? 'text-green-600' : 'text-neutral-500'}
            `}>
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};