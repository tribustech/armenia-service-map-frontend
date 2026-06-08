'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { TopicDetail, TopicFormPayload } from '@/types/api';

type EditableSubtopic = {
  id?: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
};

export function TopicForm({
  initialValue,
  onSubmit,
  onCancel,
}: {
  // `mode` remains part of the caller-facing prop contract but no longer affects rendering.
  mode: 'create' | 'edit';
  initialValue?: TopicDetail;
  onSubmit: (payload: TopicFormPayload) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const t = useTranslations('admin.taxonomy');
  const tCommon = useTranslations('admin.common');
  const tStatuses = useTranslations('admin.statuses');
  const [name, setName] = useState(initialValue?.name ?? '');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(initialValue?.status ?? 'ACTIVE');
  const [subtopics, setSubtopics] = useState<EditableSubtopic[]>(
    initialValue?.children.map((child, index) => ({
      id: child.id,
      name: child.name,
      status: child.status,
      sortOrder: child.sortOrder ?? index,
    })) ?? [],
  );
  const [removedSubtopicIds, setRemovedSubtopicIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const duplicateNames = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    subtopics.forEach((subtopic) => {
      const key = subtopic.name.trim().toLowerCase();
      if (!key) return;
      if (seen.has(key)) duplicates.add(key);
      seen.add(key);
    });

    return duplicates;
  }, [subtopics]);

  function updateSubtopic(index: number, updates: Partial<EditableSubtopic>) {
    setSubtopics((current) =>
      current.map((subtopic, currentIndex) =>
        currentIndex === index
          ? { ...subtopic, ...updates }
          : subtopic,
      ),
    );
  }

  function addSubtopic() {
    setSubtopics((current) => [
      ...current,
      {
        name: '',
        status: 'ACTIVE',
        sortOrder: current.length,
      },
    ]);
  }

  function removeSubtopic(index: number) {
    setSubtopics((current) => {
      const row = current[index];
      if (row?.id) setRemovedSubtopicIds((ids) => [...ids, row.id!]);
      return current
        .filter((_, currentIndex) => currentIndex !== index)
        .map((subtopic, currentIndex) => ({ ...subtopic, sortOrder: currentIndex }));
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError(t('form.errors.topicRequired'));
      return;
    }

    if (subtopics.some((subtopic) => !subtopic.name.trim())) {
      setError(t('form.errors.subtopicNameRequired'));
      return;
    }

    if (duplicateNames.size > 0) {
      setError(t('form.errors.subtopicNamesUnique'));
      return;
    }

    setError(null);
    const payload: TopicFormPayload = {
      name: name.trim(),
      status,
      subtopics: subtopics.map((subtopic, index) => ({
        id: subtopic.id,
        name: subtopic.name.trim(),
        status: subtopic.status,
        sortOrder: index,
      })),
    };

    if (removedSubtopicIds.length > 0) {
      payload.removedSubtopicIds = removedSubtopicIds;
    }

    await onSubmit(payload);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="admin-panel rounded-xl border border-[#e8e8e8] bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <Input label={t('entities.serviceTopic')} value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#374151]">{status === 'ACTIVE' ? tStatuses('active') : tStatuses('inactive')}</span>
            <Switch
              checked={status === 'ACTIVE'}
              onCheckedChange={(checked) => setStatus(checked ? 'ACTIVE' : 'INACTIVE')}
              ariaLabel={t('form.topicStatusAria')}
            />
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-base font-semibold text-[#111827]">{t('form.subtopics')}</h2>
          <div className="mt-4 space-y-3">
            {subtopics.map((subtopic, index) => {
              const duplicate = duplicateNames.has(subtopic.name.trim().toLowerCase());

              return (
                <div key={subtopic.id ?? `new-${index}`} className="rounded-lg border border-[#f0f0f0] p-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="min-w-0 flex-1">
                      <Input
                        label={t('form.subtopicName')}
                        aria-label={t('form.subtopicName')}
                        value={subtopic.name}
                        error={duplicate ? t('form.duplicateName') : undefined}
                        onChange={(event) => updateSubtopic(index, { name: event.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-3 md:pb-3">
                      <span className="text-sm font-medium text-[#374151]">{subtopic.status === 'ACTIVE' ? tStatuses('active') : tStatuses('inactive')}</span>
                      <Switch
                        checked={subtopic.status === 'ACTIVE'}
                        onCheckedChange={(checked) => updateSubtopic(index, { status: checked ? 'ACTIVE' : 'INACTIVE' })}
                        ariaLabel={t('form.subtopicStatusAria', { index: index + 1 })}
                      />
                    </div>
                    <div className="flex items-center md:pb-2">
                      <Button type="button" variant="ghost" className="px-0 text-[#6b7280] hover:bg-transparent hover:text-[#111827]" onClick={() => removeSubtopic(index)}>
                      {t('form.remove')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button type="button" className="mt-4 text-sm font-medium text-[#E8922D]" onClick={addSubtopic}>
            {t('form.addSubtopic')}
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {tCommon('cancel')}
        </Button>
        <Button type="submit">{tCommon('saveChanges')}</Button>
      </div>
    </form>
  );
}
