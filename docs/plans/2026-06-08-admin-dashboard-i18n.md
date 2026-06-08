# Admin Dashboard i18n Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the entire admin dashboard fully bilingual (English / Armenian) by wiring every admin page, shell component, and admin-used form to `next-intl`, reusing existing `admin.*` keys and adding new keys (with drafted Armenian) for everything currently hardcoded.

**Architecture:** All admin pages are client components, so every string is resolved with the `useTranslations('<namespace>')` hook from `next-intl`. We extend the existing nested `admin.*` object in `messages/en.json` and `messages/hy.json`, add a top-level `serviceForm.*` namespace for the form shared with the public org dashboard, and add shared sub-namespaces (`admin.common`, `admin.statuses`, `admin.pagination`, `admin.topbar`, `admin.breadcrumbs`) to avoid duplicating cross-cutting strings. A new automated **key-parity test** guards en/hy symmetry and is the TDD red/green anchor for each task.

**Tech Stack:** Next.js 16 (client components), next-intl 4.8, Vitest + Testing Library. Locale is read from a `locale` cookie in `i18n/request.ts`; supported locales are `en` and `hy` (`i18n/routing.ts`).

---

## Architectural decision (resolved during Task 1)

A **root-level `common` namespace already exists** (`messages/*.json`) with generic verbs (`save`="Save changes", `cancel`, `delete`, `edit`, `view`, `loading`, `noResults`, `perPage`, `next`, `previous`, `search`, `login`, `logout`, `adminPanel`). It is currently consumed **only** by `components/public/header.tsx`.

**Decision: admin pages use the `admin.*` tree (Option A), not root `common`.** Each admin component gets ONE `useTranslations('admin.x')` namespace for locality and consistency, accepting that ~7 generic words (`cancel`/`delete`/`edit`/`view`/`loading`/`noResults`/`perPage`) are duplicated between `admin.common`/`admin.pagination` and root `common`. Rationale: reusing root `common` would force a second hook in every admin component plus reconcile value mismatches (`common.save`="Save changes" vs needed "Save"; `common.search`="Search" vs needed "Search..."). The duplication is trivial and intentional — **reviewers should not flag it.**

## Conventions for every task

- **Branch:** work on the current branch `feature/service-availability-state` (no worktree — per user preference).
- **The TDD loop for i18n** (use this rhythm on every key-adding task):
  1. Add the new keys to `messages/en.json`.
  2. Run the parity test (`npm run test -- messages-parity`) → it should **FAIL** with keys "missing in hy".
  3. Add the matching Armenian keys to `messages/hy.json`.
  4. Run the parity test again → **PASS**.
  5. Wire the page/component to the keys.
  6. Run that file's component test (if one exists) + `npx tsc --noEmit`.
  7. Commit.
- **Wiring pattern** (client component):
  ```tsx
  import { useTranslations } from 'next-intl';
  // inside the component:
  const t = useTranslations('admin.dashboard'); // namespace for this surface
  // then: t('welcome') instead of "Welcome back"
  ```
  For values: `t('regionalLine', { region })`.
- **Test pattern:** existing tests mock next-intl so `t('key')` returns the literal key (see `app/(public)/services/page.test.tsx:18-24`). When updating an admin component that has a test, switch assertions from English text (`getByText('Add user')`) to the key (`getByText('admin.users.addUser')`) OR add the mock if the test renders the component directly. Do **not** assert on English in admin tests after wiring.
- **Don't hardcode in JSX anymore.** After wiring a file, grep it for remaining capitalized English string literals in JSX/aria-label/placeholder and key them too.
- **Next.js 16 caution (AGENTS.md):** only `useTranslations` (next-intl) is used here — no Next.js routing/data APIs change. If a task makes you touch a Next API, read `node_modules/next/dist/docs/` first.
- **Armenian values below are drafted by Claude, not a native translator** — they are functional placeholders the client should review before release. They are intentionally complete so the admin is bilingual immediately.

---

## Task 0: Key-parity test (TDD anchor)

**Files:**
- Create: `lib/i18n/messages-parity.test.ts`

**Step 1: Write the test**

```ts
import { describe, expect, it } from 'vitest';
import en from '@/messages/en.json';
import hy from '@/messages/hy.json';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' && !Array.isArray(value)
      ? collectKeys(value as Record<string, unknown>, path)
      : [path];
  });
}

describe('message catalogue parity', () => {
  const enKeys = collectKeys(en as Record<string, unknown>).sort();
  const hyKeys = collectKeys(hy as Record<string, unknown>).sort();

  it('every en key exists in hy', () => {
    expect(enKeys.filter((k) => !hyKeys.includes(k))).toEqual([]);
  });

  it('every hy key exists in en', () => {
    expect(hyKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
  });
});
```

**Step 2: Run it — expect PASS now (catalogues are currently in parity).**

Run: `npm run test -- messages-parity`
Expected: 2 passing. (This baseline proves the test works; subsequent tasks make it go red→green.)

**Step 3: Commit**

```bash
git add lib/i18n/messages-parity.test.ts
git commit -m "test: add en/hy message catalogue parity guard"
```

---

## Task 1: Shared key namespaces (`admin.common`, `admin.statuses`, `admin.pagination`)

These cover strings reused across many admin surfaces. Add once, reference everywhere.

**Files:**
- Modify: `messages/en.json` (inside the `"admin"` object)
- Modify: `messages/hy.json` (inside the `"admin"` object)

**Step 1: Add to `messages/en.json` `admin` object:**

```json
"common": {
  "searchPlaceholder": "Search...",
  "cancel": "Cancel",
  "save": "Save",
  "saveChanges": "Save changes",
  "delete": "Delete",
  "edit": "Edit",
  "view": "View",
  "add": "Add",
  "noResults": "No results found",
  "loading": "Loading...",
  "confirmDeleteService": "Delete this service?"
},
"statuses": {
  "draft": "Draft",
  "published": "Published",
  "available": "Available",
  "availableSoon": "Available soon",
  "unavailable": "Unavailable",
  "new": "New",
  "inProgress": "In progress",
  "solved": "Solved",
  "closed": "Closed",
  "pending": "Pending",
  "rejected": "Rejected",
  "suspended": "Suspended",
  "active": "Active",
  "inactive": "Inactive",
  "allStates": "All states",
  "allStatuses": "All statuses"
},
"pagination": {
  "showing": "Showing {from} to {to} of {total} results",
  "perPage": "Per page",
  "rowsPerPage": "Rows per page",
  "goToPage": "Go to page {page}"
}
```

**Step 2:** Run `npm run test -- messages-parity` → **FAIL** (missing in hy).

**Step 3: Add the Armenian equivalents to `messages/hy.json` `admin` object:**

```json
"common": {
  "searchPlaceholder": "Որոնել...",
  "cancel": "Չեղարկել",
  "save": "Պահպանել",
  "saveChanges": "Պահպանել փոփոխությունները",
  "delete": "Ջնջել",
  "edit": "Խմբագրել",
  "view": "Դիտել",
  "add": "Ավելացնել",
  "noResults": "Արդյունքներ չեն գտնվել",
  "loading": "Բեռնվում է...",
  "confirmDeleteService": "Ջնջե՞լ այս ծառայությունը:"
},
"statuses": {
  "draft": "Սևագիր",
  "published": "Հրապարակված",
  "available": "Հասանելի",
  "availableSoon": "Շուտով հասանելի",
  "unavailable": "Անհասանելի",
  "new": "Նոր",
  "inProgress": "Ընթացքի մեջ",
  "solved": "Լուծված",
  "closed": "Փակված",
  "pending": "Սպասման մեջ",
  "rejected": "Մերժված",
  "suspended": "Կասեցված",
  "active": "Ակտիվ",
  "inactive": "Ոչ ակտիվ",
  "allStates": "Բոլոր վիճակները",
  "allStatuses": "Բոլոր կարգավիճակները"
},
"pagination": {
  "showing": "Ցուցադրվում է {from}-ից {to} {total}-ից",
  "perPage": "Մեկ էջում",
  "rowsPerPage": "Տողեր մեկ էջում",
  "goToPage": "Անցնել {page} էջ"
}
```

**Step 4:** Run `npm run test -- messages-parity` → **PASS**.

**Step 5: Commit**

```bash
git add messages/en.json messages/hy.json
git commit -m "feat(i18n): add shared admin.common/statuses/pagination keys"
```

> Note: no wiring yet — these are consumed in later tasks. Keys-only commit keeps the catalogue green.

---

## Task 2: Admin shell — sidebar, topbar, navigation, breadcrumbs

**Files:**
- Modify: `messages/en.json`, `messages/hy.json` (add `admin.topbar`, `admin.breadcrumbs`)
- Modify: `components/admin/navigation.ts` — convert hardcoded `label`/breadcrumb strings to translation **keys** (the array becomes key references; resolve with `t()` at render site)
- Modify: `components/admin/sidebar.tsx:196,232` — `"Admin"`, `"Navigation"`; resolve nav item labels via `t('admin.sidebar.<key>')`
- Modify: `components/admin/topbar.tsx:124,153,173,180,217,257,266` — see mapping
- Modify: `app/(admin)/layout.tsx:54` — `"Skip to main content"`
- Test: `components/admin/admin-shell.responsive.test.tsx`, `app/(admin)/layout.test.tsx` (update assertions to keys)

**Keys to add (en):**
```json
"topbar": {
  "notifications": "Notifications",
  "markAllRead": "Mark all read",
  "noNotifications": "No notifications yet.",
  "goToDashboard": "Go to dashboard",
  "signOut": "Sign out",
  "openMenu": "Open navigation menu",
  "closeMenu": "Close navigation menu",
  "openNotifications": "Open notifications panel",
  "closeNotifications": "Close notifications panel",
  "skipToContent": "Skip to main content",
  "adminLabel": "Admin"
},
"breadcrumbs": {
  "dashboard": "Dashboard",
  "serviceDirectory": "Service directory",
  "needReports": "Need reports",
  "needsMap": "Needs map",
  "analytics": "Analytics",
  "userManagement": "User management",
  "users": "Users",
  "taxonomy": "Taxonomy"
}
```

**Keys to add (hy):**
```json
"topbar": {
  "notifications": "Ծանուցումներ",
  "markAllRead": "Նշել բոլորը որպես կարդացված",
  "noNotifications": "Դեռ ծանուցումներ չկան:",
  "goToDashboard": "Անցնել վահանակ",
  "signOut": "Դուրս գալ",
  "openMenu": "Բացել նավիգացիայի ընտրացանկը",
  "closeMenu": "Փակել նավիգացիայի ընտրացանկը",
  "openNotifications": "Բացել ծանուցումների վահանակը",
  "closeNotifications": "Փակել ծանուցումների վահանակը",
  "skipToContent": "Անցնել հիմնական բովանդակությանը",
  "adminLabel": "Ադմին"
},
"breadcrumbs": {
  "dashboard": "Վահանակ",
  "serviceDirectory": "Ծառայությունների կատալոգ",
  "needReports": "Կարիքների հայտեր",
  "needsMap": "Կարիքների քարտեզ",
  "analytics": "Վերլուծություն",
  "userManagement": "Օգտատերերի կառավարում",
  "users": "Օգտատերեր",
  "taxonomy": "Դասակարգիչ"
}
```

> Decision (breadcrumb casing): breadcrumbs reuse sentence-case to match the sidebar. This resolves the "Service Directory" vs "Service directory" inconsistency in `navigation.ts:48-58`.

**Refactor note for `navigation.ts`:** change the data structure so each item carries a stable `labelKey` (e.g. `'serviceDirectory'`) instead of a display string. Sidebar resolves `t('admin.sidebar.' + item.labelKey)`; breadcrumb resolver uses `t('admin.breadcrumbs.' + segmentKey)`. Keep route/icon fields unchanged.

**Steps:** follow the standard TDD loop (en keys → parity red → hy keys → parity green → wire files → update the two shell tests to assert keys → `tsc --noEmit` → commit).

```bash
git commit -m "feat(i18n): localize admin shell (sidebar, topbar, breadcrumbs)"
```

---

## Task 3: Shared component strings — Pagination & DataTable

**Files:**
- Modify: `components/admin/pagination.tsx:33,36,40,62` → use `admin.pagination.*` (added in Task 1)
- Modify: `components/admin/data-table.tsx:42` → default `emptyLabel` should fall back to `t('admin.common.noResults')`. Since DataTable may be a generic component, prefer: keep the `emptyLabel` prop but have each caller pass a translated string, and default the prop to the `noResults` key resolved by callers. Simplest: make `emptyLabel` required-ish by having callers pass `t('admin.common.noResults')`.
- Test: `components/admin/data-table.responsive.test.tsx`, `components/ui/table-controls.test.tsx` (update to keys)

**Wiring detail (pagination.tsx):**
```tsx
const t = useTranslations('admin.pagination');
// "Showing {from} to {to} of {total} results"
t('showing', { from, to, total })
// aria-label "Go to page {p}"
t('goToPage', { page: p })
```

**Steps:** keys already exist (Task 1), so no parity change — just wire + update tests + `tsc` + commit.

```bash
git commit -m "feat(i18n): localize admin pagination and data-table empty state"
```

---

## Task 4: Dashboard page

**Files:**
- Modify: `messages/en.json`, `messages/hy.json` → add `admin.dashboard`
- Modify: `app/(admin)/admin/dashboard/page.tsx:43,48,64,65,66,71,72,94,95`

**en:**
```json
"dashboard": {
  "welcome": "Welcome back",
  "description": "Monitor platform health, search behavior, and activity volume in one place.",
  "totalServices": "Total Services",
  "totalNeedReports": "Total Need Reports",
  "totalOrganisations": "Total Organisations",
  "needReportsTrend": "Need reports over time",
  "needReportsTrendSubtitle": "12-month trend of created need reports.",
  "servicesTrend": "Services created over time",
  "servicesTrendSubtitle": "12-month trend of newly added services."
}
```
**hy:**
```json
"dashboard": {
  "welcome": "Բարի վերադարձ",
  "description": "Հետևեք հարթակի վիճակին, որոնման վարքագծին և ակտիվության ծավալին մեկ տեղում:",
  "totalServices": "Ընդհանուր ծառայություններ",
  "totalNeedReports": "Ընդհանուր կարիքների հայտեր",
  "totalOrganisations": "Ընդհանուր կազմակերպություններ",
  "needReportsTrend": "Կարիքների հայտերը ժամանակի ընթացքում",
  "needReportsTrendSubtitle": "Ստեղծված կարիքների հայտերի 12-ամսյա միտումը:",
  "servicesTrend": "Ստեղծված ծառայությունները ժամանակի ընթացքում",
  "servicesTrendSubtitle": "Նոր ավելացված ծառայությունների 12-ամսյա միտումը:"
}
```
TDD loop → wire → `tsc` → commit `feat(i18n): localize admin dashboard`.

---

## Task 5: Services list page

**Files:**
- Modify: `messages/*.json` → extend `admin.services` + add `admin.services.columns`
- Modify: `app/(admin)/admin/services/page.tsx:71,121,122,124,139,140,160`

Reuse from shared: status badges → `admin.statuses.draft/published`; "All states" → `admin.statuses.allStates`; search → `admin.common.searchPlaceholder`.

**New keys to add under `admin.services` (en):**
```json
"description": "Review publication state, coverage, and availability across partner services.",
"addNew": "Add new service",
"columns": {
  "title": "Title",
  "organisation": "Organisation",
  "location": "Location",
  "availability": "Availability",
  "state": "State",
  "targetGroup": "Target group",
  "topics": "Topics",
  "lastUpdated": "Last updated"
}
```
**hy:**
```json
"description": "Վերանայեք հրապարակման վիճակը, ընդգրկույթը և հասանելիությունը գործընկեր ծառայությունների միջև:",
"addNew": "Ավելացնել նոր ծառայություն",
"columns": {
  "title": "Վերնագիր",
  "organisation": "Կազմակերպություն",
  "location": "Տեղակայություն",
  "availability": "Հասանելիություն",
  "state": "Վիճակ",
  "targetGroup": "Թիրախ խումբ",
  "topics": "Թեմաներ",
  "lastUpdated": "Վերջին թարմացում"
}
```
TDD loop → wire → `tsc` → commit `feat(i18n): localize admin services list`.

---

## Task 6: Shared ServiceForm + service new/detail/edit pages

> **Cross-surface caution:** `components/services/service-form.tsx` is used by **both** `/admin/services/*` and the public **org** dashboard. Its strings go under a **top-level `serviceForm.*` namespace** (NOT `admin.*`), so localizing it correctly covers the org surface too. Update `components/services/service-form.test.tsx` accordingly.

**Files:**
- Modify: `messages/*.json` → add top-level `serviceForm` namespace
- Modify: `components/services/service-form.tsx:127-132,172-186,193` (validation, language toggle, labels, "Select organisation...")
- Modify: `app/(admin)/admin/services/new/page.tsx` (submit label → `t`)
- Modify: `app/(admin)/admin/services/[id]/page.tsx:38` → `confirm(t('admin.common.confirmDeleteService'))`
- Modify: `app/(admin)/admin/services/[id]/edit/page.tsx:105,107,108,185,188,318,327` (validation, breadcrumb "Edit", title, language toggle)
- Test: `components/services/service-form.test.tsx`

**`serviceForm` (en):**
```json
"serviceForm": {
  "language": "Language",
  "english": "English",
  "armenian": "Armenian",
  "selectOrganisation": "Select organisation...",
  "editTitle": "Edit service",
  "editBreadcrumb": "Edit",
  "validation": {
    "titleRequired": "Title is required.",
    "shortDescriptionRequired": "Short description is required.",
    "descriptionRequired": "Description is required.",
    "howToAccessRequired": "How to access the service is required.",
    "organisationRequired": "Organisation is required.",
    "endBeforeStart": "End date cannot be before start date."
  },
  "saveError": "Unable to save service. Please try again."
}
```
**`serviceForm` (hy):**
```json
"serviceForm": {
  "language": "Լեզու",
  "english": "Անգլերեն",
  "armenian": "Հայերեն",
  "selectOrganisation": "Ընտրեք կազմակերպություն...",
  "editTitle": "Խմբագրել ծառայությունը",
  "editBreadcrumb": "Խմբագրել",
  "validation": {
    "titleRequired": "Վերնագիրը պարտադիր է:",
    "shortDescriptionRequired": "Համառոտ նկարագրությունը պարտադիր է:",
    "descriptionRequired": "Նկարագրությունը պարտադիր է:",
    "howToAccessRequired": "Ծառայության հասանելիության եղանակը պարտադիր է:",
    "organisationRequired": "Կազմակերպությունը պարտադիր է:",
    "endBeforeStart": "Ավարտի ամսաթիվը չի կարող լինել սկզբի ամսաթվից շուտ:"
  },
  "saveError": "Չհաջողվեց պահպանել ծառայությունը: Խնդրում ենք կրկին փորձել:"
}
```
> ServiceForm is a client component → `useTranslations('serviceForm')`. Confirm the public org surface still renders correctly after wiring (run `components/services/service-form.test.tsx` and, if present, any org-services test).

TDD loop → wire all four files → `tsc` → commit `feat(i18n): localize shared service form and admin service detail/edit`.

---

## Task 7: Needs list + need detail + needs map

**Files:**
- Modify: `messages/*.json` → extend `admin.needs` (description, viewMap, columns, statuses already shared, form, sections, map text)
- Modify: `app/(admin)/admin/needs/page.tsx:98,99,101,107,130-136,140`
- Modify: `app/(admin)/admin/needs/[id]/page.tsx:33,141,163,168,181,190,196,200,206,214,219,246,262,281`
- Modify: `app/(admin)/admin/needs/map/page.tsx:105,185`
- Test: `components/shared/need-events-timeline.test.tsx` (if it asserts English)

Reuse: status filter labels → `admin.statuses.new/inProgress/solved/closed`; "All statuses" → `admin.statuses.allStatuses`; search → `admin.common.searchPlaceholder`.

**New `admin.needs` keys (en):**
```json
"description": "Track status, assignment, and incoming needs across the admin workspace.",
"viewMap": "View map",
"columns": {
  "id": "ID",
  "title": "Title",
  "submittedBy": "Submitted by",
  "region": "Region",
  "status": "Status",
  "assignedTo": "Assigned to",
  "submitted": "Submitted"
},
"form": {
  "editTitle": "Edit title",
  "cancelTitleEdit": "Cancel title edit",
  "needTitle": "Need title",
  "needTitlePlaceholder": "Add a clear title for this need",
  "needDescription": "Need description",
  "addComment": "Add comment",
  "commentPlaceholder": "Write a comment for activity timeline",
  "submitComment": "Submit comment",
  "submittingComment": "Submitting...",
  "activityTimeline": "Activity timeline",
  "noActivity": "No activity events yet.",
  "needDetails": "Need details",
  "status": "Status",
  "assignee": "Assignee",
  "save": "Save"
},
"map": {
  "showingRegion": "Showing needs in {region}",
  "showingAll": "Showing all need reports by region across Armenia",
  "listHeader": "Need reports list"
}
```
**New `admin.needs` keys (hy):**
```json
"description": "Հետևեք կարգավիճակին, նշանակումներին և մուտքային կարիքներին ադմին տիրույթում:",
"viewMap": "Դիտել քարտեզը",
"columns": {
  "id": "ID",
  "title": "Վերնագիր",
  "submittedBy": "Ներկայացրել է",
  "region": "Մարզ",
  "status": "Կարգավիճակ",
  "assignedTo": "Նշանակված է",
  "submitted": "Ներկայացված է"
},
"form": {
  "editTitle": "Խմբագրել վերնագիրը",
  "cancelTitleEdit": "Չեղարկել վերնագրի խմբագրումը",
  "needTitle": "Կարիքի վերնագիր",
  "needTitlePlaceholder": "Ավելացրեք հստակ վերնագիր այս կարիքի համար",
  "needDescription": "Կարիքի նկարագրություն",
  "addComment": "Ավելացնել մեկնաբանություն",
  "commentPlaceholder": "Գրեք մեկնաբանություն ակտիվության ժապավենի համար",
  "submitComment": "Ուղարկել մեկնաբանությունը",
  "submittingComment": "Ուղարկվում է...",
  "activityTimeline": "Ակտիվության ժապավեն",
  "noActivity": "Դեռ ակտիվության իրադարձություններ չկան:",
  "needDetails": "Կարիքի մանրամասներ",
  "status": "Կարգավիճակ",
  "assignee": "Պատասխանատու",
  "save": "Պահպանել"
},
"map": {
  "showingRegion": "Ցուցադրվում են կարիքները {region}-ում",
  "showingAll": "Ցուցադրվում են բոլոր կարիքների հայտերը ըստ մարզերի Հայաստանում",
  "listHeader": "Կարիքների հայտերի ցանկ"
}
```
TDD loop → wire 3 files → `tsc` → commit `feat(i18n): localize admin needs list, detail, and map`.

---

## Task 8: Organisations list + new + detail

**Files:**
- Modify: `messages/*.json` → extend `admin.organisations`
- Modify: `app/(admin)/admin/organisations/page.tsx:72,73,75,80,86,118-120`
- Modify: `app/(admin)/admin/organisations/new/page.tsx:90,107-125,148`
- Modify: `app/(admin)/admin/organisations/[id]/page.tsx:19-20,63,70,76,82-83,105,115,135,139,155-165,205,273`
- Test: none specific; rely on `tsc` + manual.

Reuse: status labels → `admin.statuses.active/pending/rejected/suspended`; cancel/save → `admin.common.*`.

**New `admin.organisations` keys (en):**
```json
"description": "Review organisation health, access, and coverage at a glance.",
"list": "Organisations",
"addNew": "Add new organisation",
"columns": {
  "name": "Name",
  "account": "Account",
  "lastAccess": "Last access"
},
"tabs": {
  "details": "Organisation details",
  "users": "Organisation users"
},
"actions": {
  "approve": "Approve organisation",
  "reject": "Reject organisation",
  "approving": "Approving...",
  "rejecting": "Rejecting...",
  "activating": "Activating...",
  "deactivating": "Deactivating..."
},
"form": {
  "name": "Name",
  "website": "Website",
  "address": "Address",
  "contactEmail": "Contact email",
  "contactPhone": "Contact phone",
  "location": "Location"
},
"pendingNotice": "This organisation was submitted from the public Join the network form and is waiting for review.",
"allUsers": "All users",
"rejectionModal": {
  "title": "Reject organisation",
  "reasonLabel": "Rejection reason",
  "confirm": "Reject"
}
```
**New `admin.organisations` keys (hy):**
```json
"description": "Մեկ հայացքով վերանայեք կազմակերպության վիճակը, մուտքը և ընդգրկույթը:",
"list": "Կազմակերպություններ",
"addNew": "Ավելացնել նոր կազմակերպություն",
"columns": {
  "name": "Անվանում",
  "account": "Հաշիվ",
  "lastAccess": "Վերջին մուտք"
},
"tabs": {
  "details": "Կազմակերպության տվյալներ",
  "users": "Կազմակերպության օգտատերեր"
},
"actions": {
  "approve": "Հաստատել կազմակերպությունը",
  "reject": "Մերժել կազմակերպությունը",
  "approving": "Հաստատվում է...",
  "rejecting": "Մերժվում է...",
  "activating": "Ակտիվացվում է...",
  "deactivating": "Ապաակտիվացվում է..."
},
"form": {
  "name": "Անվանում",
  "website": "Կայք",
  "address": "Հասցե",
  "contactEmail": "Կոնտակտային էլ. փոստ",
  "contactPhone": "Կոնտակտային հեռախոս",
  "location": "Տեղակայություն"
},
"pendingNotice": "Այս կազմակերպությունը ներկայացվել է հանրային «Միանալ ցանցին» ձևից և սպասում է վերանայման:",
"allUsers": "Բոլոր օգտատերերը",
"rejectionModal": {
  "title": "Մերժել կազմակերպությունը",
  "reasonLabel": "Մերժման պատճառ",
  "confirm": "Մերժել"
}
```
TDD loop → wire 3 files → `tsc` → commit `feat(i18n): localize admin organisations pages`.

---

## Task 9: Users list + new + detail

**Files:**
- Modify: `messages/*.json` → extend `admin.users`
- Modify: `app/(admin)/admin/users/page.tsx:69,70,72,87`
- Modify: `app/(admin)/admin/users/new/page.tsx` (form labels/buttons)
- Modify: `app/(admin)/admin/users/[id]/page.tsx:52,62`

Reuse: status "Active" → `admin.statuses.active`; search → `admin.common.searchPlaceholder`.

**New `admin.users` keys (en):**
```json
"description": "Manage admin and organisation accounts from one polished directory.",
"columns": {
  "firstName": "First name",
  "lastName": "Last name",
  "email": "Email",
  "role": "Role",
  "organisation": "Organisation",
  "created": "Created"
}
```
**New `admin.users` keys (hy):**
```json
"description": "Կառավարեք ադմին և կազմակերպության հաշիվները մեկ կոկիկ ցանկից:",
"columns": {
  "firstName": "Անուն",
  "lastName": "Ազգանուն",
  "email": "Էլ. փոստ",
  "role": "Դեր",
  "organisation": "Կազմակերպություն",
  "created": "Ստեղծվել է"
}
```
TDD loop → wire 3 files → `tsc` → commit `feat(i18n): localize admin users pages`.

---

## Task 10: Taxonomy page + entity form

**Files:**
- Modify: `messages/*.json` → extend `admin.taxonomy` (columns, sections, form, "Add target group", "Editing" states)
- Modify: `app/(admin)/admin/taxonomy/page.tsx:26,82,186,290` + column headers + status badges
- Modify: `components/admin/taxonomy/taxonomy-entity-form.tsx:39-45`
- Test: `app/(admin)/admin/taxonomy/taxonomy-page.test.tsx`, `components/admin/taxonomy/topic-form.test.tsx`, `components/admin/taxonomy/topic-subtopics-table.test.tsx` (update to keys)

Reuse: status options → `admin.statuses.active/inactive`; cancel/saveChanges → `admin.common.*`.

**New `admin.taxonomy` keys (en):**
```json
"targetGroups": "Target groups",
"addTargetGroup": "Add target group",
"editing": "Editing",
"editingComplete": "Editing complete",
"noSubtopics": "No sub-topics found",
"columns": {
  "id": "ID",
  "topics": "Topics",
  "usage": "Usage",
  "status": "Status",
  "lastUpdate": "Last update"
}
```
**New `admin.taxonomy` keys (hy):**
```json
"targetGroups": "Թիրախ խմբեր",
"addTargetGroup": "Ավելացնել թիրախ խումբ",
"editing": "Խմբագրվում է",
"editingComplete": "Խմբագրումն ավարտված է",
"noSubtopics": "Ենթաթեմաներ չեն գտնվել",
"columns": {
  "id": "ID",
  "topics": "Թեմաներ",
  "usage": "Օգտագործում",
  "status": "Կարգավիճակ",
  "lastUpdate": "Վերջին թարմացում"
}
```
TDD loop → wire → update 3 tests → `tsc` → commit `feat(i18n): localize admin taxonomy`.

---

## Task 11: Analytics page (full new namespace)

**Files:**
- Modify: `messages/*.json` → add `admin.analytics`
- Modify: `app/(admin)/admin/analytics/page.tsx:113,123-135,150,160,186,240,266,294` + empty states

**`admin.analytics` (en):**
```json
"analytics": {
  "title": "Analytics",
  "totalSearches": "Total searches",
  "totalUniqueSearches": "Total unique searches",
  "zeroResultSearches": "Zero-result searches",
  "topQueries": "Top search queries",
  "topQueriesSubtitle": "Most frequent terms used by visitors.",
  "zeroResultQueries": "Zero-result queries",
  "zeroResultQueriesSubtitle": "Queries with no matching services.",
  "searchTrend": "Search frequency trend",
  "searchTrendSubtitle": "Daily search volume over the last 30 buckets.",
  "allSearches": "All searches",
  "searchPlaceholder": "Search query text...",
  "resultsColumn": "# Results",
  "mostUsedFilters": "Most used filters",
  "mostUsedFiltersSubtitle": "Top regions and topics selected in search.",
  "leastUsedFilters": "Least used filters",
  "leastUsedFiltersSubtitle": "Long-tail filters with lowest usage.",
  "filterHeatmap": "Filter combinations heatmap",
  "noSearches": "No searches yet.",
  "noZeroResults": "No zero-result queries."
}
```
**`admin.analytics` (hy):**
```json
"analytics": {
  "title": "Վերլուծություն",
  "totalSearches": "Ընդհանուր որոնումներ",
  "totalUniqueSearches": "Ընդհանուր եզակի որոնումներ",
  "zeroResultSearches": "Առանց արդյունքի որոնումներ",
  "topQueries": "Ամենահաճախ որոնումները",
  "topQueriesSubtitle": "Այցելուների կողմից ամենահաճախ օգտագործվող բառերը:",
  "zeroResultQueries": "Առանց արդյունքի հարցումներ",
  "zeroResultQueriesSubtitle": "Հարցումներ, որոնք համընկնող ծառայություններ չունեն:",
  "searchTrend": "Որոնման հաճախականության միտում",
  "searchTrendSubtitle": "Օրական որոնման ծավալը վերջին 30 հատվածներում:",
  "allSearches": "Բոլոր որոնումները",
  "searchPlaceholder": "Որոնման հարցման տեքստ...",
  "resultsColumn": "Արդյունքների #",
  "mostUsedFilters": "Ամենաշատ օգտագործվող զտիչներ",
  "mostUsedFiltersSubtitle": "Որոնման մեջ ընտրված առաջատար մարզերն ու թեմաները:",
  "leastUsedFilters": "Ամենաքիչ օգտագործվող զտիչներ",
  "leastUsedFiltersSubtitle": "Ամենացածր օգտագործմամբ զտիչներ:",
  "filterHeatmap": "Զտիչների համակցությունների ջերմաքարտեզ",
  "noSearches": "Դեռ որոնումներ չկան:",
  "noZeroResults": "Առանց արդյունքի հարցումներ չկան:"
}
```
TDD loop → wire → `tsc` → commit `feat(i18n): localize admin analytics`.

---

## Task 12: Sweep for missed strings + final verification

**Step 1: Grep for leftover hardcoded English in admin code.**

Run:
```bash
cd armenia-service-map-frontend
grep -rnE '"[A-Z][a-z]+[^"]*"' "app/(admin)" components/admin \
  --include=*.tsx --include=*.ts \
  | grep -vE "useTranslations|className|data-testid|import |from '|\.test\." \
  | grep -vE "'admin\.|'serviceForm" || echo "no obvious leftovers"
```
Expected: any hits are reviewed; genuine UI strings get a key (repeat the TDD loop), non-strings (enum values, classNames) are ignored.

**Step 2: Full test suite.**

Run: `npm run test`
Expected: all green, including `messages-parity`.

**Step 3: Type check.**

Run: `npx tsc --noEmit`
Expected: no errors.

**Step 4: Lint.**

Run: `npm run lint`
Expected: clean.

**Step 5: Manual locale smoke test.**

Set the `locale` cookie to `hy` (DevTools → Application → Cookies → `locale=hy`), reload `/admin`, and click through dashboard, services, needs, organisations, users, taxonomy, analytics. Confirm: no English islands, no raw keys (e.g. `admin.dashboard.welcome`) rendered, layouts intact with longer Armenian strings. Repeat with `locale=en`.

**Step 6: Final commit.**

```bash
git add -A
git commit -m "feat(i18n): complete admin dashboard localization sweep"
```

---

## Definition of done

- Every admin page, the admin shell, shared pagination/data-table, and the shared ServiceForm resolve all user-facing strings through `next-intl`.
- `messages/en.json` and `messages/hy.json` are in parity (parity test green).
- Switching the `locale` cookie between `en` and `hy` shows a fully translated admin in both languages, with no raw keys and no English leftovers.
- `npm run test`, `npx tsc --noEmit`, and `npm run lint` all pass.
- Armenian values are flagged to the client for native-speaker review.
