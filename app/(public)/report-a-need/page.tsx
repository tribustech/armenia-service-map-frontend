'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSubmitNeed } from '@/lib/api/needs';
import { usePublicRegions } from '@/lib/api/services';

export default function ReportANeedPage() {
  const router = useRouter();
  const submit = useSubmitNeed();
  const { data: regions } = usePublicRegions();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    contactMethod: 'email',
    contactValue: '',
    description: '',
    regionId: '',
  });

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

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
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Thank you</h1>
        <p className="mt-4 text-gray-600">Your need has been submitted. We will review it and connect you with available support services.</p>
        <Button className="mt-6" onClick={() => router.push('/')}>Return home</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">Report a need</h1>
      <p className="mt-2 text-gray-600">Tell us what you need. Your information will be reviewed and you will be connected with the right support services.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border bg-white p-6">
        <Input label="Full name *" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} required />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Preferred contact method *</label>
            <select value={form.contactMethod} onChange={(e) => updateField('contactMethod', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <Input label="Contact details *" value={form.contactValue} onChange={(e) => updateField('contactValue', e.target.value)} placeholder={form.contactMethod === 'email' ? 'your@email.com' : '+374...'} required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Region</label>
          <select value={form.regionId} onChange={(e) => updateField('regionId', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
            <option value="">Select your region...</option>
            {regions?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Describe your need *</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={5}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            placeholder="Please describe what kind of support you are looking for..."
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={submit.isPending}>{submit.isPending ? 'Submitting...' : 'Submit'}</Button>
        </div>
      </form>
    </div>
  );
}
