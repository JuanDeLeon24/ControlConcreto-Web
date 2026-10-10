import type { FC, ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  elevated?: boolean;
}

export interface CardHeaderProps {
  children?: ReactNode;
  className?: string;
  action?: ReactNode;
  title?: string;
  subtitle?: string;
}

export interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
  divider?: boolean;
}

/**
 * Card component following El Cóndor design system
 * Supports hover effects, elevation, and flexible padding
 */
export const Card: FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  bordered = true,
  elevated = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const baseClasses = `
    bg-white dark:bg-neutral-900
    ${bordered ? 'border border-neutral-200 dark:border-neutral-700' : ''}
    rounded-xl
    ${paddingClasses[padding]}
    ${hover ? 'transition-all duration-200 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700' : ''}
    ${elevated ? 'shadow-md' : ''}
    ${className}
  `;

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

/** Card Header with optional title, subtitle, and action */
export const CardHeader: FC<CardHeaderProps> = ({
  children,
  className = '',
  action,
  title,
  subtitle,
}) => {
  const hasTitle = title || subtitle;
  
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="flex-1 min-w-0">
        {hasTitle && (
          <div className="mb-1">
            {title && (
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
};

/** Card Body - main content area */
export const CardBody: FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

/** Card Footer with optional divider */
export const CardFooter: FC<CardFooterProps> = ({
  children,
  className = '',
  divider = true,
}) => (
  <div
    className={`flex items-center justify-end gap-2 mt-4 pt-4 ${divider ? 'border-t border-neutral-200 dark:border-neutral-700' : ''} ${className}`}
  >
    {children}
  </div>
);

/** Card completo con estructura predefinida */
export const CardLayout: FC<{
  header?: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
  className?: string;
  hover?: boolean;
}> = ({ header, body, footer, className = '', hover = false }) => (
  <Card className={className} hover={hover} padding="none">
    {header && <CardHeader>{header}</CardHeader>}
    <CardBody>{body}</CardBody>
    {footer && <CardFooter>{footer}</CardFooter>}
  </Card>
);