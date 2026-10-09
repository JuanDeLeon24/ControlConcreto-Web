interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  color = 'bg-primario', 
  size = 'md',
  showLabel = true,
  label 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-texto-secundario">{label}</span>}
          {showLabel && <span className="text-sm font-medium text-texto">{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div className={`w-full bg-borde rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`${color} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
