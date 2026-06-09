# Public Services — Scroll-to-results on page change, region click, and mobile filtering

**Date:** 2026-06-09
**File touched:** `app/(public)/services/page.tsx` (+ its test, i18n messages)

## Problem

On the public services page (`app/(public)/services/page.tsx`), the pagination
control lives at the bottom of the results region. Changing the page re-renders
the list in place but leaves the viewport scrolled down, so the user stares at
the footer instead of the new top-of-list. The same "I can't tell anything
changed" problem appears:

- when tapping a region on the map (the filtered list updates off-screen), and
- on mobile when changing any filter (the filter card fills the screen; the
  map/list update below the fold).

## Goals

1. Pagination page change / per-page change scrolls to the top of the results.
2. Tapping a region on the map scrolls to the service list.
3. A mobile-only "View results" button scrolls to the service list so filter
   changes produce visible feedback.

Out of scope (deliberately): scrolling on topic/search/availability/region-
dropdown changes (the user is physically at the filter card for those), and on
the list/map view toggle.

## Mechanism

Two scroll anchors, scrolled **imperatively from the event handlers** (not via
`useEffect`, to avoid scrolling on initial mount and double-fires):

- `resultsRef` → the results-region container
  (`<div className="mx-auto max-w-7xl px-6 py-8">`, the map+list block).
- `listRef` → the `ServiceList` wrapper. In list view it is the full-width
  list; in map view it is the right column (`lg:w-2/5`). One ref is passed down
  so both views share a single target.

A tiny helper:

```ts
const scrollToAnchor = (ref: React.RefObject<HTMLElement | null>) =>
  ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
```

**Sticky-header offset.** The site header is `sticky top-0 z-50`
(`components/public/header.tsx`), and the map uses `lg:top-24` (96px) to clear
it. Rather than compute pixel offsets in JS, add Tailwind `scroll-mt-24` to both
anchor elements; `scrollIntoView({ block: 'start' })` then stops below the
sticky header. No magic numbers in JS.

Scrolling fires immediately on click — the anchor element already exists in the
DOM, so even though `isLoading` flips to show the skeleton, the anchor stays put
and the user watches the skeleton→content swap at the correct scroll position.

## Wiring

| Trigger | Scrolls to | Visibility |
|---|---|---|
| Pagination page / per-page change | results region (`listRef` in map view) | all |
| Map region click | service list (`listRef`) | all |
| Mobile "View results" button | service list (`listRef`) | mobile only |
| Filter inputs (topic / search / availability / region dropdown) | — (no scroll) | — |

- `Pagination onPageChange` → `setPage(p)` + scroll.
- `Pagination onPerPageChange` → `setPerPage(n); setPage(1)` + scroll.
- Map `onRegionClick` → existing region-toggle logic + `scrollToAnchor(listRef)`.

**Pagination target adapts to view mode:** `resultsRef` in list view,
`listRef` in map view. This reveals the actual new list items everywhere — on
desktop the two are visually equivalent (the map is sticky), and on mobile map
view it avoids scrolling back up to the map with new items hidden below it.

## Mobile "View results" button

- Full-width button at the **bottom of the filter card** (after the
  availability/count/toggle row), marked `md:hidden`.
- Label with live count: `t('viewResults', { count: totalServices })` →
  e.g. "View 12 results". The count updates live as filters change, so the
  button doubles as "something changed" feedback before it is even tapped.
- On tap → `scrollToAnchor(listRef)`. The label says "results"; results = the
  service list, so it lands on the list in both views (skipping the map in map
  view is intended).
- **Always visible on mobile**, not gated on `hasActiveFilters` — gating would
  make it pop in/out while toggling filters. It also doubles as a jump-to-
  results shortcut.

## i18n

New key `services.viewResults` (ICU plural/count) in **both**
`messages/en.json` and `messages/hy.json`. Armenian (`hy`) is the default
language, so the Armenian value is required, not optional.

## Tests (TDD — extends `app/(public)/services/page.test.tsx`)

1. Upgrade the `ArmeniaMap` and `Pagination` mocks from dumb stubs into ones
   that expose their callbacks (e.g. a `<button onClick={() =>
   props.onRegionClick('shirak-path')}>` and one calling `onPageChange(2)` /
   `onPerPageChange`).
2. Mock `Element.prototype.scrollIntoView` (jsdom does not implement it) in the
   test or `vitest.setup.ts`.
3. Assertions:
   - clicking pagination page-change calls `scrollIntoView` once;
   - per-page change calls it;
   - region click calls it;
   - the mobile "View results" button renders, clicking it calls it, and its
     label reflects the current `totalServices` count;
   - typing in search / toggling availability does **not** call it (guards the
     tight scope).

## Verification

- FE repo: `npm run build` + `npm test`.
- Manual: all four scroll cases across one desktop and one mobile width.

## Note on this Next.js

Per `AGENTS.md`, this Next.js has breaking changes vs. training data. Read the
relevant guide in `node_modules/next/dist/docs/` before writing code.
