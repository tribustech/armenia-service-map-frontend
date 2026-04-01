import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f9fafb] px-6 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-[#e5e7eb] bg-white p-10 text-center shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#155dfc]">404</p>
        <h1 className="mt-3 text-3xl font-bold text-[#101828]">Page not found</h1>
        <p className="mt-3 text-[#4a5565]">
          The page you requested does not exist anymore or the URL is incorrect.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-[12px] bg-[#155dfc] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1247cc]"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
