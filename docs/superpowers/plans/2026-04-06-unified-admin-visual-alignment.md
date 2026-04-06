# Unified Admin Visual Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current warm admin styling with a shared gray control-panel design system used consistently across both `/admin` and `/org`.

**Architecture:** Rebuild the visual language from the shared layer outward. First update global tokens and shared primitives, then restyle the admin and org shells to consume the same system, then align data/list/detail surfaces that still carry old page-level colors. Keep existing behavior, routing, and responsive table/card logic intact while moving presentation onto the new tokens.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Vitest, Testing Library

---

## File Structure

- Modify: `app/globals.css`
  Central admin/org tokens, surface utilities, control utilities, focus states, panel shadows, gray shell background styles.
- Modify: `components/admin/admin-surface.tsx`
  Shared wrappers for primary panels, insets, and toolbars.
- Modify: `components/ui/button.tsx`
  Shared button variants used across authenticated surfaces.
- Modify: `components/ui/input.tsx`
  Shared input control styling for admin/org forms.
- Modify: `components/ui/badge.tsx`
  Shared muted semantic badge styling.
- Modify: `components/admin/sidebar.tsx`
  Super admin navigation visuals.
- Modify: `components/admin/topbar.tsx`
  Super admin top utility bar visuals.
- Modify: `app/(admin)/layout.tsx`
  Super admin shell background and spacing.
- Modify: `components/org/sidebar.tsx`
  Organisation navigation visuals aligned to the same system.
- Modify: `components/org/topbar.tsx`
  Organisation top utility bar visuals aligned to the same system.
- Modify: `app/(org)/layout.tsx`
  Organisation shell background and spacing.
- Modify: `components/admin/data-table.tsx`
  Shared desktop/mobile data view styling.
- Modify: `components/admin/pagination.tsx`
  Pagination controls aligned to the shared system.
- Modify: `components/shared/loading-skeletons.tsx`
  Shell/loading placeholders aligned to the neutral admin system.
- Modify: `components/shared/rich-text-editor.tsx`
  Neutral toolbar/editor surface styling.
- Modify: `components/shared/need-events-timeline.tsx`
  Neutral timeline/comment surfaces where older warm chrome remains.
- Modify: `app/(admin)/admin/dashboard/page.tsx`
  Dashboard cards/charts tuned to shared panel hierarchy.
- Modify: `app/(org)/org/dashboard/page.tsx`
  Org dashboard cards/charts tuned to shared panel hierarchy.
- Modify: `app/(admin)/admin/needs/map/page.tsx`
  Map filters and side panels aligned to shared controls.
- Test: `components/admin/admin-shell.responsive.test.tsx`
  Shell behavior must remain intact while visuals change.
- Test: `components/admin/data-table.responsive.test.tsx`
  Table/mobile card rendering must remain intact after restyling.
- Create: `components/ui/admin-theme.test.tsx`
  Focused regression tests for button, input, and badge class outputs.

### Task 1: Rebuild the shared gray admin tokens and primitives

**Files:**
- Modify: `app/globals.css`
- Modify: `components/admin/admin-surface.tsx`
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `components/ui/badge.tsx`
- Test: `components/ui/admin-theme.test.tsx`

- [ ] **Step 1: Write the failing primitive regression tests**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

describe('admin theme primitives', () => {
  it('renders neutral shared control classes for buttons, inputs, and badges', () => {
    render(
      <div>
        <Button variant="secondary">Secondary</Button>
        <Input aria-label="Name" />
        <Badge variant="neutral">Draft</Badge>
      </div>,
    );

    expect(screen.getByRole('button', { name: 'Secondary' }).className).toContain('border-[#d7dde5]');
    expect(screen.getByLabelText('Name').className).toContain('border-[#d7dde5]');
    expect(screen.getByText('Draft').className).toContain('bg-[#f3f5f8]');
  });
});
```

- [ ] **Step 2: Run the primitive test to verify it fails**

Run: `npm test -- components/ui/admin-theme.test.tsx`
Expected: FAIL because the file does not exist yet and current warm classes do not match the gray token assertions.

- [ ] **Step 3: Implement the shared neutral tokens and control styles**

```css
:root {
  --admin-shell-bg: #edf1f5;
  --admin-sidebar-bg: #f6f8fb;
  --admin-panel-bg: rgba(255, 255, 255, 0.96);
  --admin-panel-border: rgba(214, 221, 229, 0.92);
  --admin-panel-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
  --admin-panel-shadow-soft: 0 8px 22px rgba(15, 23, 42, 0.04);
  --admin-control-bg: #ffffff;
  --admin-control-border: #d7dde5;
  --admin-control-focus: #3b82f6;
}

.admin-panel {
  border-radius: 1.25rem;
  background: var(--admin-panel-bg);
  border: 1px solid var(--admin-panel-border);
  box-shadow: var(--admin-panel-shadow);
}
```

```tsx
const variantClasses: Record<Variant, string> = {
  primary: 'border border-[#2563eb] bg-[#2563eb] text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)] hover:bg-[#1d4ed8]',
  secondary: 'border border-[#d7dde5] bg-white text-[#1f2937] hover:bg-[#f8fafc] hover:border-[#c5ced8]',
  danger: 'border border-[#f1c7c2] bg-white text-[#c24135] hover:bg-[#fff5f4]',
  ghost: 'border border-transparent bg-transparent text-[#4b5563] hover:bg-[#eef2f6] hover:text-[#111827]',
  gradient: 'border border-[#2563eb] bg-[#2563eb] text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)] hover:bg-[#1d4ed8]',
  'outline-light': 'border border-[#cfd8e3] bg-[#f8fafc] text-[#1f2937] hover:bg-white',
};
```

- [ ] **Step 4: Run the primitive test to verify it passes**

Run: `npm test -- components/ui/admin-theme.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit the primitive refresh**

```bash
git add app/globals.css components/admin/admin-surface.tsx components/ui/button.tsx components/ui/input.tsx components/ui/badge.tsx components/ui/admin-theme.test.tsx
git commit -m "feat: add unified admin design primitives"
```

### Task 2: Align admin and org shells onto one shared panel system

**Files:**
- Modify: `app/(admin)/layout.tsx`
- Modify: `components/admin/sidebar.tsx`
- Modify: `components/admin/topbar.tsx`
- Modify: `app/(org)/layout.tsx`
- Modify: `components/org/sidebar.tsx`
- Modify: `components/org/topbar.tsx`
- Modify: `components/shared/loading-skeletons.tsx`
- Test: `components/admin/admin-shell.responsive.test.tsx`

- [ ] **Step 1: Extend the shell test to verify both responsive behavior and neutral shell chrome**

```tsx
it('keeps the mobile drawer trigger while rendering the neutral shell chrome', async () => {
  setViewport(480);

  render(
    <AdminLayout>
      <div>Content</div>
    </AdminLayout>,
  );

  expect(screen.getByRole('banner').className).toContain('bg-[#f7f9fc]/95');
  expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the shell test to verify it fails**

Run: `npm test -- components/admin/admin-shell.responsive.test.tsx`
Expected: FAIL because the current shell uses warm backgrounds and border colors.

- [ ] **Step 3: Restyle the admin and org shell components to share the same gray language**

```tsx
return (
  <div className="flex min-h-screen bg-[linear-gradient(180deg,#f4f7fb_0%,#eef2f6_100%)]">
    <a href="#admin-main-content" className="skip-link">Skip to main content</a>
    <AdminSidebar ... />
    <div className="flex min-w-0 flex-1 flex-col">
      <AdminTopbar ... />
      <main id="admin-main-content" className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 xl:px-8 xl:py-8">
        {children}
      </main>
    </div>
  </div>
);
```

```tsx
<aside className="flex h-full w-80 flex-col border-r border-[#e3e8ef] bg-[#f8fafc]">
```

```tsx
<header className="sticky top-0 z-20 border-b border-[#e3e8ef] bg-[#f7f9fc]/95 px-4 py-4 backdrop-blur md:px-6">
```

- [ ] **Step 4: Run the shell test to verify it passes**

Run: `npm test -- components/admin/admin-shell.responsive.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit the shell alignment**

```bash
git add 'app/(admin)/layout.tsx' 'app/(org)/layout.tsx' components/admin/sidebar.tsx components/admin/topbar.tsx components/org/sidebar.tsx components/org/topbar.tsx components/shared/loading-skeletons.tsx components/admin/admin-shell.responsive.test.tsx
git commit -m "feat: align admin and org shells"
```

### Task 3: Restyle shared list, table, and detail support surfaces

**Files:**
- Modify: `components/admin/data-table.tsx`
- Modify: `components/admin/pagination.tsx`
- Modify: `components/shared/rich-text-editor.tsx`
- Modify: `components/shared/need-events-timeline.tsx`
- Test: `components/admin/data-table.responsive.test.tsx`

- [ ] **Step 1: Extend the responsive data-table test with neutral desktop and mobile surface checks**

```tsx
expect(screen.getByTestId('mobile-data-card-1').className).toContain('border-[#dbe2ea]');
expect(screen.getByRole('table').className).toContain('text-[#334155]');
```

- [ ] **Step 2: Run the data-table test to verify it fails**

Run: `npm test -- components/admin/data-table.responsive.test.tsx`
Expected: FAIL because the current classes still use warm text, border, and hover colors.

- [ ] **Step 3: Move table, pagination, editor, and timeline surfaces onto the neutral tokens**

```tsx
<AdminInset key={rowId} className="border border-[#dbe2ea] bg-white p-4 shadow-[0_6px_16px_rgba(15,23,42,0.04)]" />
```

```tsx
<tr key={headerGroup.id} className="border-b border-[#e7edf3] bg-[#f8fafc]">
```

```tsx
<tr key={row.id} className="border-b border-[#edf2f7] text-[#334155] transition-colors hover:bg-[#f8fafc]">
```

```tsx
<div className="admin-panel overflow-hidden focus-within:ring-2 focus-within:ring-[#3b82f6]">
```

- [ ] **Step 4: Run the data-table test to verify it passes**

Run: `npm test -- components/admin/data-table.responsive.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit the shared data-surface refresh**

```bash
git add components/admin/data-table.tsx components/admin/pagination.tsx components/shared/rich-text-editor.tsx components/shared/need-events-timeline.tsx components/admin/data-table.responsive.test.tsx
git commit -m "feat: refresh admin data surfaces"
```

### Task 4: Tune high-visibility dashboard and map pages to the new system

**Files:**
- Modify: `app/(admin)/admin/dashboard/page.tsx`
- Modify: `app/(org)/org/dashboard/page.tsx`
- Modify: `app/(admin)/admin/needs/map/page.tsx`
- Modify: `app/(admin)/admin/needs/page.tsx`
- Modify: `app/(admin)/admin/services/page.tsx`
- Modify: `app/(admin)/admin/organisations/page.tsx`
- Modify: `app/(admin)/admin/users/page.tsx`
- Modify: `app/(admin)/admin/taxonomy/page.tsx`

- [ ] **Step 1: Inspect each high-traffic page for remaining warm one-off classes**

```bash
rg -n "#fff3|#fff8|#fdf7|#f6ec|#d6a25b|#8f7|#b76|#e47|#f5ede2" app/(admin)/admin app/(org)/org
```

Expected: Matches appear across dashboards, filters, list pages, and map controls that still need gray-token replacement.

- [ ] **Step 2: Replace lingering warm one-off styling with shared panel and control classes**

```tsx
<section className="admin-panel p-6">
```

```tsx
<div className="admin-toolbar mt-4 flex gap-1 p-1.5">
```

```tsx
<select className="admin-control px-4 py-3 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
```

- [ ] **Step 3: Run targeted tests and the full frontend suite**

Run: `npm test -- components/ui/admin-theme.test.tsx components/admin/admin-shell.responsive.test.tsx components/admin/data-table.responsive.test.tsx`
Expected: PASS

Run: `npm test`
Expected: PASS

- [ ] **Step 4: Build the frontend to catch class or import regressions**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit the page-family alignment**

```bash
git add 'app/(admin)/admin/dashboard/page.tsx' 'app/(org)/org/dashboard/page.tsx' 'app/(admin)/admin/needs/map/page.tsx' 'app/(admin)/admin/needs/page.tsx' 'app/(admin)/admin/services/page.tsx' 'app/(admin)/admin/organisations/page.tsx' 'app/(admin)/admin/users/page.tsx' 'app/(admin)/admin/taxonomy/page.tsx'
git commit -m "feat: align admin page families to unified system"
```

## Self-Review

### Spec coverage

- Shared tokens, surfaces, buttons, inputs, badges, borders, and shadows are covered in Task 1.
- Shared shell grammar across `/admin` and `/org` is covered in Task 2.
- Tables, mobile cards, pagination, rich text, and timeline/comment surfaces are covered in Task 3.
- Dashboards, map filters, and high-traffic list pages are covered in Task 4.

### Placeholder scan

- No `TODO`, `TBD`, or deferred “implement later” language remains.
- All tasks include concrete file paths, commands, and code snippets.

### Type consistency

- Shared class hooks stay centered on `admin-panel`, `admin-toolbar`, and `admin-control`.
- Test targets match the files listed in the file map.

Plan complete and saved to `docs/superpowers/plans/2026-04-06-unified-admin-visual-alignment.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

User already chose inline execution without another checkpoint, so continue with inline implementation in this session.
