# Admin Responsive Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin shell responsive so desktop keeps the full sidebar, tablets show an icon-only rail, and phones use a topbar-triggered navigation drawer.

**Architecture:** Keep responsive state ownership in the admin layout and make the sidebar render in explicit `full`, `rail`, and `drawer` modes instead of duplicating navigation trees. Extract the admin navigation model into a small shared module, add a focused frontend component-test harness for the new behavior, and wire the topbar and sidebar together through a controlled mobile-drawer state.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Heroicons, Vitest, Testing Library

---

## File Map

- Create: `armenia-service-map-frontend/vitest.config.ts`
  Configures Vitest with the `jsdom` environment and path alias support for frontend component tests.
- Create: `armenia-service-map-frontend/vitest.setup.ts`
  Registers `@testing-library/jest-dom` matchers for component assertions.
- Create: `armenia-service-map-frontend/components/admin/navigation.ts`
  Holds the shared admin navigation structure and route-label helpers so sidebar, topbar, and tests use the same source of truth.
- Create: `armenia-service-map-frontend/components/admin/admin-shell.responsive.test.tsx`
  Verifies the three navigation states and key drawer interactions.
- Modify: `armenia-service-map-frontend/package.json`
  Adds the `test` script and frontend test devDependencies.
- Modify: `armenia-service-map-frontend/components/admin/sidebar.tsx`
  Supports `full`, `rail`, and `drawer` rendering modes plus drawer-close behavior.
- Modify: `armenia-service-map-frontend/components/admin/topbar.tsx`
  Adds a mobile navigation trigger and supports tighter narrow-screen layout behavior.
- Modify: `armenia-service-map-frontend/app/(admin)/layout.tsx`
  Owns responsive mode detection and mobile drawer open/close state.

## Task 1: Add a focused frontend component-test harness

**Files:**
- Create: `armenia-service-map-frontend/vitest.config.ts`
- Create: `armenia-service-map-frontend/vitest.setup.ts`
- Modify: `armenia-service-map-frontend/package.json`

- [ ] **Step 1: Write the failing test**

Define the missing test-tooling baseline:

- `package.json` has no `test` script
- there is no `vitest.config.ts`
- there is no `vitest.setup.ts`

Capture that baseline with these exact checks:

```bash
node -e "const pkg=require('./package.json'); process.exit(pkg.scripts.test ? 0 : 1)"
test -f vitest.config.ts
test -f vitest.setup.ts
```

- [ ] **Step 2: Run the red checks to verify the tooling is absent**

Run: `node -e "const pkg=require('./package.json'); process.exit(pkg.scripts.test ? 0 : 1)"; echo $?`
Expected: `1`

Run: `test -f vitest.config.ts; echo $?`
Expected: `1`

Run: `test -f vitest.setup.ts; echo $?`
Expected: `1`

- [ ] **Step 3: Write the minimal implementation**

Install the narrowest test stack needed for component tests:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Update `package.json` scripts and devDependencies so the frontend has a runnable test command:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  }
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Run the green checks to verify the harness exists**

Run: `node -e "const pkg=require('./package.json'); process.exit(pkg.scripts.test === 'vitest run' ? 0 : 1)"; echo $?`
Expected: `0`

Run: `test -f vitest.config.ts; echo $?`
Expected: `0`

Run: `test -f vitest.setup.ts; echo $?`
Expected: `0`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts
git commit -m "test: add frontend component test harness"
```

## Task 2: Add a red test for tablet rail and mobile drawer behavior

**Files:**
- Create: `armenia-service-map-frontend/components/admin/admin-shell.responsive.test.tsx`
- Create: `armenia-service-map-frontend/components/admin/navigation.ts`
- Modify: `armenia-service-map-frontend/components/admin/sidebar.tsx`
- Modify: `armenia-service-map-frontend/components/admin/topbar.tsx`
- Modify: `armenia-service-map-frontend/app/(admin)/layout.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/admin/admin-shell.responsive.test.tsx` with route/auth mocks and three focused behaviors:

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLayout from '@/app/(admin)/layout';

const pathnameState = { value: '/admin/needs' };

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameState.value,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
    },
    logout: vi.fn(),
  }),
}));

vi.mock('@/lib/api/notifications', () => ({
  useUnreadCount: () => ({ data: { unreadCount: 2 } }),
  useNotifications: () => ({ data: { data: [] } }),
  useMarkNotificationRead: () => ({ mutate: vi.fn() }),
  useMarkAllNotificationsRead: () => ({ mutate: vi.fn() }),
}));

function setViewport(width: number) {
  window.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
}

describe('Admin responsive navigation', () => {
  beforeEach(() => {
    pathnameState.value = '/admin/needs';
  });

  it('renders an icon-only rail on tablet widths', async () => {
    setViewport(900);

    render(<AdminLayout><div>Content</div></AdminLayout>);

    const nav = await screen.findByLabelText('Admin navigation');
    expect(within(nav).getByLabelText('Need reports')).toBeVisible();
    expect(within(nav).queryByText('Need reports')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /open navigation menu/i })).not.toBeInTheDocument();
  });

  it('opens the full navigation drawer from the topbar on mobile widths', async () => {
    setViewport(480);
    const user = userEvent.setup();

    render(<AdminLayout><div>Content</div></AdminLayout>);

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));

    expect(screen.getByRole('dialog', { name: /admin navigation/i })).toBeVisible();
    expect(screen.getByText('Need reports')).toBeVisible();
  });

  it('closes the mobile drawer after selecting a destination', async () => {
    setViewport(480);
    const user = userEvent.setup();

    render(<AdminLayout><div>Content</div></AdminLayout>);

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));
    await user.click(screen.getByRole('link', { name: 'Need reports' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /admin navigation/i })).not.toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run the red test and verify the failure is about missing responsive behavior**

Run: `npm test -- components/admin/admin-shell.responsive.test.tsx`
Expected: FAIL because the current layout always renders the full sidebar, never shows a mobile menu trigger, and does not create a navigation drawer.

- [ ] **Step 3: Write the minimal implementation scaffolding the test expects**

Create `components/admin/navigation.ts`:

```ts
import {
  HomeIcon,
  ArchiveBoxIcon,
  InboxIcon,
  MapIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import { type ComponentType, type SVGProps } from 'react';

export type AdminNavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export type AdminNavSection = {
  title?: string;
  items: AdminNavItem[];
};

export const adminNav: AdminNavSection[] = [
  { items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon }] },
  { title: 'Services', items: [{ label: 'Service directory', href: '/admin/services', icon: ArchiveBoxIcon }] },
  {
    title: 'Needs & Queries',
    items: [
      { label: 'Need reports', href: '/admin/needs', icon: InboxIcon },
      { label: 'Needs map', href: '/admin/needs/map', icon: MapIcon },
      { label: 'Analytics', href: '/admin/analytics', icon: ArrowTrendingUpIcon },
    ],
  },
  {
    title: 'Configurations',
    items: [
      { label: 'User management', href: '/admin/organisations', icon: UserGroupIcon },
      { label: 'Taxonomy', href: '/admin/taxonomy', icon: ViewColumnsIcon },
    ],
  },
];

export const adminBreadcrumbLabels: Record<string, string> = {
  admin: 'Dashboard',
  dashboard: 'Dashboard',
  services: 'Service Directory',
  needs: 'Need Reports',
  map: 'Needs Map',
  analytics: 'Analytics',
  organisations: 'User Management',
  users: 'Users',
  taxonomy: 'Taxonomy',
};
```

Update `app/(admin)/layout.tsx` to calculate responsive mode from viewport width:

```tsx
type SidebarMode = 'full' | 'rail' | 'drawer';

function getSidebarMode(width: number): SidebarMode {
  if (width < 768) return 'drawer';
  if (width < 1280) return 'rail';
  return 'full';
}
```

Pass `mode`, `mobileNavOpen`, and close handlers into the sidebar and topbar so the later implementation can satisfy the tests without adding duplicate state.

- [ ] **Step 4: Run the same test again and confirm it still fails for the unimplemented rendering details**

Run: `npm test -- components/admin/admin-shell.responsive.test.tsx`
Expected: FAIL, but now the failures should be narrower and focused on the sidebar/topbar rendering details rather than missing config or missing imports.

- [ ] **Step 5: Commit**

```bash
git add components/admin/admin-shell.responsive.test.tsx components/admin/navigation.ts app/(admin)/layout.tsx components/admin/sidebar.tsx components/admin/topbar.tsx
git commit -m "test: add admin responsive navigation coverage"
```

## Task 3: Implement the responsive admin shell behavior

**Files:**
- Modify: `armenia-service-map-frontend/app/(admin)/layout.tsx`
- Modify: `armenia-service-map-frontend/components/admin/sidebar.tsx`
- Modify: `armenia-service-map-frontend/components/admin/topbar.tsx`
- Modify: `armenia-service-map-frontend/components/admin/navigation.ts`

- [ ] **Step 1: Implement the layout-owned responsive state**

Update `app/(admin)/layout.tsx` so it:

- tracks `sidebarMode` in state using the `getSidebarMode(window.innerWidth)` helper
- tracks `mobileNavOpen` separately
- closes the drawer automatically whenever the viewport leaves mobile mode
- passes the correct props to `AdminSidebar` and `AdminTopbar`

Use this structure:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopbar } from '@/components/admin/topbar';
import { ShellLoadingScreen } from '@/components/shared/loading-skeletons';

type SidebarMode = 'full' | 'rail' | 'drawer';

function getSidebarMode(width: number): SidebarMode {
  if (width < 768) return 'drawer';
  if (width < 1280) return 'rail';
  return 'full';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('full');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const syncMode = () => setSidebarMode(getSidebarMode(window.innerWidth));
    syncMode();
    window.addEventListener('resize', syncMode);
    return () => window.removeEventListener('resize', syncMode);
  }, []);

  useEffect(() => {
    if (sidebarMode !== 'drawer') {
      setMobileNavOpen(false);
    }
  }, [sidebarMode]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <ShellLoadingScreen tone="admin" />;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#fdf7ee]">
      <a href="#admin-main-content" className="skip-link">Skip to main content</a>
      <AdminSidebar
        mode={sidebarMode}
        mobileNavOpen={mobileNavOpen}
        onCloseMobileNav={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          mobileNavOpen={mobileNavOpen}
          onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
          showMobileNavTrigger={sidebarMode === 'drawer'}
        />
        <main id="admin-main-content" className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `AdminSidebar` modes without duplicating nav data**

Refactor `components/admin/sidebar.tsx` to consume `adminNav` from `components/admin/navigation.ts` and support these props:

```ts
type SidebarMode = 'full' | 'rail' | 'drawer';

type AdminSidebarProps = {
  mode: SidebarMode;
  mobileNavOpen: boolean;
  onCloseMobileNav: () => void;
};
```

Implement these rules:

- `full`: current sidebar UI at `w-80`
- `rail`: persistent `w-20` icon rail with icon links only, `aria-label`, and `title`
- `drawer`: render nothing when closed, and when open render a `role="dialog"` overlay with backdrop, close button, and the existing full nav

Use this drawer shell:

```tsx
{mode === 'drawer' ? (
  mobileNavOpen ? (
    <div className="fixed inset-0 z-40 md:hidden">
      <button
        type="button"
        aria-label="Close navigation menu"
        className="absolute inset-0 bg-[#2f2418]/30"
        onClick={onCloseMobileNav}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className="relative z-10 flex h-full w-[18.5rem] max-w-[85vw] flex-col border-r border-[#f0ece6] bg-white shadow-xl"
      >
        {/* full navigation content plus close button */}
      </aside>
    </div>
  ) : null
) : (
  <aside className={mode === 'rail'
    ? 'hidden h-screen w-20 shrink-0 border-r border-[#f0ece6] bg-white md:flex xl:hidden'
    : 'hidden h-screen w-80 shrink-0 border-r border-[#f0ece6] bg-white xl:flex'}>
    {/* mode-specific nav content */}
  </aside>
)}
```

When a nav link is clicked in drawer mode, call `onCloseMobileNav()` in addition to navigating.

- [ ] **Step 3: Implement the topbar mobile trigger and narrow-screen behavior**

Update `components/admin/topbar.tsx` to import breadcrumb labels from `components/admin/navigation.ts` and accept:

```ts
type AdminTopbarProps = {
  mobileNavOpen: boolean;
  onToggleMobileNav: () => void;
  showMobileNavTrigger: boolean;
};
```

Add a left-side trigger that only renders when `showMobileNavTrigger` is true:

```tsx
import { Bars3Icon } from '@heroicons/react/24/outline';

{showMobileNavTrigger ? (
  <button
    type="button"
    onClick={onToggleMobileNav}
    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#f0ece6] bg-white text-[#8f7a62] transition hover:bg-[#fff3e5] md:hidden"
    aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
    aria-expanded={mobileNavOpen}
    aria-controls="admin-mobile-navigation"
  >
    <Bars3Icon className="h-5 w-5" />
  </button>
) : null}
```

Wrap the breadcrumb and trigger in a `min-w-0` container so breadcrumb text truncates instead of forcing controls to wrap.

- [ ] **Step 4: Run the responsive test suite and make it green**

Run: `npm test -- components/admin/admin-shell.responsive.test.tsx`
Expected: PASS with all three responsive navigation assertions green

- [ ] **Step 5: Commit**

```bash
git add app/(admin)/layout.tsx components/admin/sidebar.tsx components/admin/topbar.tsx components/admin/navigation.ts components/admin/admin-shell.responsive.test.tsx
git commit -m "feat: add responsive admin navigation"
```

## Task 4: Verify accessibility and production readiness

**Files:**
- Verify: `armenia-service-map-frontend/app/(admin)/layout.tsx`
- Verify: `armenia-service-map-frontend/components/admin/sidebar.tsx`
- Verify: `armenia-service-map-frontend/components/admin/topbar.tsx`
- Verify: `armenia-service-map-frontend/components/admin/admin-shell.responsive.test.tsx`

- [ ] **Step 1: Add one more regression assertion for keyboard-safe drawer close behavior**

Extend `components/admin/admin-shell.responsive.test.tsx` with this test:

```tsx
it('closes the mobile drawer when Escape is pressed', async () => {
  setViewport(480);
  const user = userEvent.setup();

  render(<AdminLayout><div>Content</div></AdminLayout>);

  await user.click(screen.getByRole('button', { name: /open navigation menu/i }));
  expect(screen.getByRole('dialog', { name: /admin navigation/i })).toBeVisible();

  await user.keyboard('{Escape}');

  await waitFor(() => {
    expect(screen.queryByRole('dialog', { name: /admin navigation/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the focused tests**

Run: `npm test -- components/admin/admin-shell.responsive.test.tsx`
Expected: PASS

- [ ] **Step 3: Run lint and production build**

Run: `npm run lint components/admin/sidebar.tsx components/admin/topbar.tsx 'app/(admin)/layout.tsx' components/admin/navigation.ts components/admin/admin-shell.responsive.test.tsx`
Expected: no ESLint errors

Run: `npm run build`
Expected: successful Next.js production build

- [ ] **Step 4: Perform manual responsive checks**

Run: `npm run dev`
Expected: local dev server starts

Then verify in the browser:

- desktop at `>=1280px`: full sidebar with labels and section toggles
- tablet around `900px`: icon-only rail, no visible item labels, active destination highlighted
- phone around `390px`: no persistent sidebar, topbar menu button opens labeled drawer, drawer closes on backdrop click, `Escape`, and destination click

- [ ] **Step 5: Commit**

```bash
git add components/admin/admin-shell.responsive.test.tsx app/(admin)/layout.tsx components/admin/sidebar.tsx components/admin/topbar.tsx components/admin/navigation.ts package.json package-lock.json vitest.config.ts vitest.setup.ts
git commit -m "test: verify responsive admin navigation"
```
