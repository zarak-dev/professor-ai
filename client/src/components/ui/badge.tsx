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
    blue: 'bg-[#F0F5F8] text-[#213448] border-[#CADDE6]',
    slate: 'bg-[#F4EFE6] text-[#213448] border-[#E2DBD0]',
    mint: 'bg-[#ECF5F3] text-[#235B54] border-[#CADDE6]',
    yellow: 'bg-[#FAF3E6] text-[#7A5726] border-[#EAE0CF]',
    pink: 'bg-[#FAECEC] text-[#8E3030] border-[#F8D7D7]',
    purple: 'bg-[#F3EFF8] text-[#4E4072] border-[#DDD4EC]',
    peach: 'bg-[#FAEDE4] text-[#86461D] border-[#F0D5C3]',
  };

  const outlineMap = {
    blue: 'bg-transparent text-[#213448] border-[#CADDE6]',
    slate: 'bg-transparent text-[#547792] border-[#E2DBD0]',
    mint: 'bg-transparent text-[#235B54] border-[#CADDE6]',
    yellow: 'bg-transparent text-[#7A5726] border-[#EAE0CF]',
    pink: 'bg-transparent text-[#8E3030] border-[#F8D7D7]',
    purple: 'bg-transparent text-[#4E4072] border-[#DDD4EC]',
    peach: 'bg-transparent text-[#86461D] border-[#F0D5C3]',
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
