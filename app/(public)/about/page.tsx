import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  const steps = [
    { title: t('step1Title'), text: t('step1Text') },
    { title: t('step2Title'), text: t('step2Text') },
    { title: t('step3Title'), text: t('step3Text') },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-4 text-lg text-gray-600">{t('intro')}</p>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">{t('mission')}</h2>
        <p className="mt-3 text-gray-600">{t('missionText')}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">{t('howItWorks')}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="rounded-lg border bg-white p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                {i + 1}
              </div>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 rounded-lg bg-gray-50 p-8 text-center text-gray-600">
        {t('builtBy')}
      </div>
    </div>
  );
}
