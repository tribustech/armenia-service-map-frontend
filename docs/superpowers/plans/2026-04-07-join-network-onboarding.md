# Join Network Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the public join form into a persisted onboarding flow that Super Admin can review in Organisations and approve or reject, with approval creating the first org user.

**Architecture:** Extend the existing `Organisation` lifecycle instead of introducing a separate join-request entity. Implement backend-first review transitions and user provisioning, then wire the public page and admin organisation surfaces to the new API and metadata.

**Tech Stack:** Next.js, React Query, NestJS, Prisma, PostgreSQL, Jest

---

### Task 1: Extend organisation status and review metadata

**Files:**
- Modify: `armenia-service-map-backend/prisma/schema.prisma`
- Modify: `armenia-service-map-backend/src/common/enums/organisation-status.enum.ts`
- Modify: `armenia-service-map-backend/prisma/seed.ts`

- [ ] **Step 1: Add the new organisation review fields and `REJECTED` status to Prisma**

```prisma
enum OrganisationStatus {
  ACTIVE
  PENDING
  REJECTED
  SUSPENDED
}

model Organisation {
  id                 String             @id @default(uuid())
  name               String
  ...
  status             OrganisationStatus @default(PENDING)
  submissionSource   String?            @map("submission_source")
  reviewedAt         DateTime?          @map("reviewed_at")
  reviewedByUserId   String?            @map("reviewed_by_user_id")
  rejectionReason    String?            @map("rejection_reason")
  ...
}
```

- [ ] **Step 2: Mirror the enum change in the backend TypeScript enum**

```ts
export enum OrganisationStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}
```

- [ ] **Step 3: Update seed data to tolerate the new organisation shape**

```ts
status: OrganisationStatus.ACTIVE,
submissionSource: null,
reviewedAt: null,
reviewedByUserId: null,
rejectionReason: null,
```

- [ ] **Step 4: Regenerate Prisma client and verify schema compiles**

Run: `npx prisma generate`
Expected: Prisma client generated successfully

- [ ] **Step 5: Commit**

```bash
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-backend add prisma/schema.prisma prisma/seed.ts src/common/enums/organisation-status.enum.ts
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-backend commit -m "feat: extend organisation review status model"
```

### Task 2: Add backend tests for join submission and review transitions

**Files:**
- Create: `armenia-service-map-backend/src/modules/organisations/organisations.service.spec.ts`
- Test: `armenia-service-map-backend/src/modules/organisations/organisations.service.spec.ts`

- [ ] **Step 1: Write failing tests for pending submission, approval, rejection, and duplicate-email conflicts**

```ts
it('creates a pending organisation from a join request', async () => {
  await expect(service.createJoinRequest({
    organisationName: 'Bridge to Hope',
    regionId: 'region-1',
    contactName: 'Mariam Hakobyan',
    email: 'mariam@example.com',
    phone: '+37477111222',
    servicesDescription: 'Emergency shelter and legal referrals',
  })).resolves.toMatchObject({
    name: 'Bridge to Hope',
    status: OrganisationStatus.PENDING,
    contactPersonEmail: 'mariam@example.com',
    submissionSource: 'JOIN_NETWORK',
  });
});

it('approves a pending organisation and creates the first org admin user', async () => {
  await expect(service.approveJoinRequest('org-1', 'admin-1')).resolves.toMatchObject({
    status: OrganisationStatus.ACTIVE,
  });
  expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({
      email: 'mariam@example.com',
      role: Role.ORG_ADMIN,
      status: UserStatus.PENDING,
    }),
  }));
});

it('rejects a pending organisation with review metadata', async () => {
  await expect(service.rejectJoinRequest('org-1', 'admin-1', 'Missing verification')).resolves.toMatchObject({
    status: OrganisationStatus.REJECTED,
    rejectionReason: 'Missing verification',
  });
});

it('fails approval when another user already owns the submitted email', async () => {
  await expect(service.approveJoinRequest('org-1', 'admin-1')).rejects.toThrow(/already exists/i);
});
```

- [ ] **Step 2: Run the organisations service spec and verify it fails for missing implementation**

Run: `npm test -- organisations.service.spec.ts`
Expected: FAIL with missing methods or mismatched expectations

- [ ] **Step 3: Commit**

```bash
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-backend add src/modules/organisations/organisations.service.spec.ts
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-backend commit -m "test: cover join network review lifecycle"
```

### Task 3: Implement backend join submission and review actions

**Files:**
- Modify: `armenia-service-map-backend/src/modules/organisations/organisations.service.ts`
- Modify: `armenia-service-map-backend/src/modules/organisations/organisations.module.ts`
- Modify: `armenia-service-map-backend/src/api/organisations/organisations.controller.ts`
- Create: `armenia-service-map-backend/src/api/organisations/dto/reject-organisation.dto.ts`
- Create: `armenia-service-map-backend/src/api/public/public-organisations.controller.ts`

- [ ] **Step 1: Add DTO-backed public join request and admin reject payloads**

```ts
export class RejectOrganisationDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
```

```ts
export class JoinNetworkDto {
  @IsString()
  organisationName: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsString()
  contactName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(10)
  servicesDescription: string;
}
```

- [ ] **Step 2: Add organisation service methods for join submission, approval, and rejection**

```ts
async createJoinRequest(input: JoinNetworkInput) {
  return this.prisma.organisation.create({
    data: {
      name: input.organisationName.trim(),
      description: input.servicesDescription.trim(),
      regionId: input.regionId,
      contactPersonName: input.contactName.trim(),
      contactPersonEmail: input.email.trim().toLowerCase(),
      contactPersonPhone: input.phone?.trim() || null,
      status: OrganisationStatus.PENDING,
      submissionSource: 'JOIN_NETWORK',
    },
    include: { region: true },
  });
}

async approveJoinRequest(id: string, reviewerId: string) {
  const organisation = await this.findOne(id);
  this.assertPendingJoinRequest(organisation);
  await this.assertJoinEmailAvailable(organisation.contactPersonEmail);
  const name = splitContactName(organisation.contactPersonName);
  return this.prisma.$transaction(async (tx) => {
    const updated = await tx.organisation.update({
      where: { id },
      data: {
        status: OrganisationStatus.ACTIVE,
        reviewedAt: new Date(),
        reviewedByUserId: reviewerId,
        rejectionReason: null,
      },
      include: { region: true },
    });

    const user = await tx.user.create({
      data: {
        email: organisation.contactPersonEmail!,
        firstName: name.firstName,
        lastName: name.lastName,
        phone: organisation.contactPersonPhone ?? undefined,
        role: Role.ORG_ADMIN,
        status: UserStatus.PENDING,
        organisationId: organisation.id,
        passwordHash: await bcrypt.hash(randomPassword(), 10),
      },
    });

    await this.sendSetupInvite(user, organisation.name);
    return updated;
  });
}
```

- [ ] **Step 3: Expose controller endpoints**

```ts
@Post(':id/approve')
async approve(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
  return this.approveOrganisation.execute(id, req.user.id);
}

@Post(':id/reject')
async reject(@Param('id') id: string, @Body() dto: RejectOrganisationDto, @Req() req: AuthenticatedRequest) {
  return this.rejectOrganisation.execute(id, req.user.id, dto.rejectionReason);
}
```

```ts
@Controller('public/organisations')
export class PublicOrganisationsController {
  constructor(private readonly organisations: OrganisationsService) {}

  @Post('join-network')
  async joinNetwork(@Body() dto: JoinNetworkDto) {
    return this.organisations.createJoinRequest(dto);
  }
}
```

- [ ] **Step 4: Run backend tests for the new service/controller flow**

Run: `npm test -- organisations.service.spec.ts auth.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-backend add src/modules/organisations/organisations.service.ts src/modules/organisations/organisations.module.ts src/api/organisations/organisations.controller.ts src/api/organisations/dto/reject-organisation.dto.ts src/api/public/public-organisations.controller.ts
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-backend commit -m "feat: add join network review workflow"
```

### Task 4: Extend frontend API types and mutations

**Files:**
- Modify: `armenia-service-map-frontend/types/api.ts`
- Modify: `armenia-service-map-frontend/lib/api/organisations.ts`

- [ ] **Step 1: Add `REJECTED` and review metadata to frontend organisation types**

```ts
status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
submissionSource?: string | null;
reviewedAt?: string | null;
reviewedByUserId?: string | null;
rejectionReason?: string | null;
```

- [ ] **Step 2: Add public submit and admin approve/reject mutations**

```ts
export function useJoinNetwork() {
  return useMutation({
    mutationFn: (data: JoinNetworkPayload) =>
      apiClient<Organisation>('/public/organisations/join-network', { method: 'POST', body: data }),
  });
}

export function useApproveOrganisation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient<Organisation>(`/admin/organisations/${id}/approve`, { method: 'POST' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organisations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'organisations', id] });
    },
  });
}
```

- [ ] **Step 3: Run targeted frontend typecheck/tests**

Run: `npm run build`
Expected: build succeeds without type errors from the new organisation API shape

- [ ] **Step 4: Commit**

```bash
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-frontend add types/api.ts lib/api/organisations.ts
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-frontend commit -m "feat: add join network organisation api hooks"
```

### Task 5: Wire the public join page to the backend

**Files:**
- Modify: `armenia-service-map-frontend/app/(public)/join-the-network/page.tsx`
- Test: `armenia-service-map-frontend/app/(public)/join-the-network/page.tsx`

- [ ] **Step 1: Add a failing test or page-level assertion for submit behavior**

```tsx
it('submits a valid join request and shows success', async () => {
  render(<JoinTheNetworkPage />);
  await user.type(screen.getByLabelText(/organisation/i), 'Bridge to Hope');
  await user.type(screen.getByLabelText(/^email/i), 'mariam@example.com');
  await user.type(screen.getByLabelText(/contact/i), 'Mariam Hakobyan');
  await user.type(screen.getByLabelText(/services/i), 'Emergency shelter and legal referrals');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(mockJoinNetwork).toHaveBeenCalled();
});
```

- [ ] **Step 2: Replace local-only submit behavior with the API mutation**

```tsx
const joinNetwork = useJoinNetwork();

async function handleSubmit(event: React.FormEvent) {
  event.preventDefault();
  const validationErrors = validate();
  setErrors(validationErrors);
  if (Object.keys(validationErrors).length > 0 || !hasRequiredFields) return;

  try {
    await joinNetwork.mutateAsync({
      organisationName: form.organisationName,
      regionId: form.regionId || undefined,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone || undefined,
      servicesDescription: form.servicesDescription,
    });
    setSubmitted(true);
    setForm(initialForm);
  } catch (error) {
    setErrors(mapJoinErrors(error));
  }
}
```

- [ ] **Step 3: Show pending state and server failure feedback**

```tsx
<button type="submit" disabled={!hasRequiredFields || joinNetwork.isPending}>
  {joinNetwork.isPending ? 'Submitting...' : t('submit')}
</button>
```

- [ ] **Step 4: Run the page test/build verification**

Run: `npm run build`
Expected: public page compiles and the join mutation is typed correctly

- [ ] **Step 5: Commit**

```bash
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-frontend add 'app/(public)/join-the-network/page.tsx'
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-frontend commit -m "feat: submit join network requests"
```

### Task 6: Add Super Admin review actions to organisations UI

**Files:**
- Modify: `armenia-service-map-frontend/app/(admin)/admin/organisations/page.tsx`
- Modify: `armenia-service-map-frontend/app/(admin)/admin/organisations/[id]/page.tsx`

- [ ] **Step 1: Add status mapping for `REJECTED` in list/detail UI**

```tsx
const accountBadge: Record<Organisation['status'], 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
};
```

- [ ] **Step 2: Add approve and reject actions to the organisation detail view**

```tsx
{org.status === 'PENDING' ? (
  <div className="flex gap-3">
    <Button onClick={() => approveOrg.mutate(org.id)} disabled={approveOrg.isPending}>
      {approveOrg.isPending ? 'Approving...' : 'Approve organisation'}
    </Button>
    <Button variant="secondary" onClick={() => rejectOrg.mutate({ id: org.id, rejectionReason })} disabled={rejectOrg.isPending}>
      {rejectOrg.isPending ? 'Rejecting...' : 'Reject organisation'}
    </Button>
  </div>
) : null}
```

- [ ] **Step 3: Show review metadata in the details panel**

```tsx
<div>
  <div className="text-sm font-medium text-[#6b7280]">Review status</div>
  <div className="mt-1">{statusLabel[org.status]}</div>
</div>
<div>
  <div className="text-sm font-medium text-[#6b7280]">Reviewed at</div>
  <div className="mt-1">{org.reviewedAt ? new Date(org.reviewedAt).toLocaleString() : 'Awaiting review'}</div>
</div>
```

- [ ] **Step 4: Run frontend build verification**

Run: `npm run build`
Expected: admin organisation list/detail compile successfully

- [ ] **Step 5: Commit**

```bash
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-frontend add 'app/(admin)/admin/organisations/page.tsx' 'app/(admin)/admin/organisations/[id]/page.tsx'
git -C /Users/andrewradulescu/Documents/Projects/Code4/ArmeniaServiceMap/armenia-service-map-frontend commit -m "feat: add organisation review actions"
```

### Task 7: Final verification

**Files:**
- Verify only

- [ ] **Step 1: Run backend test coverage for onboarding flow**

Run: `npm test -- organisations.service.spec.ts`
Expected: PASS

- [ ] **Step 2: Run frontend production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Smoke-check both repos for clean state**

Run: `git status --short`
Expected: only intended files changed

- [ ] **Step 4: Commit final polish if needed**

```bash
git add <intended-files>
git commit -m "chore: finalize join network onboarding"
```
