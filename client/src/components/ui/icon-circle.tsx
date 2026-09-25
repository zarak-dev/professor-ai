import React from 'react';

export interface IconCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  bgColor?: string;
}

export const IconCircle: React.FC<IconCircleProps> = ({
  children,
  className = '',
  bgColor,
  ...props
}) => {
  return (
    <div
      className={`icon-circle ${className}`}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default IconCircle;
