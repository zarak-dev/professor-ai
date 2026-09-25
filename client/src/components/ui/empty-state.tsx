import React from 'react';
import { Card } from './card';
import { Button } from './button';
import Link from 'next/link';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <Card className={`text-center py-12 px-6 flex flex-col items-center justify-center border-dashed border-slate-300 ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4 border border-slate-200/60">
          {icon}
        </div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && (
        actionHref ? (
          <Link href={actionHref}>
            <Button variant="primary" size="md">{actionText}</Button>
          </Link>
        ) : (
          <Button variant="primary" size="md" onClick={onAction}>{actionText}</Button>
        )
      )}
    </Card>
  );
};

export default EmptyState;
