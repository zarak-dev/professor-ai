import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`${interactive ? 'bento-card cursor-pointer' : 'bento-card-static'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
