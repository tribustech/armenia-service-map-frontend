'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  howToAccess: string;
  howToAccessHy: string;
  organisationId: string;
  isExternalOrganisation: boolean;
  externalOrganisationName: string;
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
  | 'howToAccess'
  | 'organisationId'
  | 'externalOrganisationName'
  | 'availabilityStart'
  | 'availabilityEnd';

type ServiceFormProps = {
  showOrganisationField: boolean;
  allowExternalOrganisation?: boolean;
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
  howToAccess: '',
  howToAccessHy: '',
  organisationId: '',
  isExternalOrganisation: false,
  externalOrganisationName: '',
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
  allowExternalOrganisation = false,
  organisationOptions = [],
  isSubmitting,
  submitLabel,
  onCancel,
  onSubmit,
}: ServiceFormProps) {
  const t = useTranslations('serviceForm');
  const [form, setForm] = useState<ServiceFormState>(EMPTY_FORM);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'hy'>('en');
  const languageLabel = activeLanguage === 'en' ? t('english') : t('armenian');
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

  const handleExternalToggle = (checked: boolean) => {
    setForm((previous) => ({
      ...previous,
      isExternalOrganisation: checked,
      organisationId: checked ? '' : previous.organisationId,
      externalOrganisationName: checked ? previous.externalOrganisationName : '',
    }));
    setSubmitError(null);
    setErrors((previous) => ({ ...previous, organisationId: undefined, externalOrganisationName: undefined }));
  };

  function validate(values: ServiceFormState) {
    const nextErrors: Partial<Record<FieldErrorKey, string>> = {};
    if (!values.title.trim()) nextErrors.title = t('validation.titleRequired');
    if (!toPlainText(values.shortDescription)) nextErrors.shortDescription = t('validation.shortDescriptionRequired');
    if (!toPlainText(values.description)) nextErrors.description = t('validation.descriptionRequired');
    if (!toPlainText(values.howToAccess)) nextErrors.howToAccess = t('validation.howToAccessRequired');
    if (showOrganisationField) {
      if (values.isExternalOrganisation) {
        if (!values.externalOrganisationName.trim()) {
          nextErrors.externalOrganisationName = t('validation.organisationNameRequired');
        }
      } else if (!values.organisationId) {
        nextErrors.organisationId = t('validation.organisationRequired');
      }
    }
    if (values.availabilityStart && values.availabilityEnd && values.availabilityEnd < values.availabilityStart) {
      nextErrors.availabilityEnd = t('validation.endBeforeStart');
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
        howToAccess: form.howToAccess,
        howToAccessHy: toPlainText(form.howToAccessHy) ? form.howToAccessHy : undefined,
        organisationId:
          showOrganisationField && !form.isExternalOrganisation ? form.organisationId : undefined,
        externalOrganisationName:
          showOrganisationField && form.isExternalOrganisation
            ? form.externalOrganisationName.trim()
            : undefined,
        status: form.status,
        isAvailable: form.isAvailable,
        regionId: form.regionId || undefined,
        targetGroupIds: form.targetGroupIds,
        topicIds: form.topicIds,
        availabilityStart: form.availabilityStart || undefined,
        availabilityEnd: form.availabilityEnd || undefined,
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error, t('saveError')));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate /* custom validate() handles all errors; suppress native browser validation */ className="mt-8 space-y-6">
      {submitError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
      ) : null}
      <div className="space-y-10 rounded-xl bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06),0px_0px_0px_0px_#ececee]">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">{t('language')}</label>
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setActiveLanguage('en')}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                activeLanguage === 'en' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6b7280]'
              }`}
            >
              {t('english')}
            </button>
            <button
              type="button"
              onClick={() => setActiveLanguage('hy')}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                activeLanguage === 'hy' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6b7280]'
              }`}
            >
              {t('armenian')}
            </button>
          </div>
        </div>

        {showOrganisationField ? (
          allowExternalOrganisation ? (
            // Two-column layout: org select + optional external-org name field
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">{t('organisation')}</label>
                <select
                  aria-label={t('organisation')}
                  value={form.organisationId}
                  onChange={(event) => updateField('organisationId', event.target.value)}
                  disabled={form.isExternalOrganisation}
                  className={`${selectClasses} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
                >
                  <option value="">{t('selectOrganisation')}</option>
                  {organisationOptions.map((organisation) => (
                    <option key={organisation.id} value={organisation.id}>
                      {organisation.name}
                    </option>
                  ))}
                </select>
                {errors.organisationId ? <p className="mt-1 text-xs text-red-600">{errors.organisationId}</p> : null}
                <label className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#111827]">
                  <input
                    type="checkbox"
                    checked={form.isExternalOrganisation}
                    onChange={(event) => handleExternalToggle(event.target.checked)}
                  />
                  {t('outsideNetwork')}
                </label>
              </div>
              {form.isExternalOrganisation ? (
                <Input
                  label={t('organisationName')}
                  value={form.externalOrganisationName}
                  onChange={(event) => updateField('externalOrganisationName', event.target.value)}
                  required
                  error={errors.externalOrganisationName}
                />
              ) : (
                <div />
              )}
            </div>
          ) : (
            // Single-column layout (original appearance for org-create / admin-create consumers)
            <div className="max-w-[492px]">
              <label className="mb-2 block text-sm font-medium text-[#111827]">{t('organisation')}</label>
              <select
                aria-label={t('organisation')}
                value={form.organisationId}
                onChange={(event) => updateField('organisationId', event.target.value)}
                className={selectClasses}
              >
                <option value="">{t('selectOrganisation')}</option>
                {organisationOptions.map((organisation) => (
                  <option key={organisation.id} value={organisation.id}>
                    {organisation.name}
                  </option>
                ))}
              </select>
              {errors.organisationId ? <p className="mt-1 text-xs text-red-600">{errors.organisationId}</p> : null}
            </div>
          )
        ) : null}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">{t('status')}</label>
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value as 'DRAFT' | 'PUBLISHED')}
              className={selectClasses}
            >
              <option value="DRAFT">{t('draft')}</option>
              <option value="PUBLISHED">{t('published')}</option>
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-[#111827]">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(event) => updateField('isAvailable', event.target.checked)}
              />
              {t('serviceCurrentlyAvailable')}
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Input
            label={t('titleField', { language: languageLabel })}
            value={activeLanguage === 'en' ? form.title : form.titleHy}
            onChange={(event) =>
              updateField(activeLanguage === 'en' ? 'title' : 'titleHy', event.target.value)
            }
            required={activeLanguage === 'en'}
            error={activeLanguage === 'en' ? errors.title : undefined}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">{t('location')}</label>
            <select
              value={form.regionId}
              onChange={(event) => updateField('regionId', event.target.value)}
              className={selectClasses}
            >
              <option value="">{t('whereAvailable')}</option>
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
            <label className="mb-2 block text-sm font-medium text-[#111827]">{t('topics')}</label>
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
            <label className="mb-2 block text-sm font-medium text-[#111827]">{t('targetGroups')}</label>
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
            label={t('startDate')}
            type="date"
            value={form.availabilityStart}
            onChange={(event) => updateField('availabilityStart', event.target.value)}
            error={errors.availabilityStart}
          />
          <Input
            label={t('endDate')}
            type="date"
            value={form.availabilityEnd}
            onChange={(event) => updateField('availabilityEnd', event.target.value)}
            error={errors.availabilityEnd}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">
            {t('shortDescriptionField', { language: languageLabel })}
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
            {t('descriptionField', { language: languageLabel })}
          </label>
          <RichTextEditor
            content={activeLanguage === 'en' ? form.description : form.descriptionHy}
            onChange={(html) => updateField(activeLanguage === 'en' ? 'description' : 'descriptionHy', html)}
          />
          {activeLanguage === 'en' && errors.description ? (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">
            {t('howToAccessField', { language: languageLabel })}
          </label>
          <RichTextEditor
            content={activeLanguage === 'en' ? form.howToAccess : form.howToAccessHy}
            onChange={(html) =>
              updateField(activeLanguage === 'en' ? 'howToAccess' : 'howToAccessHy', html)
            }
          />
          {activeLanguage === 'en' && errors.howToAccess ? (
            <p className="mt-1 text-xs text-red-600">{errors.howToAccess}</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('saving') : submitLabel}
        </Button>
      </div>
    </form>
  );
}
