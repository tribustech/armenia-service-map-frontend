'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { ServiceForm } from '@/components/services/service-form';
import { useCreateService } from '@/lib/api/services';
import { useOrganisations } from '@/lib/api/organisations';

export default function NewServicePage() {
  const router = useRouter();
  const create = useCreateService();
  const { data: orgs } = useOrganisations({ perPage: 100 });
  const organisationOptions = orgs?.data ?? [];

  async function handleSubmit(payload: Parameters<typeof create.mutateAsync>[0]) {
    await create.mutateAsync({
      ...payload,
      organisationId: payload.organisationId,
    });
    router.push('/admin/services');
  }

  return (
    <div className="mx-auto max-w-[1220px] pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 pt-8 text-sm text-[#6b7280]">
        <Link href="/admin/services" className="font-medium hover:underline">
          Service directory
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="font-medium">Add new service</span>
      </div>

      <h1 className="mt-3 text-3xl font-bold text-[#111827]">Add new service</h1>

      <ServiceForm
        showOrganisationField
        organisationOptions={organisationOptions}
        isSubmitting={create.isPending}
        submitLabel="Save changes"
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
