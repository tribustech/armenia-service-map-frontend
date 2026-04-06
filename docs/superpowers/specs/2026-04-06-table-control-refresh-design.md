# Table Control Refresh Design

## Summary

Refresh all table toolbar and pagination controls across the admin and organisation workspaces so they feel consistent, polished, and reliable. The update fixes broken-looking dropdown buttons, removes the unwanted gray control fill, adds a soft elevated treatment to inputs, and ensures all table search fields show a search icon at the leading edge.

## Goals

- Normalize dropdown styling across browsers so filter selects and per-page selects look intentional instead of native-default.
- Keep table controls on a clean white surface rather than a gray-filled background.
- Improve visual quality of table inputs with a subtle border and shadow treatment.
- Add a leading search icon to all table search inputs without changing page-level behavior.
- Apply the refresh across all table views that currently use shared admin/org table controls.

## Non-Goals

- Redesign non-table forms across the application.
- Change filtering, sorting, or pagination behavior.
- Replace existing table layouts or data structures.
- Introduce a heavy custom select menu implementation; native selects remain acceptable as long as they are styled consistently.

## Affected Areas

The refresh should cover shared controls and all table surfaces that rely on them:

- Shared `Input` usage in table toolbars.
- Shared pagination per-page selector.
- Admin list views such as needs, services, users, organisations, and taxonomy tables.
- Organisation list views such as needs and services.
- Any other table toolbar using the same shared control styling during this pass.

## Proposed Approach

### 1. Shared Table Search Input

Create a small shared table-search wrapper component that composes the existing input component and adds:

- A leading search icon inside the field.
- Padding adjustments so typed text does not overlap the icon.
- Reuse of the existing input API for placeholder, value, change handlers, and width classes.

This keeps the icon treatment consistent while avoiding repeated page-level wrappers.

### 2. Shared Styled Select

Create a reusable select control for table filters and per-page selection that:

- Uses native `select` semantics for accessibility and low implementation risk.
- Removes inconsistent browser default appearance.
- Renders a custom trailing chevron.
- Matches the same white background, border, radius, and shadow language as the refreshed inputs.
- Supports existing page-level `value`, `onChange`, `aria-label`, and class name usage.

### 3. Shared Control Styling Refresh

Adjust the shared control visual language so table controls consistently use:

- White background.
- Neutral border with slightly stronger definition than the current implementation.
- Subtle shadow for elevation.
- Existing orange focus ring and focus border behavior.
- Stable height and padding so selects and inputs align visually in toolbars and pagination.

This should be implemented in a way that improves shared controls without unintentionally changing unrelated page sections beyond the existing shared control family.

### 4. Table Page Adoption

Update table pages that currently render raw toolbar selects or bare search inputs so they use the new shared controls. This primarily includes:

- Admin needs
- Admin services
- Admin users
- Admin organisations
- Admin taxonomy tables
- Org needs
- Org services
- Shared pagination

## Behavior and Accessibility

- Search inputs remain plain text inputs with unchanged placeholder and filtering behavior.
- Filter selects and per-page selects remain keyboard accessible native selects.
- Decorative search and chevron icons must not interfere with clicks, focus, or screen-reader labels.
- Existing `aria-label` values for selects should be preserved where already present.

## Error Handling and Edge Cases

- Long selected option labels should remain readable without overlapping the trailing chevron.
- Search input widths should remain responsive on narrow screens.
- Control styling should degrade safely even if a browser renders native select affordances differently.
- Existing form-error input styling should continue to work for the shared input component.

## Testing Strategy

Add or update focused frontend tests that verify:

- Table search inputs render with a leading search icon.
- Shared select styling component renders expected affordances without breaking label and value behavior.
- Pagination uses the shared select control.
- Existing table interactions continue to render and function after the control swap.

Manual verification should include:

- Admin needs, services, users, organisations, and taxonomy tables.
- Org needs and services tables.
- Toolbar responsiveness on mobile and desktop widths.
- Per-page selector appearance and usability.

## Risks and Mitigations

- Risk: Broad changes to the shared input style could affect non-table forms.
  Mitigation: keep the visual refresh scoped through dedicated shared table controls where needed instead of overloading every input use blindly.

- Risk: Custom select decoration could interfere with native interaction.
  Mitigation: rely on a native `select` element with appearance reset and pointer-events-disabled decorative icon.

- Risk: Inconsistent styling between admin and org surfaces.
  Mitigation: adopt the same shared table controls in both workspaces instead of duplicating local variants.

## Implementation Notes

- Prefer shared components over page-by-page bespoke wrappers.
- Reuse the current icon library already present in the frontend.
- Keep the change compatible with current Next.js app-router patterns already used in the repo.
