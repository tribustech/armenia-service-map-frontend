import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function JoinNetworkCta() {
  const t = useTranslations('home.joinNetwork');

  const features = [t('feature1'), t('feature2'), t('feature3')];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="rounded-3xl bg-white px-6 py-10 shadow-2xl sm:px-10 md:px-14 md:py-14">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-center md:gap-10 md:text-left">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#155dfc] to-[#4f39f6] shadow-lg shadow-[#4f39f64d]">
            <BuildingIcon />
          </div>

          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#eff6ff] px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#155dfc]">
              <BuildingIcon className="h-4 w-4" stroke="#155dfc" />
              {t('badge')}
            </span>
            <h2 className="mt-5 text-3xl font-bold text-[#101828] sm:text-4xl">{t('title')}</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4a5565] sm:text-lg">{t('description')}</p>
            <ul className="mt-6 flex flex-col flex-wrap gap-x-8 gap-y-3 sm:flex-row sm:items-center">
              {features.map((feature) => (
                <li key={feature} className="flex items-center justify-center gap-2 text-base font-semibold text-[#364153] sm:justify-start">
                  <CheckCircleIcon />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/join-the-network"
            className="inline-flex shrink-0 items-center gap-2 rounded-[14px] bg-gradient-to-r from-[#155dfc] to-[#4f39f6] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            {t('register')}
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BuildingIcon({ className = 'h-11 w-11', stroke = 'white' }: { className?: string; stroke?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18" />
      <path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2" />
      <path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2" />
      <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#155dfc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ArrowRightIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
