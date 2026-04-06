# Taxonomy Route Management Design

## Summary

Replace the current taxonomy modal-based management flow with a route-based admin experience that matches the Armenia design screenshots more closely. The new flow should support dedicated list, detail, and edit/create pages for service topics, while also introducing first-class management of nested subtopics and their active state. Need tags and target groups should follow the same UX grammar so the taxonomy area feels consistent even where their data model is flatter.

## Goals

- Replace modal topic creation and editing with dedicated pages.
- Match the screenshot flow for taxonomy list, detail, and edit states.
- Support parent topic and nested subtopic management in one coherent admin flow.
- Allow quick subtopic active/inactive changes directly from the topic detail page.
- Align need tags and target groups with the same route-based UX logic.
- Preserve existing responsive behavior and reuse the shared admin surface system already established in the frontend.

## Non-Goals

- No broad taxonomy information architecture rewrite outside service topics, need tags, and target groups.
- No pixel-perfect recreation of the screenshots where that would fight the shared admin component system.
- No public-site taxonomy redesign in this scope.
- No speculative features beyond what the screenshots and current requirements support.

## Source-of-Truth Direction

The screenshot set in `Armenia Design Photos` is the visual and workflow reference for this feature, especially:

- `SuperAdmin - Taxonomy - Nomenclature - Service Topics - List.png`
- `SuperAdmin - Taxonomy - Nomenclature - Service Topics - Add service topic.png`
- `SuperAdmin - Taxonomy - Nomenclature - Service Topics - View one topic.png`
- `SuperAdmin - Taxonomy - Nomenclature - Need tags - Listing.png`
- `SuperAdmin - Taxonomy - Nomenclature - Need tags - Edit.png`

The implementation should preserve the shared admin design language already in the codebase while bringing taxonomy behavior and layout into the same family as the references.

## Current Problem

The current taxonomy page in [`app/(admin)/admin/taxonomy/page.tsx`](/Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-frontend/app/(admin)/admin/taxonomy/page.tsx) treats service topics as flat records and manages them with a modal. That creates three gaps:

- The service topics area does not reflect the route-based flow shown in the screenshots.
- Topic management does not expose nested subtopics even though other parts of the app already consume topic children.
- Need tags and target groups still use an older interaction pattern that would feel inconsistent if topics alone moved to a richer page-based flow.

## Information Architecture

Taxonomy should remain a single admin area rooted at `/admin/taxonomy`, with tabs for:

- Service topics
- Need tags
- Target groups

Each tab should act as the entry point into a consistent pattern:

- list page for browsing records
- detail page for inspecting one record and performing lightweight actions
- create page for adding a new record
- edit page for full-form changes

### Routes

Service topics should use these routes:

- `/admin/taxonomy`
  Service topics tab shows the topic list by default when selected.
- `/admin/taxonomy/topics/new`
  Dedicated page for creating a topic and its initial subtopics.
- `/admin/taxonomy/topics/[id]`
  Dedicated page for viewing one topic and managing subtopic status quickly.
- `/admin/taxonomy/topics/[id]/edit`
  Dedicated page for editing the parent topic and the full nested subtopic list.

Need tags should use matching routes:

- `/admin/taxonomy/need-tags/new`
- `/admin/taxonomy/need-tags/[id]`
- `/admin/taxonomy/need-tags/[id]/edit`

Target groups should use matching routes:

- `/admin/taxonomy/target-groups/new`
- `/admin/taxonomy/target-groups/[id]`
- `/admin/taxonomy/target-groups/[id]/edit`

The taxonomy hub remains the discoverability surface. The individual routes handle full-page work rather than reusing modal overlays.

## Service Topics UX

### List Page

The service topics list should align to the screenshot structure:

- page title `Nomenclature`
- segmented tabs for taxonomy sections
- white listing panel with heading `Service topics`
- top-right primary action `Add topic`
- search control inside the panel toolbar
- desktop table columns:
  - `ID`
  - `Topics`
  - `Usage`
  - `Status`
  - `Last update`
  - `View`

The current edit/delete text links should be replaced by a `View` affordance that leads to the detail page. Destructive actions should not remain the primary row interaction.

Status should be visible at list level for the parent topic. If backend support does not yet expose topic status, this project should extend the frontend contract to consume it once provided rather than inventing a fake UI-only value.
For this scope, parent topics and subtopics should both be treated as status-bearing records using the same `ACTIVE` and `INACTIVE` vocabulary already used elsewhere in admin taxonomy.

### Detail Page

The topic detail page should follow the screenshot pattern:

- breadcrumb back to taxonomy
- page title with the parent topic name
- top-right `Edit service topic` action
- main white panel titled `Sub-topics`
- subtopics table with:
  - `ID`
  - `Sub-topics`
  - `Usage`
  - `Status`
  - `Last update`

This page should also support quick subtopic status updates directly in the table. The quick action should be inline and lightweight, such as a compact toggle or click target in the status cell, while still reading clearly inside the existing admin table grammar.

Quick status changes must:

- update only the selected subtopic
- preserve table context without navigation
- show pending state during mutation
- revert on failure
- surface a concise error message if the backend rejects the change

The detail page is not the place for full structural editing. Adding, renaming, reordering, or deleting subtopics belongs on the edit page.

### Create and Edit Pages

The create and edit pages should follow the `Add service topic` screenshot:

- breadcrumb trail
- large page title
- single primary panel containing the form
- parent topic name field
- inline repeatable subtopic rows under a `Sub-topics` section
- page-level cancel and save actions

Each subtopic row should support:

- editable subtopic name
- active/inactive control
- remove action
- stable row identity for existing subtopics

The form should allow adding more rows through an explicit `Add another sub-topic` action.

Create mode and edit mode should share the same form component and behavior wherever possible.

## Service Topic Data Model Expectations

The frontend should treat service topics as hierarchical records:

- parent topic:
  - `id`
  - `name`
  - `slug`
  - `status`
  - usage count
  - timestamps
- child subtopic:
  - `id`
  - `name`
  - `slug`
  - `status`
  - `sortOrder`
  - usage count
  - timestamps

The existing `Topic` type is currently too flat for the admin use case. The taxonomy admin contract should be expanded to include nested subtopic data for detail and edit screens. The public topic model already hints at this hierarchy through `children`, so the admin model should stop pretending the hierarchy does not exist.

## Mutation Design

### Topic Create and Edit

The topic create and edit form should submit parent and child updates together in one save interaction. The payload should support:

- parent topic field updates
- newly added subtopics
- changed subtopic fields
- removed subtopics
- subtopic status changes
- subtopic ordering, if ordering is already supported by the backend

This avoids forcing admins through multiple fragmented saves while editing one topic.

### Quick Subtopic Status Changes

The detail page should use a focused mutation for quick status updates. That mutation should change only the selected subtopic status and then refresh or patch the detail view.

### Deletes

Deleting a parent topic from the list page should not be a silent one-click row action. If topic deletion remains supported, it should be secondary and protected by confirmation from either the detail or edit page.

Deleting a subtopic should happen only on the edit page. If a subtopic cannot be deleted because it is referenced by services, the UI should show the backend message clearly and preserve form state.

## Need Tags UX Alignment

Need tags do not require nested children, but they should follow the same route-based UX logic:

- taxonomy list tab with search, status, last update, and view action
- dedicated create page
- dedicated detail page
- dedicated edit page

The need tag detail page can be lighter than service topics, but it should still use the same page grammar:

- breadcrumb
- page title
- primary action for edit
- white detail panel

If need tags support status, that status should be visible on the list and detail surfaces and editable inline on detail only if the interaction remains clear and low-friction. If not, status editing can stay in the full edit form while preserving the same navigational structure.

## Target Groups UX Alignment

Target groups should use the same interaction model as need tags:

- route-based create, detail, and edit pages
- list rows centered around view rather than inline modal editing
- consistent status and metadata treatment
- same admin panel spacing, breadcrumbs, action placement, and form rhythm

Target groups should not adopt a different control language just because the entity is simpler.

## Responsive Behavior

The taxonomy hub and all child pages must remain usable on mobile:

- list pages still render mobile cards where the shared data table does so today
- view actions remain obvious and thumb-reachable
- detail pages stack panels vertically
- create and edit forms keep subtopic rows legible without forcing horizontal scrolling for common actions

For mobile subtopic rows, layout can collapse into vertically stacked mini-cards instead of pretending to be a narrow table. The desktop screenshot is the visual reference, but responsive usability takes priority on smaller screens.

## Validation Rules

The create and edit forms should enforce:

- parent topic name is required
- subtopic name is required for every non-empty row
- duplicate subtopic names within the same topic are rejected client-side before save
- empty placeholder rows should not be submitted

Slug behavior should follow existing project conventions. If slugs are currently editable, keep that pattern. If they are derived or optional in the nested flow, the implementation plan should make that behavior explicit rather than leaving it ambiguous.
For this scope, the parent topic should keep an explicit editable slug field because the current topic management flow already exposes it. Subtopic slugs should not be edited inline; they should be derived from the subtopic name or handled by the backend in the same way new nested records are normally normalized.

## Error Handling

- Failed list, detail, or form loads should show the established admin error state pattern.
- Failed quick status changes should roll back immediately and show a concise inline or toast-style error.
- Failed save operations should keep all unsaved form input intact.
- Backend validation errors should map to the relevant field or row whenever possible.

## Testing Focus

Implementation and verification should cover:

- service topic list navigation into create, detail, and edit routes
- removal of modal-based topic CRUD from the taxonomy hub
- correct rendering of nested subtopics on topic detail and edit pages
- quick subtopic active/inactive updates from the detail page
- create and edit flows for parent topics with nested subtopics
- consistent route-based UX for need tags and target groups
- mobile card behavior and responsive form behavior
- preservation of existing service form topic selection behavior

## Open Decisions Resolved For This Scope

- Use dedicated routes rather than modals for all taxonomy entities.
- Allow quick subtopic status changes on the topic detail page.
- Keep full structural subtopic management on the create and edit pages.
- Align need tags and target groups to the same UX logic even if their detail pages are simpler.

## Implementation Boundary

This design is focused enough for a single implementation plan. The work spans frontend routing, admin page composition, taxonomy API typing and hooks, and form interactions, but it remains one coherent project centered on taxonomy management behavior.
