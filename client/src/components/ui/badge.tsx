import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'yellow' | 'mint' | 'pink' | 'purple' | 'peach' | 'blue' | 'slate';
  variant?: 'outline' | 'subtle';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'blue',
  variant = 'subtle',
  className = '',
  ...props
}) => {
  const subtleMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    mint: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200/80',
    pink: 'bg-rose-50 text-rose-700 border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    peach: 'bg-orange-50 text-orange-700 border-orange-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const outlineMap = {
    blue: 'bg-transparent text-blue-700 border-blue-300',
    mint: 'bg-transparent text-emerald-700 border-emerald-300',
    yellow: 'bg-transparent text-amber-700 border-amber-300',
    pink: 'bg-transparent text-rose-700 border-rose-300',
    purple: 'bg-transparent text-purple-700 border-purple-300',
    peach: 'bg-transparent text-orange-700 border-orange-300',
    slate: 'bg-transparent text-slate-700 border-slate-300',
  };

  const styleClass = variant === 'outline' ? outlineMap[color] : subtleMap[color];

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${styleClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
