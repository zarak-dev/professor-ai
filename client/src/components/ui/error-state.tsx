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
    <Card className={`text-center py-10 px-6 flex flex-col items-center justify-center ${className}`}>
      <div className="icon-circle !w-14 !h-14 mx-auto mb-4 bg-red-100 dark:bg-red-950 text-red-600 border-red-400">
        <AlertCircle size={26} />
      </div>
      <h3 className="text-lg font-bold mb-1.5">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-md mb-5">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw size={14} className="mr-1.5" />
          Try Again
        </Button>
      )}
    </Card>
  );
};

export default ErrorState;
