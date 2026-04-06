'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ServiceForm } from '@/components/services/service-form';
import { useCreateOrgService } from '@/lib/api/services';

export default function NewOrgServicePage() {
  const router = useRouter();
  const create = useCreateOrgService();
  async function handleSubmit(payload: Parameters<typeof create.mutateAsync>[0]) {
    await create.mutateAsync(payload);
    router.push('/org/services');
  }

  return (
    <div>
      <div className="mb-2 text-sm text-[#6b7280]">
        <Link href="/org/services" className="hover:underline">Services</Link>{' > '}Add new service
      </div>
      <h1 className="text-2xl font-bold">Add new service</h1>

      <ServiceForm
        showOrganisationField={false}
        isSubmitting={create.isPending}
        submitLabel="Create service"
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
