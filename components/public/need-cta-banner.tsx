import Link from 'next/link';

export function NeedCtaBanner({
  title = "Haven't found the right service yet?",
  subtitle = 'Share your needs with us.',
  buttonLabel = 'Report a need',
}: {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="rounded-3xl bg-gradient-to-r from-[#155dfc] to-[#4f39f6] px-8 py-14 text-center shadow-2xl md:px-12 md:py-16">
        <h2 className="text-3xl font-bold text-white md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[#dbeafe] md:text-xl">{subtitle}</p>
        <Link
          href="/report-a-need"
          className="mt-8 inline-flex items-center justify-center rounded-[14px] bg-white px-8 py-3 text-base font-semibold text-[#155dfc] shadow-lg transition-colors hover:bg-[#f8fafc]"
        >
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}
