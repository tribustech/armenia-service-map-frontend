'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateOrganisation } from '@/lib/api/organisations';
import { getErrorMessage, isValidEmail, isValidPhone, mapErrorMessageToField } from '@/lib/validation';

type FormState = {
  name: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
};

type FormField = keyof FormState;

export default function NewOrganisationPage() {
  const router = useRouter();
  const t = useTranslations('admin.organisations');
  const tCommon = useTranslations('admin.common');
  const createOrg = useCreateOrganisation();
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = (field: FormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  };

  function validate(values: FormState) {
    const nextErrors: Partial<Record<FormField, string>> = {};
    if (!values.name.trim()) nextErrors.name = t('validation.nameRequired');
    if (values.contactEmail.trim() && !isValidEmail(values.contactEmail)) {
      nextErrors.contactEmail = t('validation.invalidEmail');
    }
    if (values.contactPhone.trim() && !isValidPhone(values.contactPhone)) {
      nextErrors.contactPhone = t('validation.invalidPhone');
    }
    return nextErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const data = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== ''),
    );

    try {
      await createOrg.mutateAsync(data);
      router.push('/admin/organisations');
    } catch (error) {
      const message = getErrorMessage(error, t('validation.createFailed'));
      const mappedField = mapErrorMessageToField<FormField>(message, [
        { field: 'name', pattern: /name|organisation/i },
        { field: 'contactEmail', pattern: /email/i },
        { field: 'contactPhone', pattern: /phone|telephone/i },
        { field: 'address', pattern: /address|street/i },
      ]);
      if (mappedField) {
        setErrors((prev) => ({ ...prev, [mappedField]: message }));
      } else {
        setSubmitError(message);
      }
    }
  }

  return (
    <div>
      <div className="mb-2 text-sm text-[#6b7280]">
        <Link href="/admin/organisations" className="hover:underline">{t('title')}</Link>
        {' > '}
        <span>{t('addNew')}</span>
      </div>
      <h1 className="text-2xl font-bold">{t('addNew')}</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4 rounded-lg border bg-white p-6">
        {submitError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('form.nameRequired')}
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
            aria-invalid={Boolean(errors.name)}
            required
          />
          <Input label={t('form.website')} value={form.website} onChange={(e) => updateField('website', e.target.value)} />
        </div>
        <Input
          label={t('form.address')}
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
          error={errors.address}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('form.contactEmail')}
            type="email"
            value={form.contactEmail}
            onChange={(e) => updateField('contactEmail', e.target.value)}
            error={errors.contactEmail}
            aria-invalid={Boolean(errors.contactEmail)}
          />
          <Input
            label={t('form.contactPhone')}
            value={form.contactPhone}
            onChange={(e) => updateField('contactPhone', e.target.value)}
            error={errors.contactPhone}
            aria-invalid={Boolean(errors.contactPhone)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#374151]">{t('form.description')}</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'org-description-error' : undefined}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          {errors.description ? (
            <p id="org-description-error" className="mt-1 text-xs text-red-600">{errors.description}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>{tCommon('cancel')}</Button>
          <Button type="submit" disabled={createOrg.isPending}>
            {createOrg.isPending ? t('form.saving') : tCommon('saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
}
