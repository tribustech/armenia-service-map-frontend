'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { NeedCtaBanner } from '@/components/public/need-cta-banner';
import { usePublicRegions } from '@/lib/api/services';

interface FormState {
  organisationName: string;
  regionId: string;
  contactName: string;
  email: string;
  phone: string;
  servicesDescription: string;
}

const initialForm: FormState = {
  organisationName: '',
  regionId: '',
  contactName: '',
  email: '',
  phone: '',
  servicesDescription: '',
};

export default function JoinTheNetworkPage() {
  const t = useTranslations('joinNetworkPage');
  const tHome = useTranslations('home');
  const { data: regions } = usePublicRegions();

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);

  const hasRequiredFields = useMemo(() => {
    return (
      form.organisationName.trim() &&
      form.contactName.trim() &&
      form.email.trim() &&
      form.servicesDescription.trim()
    );
  }, [form]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!hasRequiredFields) {
      return;
    }
    setSubmitted(true);
    setForm(initialForm);
  }

  return (
    <div className="bg-[#f9fafb]">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold text-[#101828]">{t('title')}</h1>
        <p className="mt-4 max-w-3xl text-lg text-[#4a5565]">{t('subtitle')}</p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-8 rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-lg lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold text-[#101828]">{t('formTitle')}</h2>
            <p className="mt-2 text-sm text-[#6a7282]">{t('formSubtitle')}</p>

            {submitted ? (
              <p className="mt-6 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-sm text-[#166534]">
                {t('success')}
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label={t('organisationName')} required>
                <input
                  type="text"
                  value={form.organisationName}
                  onChange={(event) => updateField('organisationName', event.target.value)}
                  required
                  className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                />
              </Field>

              <Field label={t('regionOfActivity')}>
                <select
                  value={form.regionId}
                  onChange={(event) => updateField('regionId', event.target.value)}
                  className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                >
                  <option value="">{t('selectRegion')}</option>
                  {regions?.map((region) => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t('contactName')} required>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(event) => updateField('contactName', event.target.value)}
                    required
                    className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                  />
                </Field>

                <Field label={t('email')} required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    required
                    className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                  />
                </Field>
              </div>

              <Field label={t('phone')}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                />
              </Field>

              <Field label={t('servicesDescription')} required>
                <textarea
                  value={form.servicesDescription}
                  onChange={(event) => updateField('servicesDescription', event.target.value)}
                  rows={5}
                  required
                  className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                />
              </Field>

              <button
                type="submit"
                disabled={!hasRequiredFields}
                className="rounded-md bg-[#155dfc] px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:bg-[#1447e6] disabled:opacity-50"
              >
                {t('submit')}
              </button>
            </form>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-[#e5e7eb]">
            <Image
              src="/join-the-network.png"
              alt={t('imageAlt')}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

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
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#374151]">
        {label}{required ? ' *' : ''}
      </span>
      {children}
    </label>
  );
}
