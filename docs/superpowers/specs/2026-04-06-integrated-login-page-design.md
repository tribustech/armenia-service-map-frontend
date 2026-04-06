# Integrated Public Login Page Design

## Goal

Integrate the sign-in experience into the public website shell so users stay within the same navigation, branding, and page structure as the rest of the site. The login route remains `/login`, but it should render as a public-facing page inside the shared public layout instead of as a standalone full-screen auth screen.

## Current State

- The public site already uses a shared header and footer through the `(public)` route group.
- The public navigation already links to `/login`.
- The current login page lives outside the public route group and renders as a detached full-screen card with custom inline input and button styles.

## Proposed Change

Move the login page into the public route group and redesign it as a dedicated public page with a split layout:

- Left column: sign-in form, heading, short supporting copy, validation feedback, and primary action.
- Right column: branded visual panel using an existing public image with an overlay and concise supporting message.
- Mobile layout: stack into a single-column experience with the form first and the visual content secondary.

This preserves the existing route while making the page feel like part of the site rather than a separate admin entry point.

## Layout

### Route placement

The login page should be implemented under the `(public)` route group so it automatically inherits:

- the existing public header
- the existing public footer
- the standard public `<main>` content area

The URL remains `/login`.

### Page composition

The page should use a two-column layout on desktop and a one-column layout on smaller screens.

Form column requirements:

- clear page title and short explanatory copy
- existing shared `Input` component for email and password fields
- existing shared `Button` component for the submit action
- inline error message for invalid credentials
- comfortable vertical spacing consistent with the rest of the public site

Visual column requirements:

- use an existing public image asset already shipped with the frontend
- add a dark or brand-tinted overlay so text remains readable
- include a short message that reinforces trust, support, and continuity with the rest of the site
- hide, reduce, or reposition content appropriately on smaller screens so the form stays primary

## Styling Direction

The page should follow the visual language already present in the public header and primary buttons:

- blue and neutral palette already used across the public site
- soft card treatment for the form area rather than a plain box
- generous spacing and responsive padding
- rounded corners and restrained shadow use
- no separate admin-style layout treatment

The login form should reuse the existing input and button primitives instead of introducing page-local field styling.

## Behavior

Authentication behavior should remain unchanged:

- submit email and password through the current auth context
- clear previous error state before each submission attempt
- show the translated invalid-credentials message on failed login
- keep the loading state on the submit button while the request is in flight
- redirect authenticated users to `/admin/dashboard` after successful login

No backend, token, or API contract changes are required.

## Accessibility

The page should preserve or improve current accessibility:

- fields keep visible labels
- submit remains keyboard accessible
- error feedback stays visible in text, not only color
- reading order prioritizes the form before decorative imagery on small screens
- the page remains fully usable with the shared site navigation intact

## Implementation Notes

- Remove or replace the standalone `app/login/page.tsx` implementation.
- Create the new login page under `app/(public)/login/page.tsx`.
- Import and use the shared UI primitives from `components/ui`.
- Use an existing public image from `public/` for the right-side panel to avoid introducing a new asset requirement.
- Keep translation usage aligned with the current `auth` message namespace unless copy changes require new keys.

## Testing

Verify the following after implementation:

- `/login` renders with the public header and footer
- the login navigation item appears active on the login page
- desktop layout shows the two-column composition
- mobile layout stacks correctly with the form first
- invalid credentials show the expected error message
- successful login still redirects to `/admin/dashboard`
- shared input and button styles match the rest of the application

## Out of Scope

- changing dashboard routing after login
- adding password reset or account recovery flows
- changing authentication APIs
- converting login into a modal or inline homepage section
