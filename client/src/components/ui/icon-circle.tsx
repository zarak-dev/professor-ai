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
      className={`w-9 h-9 rounded-lg border border-slate-200/80 bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 ${className}`}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default IconCircle;
