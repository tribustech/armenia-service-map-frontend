'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUnsubscribe } from '@/lib/api/subscriptions';

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeContent />
    </Suspense>
  );
}

function UnsubscribeContent() {
  const t = useTranslations('unsubscribe');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const unsubscribe = useUnsubscribe();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const work = token
      ? unsubscribe.mutateAsync(token).then(() => setStatus('success'))
      : Promise.resolve().then(() => setStatus('error'));
    work.catch(() => setStatus('error'));
  }, [token, unsubscribe]);

  return (
    <div className="bg-[#f9fafb]">
      <div className="mx-auto max-w-2xl px-8 py-24 text-center">
        {status === 'processing' ? (
          <p className="text-lg text-[#374151]">{t('processing')}</p>
        ) : status === 'success' ? (
          <>
            <h1 className="text-3xl font-extrabold text-[#101828]">{t('successTitle')}</h1>
            <p className="mt-4 text-lg text-[#374151]">{t('successBody')}</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-[#101828]">{t('errorTitle')}</h1>
            <p className="mt-4 text-lg text-[#374151]">{token ? t('errorBody') : t('missingToken')}</p>
          </>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-8 rounded-md bg-[#1e40af] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1e3a8a]"
        >
          {t('returnHome')}
        </button>
      </div>
    </div>
  );
}
