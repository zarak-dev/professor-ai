import React from 'react';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-foreground/10 rounded-xl ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
