import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient' | 'outline-light';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<Variant, string> = {
  primary: 'border border-[#E8922D] bg-[#E8922D] text-white hover:bg-[#d4801f] hover:border-[#d4801f] active:bg-[#c0720f]',
  secondary: 'border border-[#d7dde5] bg-white text-[#374151] hover:bg-[#f9fafb] hover:border-[#b0b7c0] active:bg-[#f3f4f6]',
  danger: 'border border-[#fca5a5] bg-white text-[#dc2626] hover:bg-[#fef2f2] hover:border-[#f87171] active:bg-[#fee2e2]',
  ghost: 'border border-transparent bg-transparent text-[#6b7280] hover:bg-[#f5f5f4] hover:text-[#111827] active:bg-[#e5e5e5]',
  gradient: 'border border-[#E8922D] bg-[#E8922D] text-white hover:bg-[#d4801f] hover:border-[#d4801f] active:bg-[#c0720f]',
  'outline-light': 'border border-[#d7dde5] bg-[#fafafa] text-[#374151] font-semibold hover:bg-white hover:border-[#b0b7c0] active:bg-[#f3f4f6]',
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
        className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 ease-out disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
