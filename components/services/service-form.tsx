'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/shared/rich-text-editor';
import { usePublicRegions, usePublicTargetGroups, usePublicTopics } from '@/lib/api/services';
import type { ServiceMutationInput } from '@/lib/api/services';
import { getErrorMessage, toPlainText } from '@/lib/validation';

type ServiceFormState = {
  title: string;
  titleHy: string;
  shortDescription: string;
  shortDescriptionHy: string;
  description: string;
  descriptionHy: string;
  organisationId: string;
  status: 'DRAFT' | 'PUBLISHED';
  isAvailable: boolean;
  regionId: string;
  topicIds: string[];
  targetGroupIds: string[];
  availabilityStart: string;
  availabilityEnd: string;
};

type FieldErrorKey =
  | 'title'
  | 'shortDescription'
  | 'description'
  | 'organisationId'
  | 'availabilityStart'
  | 'availabilityEnd';

type ServiceFormProps = {
  showOrganisationField: boolean;
  organisationOptions?: Array<{ id: string; name: string }>;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (payload: ServiceMutationInput) => Promise<void>;
};

const EMPTY_FORM: ServiceFormState = {
  title: '',
  titleHy: '',
  shortDescription: '',
  shortDescriptionHy: '',
  description: '',
  descriptionHy: '',
  organisationId: '',
  status: 'DRAFT',
  isAvailable: true,
  regionId: '',
  topicIds: [],
  targetGroupIds: [],
  availabilityStart: '',
  availabilityEnd: '',
};

export function ServiceForm({
  showOrganisationField,
  organisationOptions = [],
  isSubmitting,
  submitLabel,
  onCancel,
  onSubmit,
}: ServiceFormProps) {
  const [form, setForm] = useState<ServiceFormState>(EMPTY_FORM);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'hy'>('en');
  const [errors, setErrors] = useState<Partial<Record<FieldErrorKey, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: topics } = usePublicTopics();
  const { data: regions } = usePublicRegions();
  const { data: targetGroups } = usePublicTargetGroups();

  const topicOptions = useMemo(
    () =>
      (topics ?? []).flatMap((topic) => [
        { id: topic.id, name: topic.name },
        ...((topic.children ?? []).map((child) => ({
          id: child.id,
          name: `${topic.name} / ${child.name}`,
        })) || []),
      ]),
    [topics],
  );

  const selectClasses =
    'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none';

  const updateField = <K extends keyof ServiceFormState>(field: K, value: ServiceFormState[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setSubmitError(null);
    if (field in errors) {
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    }
  };

  function validate(values: ServiceFormState) {
    const nextErrors: Partial<Record<FieldErrorKey, string>> = {};
    if (!values.title.trim()) nextErrors.title = 'Title is required.';
    if (!toPlainText(values.shortDescription)) nextErrors.shortDescription = 'Short description is required.';
    if (!toPlainText(values.description)) nextErrors.description = 'Description is required.';
    if (showOrganisationField && !values.organisationId) {
      nextErrors.organisationId = 'Organisation is required.';
    }
    if (values.availabilityStart && values.availabilityEnd && values.availabilityEnd < values.availabilityStart) {
      nextErrors.availabilityEnd = 'End date cannot be before start date.';
    }
    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await onSubmit({
        title: form.title,
        titleHy: form.titleHy.trim() ? form.titleHy : undefined,
        shortDescription: form.shortDescription,
        shortDescriptionHy: toPlainText(form.shortDescriptionHy) ? form.shortDescriptionHy : undefined,
        description: form.description,
        descriptionHy: toPlainText(form.descriptionHy) ? form.descriptionHy : undefined,
        organisationId: showOrganisationField ? form.organisationId : undefined,
        status: form.status,
        isAvailable: form.isAvailable,
        regionId: form.regionId || undefined,
        targetGroupIds: form.targetGroupIds,
        topicIds: form.topicIds,
        availabilityStart: form.availabilityStart || undefined,
        availabilityEnd: form.availabilityEnd || undefined,
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Unable to save service. Please try again.'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {submitError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
      ) : null}
      <div className="space-y-10 rounded-xl bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06),0px_0px_0px_0px_#ececee]">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">Language</label>
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setActiveLanguage('en')}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                activeLanguage === 'en' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6b7280]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveLanguage('hy')}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                activeLanguage === 'hy' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6b7280]'
              }`}
            >
              Armenian
            </button>
          </div>
        </div>

        {showOrganisationField ? (
          <div className="max-w-[492px]">
            <label className="mb-2 block text-sm font-medium text-[#111827]">Organisation</label>
            <select
              value={form.organisationId}
              onChange={(event) => updateField('organisationId', event.target.value)}
              className={selectClasses}
            >
              <option value="">Select organisation...</option>
              {organisationOptions.map((organisation) => (
                <option key={organisation.id} value={organisation.id}>
                  {organisation.name}
                </option>
              ))}
            </select>
            {errors.organisationId ? <p className="mt-1 text-xs text-red-600">{errors.organisationId}</p> : null}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">Status</label>
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value as 'DRAFT' | 'PUBLISHED')}
              className={selectClasses}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-[#111827]">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(event) => updateField('isAvailable', event.target.checked)}
              />
              Service currently available
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Input
            label={activeLanguage === 'en' ? 'Title (English)' : 'Title (Armenian)'}
            value={activeLanguage === 'en' ? form.title : form.titleHy}
            onChange={(event) =>
              updateField(activeLanguage === 'en' ? 'title' : 'titleHy', event.target.value)
            }
            required={activeLanguage === 'en'}
            error={activeLanguage === 'en' ? errors.title : undefined}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">Location</label>
            <select
              value={form.regionId}
              onChange={(event) => updateField('regionId', event.target.value)}
              className={selectClasses}
            >
              <option value="">Where it is available</option>
              {regions?.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">Topics</label>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-200 p-3">
              <div className="flex flex-col gap-2">
                {topicOptions.map((topic) => (
                  <label key={topic.id} className="flex items-center gap-2 text-sm text-[#374151]">
                    <input
                      type="checkbox"
                      checked={form.topicIds.includes(topic.id)}
                      onChange={(event) =>
                        updateField(
                          'topicIds',
                          event.target.checked
                            ? [...form.topicIds, topic.id]
                            : form.topicIds.filter((id) => id !== topic.id),
                        )
                      }
                    />
                    {topic.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">Target groups</label>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-200 p-3">
              <div className="flex flex-col gap-2">
                {(targetGroups ?? []).map((targetGroup) => (
                  <label key={targetGroup.id} className="flex items-center gap-2 text-sm text-[#374151]">
                    <input
                      type="checkbox"
                      checked={form.targetGroupIds.includes(targetGroup.id)}
                      onChange={(event) =>
                        updateField(
                          'targetGroupIds',
                          event.target.checked
                            ? [...form.targetGroupIds, targetGroup.id]
                            : form.targetGroupIds.filter((id) => id !== targetGroup.id),
                        )
                      }
                    />
                    {targetGroup.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
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

        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">
            Short description ({activeLanguage === 'en' ? 'English' : 'Armenian'})
          </label>
          <RichTextEditor
            content={activeLanguage === 'en' ? form.shortDescription : form.shortDescriptionHy}
            onChange={(html) =>
              updateField(activeLanguage === 'en' ? 'shortDescription' : 'shortDescriptionHy', html)
            }
          />
          {activeLanguage === 'en' && errors.shortDescription ? (
            <p className="mt-1 text-xs text-red-600">{errors.shortDescription}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">
            Description ({activeLanguage === 'en' ? 'English' : 'Armenian'})
          </label>
          <RichTextEditor
            content={activeLanguage === 'en' ? form.description : form.descriptionHy}
            onChange={(html) => updateField(activeLanguage === 'en' ? 'description' : 'descriptionHy', html)}
          />
          {activeLanguage === 'en' && errors.description ? (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
