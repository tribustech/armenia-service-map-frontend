import type { HTMLAttributes, ReactNode } from 'react';

type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

type AdminToolbarProps = SurfaceProps & {
  layout?: 'end' | 'between' | 'compact-end';
};

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function AdminPanel({ children, className, ...props }: SurfaceProps) {
  return (
    <div className={joinClasses('admin-panel', className)} {...props}>
      {children}
    </div>
  );
}

export function AdminInset({ children, className, ...props }: SurfaceProps) {
  return (
    <div className={joinClasses('admin-inset', className)} {...props}>
      {children}
    </div>
  );
}

const adminToolbarLayoutClasses = {
  end: 'm-4 mb-0 flex flex-col gap-3 border-0 bg-transparent px-0 py-2 shadow-none sm:flex-row sm:items-center sm:justify-end',
  between: 'm-4 mb-0 flex flex-col gap-3 border-0 bg-transparent px-0 py-2 shadow-none sm:flex-row sm:items-center sm:justify-between',
  'compact-end': 'mx-4 mt-3 mb-0 flex flex-col gap-2 border-0 bg-transparent px-0 py-0 shadow-none sm:flex-row sm:items-center sm:justify-end',
} satisfies Record<NonNullable<AdminToolbarProps['layout']>, string>;

export function AdminToolbar({ children, className, layout = 'end', ...props }: AdminToolbarProps) {
  return (
    <div
      className={joinClasses(
        'admin-toolbar',
        adminToolbarLayoutClasses[layout],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AdminPageHeader({ children, className, ...props }: SurfaceProps) {
  return (
    <div className={joinClasses('flex flex-col gap-3 md:flex-row md:items-start md:justify-between', className)} {...props}>
      {children}
    </div>
  );
}
