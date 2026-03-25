import { useTranslations } from 'next-intl';

export default function JoinTheNetworkPage() {
  const t = useTranslations('joinNetwork');

  const benefits = [
    { title: t('benefit1Title'), text: t('benefit1Text') },
    { title: t('benefit2Title'), text: t('benefit2Text') },
    { title: t('benefit3Title'), text: t('benefit3Text') },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-4 text-lg text-gray-600">{t('subtitle')}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {benefits.map((b, i) => (
          <div key={i} className="rounded-lg border bg-white p-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
              {i + 1}
            </div>
            <h3 className="mt-3 font-semibold">{b.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{b.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-orange-50 p-8 text-center">
        <h2 className="text-xl font-bold">{t('ctaTitle')}</h2>
        <p className="mt-3 text-gray-600">{t('ctaText')}</p>
        <a href={`mailto:${t('contactEmail')}`} className="mt-4 inline-block text-lg font-medium text-orange-600 hover:underline">
          {t('contactEmail')}
        </a>
      </div>
    </div>
  );
}
