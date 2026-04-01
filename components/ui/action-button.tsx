import { type ButtonHTMLAttributes, forwardRef } from 'react';

type ActionVariant = 'edit' | 'delete' | 'publish';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ActionVariant;
}

const variantClasses: Record<ActionVariant, string> = {
  edit: 'border-[#e5e5e5] text-[#262626] shadow-[0px_0.5px_2px_0px_rgba(0,0,0,0.05)] hover:bg-gray-50',
  delete: 'border-[#dc2626] text-[#dc2626] hover:bg-red-50',
  publish: 'border-[#0e8040] text-[#0e8040] hover:bg-green-50',
};

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function PublishIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

const icons: Record<ActionVariant, typeof EditIcon> = {
  edit: EditIcon,
  delete: TrashIcon,
  publish: PublishIcon,
};

const labels: Record<ActionVariant, string> = {
  edit: 'Edit',
  delete: 'Delete',
  publish: 'Publish',
};

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ variant, className = '', children, type = 'button', ...props }, ref) => {
    const Icon = icons[variant];
    return (
      <button
        ref={ref}
        type={type}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-sm font-semibold transition-colors duration-150 disabled:opacity-50 ${variantClasses[variant]} ${className}`}
        {...props}
      >
        <span aria-hidden="true">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {children ?? labels[variant]}
      </button>
    );
  },
);
ActionButton.displayName = 'ActionButton';
