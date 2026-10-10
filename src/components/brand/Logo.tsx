import type { FC } from 'react';

interface LogoProps {
  variant?: 'default' | 'horizontal' | 'compact';
  color?: 'default' | 'white';
  className?: string;
  withTagline?: boolean;
}

/**
 * Logo de El Cóndor S.A. basado en el Manual de Identidad Corporativa
 * 
 * Elementos:
 * - Símbolo: Cuadrado con ala de cóndor (vías/carreteras curvas) → progreso, estabilidad, infraestructura
 * - Nombre: "Construcciones" + "EL CÓNDOR S.A."
 * - Actividad: "Ingeniería de Infraestructura e Inversiones"
 */
export const Logo: FC<LogoProps> = ({
  variant = 'default',
  color = 'default',
  className = '',
  withTagline = true,
}) => {
  const isHorizontal = variant === 'horizontal';
  const isCompact = variant === 'compact';
  const isWhite = color === 'white';

  const baseClasses = `logo-condor ${isHorizontal ? 'logo-condor--horizontal' : ''} ${isWhite ? 'logo-condor--white' : ''} ${className}`;

  return (
    <a href="/" className={baseClasses} aria-label="El Cóndor S.A. - Inicio">
      {/* Símbolo: Cuadrado con ala de cóndor estilizada */}
      <svg
        className="logo-condor__symbol"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
      >
        {/* Fondo cuadrado estable */}
        <rect
          x="0"
          y="0"
          width="40"
          height="40"
          rx={isCompact ? 4 : 6}
          fill={isWhite ? 'white' : 'url(#gradSymbol)'}
        />
        
        <defs>
          <linearGradient id="gradSymbol" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#001F4D" />
            <stop offset="100%" stopColor="#00388D" />
          </linearGradient>
        </defs>

        {/* Ala del cóndor - líneas curvas ascendentes que simulan vías/carreteras */}
        <g stroke={isWhite ? 'white' : 'white'} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.95">
          {/* Curva principal - ala superior */}
          <path d="M8 28 C10 18, 18 14, 24 12 C30 10, 34 14, 36 18" />
          
          {/* Curvas interiores - trazado de vías/carreteras */}
          <path d="M10 30 C12 22, 18 18, 24 16" opacity="0.7" strokeWidth="1" />
          <path d="M12 32 C14 25, 20 21, 26 19" opacity="0.5" strokeWidth="0.8" />
          <path d="M14 34 C16 28, 22 24, 28 22" opacity="0.4" strokeWidth="0.6" />
        </g>

        {/* Punto focal - ojo del cóndor / punto de progreso */}
        <circle cx="32" cy="14" r="2" fill={isWhite ? 'white' : '#FBBF24'} opacity="0.9" />
      </svg>

      <div className="logo-condor__text">
        {!isCompact && (
          <span className="logo-condor__name">Construcciones</span>
        )}
        <span className="logo-condor__company">EL CÓNDOR S.A.</span>
        {withTagline && !isCompact && (
          <span className="logo-condor__tagline">Ingeniería de Infraestructura e Inversiones</span>
        )}
      </div>
    </a>
  );
};

/** Logo compacto solo para espacios reducidos (favicon, avatars) */
export const LogoMark: FC<{ className?: string; color?: 'default' | 'white'; size?: number }> = ({
  className = '',
  color = 'default',
  size = 40,
}) => {
  const isWhite = color === 'white';

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="40" height="40" rx={6} fill={isWhite ? 'white' : 'url(#gradMark)'} />
      <defs>
        <linearGradient id="gradMark" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#001F4D" />
          <stop offset="100%" stopColor="#00388D" />
        </linearGradient>
      </defs>
      <g stroke={isWhite ? 'white' : 'white'} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.95">
        <path d="M8 28 C10 18, 18 14, 24 12 C30 10, 34 14, 36 18" />
        <path d="M10 30 C12 22, 18 18, 24 16" opacity="0.7" strokeWidth="1" />
        <path d="M12 32 C14 25, 20 21, 26 19" opacity="0.5" strokeWidth="0.8" />
        <path d="M14 34 C16 28, 22 24, 28 22" opacity="0.4" strokeWidth="0.6" />
      </g>
      <circle cx="32" cy="14" r="2" fill={isWhite ? 'white' : '#FBBF24'} opacity="0.9" />
    </svg>
  );
};

/** Eslogan corporativo */
export const Slogan: FC<{ className?: string }> = ({ className = '' }) => (
  <p className={`text-sm font-medium uppercase tracking-wider text-primary-600 ${className}`}>
    Construimos FUTURO Invirtiendo en el PRESENTE
  </p>
);