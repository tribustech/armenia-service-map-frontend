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
      <div className="rounded-3xl bg-gradient-to-r from-[#155dfc] to-[#4f39f6] px-8 py-16 text-center shadow-2xl">
        <h2 className="text-4xl font-bold text-white">{title}</h2>
        <p className="mt-4 text-xl text-[#dbeafe]">{subtitle}</p>
        <Link href="/report-a-need" className="mt-8 inline-block">
          <button className="rounded-[14px] bg-white px-8 py-4 text-base font-semibold text-[#155dfc] shadow-lg transition-colors hover:bg-gray-50">
            {buttonLabel}
          </button>
        </Link>
      </div>
    </section>
  );
}
