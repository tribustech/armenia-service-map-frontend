# Unified Admin Visual Alignment Design

## Summary

Redesign the super admin and organisation member interfaces so they consistently match the visual language shown in the provided admin screenshots. The current admin UI leans warm, soft, and somewhat promotional. The target UI should instead feel operational, neutral, and standardized: light gray application backgrounds, white content panels, restrained shadows, thin cool-gray borders, compact controls, and a consistent admin component system shared across both `/admin` and `/org`.

This work is a design-system-led refresh. We will not chase pixel-perfect copies of every reference screen. Instead, we will build one shared admin visual system that captures the screenshot family closely and apply it across shells, buttons, inputs, tables, tabs, cards, list views, detail layouts, and supporting admin-specific surfaces.

## Goals

- Align both super admin and organisation member panels with the screenshot-inspired gray admin look.
- Replace the current warm beige admin styling with a neutral gray system.
- Standardize buttons, fields, panel surfaces, borders, shadows, tables, badges, tabs, and navigation across admin experiences.
- Make `/admin` and `/org` feel like one coherent platform with role-specific navigation rather than two differently styled products.
- Preserve all existing workflows, data behavior, and responsive functionality while improving visual consistency.

## Non-Goals

- No backend API changes, data model changes, or permission changes.
- No information architecture rewrite beyond visual/layout normalization.
- No public-site redesign in this scope.
- No requirement to exactly duplicate every screenshot at the pixel level.
- No broad product rebrand outside the authenticated admin-style surfaces.

## Source-of-Truth Direction

The provided screenshots are the visual source of truth for style and tone. The implementation should optimize for shared system fidelity rather than exact one-off recreation. Where a screen family in the references has a distinctive pattern, such as dashboard metric cards, dense listing shells, or structured detail panels, those patterns can receive modest page-level tuning after the shared system is in place.

## Visual Direction

The target interface should feel like a modern administrative workspace:

- calm, neutral, and practical rather than warm or editorial
- structured through spacing, containment, and subtle contrast
- light gray at the application shell level, with white or near-white working surfaces
- crisp but not harsh, using thin gray borders and restrained shadow depth
- dense enough for operational use, while still clean and readable

The current warm palette, amber-tinted surfaces, and glow-heavy shadows should be removed from admin-facing shells and components. Accent color should be used deliberately for primary actions, focus states, active navigation, and selected controls, not as a pervasive decorative layer.

## Shared Design Tokens

The new admin system should define and consistently use role-agnostic tokens for both `/admin` and `/org`.

### Color Tokens

- Application background gray
- Sidebar background gray
- Primary panel white
- Secondary panel/off-white
- Border gray for surfaces and controls
- Row separator gray
- Header tint gray
- Primary text
- Secondary text
- Muted text
- Action color
- Success, warning, and danger semantic colors tuned for admin badges and notices

### Shape and Spacing Tokens

- Shared shell spacing rhythm
- Standard panel radius
- Standard control radius
- Table row height and compact spacing values
- Gaps for page sections, filters, card grids, and sidebars

### Elevation Tokens

- No-elevation or minimal-elevation default
- Subtle panel shadow
- Raised interactive shadow for hover or priority surfaces
- Stronger overlay shadow for drawers and modals

The goal is to remove ad hoc warm shadows and inconsistent radii so the admin UI reads as one composed system.

## Shell and Navigation Design

### Shared Shell Grammar

Both super admin and organisation member should use the same layout grammar:

- left navigation rail or sidebar
- restrained top utility bar
- main page body on a light gray canvas
- content arranged in consistent panels and sections

The shell structure can remain functionally similar to the current layout, but the presentation should be normalized so role changes do not feel like switching to a different product.

### Sidebar

The sidebar should become cooler, flatter, and more structured:

- use a neutral gray background rather than a warm tinted one
- standardize item spacing, icon sizing, section labels, and separators
- make active items feel selected through fill, border/accent, and text emphasis rather than decorative glow
- keep inactive items quiet and readable
- use the same structural styling in both admin roles, changing only the navigation entries

### Top Bar

The top bar should become a thin utility strip rather than a decorative banner:

- neutral background
- subtle bottom separation
- compact breadcrumbs/context title
- compact user or role affordances
- mobile navigation trigger styled as part of the same admin control family

## Page Structure and Layout Rules

### Listing Pages

List pages should feel like one operational workspace rather than multiple disconnected cards:

- page heading row with title and primary action
- optional filter/search/action row
- main listing panel containing table or mobile cards
- pagination and empty states visually integrated into the same listing surface

Filters should sit either inside the main listing surface or in a coordinated panel immediately above it, depending on density. They should not look like unrelated floating widgets.

### Detail Pages

Detail pages should adopt a consistent two-zone hierarchy:

- primary record content in the main column
- supporting metadata, actions, or summary modules in a secondary column where space allows

Both zones should share the same panel language. The intent is to create a clear relationship between main content and supporting context without mixing unrelated card styles.

### Dashboard Pages

Dashboards should become denser and calmer:

- metric cards with consistent heights and chrome
- charts and summaries placed in white panels with subtle borders
- reduced decorative gradients or oversized shadows
- stronger grid alignment so the page feels operational

## Component System

### Buttons

Buttons should be redesigned into a compact admin control family:

- primary: solid action fill, clear contrast, restrained shadow
- secondary: white fill, gray border, subtle hover treatment
- ghost: minimal chrome for row actions and supporting actions
- danger: controlled red treatment without oversized saturation

Buttons should no longer feel like marketing call-to-actions. They should look deliberate, compact, and reusable across toolbars, form submits, table rows, filters, and page headers.

### Inputs and Form Controls

Inputs, selects, textareas, and related controls should share one admin field style:

- white background
- cool light-gray border
- minimal or no default shadow
- crisp focus ring using the action color
- consistent height, padding, radius, and placeholder tone

Grouped controls should be composed inside shared panel patterns. Rich text editors, comment boxes, multi-select wrappers, and filter shells should feel like part of the same family rather than custom standalone components.

### Tabs and Segmented Controls

Tab systems should be normalized:

- flatter segmented toolbar treatment or understated tab bars
- compact spacing
- clear selected state
- no warm chip-like visual language

This is especially important on taxonomy, organisation detail, and similar multi-section admin screens.

### Badges and Status Indicators

Badges should become smaller, tighter, and more systematic:

- muted fills
- readable label contrast
- consistent padding and shape
- semantic color reserved for meaning, not decoration

Status labels across services, needs, users, organisations, and taxonomy entities should share the same badge grammar even when their colors differ.

## Surfaces, Borders, and Shadows

The screenshot family suggests a clearer hierarchy built from containment rather than flourish.

### Surface Rules

- application shell uses gray background
- primary content sits on white panels
- secondary inset blocks use subtle tint shifts, not warm fills
- panels rely on thin borders and restrained shadows
- dividers and section separators should be light but visible

### Border Rules

- remove visibly warm or heavy border treatments
- use thin cool-gray borders for panels, controls, and structured lists
- use row separators and internal dividers consistently

### Shadow Rules

- remove glowy warm shadow stacks
- default to little or no shadow on routine surfaces
- reserve subtle elevation for primary panels, hover states, overlays, and key controls

The UI should feel cleaner and flatter overall, with depth used sparingly and intentionally.

## Tables and Responsive Data Views

Tables are one of the most important surfaces to align.

### Desktop Tables

Admin and organisation tables should share a single visual grammar:

- white table surface integrated into a parent panel
- subtle tinted header row
- quiet row separators
- compact spacing tuned for admin density
- clear hover state without strong color fill
- row actions visually aligned with the rest of the control system

### Mobile Card Views

The existing responsive card pattern should stay, but it must inherit the same admin system:

- white cards on gray page background
- consistent border/radius/shadow language
- compact metadata hierarchy
- strong alignment between title, supporting fields, and actions

The mobile behavior should not look like a fallback from another design system. It should read as the mobile version of the same admin product.

## Special Surface Families

### Dashboard Cards

Dashboard metric and chart cards may receive light page-level tuning so they better resemble the screenshot density and hierarchy. These should still be built from shared panel tokens and card rules.

### Map Filters and Side Panels

Map-related filters, region detail panels, and associated overlays should inherit the same control and panel system so they no longer feel visually detached from list and detail pages.

### Rich Text and Comment Surfaces

Editors, comment forms, and activity-related panels should be re-skinned using the neutral admin control language. Toolbar chrome, text areas, and action rows should feel cohesive with other forms and utility panels.

## Rollout Strategy

This work should be implemented in two waves.

### Wave 1: Shared System

- admin and org shell backgrounds
- sidebar and topbar styling
- shared panel wrappers
- buttons
- inputs/selects/textareas
- badges
- tabs/toolbars
- shared table shell and pagination styling

### Wave 2: Page Family Alignment

- dashboard screens
- list pages
- detail pages
- map/filter panels
- rich text and activity/comment areas

This sequencing keeps the redesign maintainable and reduces the risk of page-specific overrides fighting the shared system.

## Behavior Constraints

This is a presentation-layer redesign only. Existing routing, filtering, pagination, create/edit flows, permissions, and data handling must continue to behave the same way. Markup and component structure may evolve to support the new visual system, but workflow logic and API contracts remain unchanged.

## Testing Strategy

Verification should confirm both visual consistency and behavior preservation.

- Confirm `/admin` and `/org` share the same shell and component language.
- Confirm the application background shifts to gray and panels to white/near-white.
- Confirm buttons, fields, tabs, badges, borders, and shadows follow one consistent system.
- Confirm listings, detail pages, dashboards, and supporting panels inherit the same visual grammar.
- Confirm responsive table-to-card transitions still work and match the new styling.
- Confirm hover, focus, disabled, loading, and empty states remain clear and accessible.
- Confirm no workflow regressions in filters, navigation, pagination, and form submission flows.

## Risks and Mitigations

### Risk: Mixed old and new visual systems remain in the product

Mitigation: implement shared tokens and primitives first, then update page families against those shared styles rather than applying isolated overrides.

### Risk: Gray neutral styling becomes too flat or loses hierarchy

Mitigation: use subtle header tints, panel containment, spacing rhythm, and controlled elevation to preserve scanability without returning to warm glow-heavy styling.

### Risk: Role-specific pages diverge again after the redesign

Mitigation: share shell, surface, button, field, badge, and table primitives across both admin roles, with page-level tuning only where role-specific content requires it.

### Risk: Responsive mobile cards feel disconnected from desktop tables

Mitigation: define desktop and mobile list variants from the same visual tokens and content hierarchy rather than styling them independently.

## Implementation Boundary

This scope is intentionally broad across admin-facing surfaces, but still bounded enough for one implementation plan because it is unified by a single design-system objective: align all authenticated admin panels to one screenshot-inspired gray visual language. The work should be planned and executed as one coordinated frontend redesign, not as unrelated page-by-page refreshes.
