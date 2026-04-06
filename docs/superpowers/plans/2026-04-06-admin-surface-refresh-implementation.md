# Admin Surface Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the admin UI with shared elevated surfaces, mobile card-based list views, and a reference-matched need activity timeline without changing existing workflows.

**Architecture:** The work will be centered on shared frontend primitives first so the visual redesign propagates through admin pages consistently. We will extend the existing `DataTable` into a responsive list surface that supports desktop tables and mobile cards, then restyle shared controls and page shells, and finally rebuild the need detail activity timeline using the new surface language.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, TanStack Table, Vitest, Testing Library

---

## File Structure

### Create

- `components/admin/admin-surface.tsx`
  Shared admin wrappers and class helpers for elevated shells, section headers, insets, toolbars, and mobile list cards.
- `components/admin/data-table.responsive.test.tsx`
  Tests for the desktop table and mobile card rendering contract.
- `components/shared/need-events-timeline.test.tsx`
  Tests for timeline event wording, date chips, rail markers, nested comment cards, and empty state.
- `docs/superpowers/plans/2026-04-06-admin-surface-refresh-implementation.md`
  This implementation plan.

### Modify

- `app/globals.css`
  Add admin-specific surface tokens and reusable utility classes for shadows, warm neutrals, and inset panels.
- `components/admin/data-table.tsx`
  Add a responsive card mode API while preserving existing table sorting behavior.
- `components/ui/input.tsx`
  Replace hard bordered styling with soft elevated control styling that still keeps clear focus and error states.
- `components/shared/rich-text-editor.tsx`
  Restyle the editor shell and toolbar so the comment form aligns with the new admin surface system.
- `components/shared/need-events-timeline.tsx`
  Rebuild the timeline structure to match the approved reference.
- `app/(admin)/layout.tsx`
  Tune the admin shell spacing and background to support the new layered look.
- `app/(admin)/admin/needs/page.tsx`
  Move the list page onto the new surface shell and provide mobile card content for need reports.
- `app/(admin)/admin/needs/map/page.tsx`
  Restyle filters and list shell, and provide mobile cards for the map-side need list.
- `app/(admin)/admin/services/page.tsx`
  Restyle page shells and provide service mobile card content.
- `app/(admin)/admin/users/page.tsx`
  Restyle page shells and provide user mobile card content.
- `app/(admin)/admin/organisations/page.tsx`
  Restyle page shells and provide organisation mobile card content using existing region and count data.
- `app/(admin)/admin/organisations/[id]/page.tsx`
  Restyle detail tabs and provide mobile cards for organisation users.
- `app/(admin)/admin/taxonomy/page.tsx`
  Restyle the taxonomy list sections and provide topic, need tag, and target group mobile card content.
- `app/(admin)/admin/needs/[id]/page.tsx`
  Apply the refreshed surface system to the detail page and plug in the rebuilt activity timeline and comment panel styling.
- `components/shared/loading-skeletons.tsx`
  Update admin loading states so they visually match the elevated card system.

### Test

- `components/admin/data-table.responsive.test.tsx`
- `components/shared/need-events-timeline.test.tsx`
- `components/admin/admin-shell.responsive.test.tsx`

---

### Task 1: Build the shared admin surface system

**Files:**
- Create: `components/admin/admin-surface.tsx`
- Modify: `app/globals.css`
- Test: `components/admin/admin-shell.responsive.test.tsx`

- [ ] **Step 1: Write the failing test coverage for the new shell classes**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminPanel, AdminInset } from '@/components/admin/admin-surface';

describe('Admin surface primitives', () => {
  it('renders elevated panel and inset styling hooks', () => {
    render(
      <AdminPanel data-testid="panel">
        <AdminInset data-testid="inset">Nested</AdminInset>
      </AdminPanel>,
    );

    expect(screen.getByTestId('panel').className).toContain('admin-panel');
    expect(screen.getByTestId('inset').className).toContain('admin-inset');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/admin/admin-shell.responsive.test.tsx`
Expected: FAIL with an import or export error for `@/components/admin/admin-surface`

- [ ] **Step 3: Write the minimal implementation**

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

type SurfaceProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function AdminPanel({ children, className = '', ...props }: SurfaceProps) {
  return (
    <div className={`admin-panel ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function AdminInset({ children, className = '', ...props }: SurfaceProps) {
  return (
    <div className={`admin-inset ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function AdminToolbar({ children, className = '', ...props }: SurfaceProps) {
  return (
    <div className={`admin-toolbar ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
```

```css
:root {
  --admin-shell-bg: #fdf7ee;
  --admin-panel-bg: rgba(255, 255, 255, 0.96);
  --admin-panel-shadow: 0 18px 40px rgba(146, 107, 55, 0.10);
  --admin-panel-shadow-soft: 0 8px 24px rgba(146, 107, 55, 0.08);
  --admin-panel-border: rgba(229, 219, 204, 0.7);
}

.admin-panel {
  border-radius: 28px;
  background: var(--admin-panel-bg);
  box-shadow: var(--admin-panel-shadow);
}

.admin-inset {
  border-radius: 22px;
  background: #fffdfa;
  box-shadow: inset 0 0 0 1px var(--admin-panel-border), var(--admin-panel-shadow-soft);
}

.admin-toolbar {
  border-radius: 20px;
  background: rgba(255, 252, 247, 0.98);
  box-shadow: inset 0 0 0 1px rgba(233, 223, 210, 0.8);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/admin/admin-shell.responsive.test.tsx`
Expected: PASS with the new admin surface primitives available

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/admin/admin-surface.tsx
git commit -m "feat: add shared admin surface primitives"
```

### Task 2: Extend `DataTable` for mobile cards and elevated shells

**Files:**
- Create: `components/admin/data-table.responsive.test.tsx`
- Modify: `components/admin/data-table.tsx`
- Modify: `components/admin/admin-surface.tsx`
- Test: `components/admin/data-table.responsive.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';

type Row = { id: string; title: string; status: string; region: string };

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'status', header: 'Status' },
];

describe('DataTable responsive rendering', () => {
  it('renders mobile cards with supplied metadata while keeping the table markup', () => {
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
          actionLabel: 'View',
        })}
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    const card = screen.getByTestId('mobile-data-card-1');
    expect(within(card).getByText('Housing support')).toBeVisible();
    expect(within(card).getByText('Status')).toBeVisible();
    expect(within(card).getByText('Yerevan')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/admin/data-table.responsive.test.tsx`
Expected: FAIL because `mobileCard` is not yet a supported prop

- [ ] **Step 3: Write the minimal implementation**

```tsx
interface MobileCardField {
  label: string;
  value: React.ReactNode;
}

interface MobileCardConfig {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  fields: MobileCardField[];
  badges?: React.ReactNode;
  action?: React.ReactNode;
  actionLabel?: string;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  mobileCard?: (row: TData) => MobileCardConfig;
}

{mobileCard ? (
  <div className="space-y-3 px-4 py-4 md:hidden">
    {data.map((row, index) => {
      const card = mobileCard(row);
      return (
        <article
          key={index}
          data-testid={`mobile-data-card-${(row as { id?: string }).id ?? index}`}
          className="admin-inset p-4"
        >
          {card.eyebrow ? <p className="text-xs font-medium tracking-[0.18em] text-[#8b7355] uppercase">{card.eyebrow}</p> : null}
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
              {card.badges ? <div className="mt-2 flex flex-wrap gap-2">{card.badges}</div> : null}
            </div>
            {card.action}
          </div>
          <dl className="mt-4 space-y-2">
            {card.fields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-4 text-sm">
                <dt className="text-[#8f7d68]">{field.label}</dt>
                <dd className="text-right text-gray-700">{field.value}</dd>
              </div>
            ))}
          </dl>
        </article>
      );
    })}
  </div>
) : null}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/admin/data-table.responsive.test.tsx`
Expected: PASS with both table markup and mobile card markup rendered

- [ ] **Step 5: Commit**

```bash
git add components/admin/admin-surface.tsx components/admin/data-table.tsx components/admin/data-table.responsive.test.tsx
git commit -m "feat: add responsive admin data cards"
```

### Task 3: Apply the shared list shell and mobile card configs across admin pages

**Files:**
- Modify: `app/(admin)/admin/needs/page.tsx`
- Modify: `app/(admin)/admin/needs/map/page.tsx`
- Modify: `app/(admin)/admin/services/page.tsx`
- Modify: `app/(admin)/admin/users/page.tsx`
- Modify: `app/(admin)/admin/organisations/page.tsx`
- Modify: `app/(admin)/admin/organisations/[id]/page.tsx`
- Modify: `app/(admin)/admin/taxonomy/page.tsx`
- Modify: `components/admin/pagination.tsx`
- Test: `components/admin/data-table.responsive.test.tsx`

- [ ] **Step 1: Write the failing test for one real page configuration**

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminNeedsPage from '@/app/(admin)/admin/needs/page';

vi.mock('@/lib/api/needs', () => ({
  useAdminNeeds: () => ({
    data: {
      data: [{
        id: 'need-1',
        title: 'Temporary shelter',
        description: 'Need shelter',
        fullName: 'Ani Petrosyan',
        contactMethod: 'phone',
        contactValue: '555',
        regionId: 'r1',
        status: 'NEW',
        assignedOrganisationId: null,
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
        region: { id: 'r1', name: 'Shirak' },
        assignedOrganisation: null,
        tags: [],
      }],
      meta: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    },
    isLoading: false,
  }),
}));

describe('Admin needs page mobile cards', () => {
  it('passes need-specific content into the responsive card view', () => {
    render(<AdminNeedsPage />);
    expect(screen.getByText('Temporary shelter')).toBeVisible();
    expect(screen.getByText('Ani Petrosyan')).toBeVisible();
    expect(screen.getByText('Shirak')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/admin/data-table.responsive.test.tsx`
Expected: FAIL or incomplete assertions because the list pages do not yet provide mobile card content

- [ ] **Step 3: Write the minimal implementation**

```tsx
<AdminPanel className="mt-6 overflow-hidden">
  <AdminToolbar className="m-4 mb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
    <select className="admin-select min-w-[12rem]">...</select>
    <Input className="sm:w-72" placeholder="Search..." />
  </AdminToolbar>

  <DataTable
    columns={columns}
    data={data?.data ?? []}
    sorting={sorting}
    onSortingChange={setSorting}
    mobileCard={(row) => ({
      eyebrow: String(row.id).slice(0, 8),
      title: row.title || row.description.slice(0, 60),
      badges: <Badge variant={statusVariant[row.status] || 'neutral'}>{row.status}</Badge>,
      fields: [
        { label: 'Submitted by', value: row.fullName },
        { label: 'Region', value: row.region?.name || '—' },
        { label: 'Assigned to', value: row.assignedOrganisation?.name || '—' },
        { label: 'Submitted', value: new Date(row.createdAt).toLocaleDateString() },
      ],
      action: <button onClick={() => router.push(`/admin/needs/${row.id}`)} className="admin-link-button">View</button>,
    })}
  />
</AdminPanel>
```

```tsx
mobileCard={(row) => ({
  title: row.name,
  badges: <Badge variant={accountBadge[row.status]}>{row.status.toLowerCase()}</Badge>,
  fields: [
    { label: 'Last access', value: new Date(row.updatedAt).toLocaleDateString() },
    { label: 'Region', value: row.region?.name || '—' },
    { label: 'Users', value: row._count.users },
    { label: 'Services', value: row._count.services },
  ],
  action: <button onClick={() => router.push(`/admin/organisations/${row.id}`)} className="admin-link-button">View</button>,
})}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/admin/data-table.responsive.test.tsx`
Expected: PASS with card-specific content rendering for needs and no regressions in the shared table tests

- [ ] **Step 5: Commit**

```bash
git add app/'(admin)'/admin/needs/page.tsx app/'(admin)'/admin/needs/map/page.tsx app/'(admin)'/admin/services/page.tsx app/'(admin)'/admin/users/page.tsx app/'(admin)'/admin/organisations/page.tsx app/'(admin)'/admin/organisations/[id]/page.tsx app/'(admin)'/admin/taxonomy/page.tsx components/admin/pagination.tsx
git commit -m "feat: apply responsive admin list cards"
```

### Task 4: Restyle shared controls, shells, and admin loading states

**Files:**
- Modify: `app/(admin)/layout.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `components/shared/rich-text-editor.tsx`
- Modify: `components/shared/loading-skeletons.tsx`
- Modify: `components/ui/badge.tsx`
- Test: `components/admin/admin-shell.responsive.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Admin form surface styling', () => {
  it('uses the softened elevated control classes', () => {
    render(<Input aria-label="Search" />);
    expect(screen.getByLabelText('Search').className).toContain('shadow');
    expect(screen.getByLabelText('Search').className).not.toContain('border-gray-300');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/admin/admin-shell.responsive.test.tsx`
Expected: FAIL because the input still renders the old border-driven class list

- [ ] **Step 3: Write the minimal implementation**

```tsx
className={`w-full rounded-[18px] bg-white/90 px-4 py-3 text-sm text-gray-900 shadow-[0_10px_24px_rgba(146,107,55,0.08)] ring-1 ring-[#eadfce] transition focus:outline-none focus:ring-2 focus:ring-[#d9a85f] ${
  error ? 'ring-red-300 focus:ring-red-400' : ''
} ${className}`}
```

```tsx
return (
  <div className="flex h-screen bg-[radial-gradient(circle_at_top,_#fffdf8_0%,_#fdf7ee_52%,_#f6ecdf_100%)]">
    <a href="#admin-main-content" className="skip-link">Skip to main content</a>
    <AdminSidebar />
    <div className="flex min-w-0 flex-1 flex-col">
      <AdminTopbar />
      <main id="admin-main-content" className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  </div>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/admin/admin-shell.responsive.test.tsx`
Expected: PASS with softened control styling and no admin navigation regressions

- [ ] **Step 5: Commit**

```bash
git add app/'(admin)'/layout.tsx components/ui/input.tsx components/shared/rich-text-editor.tsx components/shared/loading-skeletons.tsx components/ui/badge.tsx
git commit -m "feat: refresh admin controls and shells"
```

### Task 5: Rebuild the need activity timeline to match the approved reference

**Files:**
- Create: `components/shared/need-events-timeline.test.tsx`
- Modify: `components/shared/need-events-timeline.tsx`
- Modify: `app/(admin)/admin/needs/[id]/page.tsx`
- Test: `components/shared/need-events-timeline.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { NeedEventsTimeline } from '@/components/shared/need-events-timeline';

describe('NeedEventsTimeline', () => {
  it('renders timeline rail, event chip, and nested comment card structure', () => {
    render(
      <NeedEventsTimeline
        events={[
          {
            id: '1',
            needReportId: 'need-1',
            userId: 'u1',
            eventType: 'TAG_ADDED',
            content: null,
            metadata: null,
            createdAt: '2026-07-25T08:00:00.000Z',
            user: { id: 'u1', firstName: 'Super', lastName: 'Admin', email: 'admin@example.com' },
          },
          {
            id: '2',
            needReportId: 'need-1',
            userId: 'u2',
            eventType: 'COMMENT',
            content: 'We contacted the person and will provide support.',
            metadata: null,
            createdAt: '2026-07-25T09:00:00.000Z',
            user: { id: 'u2', firstName: 'World', lastName: 'Vision', email: 'wv@example.com' },
          },
        ]}
      />,
    );

    expect(screen.getByTestId('need-events-rail')).toBeInTheDocument();
    expect(screen.getByText(/Super Admin/i)).toBeVisible();
    expect(screen.getAllByTestId('need-events-date-chip')).toHaveLength(2);
    expect(within(screen.getByTestId('need-event-comment-card-2')).getByText(/We contacted the person/i)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/shared/need-events-timeline.test.tsx`
Expected: FAIL because the current component renders simple bordered cards instead of the new timeline structure

- [ ] **Step 3: Write the minimal implementation**

```tsx
function formatActor(event: NeedReportEvent) {
  return `${event.user.firstName} ${event.user.lastName}`.trim();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

return (
  <div className="admin-panel px-5 py-6 sm:px-8" data-testid="need-events-timeline">
    <div className="relative pl-12 sm:pl-16">
      <div data-testid="need-events-rail" className="absolute left-4 top-2 bottom-2 w-px bg-[#eadfce] sm:left-6" />
      <div className="space-y-8">
        {events.map((event) => {
          const actor = formatActor(event);
          const isComment = event.eventType === 'COMMENT';
          return (
            <div key={event.id} className="relative">
              <div className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#f2eee8] text-[#6f6a63] shadow-[0_6px_18px_rgba(146,107,55,0.12)]">
                {isComment ? initials(event.user.firstName, event.user.lastName) : '•'}
              </div>
              <div className="space-y-3">
                <p className="pr-2 text-lg leading-8 text-gray-900">
                  <span className="font-semibold">{actor}</span> {eventTitle(event)}
                </p>
                <span data-testid="need-events-date-chip" className="inline-flex rounded-2xl bg-[#fff5e7] px-4 py-2 text-sm font-medium text-[#d47c1f] shadow-[0_8px_20px_rgba(212,124,31,0.08)]">
                  {formatDate(event.createdAt)}
                </span>
                {isComment && event.content ? (
                  <div data-testid={`need-event-comment-card-${event.id}`} className="admin-inset mt-2 flex gap-4 p-5 sm:p-7">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1f1f1f] text-xl text-white">
                      {initials(event.user.firstName, event.user.lastName)}
                    </div>
                    <div className="space-y-3">
                      <p className="text-2xl font-medium text-gray-900">{actor}</p>
                      <p className="text-lg leading-9 text-gray-800">{event.content}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/shared/need-events-timeline.test.tsx`
Expected: PASS with the rail, date chips, and nested comment card structure present

- [ ] **Step 5: Commit**

```bash
git add components/shared/need-events-timeline.tsx components/shared/need-events-timeline.test.tsx app/'(admin)'/admin/needs/[id]/page.tsx
git commit -m "feat: redesign admin need activity timeline"
```

### Task 6: Run regression checks and manual responsive verification

**Files:**
- Modify: none
- Test: `components/admin/admin-shell.responsive.test.tsx`
- Test: `components/admin/data-table.responsive.test.tsx`
- Test: `components/shared/need-events-timeline.test.tsx`

- [ ] **Step 1: Run focused tests**

Run: `npm test -- components/admin/admin-shell.responsive.test.tsx components/admin/data-table.responsive.test.tsx components/shared/need-events-timeline.test.tsx`
Expected: PASS for the admin shell, responsive list cards, and rebuilt timeline tests

- [ ] **Step 2: Run the full frontend test suite**

Run: `npm test`
Expected: PASS with no frontend test regressions

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: PASS with no new lint errors in admin components or pages

- [ ] **Step 4: Perform manual browser verification**

Check these screens at mobile width, tablet width, and desktop width:

- `/admin/needs`
- `/admin/needs/map`
- `/admin/services`
- `/admin/users`
- `/admin/organisations`
- `/admin/organisations/[id]`
- `/admin/taxonomy`
- `/admin/needs/[id]`

Expected:

- Desktop keeps polished elevated tables.
- Mobile switches almost all lists to readable stacked cards.
- Shared filters and editors no longer show harsh black borders.
- The need detail timeline visually matches the approved reference structure.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: verify admin surface refresh"
```

---

## Self-Review

- Spec coverage: shared admin surfaces, responsive mobile cards, restyled form controls, elevated shells, and the rebuilt need timeline are all covered by Tasks 1 through 5, with verification in Task 6.
- Placeholder scan: the plan avoids TODO-style placeholders and includes concrete files, commands, and implementation examples.
- Type consistency: the responsive table API uses a single `mobileCard` contract throughout the page tasks, and the timeline plan keeps the existing `NeedReportEvent` shape intact.
