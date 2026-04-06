# Taxonomy Route Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace taxonomy modal CRUD with route-based admin pages for service topics, need tags, and target groups, including nested subtopic management and quick subtopic status changes on topic detail pages.

**Architecture:** Extend the backend taxonomy contract just enough to support detail views and nested topic editing, then refactor the frontend taxonomy area into shared route-driven list/detail/form building blocks. Service topics get the richest flow because they are hierarchical; need tags and target groups reuse the same page grammar with flatter forms and detail panels.

**Tech Stack:** Next.js 16 App Router, React 19, TanStack Query, TanStack Table, Vitest, NestJS 11, Prisma, Jest

---

## File Structure

### Backend

- Modify: `armenia-service-map-backend/src/api/taxonomy/taxonomy.controller.ts`
  Add detail endpoints and keep admin taxonomy routes grouped consistently.
- Modify: `armenia-service-map-backend/src/api/taxonomy/dto/create-topic.dto.ts`
  Expand topic create input to accept nested subtopics.
- Modify: `armenia-service-map-backend/src/api/taxonomy/dto/update-topic.dto.ts`
  Expand topic update input to accept nested subtopic edits, removals, and ordering.
- Create: `armenia-service-map-backend/src/api/taxonomy/dto/topic-subtopic.dto.ts`
  Shared DTO shapes for nested subtopic payloads.
- Modify: `armenia-service-map-backend/src/modules/taxonomy/taxonomy.service.ts`
  Add detail queries and nested create/update logic for topics; add direct find-one methods for need tags and target groups.
- Modify: `armenia-service-map-backend/src/modules/taxonomy/taxonomy.service.spec.ts`
  Cover nested topic writes and detail reads.

### Frontend API and types

- Modify: `armenia-service-map-frontend/types/api.ts`
  Add admin taxonomy detail/form types for hierarchical topics and route-based detail entities.
- Modify: `armenia-service-map-frontend/lib/api/taxonomy.ts`
  Add detail hooks and route-oriented mutations for topics, need tags, and target groups.

### Frontend route pages and shared UI

- Modify: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/page.tsx`
  Remove modal CRUD and convert list actions to route navigation.
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/topics/new/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/topics/[id]/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/topics/[id]/edit/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/need-tags/new/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/need-tags/[id]/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/need-tags/[id]/edit/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/target-groups/new/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/target-groups/[id]/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/target-groups/[id]/edit/page.tsx`
- Create: `armenia-service-map-frontend/components/admin/taxonomy/taxonomy-tabs.tsx`
  Reusable tab bar with active-section routing support.
- Create: `armenia-service-map-frontend/components/admin/taxonomy/topic-form.tsx`
  Shared parent-topic plus subtopic repeater form.
- Create: `armenia-service-map-frontend/components/admin/taxonomy/taxonomy-entity-form.tsx`
  Shared flat form for need tags and target groups.
- Create: `armenia-service-map-frontend/components/admin/taxonomy/topic-subtopics-table.tsx`
  Shared subtopic table with inline status toggles.
- Create: `armenia-service-map-frontend/components/admin/taxonomy/taxonomy-page-header.tsx`
  Shared breadcrumb/title/action header for taxonomy detail and edit pages.

### Frontend tests

- Create: `armenia-service-map-frontend/components/admin/taxonomy/topic-form.test.tsx`
- Create: `armenia-service-map-frontend/components/admin/taxonomy/topic-subtopics-table.test.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/taxonomy-page.test.tsx`

---

### Task 1: Extend The Backend Taxonomy Contract

**Files:**
- Create: `armenia-service-map-backend/src/api/taxonomy/dto/topic-subtopic.dto.ts`
- Modify: `armenia-service-map-backend/src/api/taxonomy/dto/create-topic.dto.ts`
- Modify: `armenia-service-map-backend/src/api/taxonomy/dto/update-topic.dto.ts`
- Modify: `armenia-service-map-backend/src/api/taxonomy/taxonomy.controller.ts`
- Modify: `armenia-service-map-backend/src/modules/taxonomy/taxonomy.service.ts`
- Test: `armenia-service-map-backend/src/modules/taxonomy/taxonomy.service.spec.ts`

- [ ] **Step 1: Write the failing backend tests for nested topic updates and detail reads**

```ts
import { TaxonomyService } from './taxonomy.service';
import { DomainExceptionService } from '../../infrastructure/exceptions/domain-exception.service';

describe('TaxonomyService', () => {
  it('returns one topic with child rows and usage metadata', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'parent-1',
      name: 'Psychological help',
      status: 'ACTIVE',
      children: [{ id: 'child-1', name: 'Counselling', status: 'ACTIVE', _count: { services: 2 } }],
      _count: { services: 5 },
    });
    const prisma = { topic: { findUnique } };
    const service = new TaxonomyService(prisma as never, new DomainExceptionService());

    const topic = await service.findOneTopic('parent-1');

    expect(topic.children[0].name).toBe('Counselling');
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'parent-1' },
    }));
  });

  it('updates a parent topic and synchronizes nested subtopics in one request', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'parent-1', slug: 'psychological-help' });
    const findFirst = jest.fn().mockResolvedValue(null);
    const update = jest.fn().mockResolvedValue({ id: 'parent-1' });
    const prisma = {
      topic: { findUnique, findFirst, update },
      $transaction: jest.fn(async (work) => work(prisma)),
    };
    const service = new TaxonomyService(prisma as never, new DomainExceptionService());

    await service.updateTopic('parent-1', {
      name: 'Psychological help',
      slug: 'psychological-help',
      subtopics: [
        { id: 'child-1', name: 'Counselling', status: 'ACTIVE', sortOrder: 0 },
        { name: 'Support groups', status: 'INACTIVE', sortOrder: 1 },
      ],
      removedSubtopicIds: ['child-9'],
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(update).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the backend taxonomy spec to verify it fails**

Run: `npm test -- --runInBand src/modules/taxonomy/taxonomy.service.spec.ts`  
Workdir: `armenia-service-map-backend`  
Expected: FAIL because nested `subtopics` payload support and richer detail query behavior do not exist yet.

- [ ] **Step 3: Add nested DTO shapes and controller routes**

```ts
// src/api/taxonomy/dto/topic-subtopic.dto.ts
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum.js';

export class TopicSubtopicDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  name: string;

  @IsEnum(EntityStatus)
  status: EntityStatus;

  @IsInt()
  @Min(0)
  sortOrder: number;
}
```

```ts
// src/api/taxonomy/dto/update-topic.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsEnum, ValidateNested, IsUUID } from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum.js';
import { TopicSubtopicDto } from './topic-subtopic.dto.js';

export class UpdateTopicDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicSubtopicDto)
  subtopics?: TopicSubtopicDto[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  removedSubtopicIds?: string[];
}
```

```ts
// src/api/taxonomy/taxonomy.controller.ts
@Get('taxonomy/topics/:id')
async getTaxonomyTopic(@Param('id') id: string) {
  return this.getOneTopic.execute(id);
}

@Get('taxonomy/need-tags/:id')
async getTaxonomyNeedTag(@Param('id') id: string) {
  return this.getOneNeedTag.execute(id);
}

@Get('taxonomy/target-groups/:id')
async getTaxonomyTargetGroup(@Param('id') id: string) {
  return this.getOneTargetGroup.execute(id);
}
```

- [ ] **Step 4: Implement nested topic synchronization in the taxonomy service**

```ts
// src/modules/taxonomy/taxonomy.service.ts
async updateTopic(
  id: string,
  data: {
    name?: string;
    slug?: string;
    status?: EntityStatus;
    subtopics?: Array<{ id?: string; name: string; status: EntityStatus; sortOrder: number }>;
    removedSubtopicIds?: string[];
  },
) {
  await this.findOneTopic(id);

  return this.prisma.$transaction(async (tx) => {
    const topic = await tx.topic.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        status: data.status,
      },
    });

    if (data.removedSubtopicIds?.length) {
      await tx.topic.deleteMany({
        where: {
          id: { in: data.removedSubtopicIds },
          parentId: id,
        },
      });
    }

    for (const subtopic of data.subtopics ?? []) {
      if (subtopic.id) {
        await tx.topic.update({
          where: { id: subtopic.id },
          data: {
            name: subtopic.name,
            status: subtopic.status,
            sortOrder: subtopic.sortOrder,
          },
        });
      } else {
        await tx.topic.create({
          data: {
            name: subtopic.name,
            slug: subtopic.name.toLowerCase().trim().replace(/\s+/g, '-'),
            status: subtopic.status,
            sortOrder: subtopic.sortOrder,
            parentId: id,
          },
        });
      }
    }

    return topic;
  });
}
```

- [ ] **Step 5: Run the backend taxonomy spec to verify it passes**

Run: `npm test -- --runInBand src/modules/taxonomy/taxonomy.service.spec.ts`  
Workdir: `armenia-service-map-backend`  
Expected: PASS with the nested topic tests green.

- [ ] **Step 6: Commit**

```bash
git -C armenia-service-map-backend add \
  src/api/taxonomy/dto/topic-subtopic.dto.ts \
  src/api/taxonomy/dto/create-topic.dto.ts \
  src/api/taxonomy/dto/update-topic.dto.ts \
  src/api/taxonomy/taxonomy.controller.ts \
  src/modules/taxonomy/taxonomy.service.ts \
  src/modules/taxonomy/taxonomy.service.spec.ts
git -C armenia-service-map-backend commit -m "feat: expand taxonomy admin topic contract"
```

### Task 2: Add Frontend Taxonomy Types And Query Hooks

**Files:**
- Modify: `armenia-service-map-frontend/types/api.ts`
- Modify: `armenia-service-map-frontend/lib/api/taxonomy.ts`
- Test: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/taxonomy-page.test.tsx`

- [ ] **Step 1: Write the failing frontend API test for topic detail normalization**

```tsx
import { describe, expect, it } from 'vitest';
import type { TopicDetail } from '@/types/api';

describe('taxonomy api types', () => {
  it('supports hierarchical topic detail payloads', () => {
    const payload: TopicDetail = {
      id: 'parent-1',
      name: 'Psychological help',
      slug: 'psychological-help',
      status: 'ACTIVE',
      _count: { services: 5 },
      children: [
        {
          id: 'child-1',
          name: 'Counselling',
          slug: 'counselling',
          status: 'ACTIVE',
          sortOrder: 0,
          _count: { services: 2 },
          updatedAt: '2026-04-06T00:00:00.000Z',
        },
      ],
      updatedAt: '2026-04-06T00:00:00.000Z',
      createdAt: '2026-04-06T00:00:00.000Z',
    };

    expect(payload.children[0].status).toBe('ACTIVE');
  });
});
```

- [ ] **Step 2: Run the frontend test to verify it fails**

Run: `npm test -- app/'(admin)'/admin/taxonomy/taxonomy-page.test.tsx`  
Workdir: `armenia-service-map-frontend`  
Expected: FAIL because `TopicDetail` and route-oriented taxonomy hooks are not defined.

- [ ] **Step 3: Expand the taxonomy API types**

```ts
// types/api.ts
export interface TopicChildDetail {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  createdAt?: string;
  updatedAt: string;
  _count: { services: number };
}

export interface TopicDetail extends Topic {
  children: TopicChildDetail[];
}

export interface TopicFormPayload {
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE';
  subtopics: Array<{
    id?: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    sortOrder: number;
  }>;
  removedSubtopicIds?: string[];
}
```

- [ ] **Step 4: Add detail and route-oriented mutations to the taxonomy API client**

```ts
// lib/api/taxonomy.ts
export function useTopic(id: string) {
  return useQuery({
    queryKey: ['admin', 'taxonomy', 'topics', id],
    queryFn: () => apiClient<TopicDetail>(`/admin/taxonomy/topics/${id}`),
    enabled: Boolean(id),
  });
}

export function useUpdateTopicStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      apiClient(`/admin/taxonomy/topics/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'taxonomy', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'taxonomy', 'topics', variables.id] });
    },
  });
}

export function useNeedTag(id: string) {
  return useQuery({
    queryKey: ['admin', 'taxonomy', 'need-tags', id],
    queryFn: () => apiClient<NeedTag>(`/admin/taxonomy/need-tags/${id}`),
    enabled: Boolean(id),
  });
}
```

- [ ] **Step 5: Run the frontend test to verify it passes**

Run: `npm test -- app/'(admin)'/admin/taxonomy/taxonomy-page.test.tsx`  
Workdir: `armenia-service-map-frontend`  
Expected: PASS with the new types and hooks available.

- [ ] **Step 6: Commit**

```bash
git -C armenia-service-map-frontend add \
  types/api.ts \
  lib/api/taxonomy.ts \
  app/'(admin)'/admin/taxonomy/taxonomy-page.test.tsx
git -C armenia-service-map-frontend commit -m "feat: add taxonomy detail hooks and types"
```

### Task 3: Refactor The Taxonomy Hub List Experience

**Files:**
- Modify: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/page.tsx`
- Create: `armenia-service-map-frontend/components/admin/taxonomy/taxonomy-tabs.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/taxonomy-page.test.tsx`

- [ ] **Step 1: Write the failing list-page test for route-based actions**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaxonomyPage from './page';

describe('TaxonomyPage', () => {
  it('shows route-oriented view actions instead of topic edit modals', () => {
    render(<TaxonomyPage />);

    expect(screen.getByRole('button', { name: 'Add topic' })).toBeVisible();
    expect(screen.queryByText('Edit topic')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the list-page test to verify it fails**

Run: `npm test -- app/'(admin)'/admin/taxonomy/taxonomy-page.test.tsx`  
Workdir: `armenia-service-map-frontend`  
Expected: FAIL because the page still renders modal editing flows.

- [ ] **Step 3: Replace modal taxonomy list actions with route navigation**

```tsx
// app/(admin)/admin/taxonomy/page.tsx
import Link from 'next/link';

const columns: ColumnDef<Topic>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Topics' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <Badge variant={getValue() === 'ACTIVE' ? 'success' : 'neutral'}>{String(getValue()).toLowerCase()}</Badge>,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Link href={`/admin/taxonomy/topics/${row.original.id}`} className="admin-link-button">
        View
      </Link>
    ),
  },
];

<Button asChild>
  <Link href="/admin/taxonomy/topics/new">Add topic</Link>
</Button>
```

- [ ] **Step 4: Add a shared taxonomy tabs component for consistent section switching**

```tsx
// components/admin/taxonomy/taxonomy-tabs.tsx
type TaxonomySection = 'topics' | 'need-tags' | 'target-groups';

export function TaxonomyTabs({ active, onChange }: { active: TaxonomySection; onChange: (next: TaxonomySection) => void }) {
  return (
    <div className="admin-toolbar mt-4 flex gap-1 p-1.5" role="tablist" aria-label="Taxonomy sections">
      {[
        ['topics', 'Service topics'],
        ['need-tags', 'Need tags'],
        ['target-groups', 'Target groups'],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={active === value}
          onClick={() => onChange(value as TaxonomySection)}
          className={active === value ? 'border-b-2 border-[#E8922D] text-[#E8922D]' : 'text-[#6b7280]'}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run the list-page test to verify it passes**

Run: `npm test -- app/'(admin)'/admin/taxonomy/taxonomy-page.test.tsx`  
Workdir: `armenia-service-map-frontend`  
Expected: PASS with route-driven list actions and no topic modal.

- [ ] **Step 6: Commit**

```bash
git -C armenia-service-map-frontend add \
  app/'(admin)'/admin/taxonomy/page.tsx \
  app/'(admin)'/admin/taxonomy/taxonomy-page.test.tsx \
  components/admin/taxonomy/taxonomy-tabs.tsx
git -C armenia-service-map-frontend commit -m "feat: convert taxonomy hub to route-based lists"
```

### Task 4: Build Service Topic Detail And Form Pages

**Files:**
- Create: `armenia-service-map-frontend/components/admin/taxonomy/taxonomy-page-header.tsx`
- Create: `armenia-service-map-frontend/components/admin/taxonomy/topic-form.tsx`
- Create: `armenia-service-map-frontend/components/admin/taxonomy/topic-subtopics-table.tsx`
- Create: `armenia-service-map-frontend/components/admin/taxonomy/topic-form.test.tsx`
- Create: `armenia-service-map-frontend/components/admin/taxonomy/topic-subtopics-table.test.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/topics/new/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/topics/[id]/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/topics/[id]/edit/page.tsx`

- [ ] **Step 1: Write the failing tests for subtopic editing and quick status toggles**

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopicForm } from './topic-form';
import { TopicSubtopicsTable } from './topic-subtopics-table';

describe('TopicForm', () => {
  it('adds a new subtopic row and validates duplicate names', async () => {
    const user = userEvent.setup();
    render(<TopicForm mode="create" onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Add another sub-topic' }));

    expect(screen.getAllByLabelText('Sub-topic name')).toHaveLength(1);
  });
});

describe('TopicSubtopicsTable', () => {
  it('fires a status toggle callback for one subtopic row', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TopicSubtopicsTable
        rows={[{ id: 'child-1', name: 'Counselling', status: 'ACTIVE', updatedAt: '2026-04-06', _count: { services: 2 } }]}
        onToggleStatus={onToggle}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Set Counselling inactive' }));
    expect(onToggle).toHaveBeenCalledWith({ id: 'child-1', status: 'INACTIVE' });
  });
});
```

- [ ] **Step 2: Run the topic component tests to verify they fail**

Run: `npm test -- components/admin/taxonomy/topic-form.test.tsx components/admin/taxonomy/topic-subtopics-table.test.tsx`  
Workdir: `armenia-service-map-frontend`  
Expected: FAIL because the shared topic form and subtopic table do not exist yet.

- [ ] **Step 3: Create the shared topic form with nested row editing**

```tsx
// components/admin/taxonomy/topic-form.tsx
export function TopicForm({
  mode,
  initialValue,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  initialValue?: TopicDetail;
  onSubmit: (payload: TopicFormPayload) => Promise<void> | void;
}) {
  const [subtopics, setSubtopics] = useState(initialValue?.children ?? []);

  function addSubtopic() {
    setSubtopics((current) => [
      ...current,
      { id: undefined, name: '', status: 'ACTIVE', sortOrder: current.length, _count: { services: 0 }, updatedAt: '' },
    ]);
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); void onSubmit(/* normalized payload */); }} className="space-y-6">
      <Input label="Service topic" defaultValue={initialValue?.name ?? ''} required />
      <section>
        <h2 className="text-base font-semibold">Sub-topics</h2>
        {subtopics.map((subtopic, index) => (
          <div key={subtopic.id ?? `new-${index}`} className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <Input aria-label="Sub-topic name" value={subtopic.name} onChange={(event) => {/* update row */}} />
            <Button type="button" variant="secondary">{subtopic.status === 'ACTIVE' ? 'Active' : 'Inactive'}</Button>
            <Button type="button" variant="ghost">Remove</Button>
          </div>
        ))}
        <button type="button" className="text-[#E8922D]" onClick={addSubtopic}>Add another sub-topic</button>
      </section>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary">Cancel</Button>
        <Button type="submit">{mode === 'create' ? 'Save changes' : 'Save changes'}</Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Build the topic detail table and route pages**

```tsx
// app/(admin)/admin/taxonomy/topics/[id]/page.tsx
export default function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: topic } = useTopic(id);
  const updateStatus = useUpdateTopicStatus();

  return (
    <div className="space-y-6">
      <TaxonomyPageHeader
        title={topic?.name ?? 'Service topic'}
        breadcrumbLabel="Nomenclature"
        action={{ href: `/admin/taxonomy/topics/${id}/edit`, label: 'Edit service topic' }}
      />
      <AdminPanel>
        <TopicSubtopicsTable
          rows={topic?.children ?? []}
          onToggleStatus={({ id: subtopicId, status }) => updateStatus.mutate({ id: subtopicId, status })}
        />
      </AdminPanel>
    </div>
  );
}
```

- [ ] **Step 5: Run the topic component tests to verify they pass**

Run: `npm test -- components/admin/taxonomy/topic-form.test.tsx components/admin/taxonomy/topic-subtopics-table.test.tsx`  
Workdir: `armenia-service-map-frontend`  
Expected: PASS with nested row editing and quick toggle behavior covered.

- [ ] **Step 6: Commit**

```bash
git -C armenia-service-map-frontend add \
  components/admin/taxonomy/taxonomy-page-header.tsx \
  components/admin/taxonomy/topic-form.tsx \
  components/admin/taxonomy/topic-subtopics-table.tsx \
  components/admin/taxonomy/topic-form.test.tsx \
  components/admin/taxonomy/topic-subtopics-table.test.tsx \
  app/'(admin)'/admin/taxonomy/topics/new/page.tsx \
  app/'(admin)'/admin/taxonomy/topics/[id]/page.tsx \
  app/'(admin)'/admin/taxonomy/topics/[id]/edit/page.tsx
git -C armenia-service-map-frontend commit -m "feat: add route-based topic detail and edit pages"
```

### Task 5: Build Need Tag And Target Group Route Pages

**Files:**
- Create: `armenia-service-map-frontend/components/admin/taxonomy/taxonomy-entity-form.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/need-tags/new/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/need-tags/[id]/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/need-tags/[id]/edit/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/target-groups/new/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/target-groups/[id]/page.tsx`
- Create: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/target-groups/[id]/edit/page.tsx`
- Modify: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/page.tsx`

- [ ] **Step 1: Write the failing route-page test for non-topic taxonomy entities**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaxonomyPage from './page';

describe('TaxonomyPage non-topic sections', () => {
  it('renders view-oriented list actions for need tags and target groups', () => {
    render(<TaxonomyPage />);
    expect(screen.getAllByText('View').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the taxonomy page test to verify it fails**

Run: `npm test -- app/'(admin)'/admin/taxonomy/taxonomy-page.test.tsx`  
Workdir: `armenia-service-map-frontend`  
Expected: FAIL because need tags and target groups still open inline modals.

- [ ] **Step 3: Add shared flat entity forms and route pages**

```tsx
// components/admin/taxonomy/taxonomy-entity-form.tsx
export function TaxonomyEntityForm({
  entityLabel,
  includeSlug = true,
  initialValue,
  onSubmit,
}: {
  entityLabel: string;
  includeSlug?: boolean;
  initialValue?: { name: string; slug?: string; status?: 'ACTIVE' | 'INACTIVE' };
  onSubmit: (payload: { name: string; slug?: string; status: 'ACTIVE' | 'INACTIVE' }) => Promise<void> | void;
}) {
  return (
    <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); void onSubmit({ name: '', slug: '', status: 'ACTIVE' }); }}>
      <Input label={entityLabel} defaultValue={initialValue?.name ?? ''} required />
      {includeSlug ? <Input label="Slug" defaultValue={initialValue?.slug ?? ''} required /> : null}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary">Cancel</Button>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Convert the need tag and target group lists to route actions**

```tsx
// app/(admin)/admin/taxonomy/page.tsx
action: (
  <Link href={`/admin/taxonomy/need-tags/${row.id}`} className="admin-link-button">
    View
  </Link>
)

action: (
  <Link href={`/admin/taxonomy/target-groups/${row.id}`} className="admin-link-button">
    View
  </Link>
)
```

- [ ] **Step 5: Run the taxonomy page test to verify it passes**

Run: `npm test -- app/'(admin)'/admin/taxonomy/taxonomy-page.test.tsx`  
Workdir: `armenia-service-map-frontend`  
Expected: PASS with route-based need tag and target group actions.

- [ ] **Step 6: Commit**

```bash
git -C armenia-service-map-frontend add \
  components/admin/taxonomy/taxonomy-entity-form.tsx \
  app/'(admin)'/admin/taxonomy/need-tags/new/page.tsx \
  app/'(admin)'/admin/taxonomy/need-tags/[id]/page.tsx \
  app/'(admin)'/admin/taxonomy/need-tags/[id]/edit/page.tsx \
  app/'(admin)'/admin/taxonomy/target-groups/new/page.tsx \
  app/'(admin)'/admin/taxonomy/target-groups/[id]/page.tsx \
  app/'(admin)'/admin/taxonomy/target-groups/[id]/edit/page.tsx \
  app/'(admin)'/admin/taxonomy/page.tsx
git -C armenia-service-map-frontend commit -m "feat: align need tags and target groups with taxonomy routes"
```

### Task 6: Verify End-To-End Taxonomy Behavior

**Files:**
- Modify: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/page.tsx`
- Modify: `armenia-service-map-frontend/components/admin/taxonomy/topic-form.tsx`
- Modify: `armenia-service-map-frontend/components/admin/taxonomy/topic-subtopics-table.tsx`
- Modify: `armenia-service-map-backend/src/modules/taxonomy/taxonomy.service.ts`
- Test: `armenia-service-map-frontend/components/admin/taxonomy/topic-form.test.tsx`
- Test: `armenia-service-map-frontend/components/admin/taxonomy/topic-subtopics-table.test.tsx`
- Test: `armenia-service-map-frontend/app/(admin)/admin/taxonomy/taxonomy-page.test.tsx`
- Test: `armenia-service-map-backend/src/modules/taxonomy/taxonomy.service.spec.ts`

- [ ] **Step 1: Run the focused frontend taxonomy test suite**

Run: `npm test -- components/admin/taxonomy/topic-form.test.tsx components/admin/taxonomy/topic-subtopics-table.test.tsx app/'(admin)'/admin/taxonomy/taxonomy-page.test.tsx`  
Workdir: `armenia-service-map-frontend`  
Expected: PASS across list, detail, and form behavior.

- [ ] **Step 2: Run the focused backend taxonomy spec**

Run: `npm test -- --runInBand src/modules/taxonomy/taxonomy.service.spec.ts`  
Workdir: `armenia-service-map-backend`  
Expected: PASS across detail reads and nested updates.

- [ ] **Step 3: Run a final frontend production check**

Run: `npm run build`  
Workdir: `armenia-service-map-frontend`  
Expected: PASS with all new taxonomy routes compiling successfully.

- [ ] **Step 4: Run a final backend production check**

Run: `npm run build`  
Workdir: `armenia-service-map-backend`  
Expected: PASS with DTOs, controller routes, and taxonomy service changes compiling cleanly.

- [ ] **Step 5: Fix any final issues discovered during verification**

```ts
// Example fixes to apply if verification exposes them:
// - add `enabled: Boolean(id)` to detail hooks
// - normalize removedSubtopicIds before submit
// - tighten Link href generation for each taxonomy route
// - handle optimistic status rollback in TopicSubtopicsTable
```

- [ ] **Step 6: Commit**

```bash
git -C armenia-service-map-frontend add \
  app/'(admin)'/admin/taxonomy/page.tsx \
  components/admin/taxonomy/topic-form.tsx \
  components/admin/taxonomy/topic-subtopics-table.tsx \
  components/admin/taxonomy/topic-form.test.tsx \
  components/admin/taxonomy/topic-subtopics-table.test.tsx \
  app/'(admin)'/admin/taxonomy/taxonomy-page.test.tsx
git -C armenia-service-map-backend add \
  src/modules/taxonomy/taxonomy.service.ts \
  src/modules/taxonomy/taxonomy.service.spec.ts
git -C armenia-service-map-frontend commit -m "test: verify taxonomy route management"
git -C armenia-service-map-backend commit -m "test: verify taxonomy route management"
```

## Self-Review

### Spec coverage

- Route-based list/detail/edit/create flows: covered by Tasks 3, 4, and 5.
- Nested topic/subtopic management: covered by Tasks 1, 2, and 4.
- Quick subtopic status changes on detail pages: covered by Tasks 2 and 4.
- Need tag and target group UX alignment: covered by Task 5.
- Responsive/list-card preservation: implicitly preserved in Task 3 and verified in Task 6; if implementation reveals missing mobile coverage, add one more frontend test before closing.

### Placeholder scan

- No `TBD`, `TODO`, or “implement later” placeholders remain.
- The only intentionally conditional step is Task 6 Step 5, which is limited to concrete classes of verification fixes rather than a vague “clean up.”

### Type consistency

- `TopicDetail`, `TopicFormPayload`, and nested `subtopics` payload names match between Tasks 1, 2, and 4.
- Routes are consistently `/admin/taxonomy/topics/...`, `/admin/taxonomy/need-tags/...`, and `/admin/taxonomy/target-groups/...`.

