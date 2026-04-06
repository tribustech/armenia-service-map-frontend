'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TaxonomyEntityFormPayload } from '@/types/api';

export function TaxonomyEntityForm({
  entityLabel,
  initialValue,
  onSubmit,
  onCancel,
}: {
  entityLabel: string;
  initialValue?: TaxonomyEntityFormPayload;
  onSubmit: (payload: TaxonomyEntityFormPayload) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initialValue?.name ?? '');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(initialValue?.status ?? 'ACTIVE');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      name: name.trim(),
      status,
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="admin-panel rounded-xl border border-[#e8e8e8] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-1">
          <Input label={entityLabel} value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="mt-4 w-full md:w-56">
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Status</label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as 'ACTIVE' | 'INACTIVE')}
            className="admin-control w-full px-4 py-3 text-sm text-[#111827]"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}
