'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSubmitNeed } from '@/lib/api/needs';
import { usePublicRegions } from '@/lib/api/services';
import { NeedCtaBanner } from '@/components/public/need-cta-banner';

export default function ReportANeedPage() {
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

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const isValid = form.description.trim() && form.fullName.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-black">Thank you</h1>
          <p className="mt-4 text-xl text-[#374151]">Your need has been submitted. We will review it and connect you with available support services.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-8 rounded-md bg-[#1e40af] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1e3a8a]"
          >
            Return home
          </button>
        </div>
        <NeedCtaBanner />
      </div>
    );
  }

  return (
    <div className="bg-[#f9fafb]">
      <div className="mx-auto max-w-7xl px-8 py-16">
        {/* Page header */}
        <div className="mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-black">Report a need</h1>
          <p className="mt-4 text-xl text-[#374151]">
            Tell us what your needs are and you will be contacted and provided with the available resources.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6">
          {/* Left: Form */}
          <div className="flex flex-1 flex-col gap-9">
            {/* Info well */}
            <div className="rounded-lg bg-[#eff6ff] p-4">
              <p className="text-base text-[#374151]">
                If you have already submitted a need report and have not been contacted, call +374 00 000 000 or email help@example.com.
              </p>
            </div>

            {/* Form intro */}
            <div className="max-w-lg">
              <h2 className="text-2xl text-black">Tell us what you need</h2>
              <p className="mt-3 text-lg text-[#6b7280]">
                Let us know your needs, and we will reach out to connect you with the most appropriate services available.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-9">
              {/* Textarea */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#374151]">How can we help you?</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={8}
                  required
                  className="w-full max-w-lg resize-y rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                />
              </div>

              {/* Full name */}
              <div className="flex max-w-lg flex-col gap-1">
                <label className="text-sm font-medium text-[#374151]">Full name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  required
                  className="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                />
              </div>

              {/* Contact method */}
              <div className="flex max-w-lg flex-col gap-1">
                <label className="text-sm font-medium text-[#374151]">How would you like to be contacted?</label>
                <select
                  value={form.contactMethod}
                  onChange={(e) => updateField('contactMethod', e.target.value)}
                  className="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                >
                  <option value="">Select...</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              {/* Location */}
              <div className="flex max-w-lg flex-col gap-1">
                <label className="text-sm font-medium text-[#374151]">Location</label>
                <select
                  value={form.regionId}
                  onChange={(e) => updateField('regionId', e.target.value)}
                  className="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                >
                  <option value="">Select...</option>
                  {regions?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={!isValid || submit.isPending}
                  className="rounded-md bg-[#1e40af] px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:bg-[#1e3a8a] disabled:opacity-50"
                >
                  {submit.isPending ? 'Sending...' : 'Send need report'}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Banner image */}
          <div className="hidden w-[560px] shrink-0 lg:block">
            <div className="relative h-full min-h-[780px] overflow-hidden rounded-lg">
              <Image
                src="/report-need-banner.jpg"
                alt="People helping each other"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      <NeedCtaBanner />
    </div>
  );
}
