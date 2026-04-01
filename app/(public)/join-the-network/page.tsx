'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePublicRegions } from '@/lib/api/services';
import { NeedCtaBanner } from '@/components/public/need-cta-banner';

export default function JoinTheNetworkPage() {
  const { data: regions } = usePublicRegions();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    organisationName: '',
    regionId: '',
    contactName: '',
    email: '',
    phone: '',
    servicesDescription: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="bg-[#f9fafb]">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold text-[#101828]">Join the network</h1>
        <p className="mt-4 max-w-3xl text-lg text-[#4a5565]">
          Are you an organisation providing support services to refugees in Armenia? Register to join and we will contact you to onboard your team.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-8 rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-lg lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold text-[#101828]">Register to join</h2>
            <p className="mt-2 text-sm text-[#6a7282]">
              Tell us about your organisation and support services. Our admin team will review your request and reach out.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                Request received. We will contact you at the email address provided.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#374151]">Organisation name</label>
                <input
                  type="text"
                  value={form.organisationName}
                  onChange={(event) => updateField('organisationName', event.target.value)}
                  required
                  className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#374151]">Region of activity</label>
                <select
                  value={form.regionId}
                  onChange={(event) => updateField('regionId', event.target.value)}
                  className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                >
                  <option value="">Select region...</option>
                  {regions?.map((region) => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#374151]">Contact person name</label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(event) => updateField('contactName', event.target.value)}
                    required
                    className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#374151]">Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    required
                    className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#374151]">Phone number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#374151]">Brief description of services</label>
                <textarea
                  value={form.servicesDescription}
                  onChange={(event) => updateField('servicesDescription', event.target.value)}
                  rows={5}
                  required
                  className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#155dfc] focus:outline-none focus:ring-1 focus:ring-[#155dfc]"
                />
              </div>

              <button
                type="submit"
                className="rounded-md bg-[#155dfc] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1447e6]"
              >
                Submit request
              </button>
            </form>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-[#e5e7eb]">
            <Image
              src="/join-the-network.png"
              alt="Join the network"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <NeedCtaBanner />
    </div>
  );
}
