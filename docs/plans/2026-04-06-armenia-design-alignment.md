# Armenia Design Photos Alignment

## Summary

Restyle the super admin (`/admin`) and organisation member (`/org`) panels to match the Armenia Design Photos. The current implementation uses a cool blue-gray palette with heavy shadows and pill-style navigation that does not match the design reference. The target is a white-dominant, warm-orange-accented, minimal admin interface.

This design **replaces** the previous specs in `docs/superpowers/specs/` as the visual source of truth.

## Goals

- Match the Armenia Design Photos across all admin and org screens.
- Replace the cool blue-gray palette with a white + warm orange system.
- Simplify the sidebar from pill-style items to clean left-border-bar active indicators.
- Flatten the top bar to a minimal breadcrumb + avatar strip.
- Normalize tables, detail pages, forms, and dashboard cards to the photo reference.
- Keep both `/admin` and `/org` visually consistent, differing only in navigation entries.

## Non-Goals

- No backend, API, or data model changes.
- No public site changes.
- No information architecture or routing changes.
- No new features — purely visual alignment.

## Color System

### Backgrounds

| Token | Value | Usage |
|-------|-------|-------|
| Shell background | `#f5f5f4` | Page canvas behind content panels |
| Sidebar background | `#ffffff` | Sidebar fill |
| Panel background | `#ffffff` | Content cards, table shells, form containers |
| Topbar background | `#ffffff` / transparent | Top utility strip |

### Borders & Separators

| Token | Value | Usage |
|-------|-------|-------|
| Sidebar border | `#e5e5e5` | Right edge of sidebar |
| Panel border | `#e8e8e8` | Very subtle card borders (or none — rely on shadow) |
| Table row separator | `#f0f0f0` | Thin horizontal lines between rows |
| Input border | `#d1d5db` | Form controls resting state |

### Accent & Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| Primary accent | `#E8922D` | Orange — buttons, active nav, links, focus |
| Primary hover | `#d4801f` | Darker orange on hover |
| Active status | `#16a34a` | Green text for "Active" badges |
| Pending status | `#E8922D` | Orange text for "Pending" badges |
| Suspended/danger | `#dc2626` | Red text for "Suspended", delete actions |
| Solved status | `#E8922D` | Orange for "Solved" badges |

### Text

| Token | Value | Usage |
|-------|-------|-------|
| Primary text | `#111827` | Headings, table cells, nav labels |
| Secondary text | `#6b7280` | Supporting copy, breadcrumb segments |
| Muted text | `#9ca3af` | Timestamps, section headers |

### Elevation

| Token | Value | Usage |
|-------|-------|-------|
| Panel shadow | `0 1px 3px rgba(0,0,0,0.06)` | Content cards — very subtle |
| No shadow | none | Most surfaces — flat by default |

## Sidebar

### Structure (both admin and org)

- White background, thin right border
- Top: hamburger icon + "ADMIN" label (or org name for `/org`)
- Navigation grouped under collapsible section headers: "Services", "Needs & Queries", "Configurations"
- Section headers: small uppercase gray text with chevron toggle

### Nav Items

- Icon + label, plain text, no background, no border, no shadow
- Default: `#6b7280` icon, `#374151` text
- Hover: slightly darker text
- **Active**: orange left border bar (3-4px), orange text, orange icon — no pill, no shadow, no fill
- Items have generous vertical spacing but are visually flat

### What to Remove

- Rounded pill active items with shadows (`border-[#dbe2ea] bg-white shadow-[0_8px_18px...]`)
- Blue icon color on active (`text-[#2563eb]`)
- "Active section" badge
- "Navigation" label
- "RefugeeSupport" / "Admin Portal" branding block with icon
- Rail mode icon-in-rounded-box treatment (rail should use same left-bar pattern, just without labels)

## Top Bar

### Structure

- Left: breadcrumb trail (gray segments, `>` separator, last segment bold black)
- Right: notification bell icon, user avatar circle (dark `#1a1a1a` fill, white initials)
- No visible border on the topbar — or at most a very faint bottom line
- Clean, minimal, no elaborate button chrome

### What to Remove

- Bordered button wrappers around bell and profile (`rounded-xl border border-[#d7dde5] bg-white`)
- Profile dropdown elaborate card — simplify to clean dropdown
- Heavy backdrop blur and background tinting

## Tables & Listing Pages

### Page Layout

- Large bold page title top-left
- Orange primary action button top-right ("Add new service", "Add topic", etc.)
- Optional search input and filter controls below title, right-aligned

### Table Shell

- White card panel with very subtle shadow or just a thin border
- Clean table within — no heavy border treatment
- Header row: bold text, small sort chevrons, no background tint
- Row separators: thin `#f0f0f0` lines
- Hover: very subtle background shift
- "View" actions: simple text with eye icon (`👁 View`), no pill button

### Status Badges

- Text-only or very minimal background
- "Active": green text
- "Pending": orange text
- "Inactive": red/gray text
- "Suspended": red text
- Small, inline — not prominent pill badges

### Pagination

- "Showing 1 to 10 of 50 results" left
- "Per page" dropdown center
- Page numbers right: `1 2 3 4 ... 19 20 >`
- Current page: orange background circle or bold orange text

## Detail Pages

### Layout

- Breadcrumb trail above title
- Large bold title with optional status badge inline (e.g., "Draft" in orange outline)
- Action buttons top-right: "Delete" (red outline), "Publish" (green outline), "Edit" (pencil icon link)
- Main content: white card with field label/value pairs in 2-column grid
- Right sidebar (on need detail): metadata fields — "Submitted at", "Location", "Tags", "Assignee", "Status" as dropdowns/selectors

### Tabs

- Simple underline-style tabs
- Active tab: orange text with orange underline
- Inactive: gray text, no underline
- No pill/chip style tabs

## Forms

- White card container
- Labels above inputs
- Inputs: white background, gray border (`#d1d5db`), standard padding
- Rich text toolbar: simple icon row, integrated into the input area
- Submit: orange filled button ("Save changes")
- Cancel: plain text or outline button
- Two-column grid for short fields, full-width for textareas/editors

## Dashboard

### Welcome Card

- User avatar circle (dark, initials) + "Welcome" + user name
- "Sign out" button (outline, right-aligned)
- "filament" branding row with Documentation and GitHub links

### Stat Cards

- Three cards in a row
- Label "Stat" at top, large number below
- Small trend indicator: percentage + directional arrow, color-coded (green up, red down)
- White card, subtle shadow, ~12px border radius

### Chart Cards

- Two-column grid below stats
- White card, chart title + subtitle
- Line chart with colored lines (orange for needs, teal for services)
- Legend dot below chart

## Needs Map

- Filter bar above map: tag/region/date dropdowns, inline row
- "Download map" link top-right
- Map centered in content area
- Legend overlay on the map itself

## Activity Timeline (Need Detail)

- Vertical timeline with circle markers on left rail
- Event text: "**Super Admin** added **'Employment'** tag"
- Warm date chip below each event (small, orange-tinted)
- Comment cards: inset with avatar circle + org name + comment body
- "Add a comment" section: rich text editor + orange "Comment" button

## Implementation Approach

### Wave 1: Design Tokens & Shell

1. Replace CSS custom properties in `globals.css` with new color system
2. Restyle admin sidebar (remove pills, add orange left-bar active state)
3. Restyle org sidebar to match
4. Restyle admin topbar (simplify to breadcrumb + avatar)
5. Restyle org topbar to match
6. Update shell background in both layouts

### Wave 2: Shared Components

7. Update `Button` component: orange primary, outline secondary
8. Update `Badge` component: text-style status badges
9. Update `Input` component: simpler border treatment
10. Update `DataTable`: clean rows, thin separators, text-link actions
11. Update `Pagination`: simple number row style

### Wave 3: Page Alignment

12. Dashboard pages (admin + org)
13. Listing pages (services, needs, users, orgs, taxonomy)
14. Detail pages (service detail, need detail, org detail, user detail)
15. Form pages (add/edit service, add org, etc.)
16. Map pages
17. Analytics page

## Behavior Constraints

This is presentation-only. All routing, filtering, pagination, CRUD flows, permissions, and API contracts remain unchanged.

## Testing

- Confirm sidebar uses orange left-bar active indicator, not blue pills
- Confirm shell background is warm off-white, not cool blue-gray
- Confirm tables use thin separators, no heavy borders
- Confirm buttons use orange accent, not blue
- Confirm status badges are text-style, not pill-style
- Confirm topbar is minimal breadcrumb + avatar
- Confirm admin and org panels share the same visual language
- Confirm all existing workflows still function
