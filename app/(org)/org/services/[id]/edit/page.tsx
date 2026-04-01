'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/shared/rich-text-editor';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import {
  useOrgService,
  useUpdateOrgService,
  usePublicTopics,
  usePublicRegions,
  usePublicTargetGroups,
} from '@/lib/api/services';
import { getErrorMessage, mapErrorMessageToField, toPlainText } from '@/lib/validation';

type ServiceFormState = {
  title: string;
  titleHy: string;
  shortDescription: string;
  shortDescriptionHy: string;
  description: string;
  descriptionHy: string;
  status: 'DRAFT' | 'PUBLISHED';
  regionId: string;
  isAvailable: boolean;
  availabilityStart: string;
  availabilityEnd: string;
  targetGroupIds: string[];
  topicIds: string[];
};

const EMPTY_FORM: ServiceFormState = {
  title: '',
  titleHy: '',
  shortDescription: '',
  shortDescriptionHy: '',
  description: '',
  descriptionHy: '',
  status: 'DRAFT',
  regionId: '',
  isAvailable: true,
  availabilityStart: '',
  availabilityEnd: '',
  targetGroupIds: [],
  topicIds: [],
};

export default function EditOrgServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: service, isLoading } = useOrgService(id);
  const update = useUpdateOrgService();
  const { data: topics } = usePublicTopics();
  const { data: regions } = usePublicRegions();
  const { data: targetGroups } = usePublicTargetGroups();
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'hy'>('en');
  const topicOptions = useMemo(
    () =>
      (topics ?? []).flatMap((topic) => [
        { id: topic.id, name: topic.name },
        ...((topic.children ?? []).map((child) => ({ id: child.id, name: `${topic.name} / ${child.name}` })) || []),
      ]),
    [topics],
  );

  const [draftForm, setDraftForm] = useState<ServiceFormState | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const getBaseForm = (): ServiceFormState => {
    if (!service) return EMPTY_FORM;
    return {
      title: service.title,
      titleHy: service.titleHy ?? '',
      shortDescription: service.shortDescription,
      shortDescriptionHy: service.shortDescriptionHy ?? '',
      description: service.description,
      descriptionHy: service.descriptionHy ?? '',
      status: service.status,
      regionId: service.regionId || '',
      isAvailable: service.isAvailable,
      availabilityStart: service.availabilityStart?.split('T')[0] ?? '',
      availabilityEnd: service.availabilityEnd?.split('T')[0] ?? '',
      targetGroupIds: service.targetGroups.map((entry) => entry.targetGroup.id),
      topicIds: service.topics.map((entry) => entry.topic.id),
    };
  };
  const form = draftForm ?? getBaseForm();

  const updateField = (field: keyof ServiceFormState, value: ServiceFormState[keyof ServiceFormState]) => {
    setDraftForm((previous) => ({ ...(previous ?? getBaseForm()), [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmitError(null);
  };

  function validate(values: ServiceFormState) {
    const nextErrors: Partial<Record<keyof ServiceFormState, string>> = {};
    if (!values.title.trim()) nextErrors.title = 'Title is required.';
    if (!values.shortDescription.trim()) nextErrors.shortDescription = 'Short description is required.';
    if (!toPlainText(values.description)) nextErrors.description = 'Description is required.';
    if (
      values.availabilityStart &&
      values.availabilityEnd &&
      values.availabilityEnd < values.availabilityStart
    ) {
      nextErrors.availabilityEnd = 'End date cannot be before start date.';
    }
    return nextErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await update.mutateAsync({
        id,
        title: form.title,
        titleHy: form.titleHy || undefined,
        shortDescription: form.shortDescription,
        shortDescriptionHy: form.shortDescriptionHy || undefined,
        description: form.description,
        descriptionHy: form.descriptionHy || undefined,
        status: form.status,
        regionId: form.regionId || undefined,
        isAvailable: form.isAvailable,
        targetGroupIds: form.targetGroupIds,
        topicIds: form.topicIds,
        availabilityStart: form.availabilityStart || undefined,
        availabilityEnd: form.availabilityEnd || undefined,
      });
      router.push(`/org/services/${id}`);
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to update service. Please try again.');
      const mappedField = mapErrorMessageToField<keyof ServiceFormState>(message, [
        { field: 'title', pattern: /title/i },
        { field: 'shortDescription', pattern: /short.?description/i },
        { field: 'description', pattern: /description/i },
        { field: 'regionId', pattern: /region|location/i },
        { field: 'availabilityStart', pattern: /start/i },
        { field: 'availabilityEnd', pattern: /end/i },
      ]);
      if (mappedField) {
        setErrors((previous) => ({ ...previous, [mappedField]: message }));
      } else {
        setSubmitError(message);
      }
    }
  }

  if (isLoading) return <DetailPageLoadingSkeleton />;

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        <Link href="/org/services" className="hover:underline">Services</Link>{' > '}<Link href={`/org/services/${id}`} className="hover:underline">{service?.title}</Link>{' > '}Edit
      </div>
      <h1 className="text-2xl font-bold">Edit service</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4 rounded-lg border bg-white p-6">
        {submitError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setActiveLanguage('en')}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              activeLanguage === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setActiveLanguage('hy')}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              activeLanguage === 'hy' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            Armenian
          </button>
        </div>
        <Input
          label={activeLanguage === 'en' ? 'Title (English) *' : 'Title (Armenian)'}
          value={activeLanguage === 'en' ? form.title : form.titleHy}
          onChange={(e) => updateField(activeLanguage === 'en' ? 'title' : 'titleHy', e.target.value)}
          error={activeLanguage === 'en' ? errors.title : undefined}
          required={activeLanguage === 'en'}
        />
        <Input
          label={activeLanguage === 'en' ? 'Short description (English) *' : 'Short description (Armenian)'}
          value={activeLanguage === 'en' ? form.shortDescription : form.shortDescriptionHy}
          onChange={(e) =>
            updateField(activeLanguage === 'en' ? 'shortDescription' : 'shortDescriptionHy', e.target.value)
          }
          error={activeLanguage === 'en' ? errors.shortDescription : undefined}
          required={activeLanguage === 'en'}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description ({activeLanguage === 'en' ? 'English' : 'Armenian'})
            {activeLanguage === 'en' ? ' *' : ''}
          </label>
          <RichTextEditor
            content={activeLanguage === 'en' ? form.description : form.descriptionHy}
            onChange={(html) => updateField(activeLanguage === 'en' ? 'description' : 'descriptionHy', html)}
          />
          {activeLanguage === 'en' && errors.description ? (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
          <div className="flex items-end gap-2 pb-1">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => updateField('isAvailable', e.target.checked)} />
              Available
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start date"
            type="date"
            value={form.availabilityStart}
            onChange={(event) => updateField('availabilityStart', event.target.value)}
            error={errors.availabilityStart}
          />
          <Input
            label="End date"
            type="date"
            value={form.availabilityEnd}
            onChange={(event) => updateField('availabilityEnd', event.target.value)}
            error={errors.availabilityEnd}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Region</label>
            <select value={form.regionId} onChange={(e) => updateField('regionId', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
              <option value="">All regions</option>
              {regions?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            {errors.regionId ? <p className="mt-1 text-xs text-red-600">{errors.regionId}</p> : null}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Topics</label>
          <div className="flex flex-wrap gap-2">
            {topicOptions.map((topic) => (
              <label key={topic.id} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={form.topicIds.includes(topic.id)} onChange={(e) => {
                  updateField('topicIds', e.target.checked ? [...form.topicIds, topic.id] : form.topicIds.filter((tid) => tid !== topic.id));
                }} />
                {topic.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Target groups</label>
          <div className="flex flex-wrap gap-2">
            {targetGroups?.map((t) => (
              <label key={t.id} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={form.targetGroupIds.includes(t.id)} onChange={(e) => {
                  updateField('targetGroupIds', e.target.checked ? [...form.targetGroupIds, t.id] : form.targetGroupIds.filter((id) => id !== t.id));
                }} />
                {t.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={update.isPending}>{update.isPending ? 'Saving...' : 'Save changes'}</Button>
        </div>
      </form>
    </div>
  );
}
