'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NeedCtaBanner } from '@/components/public/need-cta-banner';

export default function JoinNetworkSuccessPage() {
  const t = useTranslations('joinNetworkPage');
  const tHome = useTranslations('home');
  const router = useRouter();

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
