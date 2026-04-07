# Join Network Onboarding Design

## Summary

Turn the public "Join the network" page into the real onboarding path for new organisations. A public submission should create a reviewable organisation record, Super Admin should review those submissions from the existing Organisations admin area, and approval should activate the organisation while provisioning its first user from the submitted contact email.

This design keeps onboarding inside the existing organisation lifecycle rather than introducing a parallel application subsystem. It also adds explicit review outcomes so pending requests, approved organisations, and rejected submissions are all represented clearly in the domain model.

## Goals

- Make the public join form persist real onboarding requests instead of only showing a local success message.
- Let Super Admin review pending submissions from the existing Organisations area.
- Support explicit approval and rejection flows for submitted organisations.
- Create the initial organisation user from the submitted contact email when a request is approved.
- Preserve the current auth model where newly created users complete password setup before they can log in.

## Non-Goals

- No redesign of the public page beyond the states needed for real submission.
- No separate "applications" or "requests" admin section.
- No self-service approval or automatic organisation activation.
- No broad refactor of organisation management unrelated to onboarding review.

## Existing Constraints

- The public join form currently validates in the browser only and does not call the backend.
- `OrganisationStatus` currently supports `ACTIVE`, `PENDING`, and `SUSPENDED`; rejection is not modeled.
- Super Admin already manages organisations from the existing organisations list and detail views.
- Authentication already blocks pending users and supports password setup for invited users.

## Proposed Approach

Use the `Organisation` model as the onboarding record and extend it with explicit review metadata.

Public submissions create organisations in `PENDING`. Super Admin reviews those records in the existing organisations admin surfaces and chooses either:

- `Approve`: set organisation status to `ACTIVE`, record review metadata, create the first org user from the submitted contact details, and trigger the setup/invitation path.
- `Reject`: set organisation status to `REJECTED`, record review metadata, optionally store a rejection reason, and keep the record visible for audit/history.

This approach avoids duplicating the organisation model while still giving onboarding requests a clear review lifecycle.

## Data Model

### Organisation Status

Add `REJECTED` to `OrganisationStatus`.

Valid review-oriented statuses:

- `PENDING`: submitted and awaiting Super Admin review
- `ACTIVE`: approved and active
- `REJECTED`: reviewed and rejected
- `SUSPENDED`: existing operational status for organisations that were previously active and later disabled

### Organisation Fields

Add review metadata to `Organisation`:

- `submissionSource` or equivalent flag to identify public join submissions
- `reviewedAt`
- `reviewedByUserId`
- `rejectionReason` nullable

These fields let the admin interface show review state and preserve audit context without requiring a separate join-request table.

The existing contact-related organisation fields remain the source of submission data:

- `contactPersonName`
- `contactPersonEmail`
- `contactPersonPhone`
- `description`
- `regionId`

The public form's organisation name maps directly to `name`, and the service summary maps to `description` unless a dedicated onboarding field is later justified.

### Reviewer Relationship

`reviewedByUserId` should reference the reviewing Super Admin user when possible. If introducing a formal Prisma relation would add too much scope for this pass, storing the UUID as a plain nullable field is acceptable, but a proper relation is preferred for auditability.

## Public Submission Flow

### Entry Point

The public page at `app/(public)/join-the-network/page.tsx` should submit to a new public backend endpoint dedicated to onboarding.

Recommended contract:

- `POST /public/join-network`

Submitted fields:

- organisation name
- region
- contact name
- email
- phone
- services description

### Validation

Frontend validation should stay aligned with current behavior:

- organisation name required
- contact name required
- email required and valid
- phone optional but validated when present
- service description required and length-checked

Backend validation becomes authoritative and should reject malformed or incomplete submissions even if the browser validation is bypassed.

### Persistence

Successful submission creates one `Organisation` with:

- `status = PENDING`
- submission metadata marking it as public onboarding
- contact fields populated from the form
- `description` populated from the services description

The public page should then show a success state confirming the request was submitted for review.

## Admin Review Experience

### Organisations List

Pending join requests should appear in the existing organisations list rather than in a separate screen.

Expected improvements:

- status filtering should support `PENDING`, `ACTIVE`, `REJECTED`, and `SUSPENDED`
- pending items should be easy to identify visually
- the list may optionally surface a "submitted via join form" hint if that improves review clarity

This preserves the user's requested workflow: Super Admin sees pending organisations in Organisations and reviews them there.

### Organisation Detail

The organisation detail page becomes the review surface for submitted entries.

It should present:

- organisation basics
- submitted contact details
- region
- services description / onboarding summary
- current status
- review metadata once a decision exists

Actions:

- `Approve` for `PENDING` organisations
- `Reject` for `PENDING` organisations

If rejection reason is included in scope, the reject action should collect a short admin note.

## Approval Workflow

Approval is a coordinated backend action, not a client-orchestrated sequence.

Single server-side action should:

1. Verify the organisation exists and is in `PENDING`.
2. Verify there is no conflicting existing user for the submitted contact email.
3. Update the organisation to `ACTIVE`.
4. Record `reviewedAt` and `reviewedByUserId`.
5. Clear any prior rejection note if present.
6. Create the first linked organisation user.
7. Trigger the setup/invitation email path if configured.

### Initial User Provisioning

The first created user should:

- use the submitted contact email
- derive first and last name from the contact name
- belong to the approved organisation
- default to `ORG_ADMIN`
- start in `PENDING` until password setup is completed

This fits the current auth behavior, where pending users cannot log in until setup is complete.

### Name Parsing

If the form continues to collect a single contact name field, the backend should apply a simple deterministic split:

- first token becomes `firstName`
- remaining tokens become `lastName`
- if only one token is present, store it as `firstName` and use a safe fallback for `lastName`

The exact fallback should be defined in implementation to avoid invalid empty values.

## Rejection Workflow

Rejection should also be a single backend action.

Server-side action should:

1. Verify the organisation exists and is in `PENDING`.
2. Update the organisation status to `REJECTED`.
3. Record `reviewedAt` and `reviewedByUserId`.
4. Store `rejectionReason` when provided.
5. Ensure no onboarding user is created.

Rejected records remain visible in the organisations system for audit/history rather than being deleted.

## Transition Rules

Allowed transitions for onboarding review:

- `PENDING -> ACTIVE`
- `PENDING -> REJECTED`

Disallowed transitions in this feature scope:

- `REJECTED -> ACTIVE` through the normal approve action
- approving an already active organisation
- rejecting an already reviewed organisation

If reopening rejected requests is needed later, that should be designed as an explicit follow-up workflow rather than inferred from the first review pass.

## Error Handling

### Public Submission Errors

- Return field-aware validation errors where practical.
- Prevent duplicate or conflicting submissions when the same contact email already belongs to an onboarding request or active organisation that would make review ambiguous.
- Use a generic fallback message for unexpected server failures.

### Admin Approval Errors

- If the contact email is already used by another user, approval must fail without partially activating the organisation.
- If the organisation is no longer pending, return a clear invalid-transition error.
- If invitation delivery fails after approval and user creation, that failure should be surfaced explicitly. Implementation may choose either transactional rollback or successful approval with an admin-visible warning, but this behavior must be consistent and documented.

## API Surface

Recommended additions:

- Public submit endpoint for join requests
- Admin approve endpoint on organisation
- Admin reject endpoint on organisation

Representative examples:

- `POST /public/join-network`
- `POST /admin/organisations/:id/approve`
- `POST /admin/organisations/:id/reject`

The existing organisations list/detail endpoints should expand naturally to include the new status and review metadata.

## Testing Strategy

### Backend

- submitting a valid join request creates a `PENDING` organisation
- invalid join payloads are rejected
- approve transitions `PENDING -> ACTIVE`
- approve creates the first pending org user with the submitted email
- approve fails on duplicate-email conflict without partial completion
- reject transitions `PENDING -> REJECTED`
- rejected organisations do not create users
- invalid review transitions are rejected

### Frontend

- public join form submits to the backend and shows success on completion
- public form shows inline validation and server-mapped errors
- organisations list can expose and filter pending/rejected items
- organisation detail shows review actions only for pending organisations
- approve and reject actions update admin state correctly

### End-to-End

One e2e path should cover:

1. submit join request
2. locate pending organisation in admin
3. approve organisation
4. verify initial user exists in pending state and is tied to the approved organisation

## Risks and Mitigations

### Risk: Duplicate identity data causes approval conflicts

Mitigation: enforce email conflict checks before state changes and keep approval transactional.

### Risk: Public submissions pollute the organisations list without enough review context

Mitigation: add explicit status filtering and submission/review metadata in admin list/detail views.

### Risk: Rejection is confused with operational suspension

Mitigation: model `REJECTED` as a distinct status and reserve `SUSPENDED` for already-onboarded organisations.

### Risk: Email delivery may lag behind approval

Mitigation: keep user creation and email triggering in one approval use case with clear failure handling and admin feedback.

## Implementation Boundary

This scope is appropriate for a single implementation plan. It covers one coherent feature slice across public submission, organisation review state, admin review UI, and approval-time user provisioning without expanding into a separate onboarding subsystem.
