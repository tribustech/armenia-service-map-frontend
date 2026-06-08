'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/shared/rich-text-editor';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { useAdminService, useUpdateService, usePublicRegions, usePublicTargetGroups, usePublicTopics } from '@/lib/api/services';
import { getErrorMessage, mapErrorMessageToField, toPlainText } from '@/lib/validation';

type ServiceFormState = {
  title: string;
  titleHy: string;
  shortDescription: string;
  shortDescriptionHy: string;
  description: string;
  descriptionHy: string;
  howToAccess: string;
  howToAccessHy: string;
  status: 'DRAFT' | 'PUBLISHED';
  regionId: string;
  isAvailable: boolean;
  targetGroupIds: string[];
  topicIds: string[];
  availabilityStart: string;
  availabilityEnd: string;
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
  status: 'DRAFT',
  regionId: '',
  isAvailable: true,
  targetGroupIds: [],
  topicIds: [],
  availabilityStart: '',
  availabilityEnd: '',
};

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations('serviceForm');
  const tServices = useTranslations('admin.services');
  const tCommon = useTranslations('admin.common');
  const { data: service, isLoading } = useAdminService(id);
  const update = useUpdateService();
  const { data: topics } = usePublicTopics();
  const { data: regions } = usePublicRegions();
  const { data: targetGroups } = usePublicTargetGroups();
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'hy'>('en');
  const languageLabel = activeLanguage === 'en' ? t('english') : t('armenian');

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
      howToAccess: service.howToAccess,
      howToAccessHy: service.howToAccessHy ?? '',
      status: service.status,
      regionId: service.regionId || '',
      isAvailable: service.isAvailable,
      targetGroupIds: service.targetGroups.map((entry) => entry.targetGroup.id),
      topicIds: service.topics.map((entry) => entry.topic.id),
      availabilityStart: service.availabilityStart?.split('T')[0] ?? '',
      availabilityEnd: service.availabilityEnd?.split('T')[0] ?? '',
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
    if (!values.title.trim()) nextErrors.title = t('validation.titleRequired');
    if (!toPlainText(values.shortDescription)) nextErrors.shortDescription = t('validation.shortDescriptionRequired');
    if (!toPlainText(values.description)) nextErrors.description = t('validation.descriptionRequired');
    if (!toPlainText(values.howToAccess)) nextErrors.howToAccess = t('validation.howToAccessRequired');
    if (
      values.availabilityStart &&
      values.availabilityEnd &&
      values.availabilityEnd < values.availabilityStart
    ) {
      nextErrors.availabilityEnd = t('validation.endBeforeStart');
    }
    return nextErrors;
  }

  const selectClasses =
    'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const normalizedTitleHy = form.titleHy.trim() ? form.titleHy : null;
      const normalizedShortDescriptionHy = toPlainText(form.shortDescriptionHy) ? form.shortDescriptionHy : null;
      const normalizedDescriptionHy = toPlainText(form.descriptionHy) ? form.descriptionHy : null;
      const normalizedHowToAccessHy = toPlainText(form.howToAccessHy) ? form.howToAccessHy : null;

      await update.mutateAsync({
        id,
        title: form.title,
        titleHy: normalizedTitleHy,
        shortDescription: form.shortDescription,
        shortDescriptionHy: normalizedShortDescriptionHy,
        description: form.description,
        descriptionHy: normalizedDescriptionHy,
        howToAccess: form.howToAccess,
        howToAccessHy: normalizedHowToAccessHy,
        status: form.status,
        regionId: form.regionId || undefined,
        isAvailable: form.isAvailable,
        targetGroupIds: form.targetGroupIds,
        topicIds: form.topicIds,
        availabilityStart: form.availabilityStart || undefined,
        availabilityEnd: form.availabilityEnd || undefined,
      });
      router.push(`/admin/services/${id}`);
    } catch (error) {
      const message = getErrorMessage(error, t('updateError'));
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
    <div className="mx-auto max-w-[1220px] pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 pt-8 text-sm text-[#6b7280]">
        <Link href="/admin/services" className="font-medium hover:underline">
          {tServices('title')}
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link href={`/admin/services/${id}`} className="font-medium hover:underline">
          {service?.title}
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="font-medium">{t('editBreadcrumb')}</span>
      </div>

      <h1 className="mt-3 text-3xl font-bold text-[#111827]">{t('editTitle')}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {submitError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}
        {/* Form card */}
        <div className="space-y-10 rounded-xl bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06),0px_0px_0px_0px_#ececee]">
          {/* Title + Location */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">{t('status')}</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className={selectClasses}
              >
                <option value="DRAFT">{t('draft')}</option>
                <option value="PUBLISHED">{t('published')}</option>
              </select>
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => updateField('isAvailable', e.target.checked)} />
                {t('available')}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input
              label={t('titleField', { language: languageLabel })}
              value={activeLanguage === 'en' ? form.title : form.titleHy}
              onChange={(e) => updateField(activeLanguage === 'en' ? 'title' : 'titleHy', e.target.value)}
              error={activeLanguage === 'en' ? errors.title : undefined}
              required={activeLanguage === 'en'}
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">{t('location')}</label>
              <select
                value={form.regionId}
                onChange={(e) => updateField('regionId', e.target.value)}
                className={selectClasses}
              >
                <option value="">{t('whereAvailable')}</option>
                {regions?.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.regionId ? <p className="mt-1 text-xs text-red-600">{errors.regionId}</p> : null}
            </div>
          </div>

          {/* Topics + Target group */}
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
                        onChange={(e) =>
                          updateField(
                            'topicIds',
                            e.target.checked
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
                        onChange={(e) =>
                          updateField(
                            'targetGroupIds',
                            e.target.checked
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

          {/* Start date + End date */}
          <div className="grid grid-cols-2 gap-6">
            <Input
              label={t('startDate')}
              type="date"
              value={form.availabilityStart}
              onChange={(e) => updateField('availabilityStart', e.target.value)}
              error={errors.availabilityStart}
            />
            <Input
              label={t('endDate')}
              type="date"
              value={form.availabilityEnd}
              onChange={(e) => updateField('availabilityEnd', e.target.value)}
              error={errors.availabilityEnd}
            />
          </div>

          {/* Short description - rich text */}
          <div>
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

          {/* Description - rich text */}
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

        {/* Action buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? t('saving') : tCommon('saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
}
