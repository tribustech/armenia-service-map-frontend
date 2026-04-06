type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'rounded-full bg-[#ecfdf3] px-2.5 py-1 text-sm font-medium text-[#16a34a]',
  warning: 'rounded-full bg-[#fff7ed] px-2.5 py-1 text-sm font-medium text-[#E8922D]',
  danger: 'rounded-full bg-[#fef2f2] px-2.5 py-1 text-sm font-medium text-[#dc2626]',
  neutral: 'rounded-full bg-[#f3f5f8] px-2.5 py-1 text-sm font-medium text-[#6b7280]',
};

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span className={`inline-flex ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
