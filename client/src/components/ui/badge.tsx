import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'yellow' | 'mint' | 'pink' | 'purple' | 'peach' | 'blue';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'yellow',
  className = '',
  ...props
}) => {
  const colorMap = {
    yellow: 'tag-yellow',
    mint: 'tag-mint',
    pink: 'tag-pink',
    purple: 'tag-purple',
    peach: 'tag-peach',
    blue: 'tag-blue',
  };

  return (
    <span className={`tag ${colorMap[color]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
