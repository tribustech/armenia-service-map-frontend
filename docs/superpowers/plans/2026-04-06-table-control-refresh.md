# Table Control Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh all table search and select controls so dropdowns render consistently, search fields include a leading icon, and toolbar/pagination controls use the updated white elevated styling.

**Architecture:** Add two shared UI primitives for table search and select controls, then replace the repeated raw toolbar and pagination controls with those primitives. Keep the implementation native and lightweight by styling standard inputs/selects rather than introducing custom menu behavior.

**Tech Stack:** Next.js app router, React 19, TypeScript, Tailwind v4 utilities, Vitest, Testing Library, Heroicons

---

### Task 1: Add failing tests for shared table controls

**Files:**
- Create: `components/ui/table-controls.test.tsx`
- Modify: `components/ui/admin-theme.test.tsx`

- [x] **Step 1: Write the failing tests**

```tsx
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Pagination } from '@/components/admin/pagination';
import { TableSearchInput, TableSelect } from '@/components/ui/table-controls';

describe('table controls', () => {
  it('renders a search icon inside the shared search input', () => {
    render(<TableSearchInput aria-label="Search needs" />);
    expect(screen.getByTestId('table-search-icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Search needs').className).toContain('pl-11');
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

    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '25' } });
    expect(screen.getByTestId('table-select-chevron')).toBeInTheDocument();
    expect(onPerPageChange).toHaveBeenCalledWith(25);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- components/ui/table-controls.test.tsx components/ui/admin-theme.test.tsx`
Expected: FAIL because `TableSearchInput` and `TableSelect` do not exist yet and the admin theme assertions still expect the old input classes.

- [x] **Step 3: Write minimal implementation**

```tsx
// Add new shared controls in components/ui/table-controls.tsx and update admin-theme
// expectations after the components exist.
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- components/ui/table-controls.test.tsx components/ui/admin-theme.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/table-controls.test.tsx components/ui/admin-theme.test.tsx components/ui/table-controls.tsx
git commit -m "test: cover shared table controls"
```

### Task 2: Implement shared table search and select primitives

**Files:**
- Create: `components/ui/table-controls.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `app/globals.css`

- [x] **Step 1: Write the failing test**

```tsx
it('keeps shared control styling on the input primitive', () => {
  render(<Input aria-label="Name" />);
  expect(screen.getByLabelText('Name').className).toContain('shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)]');
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- components/ui/admin-theme.test.tsx`
Expected: FAIL because the input still uses the old class set.

- [x] **Step 3: Write minimal implementation**

```tsx
export function TableSearchInput(props: InputProps) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon data-testid="table-search-icon" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
      <Input {...props} className={cn('pl-11', props.className)} />
    </div>
  );
}
```

```tsx
export function TableSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cn('admin-control admin-select w-full appearance-none pr-10', props.className)} />
      <ChevronDownIcon data-testid="table-select-chevron" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
    </div>
  );
}
```

```css
.admin-control {
  border-radius: 0.75rem;
  background: #fff;
  border: 1px solid #d7dde5;
  box-shadow: 0 8px 24px -18px rgba(15, 23, 42, 0.45);
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- components/ui/table-controls.test.tsx components/ui/admin-theme.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/table-controls.tsx components/ui/input.tsx app/globals.css components/ui/admin-theme.test.tsx
git commit -m "feat: add shared table control primitives"
```

### Task 3: Adopt shared controls across table screens

**Files:**
- Modify: `components/admin/pagination.tsx`
- Modify: `app/(admin)/admin/needs/page.tsx`
- Modify: `app/(admin)/admin/services/page.tsx`
- Modify: `app/(admin)/admin/users/page.tsx`
- Modify: `app/(admin)/admin/organisations/page.tsx`
- Modify: `app/(admin)/admin/taxonomy/page.tsx`
- Modify: `app/(org)/org/needs/page.tsx`
- Modify: `app/(org)/org/services/page.tsx`

- [x] **Step 1: Write the failing test**

```tsx
it('uses the shared table search input on taxonomy list toolbars', async () => {
  render(<TaxonomyPage />);
  expect(screen.getAllByTestId('table-search-icon').length).toBeGreaterThan(0);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- app/(admin)/admin/taxonomy/taxonomy-page.test.tsx`
Expected: FAIL because the page still renders the plain shared `Input` rather than `TableSearchInput`.

- [x] **Step 3: Write minimal implementation**

```tsx
<TableSelect ...>...</TableSelect>
<TableSearchInput ... />
```

Apply the swap anywhere table toolbars or pagination still use raw `select` or plain search `Input`.

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- app/(admin)/admin/taxonomy/taxonomy-page.test.tsx components/ui/table-controls.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/admin/pagination.tsx app/(admin)/admin/needs/page.tsx app/(admin)/admin/services/page.tsx app/(admin)/admin/users/page.tsx app/(admin)/admin/organisations/page.tsx app/(admin)/admin/taxonomy/page.tsx app/(org)/org/needs/page.tsx app/(org)/org/services/page.tsx
git commit -m "feat: refresh table toolbar controls"
```

### Task 4: Verify the full change set

**Files:**
- Modify: `docs/superpowers/plans/2026-04-06-table-control-refresh.md`

- [x] **Step 1: Run focused frontend tests**

Run: `npm test -- components/ui/table-controls.test.tsx components/ui/admin-theme.test.tsx app/(admin)/admin/taxonomy/taxonomy-page.test.tsx`
Expected: PASS

- [x] **Step 2: Run broader regression coverage for touched table primitives**

Run: `npm test -- components/admin/data-table.responsive.test.tsx`
Expected: PASS

- [x] **Step 3: Run a production build for UI verification**

Run: `npm run build`
Expected: exit code 0

- [x] **Step 4: Update plan checkboxes to reflect execution status**

```md
- [x] Completed after verification
```

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-04-06-table-control-refresh.md
git commit -m "docs: mark table control refresh plan complete"
```
