import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

interface TableSearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'default' | 'compact';
}

interface TableSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function TableSearchInput({ className, size = 'default', ...props }: TableSearchInputProps) {
  return (
    <div className={joinClasses('relative w-full', className)}>
      <MagnifyingGlassIcon
        data-testid="table-search-icon"
        className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#94a3b8]"
      />
      <Input {...props} className={joinClasses('pl-11', size === 'compact' ? '!py-2.5' : undefined)} />
    </div>
  );
}

export function TableSelect({ className, children, ...props }: TableSelectProps) {
  return (
    <div className={joinClasses('relative w-full', className)}>
      <select
        {...props}
        className="admin-control admin-select w-full appearance-none px-4 py-3 pr-10 text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#E8922D]"
      >
        {children}
      </select>
      <ChevronDownIcon
        data-testid="table-select-chevron"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]"
      />
    </div>
  );
}
