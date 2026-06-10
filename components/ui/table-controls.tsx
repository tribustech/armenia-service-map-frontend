'use client';

import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
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

interface TableMultiSelectOption {
  value: string;
  label: string;
}

interface TableMultiSelectProps {
  options: TableMultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** Shown when nothing is selected. */
  placeholder: string;
  /** Label for the trigger when some options are selected. */
  selectedLabel: (count: number) => string;
  className?: string;
  'aria-label'?: string;
}

export function TableMultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  selectedLabel,
  className,
  'aria-label': ariaLabel,
}: TableMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  const triggerLabel = selected.length === 0 ? placeholder : selectedLabel(selected.length);

  return (
    <div ref={containerRef} className={joinClasses('relative w-full', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((value) => !value)}
        className="admin-control admin-select flex w-full items-center justify-between px-4 py-3 pr-10 text-left text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#E8922D]"
      >
        <span className={joinClasses('truncate', selected.length === 0 ? 'text-[#94a3b8]' : undefined)}>{triggerLabel}</span>
      </button>
      <ChevronDownIcon
        data-testid="table-multiselect-chevron"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]"
      />
      {open ? (
        <div
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-[#e8e8e8] bg-white p-2 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.6)]"
        >
          {options.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-[#9ca3af]">{placeholder}</p>
          ) : (
            options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#374151] hover:bg-[#f5f5f4]"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggle(option.value)}
                  className="accent-[#E8922D]"
                />
                <span className="truncate">{option.label}</span>
              </label>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
