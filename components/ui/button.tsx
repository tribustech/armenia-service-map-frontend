import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient' | 'outline-light';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[#155dfc] text-white shadow-md hover:bg-[#0f4bca] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md',
  secondary: 'border border-gray-300 bg-white text-gray-700 hover:border-[#155dfc] hover:text-[#155dfc] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-none',
  danger: 'border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
  ghost: 'text-gray-600 hover:bg-[#eff6ff] hover:text-[#155dfc] active:bg-[#dbeafe]',
  gradient: 'bg-gradient-to-r from-[#155dfc] to-[#4f39f6] text-white shadow-lg hover:from-[#0f4bca] hover:to-[#3b2fd4] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg',
  'outline-light': 'bg-white text-[#155dfc] font-semibold shadow-lg hover:bg-[#eff6ff] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-8 py-4 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-[14px] font-medium transition-all duration-200 ease-out disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
