# Armenia Design Photos Alignment — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restyle admin and org panels to match the Armenia Design Photos — white backgrounds, warm orange accent, flat minimal chrome.

**Architecture:** Replace CSS custom properties and hardcoded colors across shell layouts, shared components (Button, Badge, Input, DataTable, Pagination), sidebars, topbars, and page files. No behavior changes — purely visual. Both `/admin` and `/org` share the same design language.

**Tech Stack:** Next.js, Tailwind CSS v4, React, TanStack Table, Heroicons

**Reference:** Design photos in `Armenia Design Photos/` folder. Design doc at `docs/plans/2026-04-06-armenia-design-alignment.md`.

---

### Task 1: Replace CSS Custom Properties and Admin Utility Classes

**Files:**
- Modify: `app/globals.css`

**Step 1: Replace the CSS custom properties and utility classes**

Replace the entire `:root` block and all `admin-*` classes with the new Armenia-aligned design tokens:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --admin-shell-bg: #f5f5f4;
  --admin-sidebar-bg: #ffffff;
  --admin-panel-bg: #ffffff;
  --admin-panel-border: #e8e8e8;
  --admin-panel-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  --admin-toolbar-bg: #fafafa;
  --admin-inset-bg: #fafafa;
  --admin-control-bg: #ffffff;
  --admin-control-border: #d1d5db;
  --admin-control-focus: #E8922D;
  --admin-highlight: #E8922D;
  --admin-highlight-soft: #fef3e2;
}
```

Update `.admin-panel`:
```css
.admin-panel {
  border-radius: 0.75rem;
  background: var(--admin-panel-bg);
  border: 1px solid var(--admin-panel-border);
  box-shadow: var(--admin-panel-shadow);
}
```

Update `.admin-inset`:
```css
.admin-inset {
  border-radius: 0.75rem;
  background: var(--admin-inset-bg);
  border: 1px solid #e8e8e8;
  box-shadow: none;
}
```

Update `.admin-toolbar`:
```css
.admin-toolbar {
  border-radius: 0.75rem;
  background: var(--admin-toolbar-bg);
  border: 1px solid #e8e8e8;
  box-shadow: none;
}
```

Update `.admin-control`:
```css
.admin-control {
  border-radius: 0.5rem;
  background: var(--admin-control-bg);
  border: 1px solid var(--admin-control-border);
  box-shadow: none;
}
```

Update `.admin-link-button`:
```css
.admin-link-button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 150ms ease;
}

.admin-link-button:hover {
  color: #111827;
}
```

Remove all `border`, `background`, `padding`, `border-radius`, `box-shadow`, and `transform` from `.admin-link-button` — it should be a plain text link per the designs.

**Step 2: Verify the app still loads**

Run: `npm run build -- --no-lint 2>&1 | tail -5` (or `npm run dev` and check browser)
Expected: No build errors. Colors will look different but nothing breaks.

**Step 3: Commit**

```
feat: replace admin design tokens with Armenia warm palette
```

---

### Task 2: Restyle Admin Sidebar

**Files:**
- Modify: `components/admin/sidebar.tsx`

**Step 1: Update the SidebarPanel header**

Replace the entire `SidebarPanel` component header area. Remove the `BuildingLibraryIcon` branded block, the "RefugeeSupport" / "Admin Portal" text, and the "Active section" badge. Replace with just "ADMIN" text:

In `SidebarPanel`, replace the header `<div>` (the one with `border-b border-[#e3e8ef]`) with:

For full mode:
```tsx
<div className="border-b border-[#e5e5e5] px-5 pb-4 pt-5">
  <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#9ca3af]">Admin</p>
</div>
```

For rail mode:
```tsx
<div className="border-b border-[#e5e5e5] px-3 pb-4 pt-5">
  <p className="text-center text-xs font-semibold uppercase tracking-[0.1em] text-[#9ca3af]">A</p>
</div>
```

Remove the "Navigation" label `<div>` below the header.

Remove the `activeItemLabel` prop and "Active section" badge entirely.

**Step 2: Restyle nav items (full/drawer mode)**

In the `SidebarNav` full/drawer rendering, replace the nav item `<Link>` className:

From:
```
flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors
+ active: border-[#dbe2ea] bg-white text-[#0f172a] shadow-[0_8px_18px_rgba(15,23,42,0.06)]
+ inactive: border-transparent text-[#475569] hover:bg-[#eef2f6] hover:text-[#0f172a]
```

To:
```
flex items-center gap-3 border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors
+ active: border-l-[#E8922D] text-[#E8922D]
+ inactive: border-l-transparent text-[#374151] hover:text-[#111827]
```

Update icon classes:
- Active: `text-[#E8922D]` (was `text-[#2563eb]`)
- Inactive: `text-[#9ca3af]` (was `text-[#94a3b8]`)

**Step 3: Restyle nav items (rail mode)**

Replace the rail mode `<Link>` className:

From:
```
flex h-12 w-12 items-center justify-center rounded-2xl transition-colors
+ active: border border-[#dbe2ea] bg-white text-[#0f172a] shadow-[...]
+ inactive: text-[#64748b] hover:bg-[#eef2f6] hover:text-[#0f172a]
```

To:
```
flex h-10 w-10 items-center justify-center border-l-[3px] transition-colors
+ active: border-l-[#E8922D] text-[#E8922D]
+ inactive: border-l-transparent text-[#9ca3af] hover:text-[#374151]
```

**Step 4: Restyle section headers**

In `SectionHeader`, update the text color from `text-[#64748b]` to `text-[#9ca3af]` and the chevron from `text-[#94a3b8]` to `text-[#d1d5db]`.

**Step 5: Update sidebar aside element backgrounds**

Change all sidebar `bg-[#f8fafc]` to `bg-white`. Change all `border-[#e3e8ef]` to `border-[#e5e5e5]`.

In the drawer mode overlay, change `bg-[#0f172a]/20` to `bg-black/20` and the aside `bg-[#f8fafc]` to `bg-white`, `border-[#e3e8ef]` to `border-[#e5e5e5]`.

**Step 6: Commit**

```
feat: restyle admin sidebar to match Armenia design photos
```

---

### Task 3: Restyle Org Sidebar

**Files:**
- Modify: `components/org/sidebar.tsx`

**Step 1: Update org sidebar to match admin**

Apply the same visual changes as the admin sidebar:

Replace the header area. Remove "RefugeeSupport" label. Keep the org name display:
```tsx
<div className="border-b border-[#e5e5e5] px-5 pb-4 pt-5">
  <p className="text-sm font-semibold text-[#111827]">{organisationName}</p>
</div>
```

Replace `aside` className:
```
bg-[#f8fafc] → bg-white
border-[#e3e8ef] → border-[#e5e5e5]
```

Replace nav item styling to use the same left-border-bar pattern:
```
Active: border-l-[3px] border-l-[#E8922D] text-[#E8922D]
Inactive: border-l-[3px] border-l-transparent text-[#374151] hover:text-[#111827]
```

Remove `rounded-xl border` and shadow from active items. Remove `bg-white` and `shadow-[0_8px_18px...]` from active.

Icon active: `text-[#E8922D]`, inactive: `text-[#9ca3af]`

Section header text: `text-[#9ca3af]`

Footer user info section: change `border-[#e3e8ef]` to `border-[#e5e5e5]`.

**Step 2: Commit**

```
feat: restyle org sidebar to match Armenia design photos
```

---

### Task 4: Restyle Admin Topbar

**Files:**
- Modify: `components/admin/topbar.tsx`

**Step 1: Simplify the topbar header element**

Replace the header className:
```
From: sticky top-0 z-20 border-b border-[#e3e8ef] bg-[#f7f9fc]/95 px-4 py-4 backdrop-blur md:px-6
To:   sticky top-0 z-20 bg-white px-4 py-3 md:px-6
```

Remove `backdrop-blur` and heavy border. Optionally add a very faint bottom border: `border-b border-[#f0f0f0]`.

**Step 2: Simplify the mobile nav trigger button**

Replace:
```
rounded-xl border border-[#d7dde5] bg-white text-[#475569] transition hover:bg-[#eef2f6]
```
With:
```
text-[#6b7280] transition hover:text-[#111827]
```

Remove border, background, and rounded box treatment — just a plain icon button.

**Step 3: Simplify notification bell button**

Replace:
```
relative rounded-xl border border-[#d7dde5] bg-white p-2 text-[#475569] transition hover:bg-[#eef2f6]
```
With:
```
relative p-2 text-[#6b7280] transition hover:text-[#111827]
```

Keep the unread count badge but change `bg-[#2563eb]` to `bg-[#E8922D]`.

**Step 4: Replace profile button with avatar circle**

Replace the profile button (currently shows name with border/bg):
```tsx
<button
  type="button"
  onClick={...}
  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-xs font-semibold text-white transition hover:bg-[#333]"
  aria-label={profileOpen ? 'Close profile menu' : 'Open profile menu'}
  aria-haspopup="menu"
  aria-expanded={profileOpen}
  aria-controls={profileMenuId}
>
  {user?.firstName?.[0]}{user?.lastName?.[0]}
</button>
```

Remove `<UserCircleIcon>` import and the old bordered button with name text.

**Step 5: Simplify notification and profile dropdown panels**

For notification dropdown, replace:
```
border border-[#dbe2ea] bg-white shadow-[0_24px_48px_rgba(15,23,42,0.14)]
```
With:
```
border border-[#e5e5e5] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]
```

Change `rounded-2xl` to `rounded-lg`.

For profile dropdown, same border/shadow changes. Change `rounded-2xl` to `rounded-lg`.

**Step 6: Update breadcrumb colors**

Change breadcrumb text `text-[#64748b]` to `text-[#6b7280]`.
Change separator icon `text-[#94a3b8]` to `text-[#d1d5db]`.
Change active segment `text-[#0f172a]` to `text-[#111827]`.

**Step 7: Commit**

```
feat: restyle admin topbar to match Armenia design photos
```

---

### Task 5: Restyle Org Topbar

**Files:**
- Modify: `components/org/topbar.tsx`

**Step 1: Apply same topbar styling as admin**

Replace header className:
```
From: sticky top-0 z-20 border-b border-[#e3e8ef] bg-[#f7f9fc]/95 px-6 py-4 backdrop-blur
To:   sticky top-0 z-20 bg-white px-6 py-3 border-b border-[#f0f0f0]
```

Replace user info block — remove bordered box, replace with avatar circle:
```tsx
<div className="flex items-center gap-3">
  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-xs font-semibold text-white">
    {user?.firstName?.[0]}{user?.lastName?.[0]}
  </div>
  <button
    type="button"
    onClick={() => void logout()}
    className="text-sm font-medium text-[#6b7280] transition hover:text-[#111827]"
  >
    Sign out
  </button>
</div>
```

Remove the bordered card and the separate Sign out button with icon.

Update breadcrumb colors same as admin topbar.

**Step 2: Commit**

```
feat: restyle org topbar to match Armenia design photos
```

---

### Task 6: Update Shell Backgrounds in Both Layouts

**Files:**
- Modify: `app/(admin)/layout.tsx`
- Modify: `app/(org)/layout.tsx`

**Step 1: Replace shell backgrounds**

In both layout files, replace:
```
bg-[linear-gradient(180deg,#f4f7fb_0%,#eef2f6_100%)]
```
With:
```
bg-[#f5f5f4]
```

**Step 2: Commit**

```
feat: update shell backgrounds to warm off-white
```

---

### Task 7: Restyle Button Component

**Files:**
- Modify: `components/ui/button.tsx`

**Step 1: Replace variant classes**

```ts
const variantClasses: Record<Variant, string> = {
  primary: 'border border-[#E8922D] bg-[#E8922D] text-white hover:bg-[#d4801f] hover:border-[#d4801f] active:bg-[#c0720f]',
  secondary: 'border border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f9fafb] hover:border-[#b0b7c0] active:bg-[#f3f4f6]',
  danger: 'border border-[#fca5a5] bg-white text-[#dc2626] hover:bg-[#fef2f2] hover:border-[#f87171] active:bg-[#fee2e2]',
  ghost: 'border border-transparent bg-transparent text-[#6b7280] hover:bg-[#f5f5f4] hover:text-[#111827] active:bg-[#e5e5e5]',
  gradient: 'border border-[#E8922D] bg-[#E8922D] text-white hover:bg-[#d4801f] hover:border-[#d4801f] active:bg-[#c0720f]',
  'outline-light': 'border border-[#d1d5db] bg-[#fafafa] text-[#374151] font-semibold hover:bg-white hover:border-[#b0b7c0] active:bg-[#f3f4f6]',
};
```

Remove all `shadow-[...]` from button variants — buttons in the designs are flat.

Update the base className — change `rounded-[12px]` to `rounded-lg` (8px).

**Step 2: Commit**

```
feat: restyle buttons to Armenia orange accent
```

---

### Task 8: Restyle Badge Component

**Files:**
- Modify: `components/ui/badge.tsx`

**Step 1: Replace badge variant classes**

The Armenia designs use simple colored text for statuses, not heavy pill badges:

```ts
const variantClasses: Record<BadgeVariant, string> = {
  success: 'text-[#16a34a]',
  warning: 'text-[#E8922D]',
  danger: 'text-[#dc2626]',
  neutral: 'text-[#6b7280]',
};
```

Update the badge render — remove background and shadow, keep as inline text:
```tsx
export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span className={`inline-flex text-sm font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
```

Remove `rounded-full px-2.5 py-1 text-xs font-semibold` and all `bg-*` / `shadow-*`.

**Step 2: Commit**

```
feat: restyle badges to text-only per Armenia designs
```

---

### Task 9: Restyle Input Component

**Files:**
- Modify: `components/ui/input.tsx`

**Step 1: Update input styling**

The `.admin-control` class was already updated in Task 1, so the Input just needs focus ring color update.

Replace `focus:ring-[#3b82f6]` with `focus:ring-[#E8922D]` (both the default and error paths).

Change label color from `text-[#334155]` to `text-[#374151]`.
Change input text from `text-[#0f172a]` to `text-[#111827]`.
Change error border `border-[#efb4ae]` to `border-[#fca5a5]`.

**Step 2: Commit**

```
feat: restyle input focus ring to orange accent
```

---

### Task 10: Restyle DataTable Component

**Files:**
- Modify: `components/admin/data-table.tsx`

**Step 1: Update table header row**

Replace:
```
border-b border-[#e7edf3] bg-[#f8fafc]
```
With:
```
border-b border-[#e5e5e5]
```

Remove header background tint — headers in the designs are white/transparent.

Update header text: `text-[#64748b]` → `text-[#6b7280]`

**Step 2: Update table body rows**

Replace:
```
border-b border-[#edf2f7] text-[#334155] transition-colors hover:bg-[#f8fafc]
```
With:
```
border-b border-[#f0f0f0] text-[#374151] transition-colors hover:bg-[#fafafa]
```

**Step 3: Update mobile cards**

In the mobile card `AdminInset`, replace:
```
border border-[#dbe2ea] bg-white p-4 shadow-[0_6px_16px_rgba(15,23,42,0.04)]
```
With:
```
border border-[#e8e8e8] bg-white p-4
```

Update card text colors:
- `text-[#94a3b8]` → `text-[#9ca3af]`
- `text-[#0f172a]` → `text-[#111827]`
- `text-[#64748b]` → `text-[#6b7280]`
- `text-[#334155]` → `text-[#374151]`

Empty state card: same border update, remove shadow.

**Step 4: Commit**

```
feat: restyle data table to match Armenia designs
```

---

### Task 11: Restyle Pagination Component

**Files:**
- Modify: `components/admin/pagination.tsx`

**Step 1: Update pagination styling**

Replace border top: `border-[#e7edf3]` → `border-[#f0f0f0]`

Replace text colors: `text-[#64748b]` → `text-[#6b7280]`, `text-[#334155]` → `text-[#374151]`

Replace select focus ring: `focus:ring-[#3b82f6]` → `focus:ring-[#E8922D]`

Replace active page button:
```
From: border-[#2563eb] bg-[#2563eb] text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)]
To:   border-[#E8922D] bg-[#E8922D] text-white
```

Replace inactive page button hover: `hover:bg-[#eef2f6]` → `hover:bg-[#f5f5f4]`

Update dots color: `text-[#94a3b8]` → `text-[#9ca3af]`
Update inactive button text: `text-[#475569]` → `text-[#374151]`

**Step 2: Commit**

```
feat: restyle pagination to orange accent
```

---

### Task 12: Restyle Loading Skeletons

**Files:**
- Modify: `components/shared/loading-skeletons.tsx`

**Step 1: Update skeleton colors**

In `SkeletonBlock`, replace:
```
bg-white/90 shadow-[0_10px_24px_rgba(15,23,42,0.06)]
```
With:
```
bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]
```

In `ShellLoadingScreen`:
- Replace `bg-[linear-gradient(180deg,#f4f7fb_0%,#eef2f6_100%)]` with `bg-[#f5f5f4]`
- Replace sidebar `bg-[#f8fafc]` with `bg-white`

In `DashboardLoadingSkeleton`:
- Replace `bg-[#f8fafc]` with `bg-white`
- Replace `border-[#dbe2ea]` with `border-[#e8e8e8]`
- Replace `shadow-[0_20px_44px_rgba(15,23,42,0.06)]` with `shadow-[0_1px_3px_rgba(0,0,0,0.06)]`
- Replace `rounded-[1.75rem]` with `rounded-xl`

In `TableLoadingSkeleton`, the `admin-panel` class will already be updated from Task 1.

Update topbar skeleton: `border-[#e7edf3]` → `border-[#f0f0f0]`, `bg-[#f7f9fc]/95` → `bg-white`

**Step 2: Commit**

```
feat: update loading skeletons to Armenia design tokens
```

---

### Task 13: Update Admin Dashboard Page

**Files:**
- Modify: `app/(admin)/admin/dashboard/page.tsx`

**Step 1: Update dashboard page colors**

Replace all blue-gray color tokens with Armenia palette:
- `text-[#94a3b8]` → `text-[#9ca3af]`
- `text-[#0f172a]` → `text-[#111827]`
- `text-[#64748b]` → `text-[#6b7280]`
- `text-[#475569]` → `text-[#6b7280]`
- `text-[#334155]` → `text-[#374151]`
- `border-[#d7dde5]` → `border-[#d1d5db]`
- `hover:bg-[#f8fafc]` → `hover:bg-[#fafafa]`
- `hover:bg-[#eef2f6]` → `hover:bg-[#f5f5f4]`

In `DashboardStatCard`, replace:
```
border-[#dbe2ea] bg-[#f8fafc] text-[#0f172a]
```
With:
```
border-[#e8e8e8] bg-white text-[#111827]
```

Replace stat card shadow: `shadow-[0_10px_24px_rgba(15,23,42,0.05)]` → `shadow-[0_1px_3px_rgba(0,0,0,0.06)]`
Replace stat card radius: `rounded-2xl` → `rounded-xl`

**Step 2: Commit**

```
feat: restyle admin dashboard to Armenia design
```

---

### Task 14: Update Org Dashboard Page

**Files:**
- Modify: `app/(org)/org/dashboard/page.tsx`

**Step 1: Update org dashboard colors**

Apply same color replacements as admin dashboard.

Replace stat card gradient tones with flat white:
```
from-[#e7f7ef] to-[#d7f2e4] text-[#1f6a47] → bg-white text-[#111827] border border-[#e8e8e8]
from-[#e9f5ff] to-[#d6ebfb] text-[#245a86] → bg-white text-[#111827] border border-[#e8e8e8]
from-[#f1f8ea] to-[#e3f3d5] text-[#446b1f] → bg-white text-[#111827] border border-[#e8e8e8]
```

Remove gradient backgrounds from stat cards — use flat white cards like the admin dashboard.

**Step 2: Commit**

```
feat: restyle org dashboard to Armenia design
```

---

### Task 15: Update All Admin Listing Pages

**Files:**
- Modify: `app/(admin)/admin/services/page.tsx`
- Modify: `app/(admin)/admin/needs/page.tsx`
- Modify: `app/(admin)/admin/organisations/page.tsx`
- Modify: `app/(admin)/admin/users/page.tsx`
- Modify: `app/(admin)/admin/taxonomy/page.tsx`

**Step 1: Color sweep across all listing pages**

In each file, do the same color replacements:
- `text-[#0f172a]` → `text-[#111827]`
- `text-[#64748b]` → `text-[#6b7280]`
- `text-[#334155]` → `text-[#374151]`
- `text-[#94a3b8]` → `text-[#9ca3af]`
- `text-[#475569]` → `text-[#6b7280]`
- `border-[#d7dde5]` → `border-[#d1d5db]`
- `hover:bg-[#eef2f6]` → `hover:bg-[#f5f5f4]`
- `hover:bg-[#f8fafc]` → `hover:bg-[#fafafa]`
- `focus:ring-[#3b82f6]` → `focus:ring-[#E8922D]`
- `text-gray-500` → `text-[#6b7280]`
- `text-gray-700` → `text-[#374151]`

In taxonomy page, update the tab styling. Find the tab buttons and replace any blue/warm-chip active styling with:
- Active tab: `text-[#E8922D] border-b-2 border-[#E8922D]`
- Inactive tab: `text-[#6b7280] hover:text-[#374151]`

In listing pages using topic badges with `bg-blue-50 text-blue-700`, replace with `text-[#E8922D]` (no background).

**Step 2: Commit**

```
feat: restyle admin listing pages to Armenia design
```

---

### Task 16: Update All Admin Detail Pages

**Files:**
- Modify: `app/(admin)/admin/services/[id]/page.tsx`
- Modify: `app/(admin)/admin/needs/[id]/page.tsx`
- Modify: `app/(admin)/admin/organisations/[id]/page.tsx`
- Modify: `app/(admin)/admin/users/[id]/page.tsx`

**Step 1: Color sweep across all detail pages**

Same color replacements as Task 15.

Additionally, for any tab components on detail pages, apply the underline tab style:
- Active: `text-[#E8922D] border-b-2 border-[#E8922D]`  
- Inactive: `text-[#6b7280]`

**Step 2: Commit**

```
feat: restyle admin detail pages to Armenia design
```

---

### Task 17: Update All Org Pages

**Files:**
- Modify: `app/(org)/org/services/page.tsx`
- Modify: `app/(org)/org/services/[id]/page.tsx`
- Modify: `app/(org)/org/services/new/page.tsx`
- Modify: `app/(org)/org/services/[id]/edit/page.tsx`
- Modify: `app/(org)/org/needs/page.tsx`
- Modify: `app/(org)/org/needs/[id]/page.tsx`
- Modify: `app/(org)/org/needs/map/page.tsx`
- Modify: `app/(org)/org/profile/page.tsx`

**Step 1: Color sweep across all org pages**

Same color replacements as Tasks 15-16.

**Step 2: Commit**

```
feat: restyle org pages to Armenia design
```

---

### Task 18: Update Admin Map and Analytics Pages

**Files:**
- Modify: `app/(admin)/admin/needs/map/page.tsx`
- Modify: `app/(admin)/admin/analytics/page.tsx`

**Step 1: Color sweep**

Same color replacements as previous tasks.

**Step 2: Commit**

```
feat: restyle map and analytics pages to Armenia design
```

---

### Task 19: Update Remaining Shared Components

**Files:**
- Modify: `components/shared/need-events-timeline.tsx`
- Modify: `components/shared/rich-text-editor.tsx`
- Modify: `components/public/header.tsx` (only if it bleeds into admin — likely skip)

**Step 1: Update timeline colors**

In the timeline component, replace any blue accent colors with orange:
- Avatar backgrounds: keep dark circle treatment
- Date chips: use warm orange tint `bg-[#fef3e2] text-[#E8922D]`
- Any `text-[#2563eb]` → `text-[#E8922D]`
- Panel borders and shadows: same replacements as previous tasks

**Step 2: Update rich text editor chrome**

Replace any blue focus/accent colors with orange.

**Step 3: Commit**

```
feat: restyle timeline and editor to Armenia design
```

---

### Task 20: Update Admin Form Pages

**Files:**
- Modify: `app/(admin)/admin/services/new/page.tsx`
- Modify: `app/(admin)/admin/services/[id]/edit/page.tsx`
- Modify: `app/(admin)/admin/organisations/new/page.tsx`
- Modify: `app/(admin)/admin/users/new/page.tsx`

**Step 1: Color sweep across form pages**

Same color replacements. Ensure form containers use updated `.admin-panel` styling.

**Step 2: Commit**

```
feat: restyle admin form pages to Armenia design
```

---

### Task 21: Update Auth Context Loading Screen

**Files:**
- Modify: `lib/auth/auth-context.tsx` (if it has any blue-gray styling)

**Step 1: Check and update any hardcoded colors**

Search for any `#2563eb`, `#f8fafc`, `#eef2f6`, etc. and replace with Armenia equivalents.

**Step 2: Commit**

```
feat: update auth context colors to Armenia palette
```

---

### Task 22: Final Visual Verification

**Step 1: Run the build**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 2: Visual check**

Run: `npm run dev`

Check each screen against the reference photos in `Armenia Design Photos/`:
- [ ] Admin dashboard
- [ ] Admin service listing
- [ ] Admin service detail
- [ ] Admin need reports listing
- [ ] Admin need report detail with timeline
- [ ] Admin needs map
- [ ] Admin analytics
- [ ] Admin user management / organisations
- [ ] Admin organisation detail (tabs)
- [ ] Admin taxonomy (tabs)
- [ ] Org dashboard
- [ ] Org service listing
- [ ] Org service detail
- [ ] Org needs listing
- [ ] Org need detail
- [ ] Org profile

**Step 3: Final commit if any touch-ups needed**

```
fix: final visual touch-ups for Armenia design alignment
```
