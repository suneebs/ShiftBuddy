import { SHIFT_CONFIG } from '../types';

export function ShiftBadge({ shift, size = 'md', showTime = false }) {
  const config = SHIFT_CONFIG[shift];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.color} border ${config.borderColor} ${sizeClasses[size]}`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
      {showTime && <span className="opacity-60 text-xs ml-1">({config.time})</span>}
    </span>
  );
}
