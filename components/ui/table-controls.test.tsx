import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Pagination } from '@/components/admin/pagination';
import { TableSearchInput, TableSelect, TableMultiSelect } from '@/components/ui/table-controls';

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

  describe('TableMultiSelect', () => {
    const options = [
      { value: 'a', label: 'Housing' },
      { value: 'b', label: 'Legal aid' },
    ];

    it('shows the placeholder when nothing is selected and reveals options on click', () => {
      render(
        <TableMultiSelect
          aria-label="Tags"
          options={options}
          selected={[]}
          onChange={vi.fn()}
          placeholder="All tags"
          selectedLabel={(count) => `${count} tags`}
        />,
      );

      const trigger = screen.getByLabelText('Tags');
      expect(trigger).toHaveTextContent('All tags');
      // Options hidden until opened.
      expect(screen.queryByText('Housing')).not.toBeInTheDocument();

      fireEvent.click(trigger);
      expect(screen.getByText('Housing')).toBeInTheDocument();
      expect(screen.getByText('Legal aid')).toBeInTheDocument();
    });

    it('summarises the selection count and toggles values', () => {
      const onChange = vi.fn();
      render(
        <TableMultiSelect
          aria-label="Tags"
          options={options}
          selected={['a']}
          onChange={onChange}
          placeholder="All tags"
          selectedLabel={(count) => `${count} tags`}
        />,
      );

      expect(screen.getByLabelText('Tags')).toHaveTextContent('1 tags');

      fireEvent.click(screen.getByLabelText('Tags'));
      // 'a' is already selected; clicking it deselects.
      fireEvent.click(screen.getByText('Housing'));
      expect(onChange).toHaveBeenCalledWith([]);

      // Clicking an unselected option adds it.
      fireEvent.click(screen.getByText('Legal aid'));
      expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    });
  });
});
