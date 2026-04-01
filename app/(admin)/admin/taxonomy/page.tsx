'use client';

import { useState } from 'react';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/data-table';
import { Pagination } from '@/components/admin/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { TableLoadingSkeleton } from '@/components/shared/loading-skeletons';
import {
  useTopics,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
  useNeedTags,
  useCreateNeedTag,
  useUpdateNeedTag,
  useDeleteNeedTag,
  useTargetGroups,
  useCreateTargetGroup,
  useUpdateTargetGroup,
  useDeleteTargetGroup,
} from '@/lib/api/taxonomy';
import type { Topic, NeedTag, TargetGroup } from '@/types/api';

type Tab = 'topics' | 'need-tags' | 'target-groups';

export default function TaxonomyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('topics');

  return (
    <div>
      <h1 className="text-2xl font-bold">Nomenclature</h1>

      <div
        className="mt-4 flex gap-1 rounded-lg bg-gray-100 p-1"
        style={{ width: 'fit-content' }}
        role="tablist"
        aria-label="Taxonomy sections"
      >
        <button
          type="button"
          role="tab"
          id="taxonomy-tab-topics"
          aria-selected={activeTab === 'topics'}
          aria-controls="taxonomy-panel-topics"
          onClick={() => setActiveTab('topics')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'topics' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Service topics
        </button>
        <button
          type="button"
          role="tab"
          id="taxonomy-tab-need-tags"
          aria-selected={activeTab === 'need-tags'}
          aria-controls="taxonomy-panel-need-tags"
          onClick={() => setActiveTab('need-tags')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'need-tags' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Need tags
        </button>
        <button
          type="button"
          role="tab"
          id="taxonomy-tab-target-groups"
          aria-selected={activeTab === 'target-groups'}
          aria-controls="taxonomy-panel-target-groups"
          onClick={() => setActiveTab('target-groups')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'target-groups' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Target groups
        </button>
      </div>

      <div className="mt-6">
        <section
          role="tabpanel"
          id="taxonomy-panel-topics"
          aria-labelledby="taxonomy-tab-topics"
          hidden={activeTab !== 'topics'}
        >
          {activeTab === 'topics' ? <TopicsSection /> : null}
        </section>
        <section
          role="tabpanel"
          id="taxonomy-panel-need-tags"
          aria-labelledby="taxonomy-tab-need-tags"
          hidden={activeTab !== 'need-tags'}
        >
          {activeTab === 'need-tags' ? <NeedTagsSection /> : null}
        </section>
        <section
          role="tabpanel"
          id="taxonomy-panel-target-groups"
          aria-labelledby="taxonomy-tab-target-groups"
          hidden={activeTab !== 'target-groups'}
        >
          {activeTab === 'target-groups' ? <TargetGroupsSection /> : null}
        </section>
      </div>
    </div>
  );
}

function TopicsSection() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const { data, isLoading } = useTopics({ page, perPage, search, sortBy, sortOrder });
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();

  const columns: ColumnDef<Topic, unknown>[] = [
    { accessorKey: 'name', header: 'Topics', enableSorting: true },
    {
      accessorFn: (row) => row._count.services,
      id: 'usage',
      header: 'Usage',
      enableSorting: false,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last update',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(row.original)}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this topic?')) deleteTopic.mutate(row.original.id);
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  function openAdd() {
    setEditingTopic(null);
    setFormName('');
    setFormSlug('');
    setIsModalOpen(true);
  }

  function openEdit(topic: Topic) {
    setEditingTopic(topic);
    setFormName(topic.name);
    setFormSlug(topic.slug);
    setIsModalOpen(true);
  }

  function handleSubmit() {
    if (editingTopic) {
      updateTopic.mutate({ id: editingTopic.id, name: formName, slug: formSlug });
    } else {
      createTopic.mutate({ name: formName, slug: formSlug });
    }
    setIsModalOpen(false);
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Service topics</h2>
        <Button onClick={openAdd}>Add topic</Button>
      </div>

      <div className="flex justify-end p-4 pb-0">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />
      </div>

      {isLoading ? (
        <div className="p-4">
          <TableLoadingSkeleton />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={data?.data ?? []} sorting={sorting} onSortingChange={setSorting} />
          {data && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              perPage={data.meta.perPage}
              onPageChange={setPage}
              onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
            />
          )}
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTopic ? 'Edit topic' : 'Add topic'}>
        <div className="space-y-4">
          <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <Input label="Slug" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editingTopic ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function NeedTagsSection() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<NeedTag | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const { data, isLoading } = useNeedTags({ page, perPage, search, sortBy, sortOrder });
  const createNeedTag = useCreateNeedTag();
  const updateNeedTag = useUpdateNeedTag();
  const deleteNeedTag = useDeleteNeedTag();

  const columns: ColumnDef<NeedTag, unknown>[] = [
    { accessorKey: 'name', header: 'Tag', enableSorting: true },
    {
      accessorFn: (row) => row._count.needReports,
      id: 'usage',
      header: 'Usage',
      enableSorting: false,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last update',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingTag(row.original);
              setFormName(row.original.name);
              setFormSlug(row.original.slug);
              setIsModalOpen(true);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this tag?')) deleteNeedTag.mutate(row.original.id);
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  function handleSubmit() {
    if (editingTag) {
      updateNeedTag.mutate({ id: editingTag.id, name: formName, slug: formSlug });
    } else {
      createNeedTag.mutate({ name: formName, slug: formSlug });
    }
    setIsModalOpen(false);
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Need tags</h2>
        <Button onClick={() => { setEditingTag(null); setFormName(''); setFormSlug(''); setIsModalOpen(true); }}>
          Add tag
        </Button>
      </div>

      <div className="flex justify-end p-4 pb-0">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />
      </div>

      {isLoading ? (
        <div className="p-4">
          <TableLoadingSkeleton />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={data?.data ?? []} sorting={sorting} onSortingChange={setSorting} />
          {data && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              perPage={data.meta.perPage}
              onPageChange={setPage}
              onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
            />
          )}
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTag ? 'Edit tag' : 'Add tag'}>
        <div className="space-y-4">
          <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <Input label="Slug" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingTag ? 'Save changes' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TargetGroupsSection() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTargetGroup, setEditingTargetGroup] = useState<TargetGroup | null>(null);
  const [formName, setFormName] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const { data, isLoading } = useTargetGroups({ page, perPage, search, sortBy, sortOrder });
  const createTargetGroup = useCreateTargetGroup();
  const updateTargetGroup = useUpdateTargetGroup();
  const deleteTargetGroup = useDeleteTargetGroup();

  const columns: ColumnDef<TargetGroup, unknown>[] = [
    { accessorKey: 'name', header: 'Target group', enableSorting: true },
    {
      accessorFn: (row) => row._count.services,
      id: 'usage',
      header: 'Usage',
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const value = String(getValue());
        return (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            value === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {value}
          </span>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last update',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingTargetGroup(row.original);
              setFormName(row.original.name);
              setFormStatus(row.original.status);
              setIsModalOpen(true);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this target group?')) deleteTargetGroup.mutate(row.original.id);
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  function handleSubmit() {
    if (editingTargetGroup) {
      updateTargetGroup.mutate({ id: editingTargetGroup.id, name: formName, status: formStatus });
    } else {
      createTargetGroup.mutate({ name: formName, status: formStatus });
    }
    setIsModalOpen(false);
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Target groups</h2>
        <Button onClick={() => {
          setEditingTargetGroup(null);
          setFormName('');
          setFormStatus('ACTIVE');
          setIsModalOpen(true);
        }}>
          Add target group
        </Button>
      </div>

      <div className="flex justify-end p-4 pb-0">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />
      </div>

      {isLoading ? (
        <div className="p-4">
          <TableLoadingSkeleton />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={data?.data ?? []} sorting={sorting} onSortingChange={setSorting} />
          {data && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              perPage={data.meta.perPage}
              onPageChange={setPage}
              onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
            />
          )}
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTargetGroup ? 'Edit target group' : 'Add target group'}>
        <div className="space-y-4">
          <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingTargetGroup ? 'Save changes' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
