# Admin Responsive Navigation Design

## Goal

Improve the admin panel responsiveness so navigation remains usable on tablets and phones without sacrificing desktop efficiency.

## Current Context

- The admin shell is composed from `app/(admin)/layout.tsx`, `components/admin/sidebar.tsx`, and `components/admin/topbar.tsx`.
- The current sidebar is always rendered at a fixed `w-80` width.
- Desktop behavior is already acceptable and should remain unchanged.
- The current admin topbar already manages dismissible overlays for notifications and the profile menu, which provides a good place to add a mobile navigation trigger.

## Responsive Navigation States

### Desktop

- Keep the existing full-width sidebar.
- Preserve grouped navigation sections, section expand/collapse behavior, branding, and the active section callout.

### Tablet

- Replace the full sidebar with a narrow icon rail.
- Hide all item labels visually.
- Hide section titles, the navigation heading, branding copy, and the active section summary.
- Keep one icon button per destination in a stable top-to-bottom order.
- Preserve active-route styling so the current location is still visually obvious.
- Expose each destination name through accessible labeling and tooltip text so the hidden labels do not reduce usability for assistive technology or pointer hover.

### Mobile

- Remove the persistent sidebar from the layout.
- Add a menu button to the admin topbar that opens a left-side drawer.
- Render the existing full navigation inside that drawer, including grouped sections and labels.
- Close the drawer on outside click, `Escape`, and after navigating to a destination.

## Component Design

### Admin Layout

- Move responsive navigation state ownership into `app/(admin)/layout.tsx`.
- Render the sidebar in three modes:
  - `full` for desktop
  - `rail` for tablet
  - `drawer` for mobile when open
- Allow the main content column to expand automatically as the sidebar narrows or disappears.

### Admin Sidebar

- Extend the sidebar component to support rendering differences by mode rather than creating separate navigation trees.
- In `full` mode, keep current behavior.
- In `rail` mode:
  - flatten the navigation into icon-only links
  - suppress section toggles and section headings
  - keep `aria-label` text on each icon link
  - add tooltip text via `title`
- In `drawer` mode:
  - reuse the full labeled navigation
  - include a close affordance near the drawer header
  - notify the layout when a link is selected so the drawer closes immediately

### Admin Topbar

- Add a mobile-only menu trigger on the left side of the topbar.
- Keep breadcrumbs visible when space allows, but let them truncate cleanly on narrow screens.
- Preserve notifications and profile interactions.
- Ensure the new menu trigger cooperates with the existing outside-click and `Escape` handling patterns.

## Interaction and Accessibility

- Icon-only tablet navigation must remain keyboard reachable and expose readable names to screen readers.
- The mobile drawer must:
  - announce its expanded/collapsed state through the trigger button
  - close with `Escape`
  - close when the user clicks outside it
  - restore focus to the trigger after closing if practical within the current component structure
- Active links should continue using `aria-current="page"`.
- No navigation destination should become unreachable when labels are hidden.

## Styling Direction

- Preserve the current admin visual language: warm neutrals, orange active states, rounded surfaces.
- Use a narrow tablet rail width sized for icon buttons with comfortable hit targets.
- Keep the mobile drawer visually consistent with the existing sidebar rather than introducing a different navigation style.

## Testing and Verification

- Verify desktop keeps the existing full sidebar behavior.
- Verify tablet widths show an icon-only rail and reclaim content space.
- Verify phone widths show no persistent sidebar and allow opening the drawer from the topbar.
- Verify active route highlighting still works in all three states.
- Verify keyboard and pointer interactions for drawer open/close behavior.
- Run frontend lint/build and any targeted tests available for the affected components.

## Out of Scope

- No changes to the organisation panel in this task.
- No redesign of admin information architecture or route structure.
- No user-configurable manual collapse toggle unless later requested.
