import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Pagination } from '@/components/admin/pagination';
import { TableSearchInput, TableSelect } from '@/components/ui/table-controls';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    if (values) {
      return key + ':' + Object.entries(values).map(([k, v]) => `${k}=${v}`).join(',');
    }
    return key;
  },
}));

describe('table controls', () => {
  it('renders a search icon inside the shared search input', () => {
    render(<TableSearchInput aria-label="Search needs" />);

    expect(screen.getByTestId('table-search-icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Search needs').className).toContain('pl-11');
  });

  it('supports a compact search input size for dense toolbars', () => {
    render(<TableSearchInput aria-label="Search topics" size="compact" />);

    const input = screen.getByLabelText('Search topics');
    expect(input.className).toContain('!py-2.5');
  });

  it('renders a styled native select with a decorative chevron', () => {
    render(
      <TableSelect aria-label="Status filter" defaultValue="">
        <option value="">All statuses</option>
        <option value="NEW">New</option>
      </TableSelect>,
    );

    expect(screen.getByLabelText('Status filter')).toBeInTheDocument();
    expect(screen.getByTestId('table-select-chevron')).toBeInTheDocument();
  });

  it('uses the shared select inside pagination', () => {
    const onPerPageChange = vi.fn();

    render(
      <Pagination
        page={1}
        totalPages={3}
        total={12}
        perPage={10}
        onPageChange={vi.fn()}
        onPerPageChange={onPerPageChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('rowsPerPage'), { target: { value: '25' } });

    expect(screen.getByTestId('table-select-chevron')).toBeInTheDocument();
    expect(onPerPageChange).toHaveBeenCalledWith(25);
  });
});
