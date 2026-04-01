'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NeedCtaBanner } from '@/components/public/need-cta-banner';
import { useSubmitNeed } from '@/lib/api/needs';
import { usePublicRegions } from '@/lib/api/services';

export default function ReportANeedPage() {
  const t = useTranslations('reportNeedPage');
  const tHome = useTranslations('home');

  const router = useRouter();
  const submit = useSubmitNeed();
  const { data: regions } = usePublicRegions();

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    contactMethod: '',
    contactValue: '',
    description: '',
    regionId: '',
  });

  const isValid = useMemo(() => {
    const hasBaseFields = Boolean(form.description.trim() && form.fullName.trim());
    const hasContact = form.contactMethod ? Boolean(form.contactValue.trim()) : true;
    return hasBaseFields && hasContact;
  }, [form]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid) {
      return;
    }

    await submit.mutateAsync({
      ...form,
      regionId: form.regionId || undefined,
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-[#f9fafb]">
        <div className="mx-auto max-w-7xl px-8 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eff6ff]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#101828]">{t('successTitle')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-[#374151]">{t('successText')}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-8 rounded-md bg-[#1e40af] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1e3a8a]"
          >
            {t('returnHome')}
          </button>
        </div>

        <NeedCtaBanner
          title={tHome('ctaTitle')}
          subtitle={tHome('ctaSubtitle')}
          buttonLabel={tHome('reportNeed')}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#f9fafb]">
      <div className="mx-auto max-w-7xl px-8 py-16">
        <div className="mb-14">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#101828]">{t('title')}</h1>
          <p className="mt-4 max-w-3xl text-xl text-[#374151]">{t('subtitle')}</p>
        </div>

        <div className="flex gap-6">
          <div className="flex flex-1 flex-col gap-9">
            <div className="rounded-lg bg-[#eff6ff] p-4">
              <p className="text-base text-[#374151]">{t('infoBox')}</p>
            </div>

            <div className="max-w-lg">
              <h2 className="text-2xl text-[#101828]">{t('formTitle')}</h2>
              <p className="mt-3 text-lg text-[#6b7280]">{t('formSubtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-7">
              <Field label={t('needDescription')} required>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  rows={8}
                  required
                  className="w-full max-w-lg resize-y rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                />
              </Field>

              <Field label={t('fullName')} required>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  required
                  className="max-w-lg rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                />
              </Field>

              <Field label={t('contactMethod')}>
                <select
                  value={form.contactMethod}
                  onChange={(event) => {
                    updateField('contactMethod', event.target.value);
                    if (!event.target.value) updateField('contactValue', '');
                  }}
                  className="max-w-lg rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                >
                  <option value="">{t('selectOption')}</option>
                  <option value="email">{t('contactEmail')}</option>
                  <option value="phone">{t('contactPhone')}</option>
                  <option value="whatsapp">{t('contactWhatsapp')}</option>
                </select>
              </Field>

              {form.contactMethod ? (
                <Field label={t('contactValue')} required>
                  <input
                    type={form.contactMethod === 'email' ? 'email' : 'text'}
                    value={form.contactValue}
                    onChange={(event) => updateField('contactValue', event.target.value)}
                    required
                    className="max-w-lg rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                  />
                </Field>
              ) : null}

              <Field label={t('location')}>
                <select
                  value={form.regionId}
                  onChange={(event) => updateField('regionId', event.target.value)}
                  className="max-w-lg rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                >
                  <option value="">{t('selectOption')}</option>
                  {regions?.map((region) => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </Field>

              <div>
                <button
                  type="submit"
                  disabled={!isValid || submit.isPending}
                  className="rounded-md bg-[#1e40af] px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:bg-[#1e3a8a] disabled:opacity-50"
                >
                  {submit.isPending ? t('sending') : t('submit')}
                </button>
              </div>
            </form>
          </div>

          <div className="hidden w-[560px] shrink-0 lg:block">
            <div className="relative h-full min-h-[780px] overflow-hidden rounded-lg">
              <Image
                src="/report-need-banner.jpg"
                alt={t('imageAlt')}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <NeedCtaBanner
        title={tHome('ctaTitle')}
        subtitle={tHome('ctaSubtitle')}
        buttonLabel={tHome('reportNeed')}
      />
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex max-w-lg flex-col gap-1">
      <span className="text-sm font-medium text-[#374151]">
        {label}{required ? ' *' : ''}
      </span>
      {children}
    </label>
  );
}
