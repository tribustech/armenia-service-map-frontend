import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';

type Row = { id: string; title: string; status: string; region: string };

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/admin/admin-surface', () => ({
  AdminInset: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
}));

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'status', header: 'Status' },
];

describe('DataTable responsive rendering', () => {
  it('renders mobile cards with supplied metadata while keeping table markup', () => {
    render(
      <DataTable
        columns={columns}
        data={[{ id: '1', title: 'Housing support', status: 'NEW', region: 'Yerevan' }]}
        mobileCard={(row) => ({
          title: row.title,
          eyebrow: row.id,
          fields: [
            { label: 'Status', value: row.status },
            { label: 'Region', value: row.region },
          ],
          action: <button type="button">View</button>,
        })}
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('table').className).toContain('text-[#334155]');
    const card = screen.getByTestId('mobile-data-card-1');
    expect(card.className).toContain('border-[#dbe2ea]');
    expect(within(card).getByText('Housing support')).toBeVisible();
    expect(within(card).getByText('Status')).toBeVisible();
    expect(within(card).getByText('Yerevan')).toBeVisible();
    expect(within(card).getByRole('button', { name: 'View' })).toBeVisible();
  });

  it('uses standard typography for desktop table headers', () => {
    render(<DataTable columns={columns} data={[{ id: '1', title: 'Housing support', status: 'NEW', region: 'Yerevan' }]} />);

    const titleHeader = screen.getByRole('columnheader', { name: 'Title' });

    expect(titleHeader.className).toContain('text-sm');
    expect(titleHeader.className).toContain('font-medium');
    expect(titleHeader.className).not.toContain('uppercase');
    expect(titleHeader.className).not.toContain('tracking-[0.14em]');
  });

  it('falls back to the translated noResults label when empty and no emptyLabel prop is given', () => {
    render(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText('noResults')).toBeInTheDocument();
  });

  it('uses a caller-supplied emptyLabel prop over the translated default', () => {
    render(<DataTable columns={columns} data={[]} emptyLabel="Nothing here" />);

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.queryByText('noResults')).not.toBeInTheDocument();
  });
});
