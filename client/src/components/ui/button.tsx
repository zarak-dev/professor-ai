import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium text-sm transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#547792] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-md';

  const variantClasses = {
    primary:
      'bg-[#213448] text-white hover:bg-[#182736] active:bg-[#121F2D] shadow-xs border border-transparent',
    secondary:
      'bg-[#F4EFE6] text-[#213448] hover:bg-[#EAE0CF] active:bg-[#DFD3BF] border border-[#E2DBD0]',
    outline:
      'bg-white text-[#213448] hover:bg-[#FAF8F5] hover:text-[#182736] hover:border-[#CADDE6] border border-[#E2DBD0] shadow-xs',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs border border-transparent',
    success:
      'bg-[#2C665F] text-white hover:bg-[#23534D] active:bg-[#1B423D] shadow-xs border border-transparent',
    ghost:
      'bg-transparent text-[#547792] hover:bg-[#F4EFE6] hover:text-[#213448] border border-transparent',
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 h-8',
    md: 'text-sm px-3.5 py-2 h-9',
    lg: 'text-sm sm:text-base px-4 py-2.5 h-11',
    icon: 'h-9 w-9 p-0',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
