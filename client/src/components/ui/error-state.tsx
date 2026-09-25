import React from 'react';
import { Card } from './card';
import { Button } from './button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <Card className={`text-center py-10 px-6 flex flex-col items-center justify-center border-red-200/80 bg-red-50/30 ${className}`}>
      <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3.5 border border-red-200">
        <AlertCircle size={22} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-600 text-sm max-w-sm mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw size={13} className="mr-1.5" />
          Try Again
        </Button>
      )}
    </Card>
  );
};

export default ErrorState;
