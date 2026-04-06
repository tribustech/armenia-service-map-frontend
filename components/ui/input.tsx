import { type InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[#374151]">{label}</label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`admin-control w-full px-4 py-3 text-sm text-[#111827] transition focus:outline-none focus:ring-2 ${
            error ? 'border-[#fca5a5] ring-red-300 focus:ring-[#E8922D]' : 'border-[#d7dde5] focus:ring-[#E8922D]'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
