'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ServiceForm } from '@/components/services/service-form';
import { useCreateOrgService } from '@/lib/api/services';

export default function NewOrgServicePage() {
  const router = useRouter();
  const t = useTranslations('org.services');
  const create = useCreateOrgService();
  async function handleSubmit(payload: Parameters<typeof create.mutateAsync>[0]) {
    await create.mutateAsync(payload);
    router.push('/org/services');
  }

  return (
    <div>
      <div className="mb-2 text-sm text-[#6b7280]">
        <Link href="/org/services" className="hover:underline">{t('breadcrumb')}</Link>{' > '}{t('newBreadcrumb')}
      </div>
      <h1 className="text-2xl font-bold">{t('newTitle')}</h1>

      <ServiceForm
        showOrganisationField={false}
        isSubmitting={create.isPending}
        submitLabel={t('createSubmit')}
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
