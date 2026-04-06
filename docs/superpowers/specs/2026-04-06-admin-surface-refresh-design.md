# Admin Surface Refresh Design

## Summary

Refresh the admin experience so it feels polished, warm, and intentionally layered instead of outlined and utilitarian. The redesign will remove the harsh black-border look across admin tables, cards, forms, editors, and supporting panels, replacing it with a shared surface system built around soft shadows, rounded corners, warmer neutrals, and more generous spacing.

The activity timeline on the need detail page will be redesigned to closely match the provided reference: a vertical rail with event markers, strong activity copy, warm date chips, and inset comment cards that sit within the event stream.

## Goals

- Remove harsh bordered surfaces from the admin interface.
- Create a cohesive admin-wide elevation and spacing system.
- Restyle shared admin tables and form controls so the visual refresh propagates across pages.
- Rebuild the need activity timeline to match the approved reference closely.
- Preserve existing admin workflows and data behavior.

## Non-Goals

- No changes to backend APIs, event semantics, or permissions.
- No rewrite of admin information architecture or routing.
- No content model changes for need events or comments.
- No redesign of public or organisation-facing surfaces outside admin.

## Visual Direction

The admin should feel warmer and more editorial while staying practical for daily operations. The base canvas remains a soft warm tone, with primary content presented on elevated white or cream-tinted surfaces. Depth should come from layered shadows and spacing rather than visible dark outlines.

Core visual rules:

- Prefer soft shadows over borders for primary surfaces.
- Use large, consistent radii so panels, cards, and controls feel related.
- Increase internal padding and inter-section spacing to create clearer hierarchy.
- Keep contrast strong in typography, but keep structural chrome quiet.
- Use warm accent details where appropriate, especially in the timeline date chips and action emphasis.

## Shared Admin Surface System

The refresh should start with the reusable admin building blocks that shape most screens.

### Surface Types

1. Page sections
   Large elevated containers used for tables, forms, detail panels, and rich editors.
2. Secondary inset surfaces
   Slightly nested blocks used inside larger sections for grouped inputs, metadata, and embedded content.
3. Interactive controls
   Inputs, selects, textareas, check groups, toolbar shells, and similar elements styled to feel embedded in the surface system.

### Styling Principles

- Primary containers use soft box shadows and light or no visible border treatment.
- Secondary containers may use extremely subtle separation, but not stark black strokes.
- Hover and focus states rely on fill, glow, shadow, or accent rings instead of heavy outlines.
- Table and form groupings should look intentionally composed as single surfaces, not as collections of unrelated bordered widgets.

## Component Plan

### Admin Page Shells

Admin pages should adopt a more consistent spacing rhythm, with generous gaps between headline areas, filter blocks, data surfaces, and supporting cards. Existing layout structure can stay in place, but the content blocks should read as a cohesive family through shared radius, padding, and elevation.

### Tables

Tables should sit inside rounded elevated shells rather than appearing as raw grids. The shell should provide the visual boundary. Within the table:

- Header rows use subtle tonal contrast.
- Row separation is soft and low-contrast.
- Hover states use light background shifts and optional gentle elevation.
- Empty states remain inside the same shell so they do not visually break the page.
- Horizontal overflow containers should inherit the shell styling cleanly.

### Shared Form Controls

Admin inputs, selects, textareas, checkbox groups, and editor wrappers should all be restyled to align with the new surface language.

Expected behavior:

- Replace hard border-heavy controls with softer fills and subtle shadow-based structure.
- Preserve clear keyboard focus with accessible accent focus indicators.
- Group related controls inside inset surfaces where it improves readability.
- Keep toolbar-based controls, such as comment editors, visually integrated into a single elevated panel.

### Cards and Detail Panels

Existing admin cards and detail blocks should be normalized into the same surface family. This includes metadata sections, action sidebars, summary cards, and content modules. Where a page currently stacks multiple bordered boxes, those areas should instead feel like coordinated layers with clearer hierarchy.

## Need Activity Timeline

The need detail activity area will move from a simple stacked list to a composed timeline that closely follows the approved reference.

### Structure

- A parent timeline surface contains the full activity stream.
- A vertical guide rail runs through the event stack.
- Each event is anchored by an icon or avatar marker aligned to the rail.
- The main event text uses stronger typographic hierarchy, with actor and action emphasized.
- A small warm date chip appears beneath each applicable event summary.
- Comment-style updates render as inset response cards nested under the relevant event flow.

### Event Presentation

Different event types should map into a consistent visual template while preserving their meaning:

- System or admin actions use a circular icon marker.
- Person-authored updates can use initials or organisation avatar treatment where appropriate.
- Event titles should read as human activity statements rather than database labels.
- Comment content should have enough spacing and width to feel like a deliberate response card, not a plain paragraph.

### Empty and Edge States

- If there are no events, the empty state should still use the refreshed surface styling.
- Events without body content should still render cleanly as timeline moments.
- The timeline should remain readable on narrower screens, with spacing scaled down without losing the rail-and-card structure.

## Behavior and Data Constraints

This is a visual refresh only. Existing sorting, editing, saving, assignment, tag management, and commenting flows should remain functionally unchanged. The implementation may reshape markup and shared styling, but it should not alter user-visible workflow logic or API contracts.

## Testing Strategy

Verification should focus on shared admin surfaces first, then the timeline-specific composition.

- Confirm tables no longer rely on harsh border treatments.
- Confirm shared admin form controls adopt the new surface language consistently.
- Confirm the need detail timeline matches the approved visual structure: rail, markers, date chips, and inset comment card.
- Confirm hover, focus, loading, and empty states still behave correctly.
- Confirm narrower desktop and mobile layouts still render without broken spacing or overflow regressions.

## Risks and Mitigations

### Risk: Partial adoption creates a mixed visual system

Mitigation: update shared admin components and wrappers first, then restyle page-specific surfaces that consume them.

### Risk: Softer styling reduces clarity or accessibility

Mitigation: preserve strong text contrast and explicit focus styles, and use shadows and tonal separation carefully rather than removing all structure.

### Risk: Timeline markup becomes too specific to one event type

Mitigation: design the timeline around shared event slots so mixed event types can fit the same structure without special-case layout breakage.

## Implementation Boundary

This design is scoped tightly enough for a single implementation plan. The work should be executed as an admin visual refresh with one focused custom timeline redesign, not as a broader product-wide redesign.
