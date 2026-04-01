'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

const navItems = [
  { href: '/', labelKey: 'home' },
  { href: '/about', labelKey: 'about' },
  { href: '/services', labelKey: 'services' },
  { href: '/report-a-need', labelKey: 'reportNeed' },
] as const;

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hy', label: 'Հայերեն' },
] as const;

export function PublicHeader() {
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tHeader = useTranslations('header');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((item) => item.code === locale) ?? languages[0];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function isActive(href: string) {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function switchLocale(nextLocale: string) {
    setLangOpen(false);
    setMobileOpen(false);
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ locale: nextLocale }),
    });
    router.refresh();
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    router.push(`/services${params.toString() ? `?${params.toString()}` : ''}`);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
      <div className="border-b border-[#f3f4f6] bg-[#f8fafc]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-2">
          <p className="text-xs font-medium text-[#4a5565] sm:text-sm">{tHeader('partnerPrefix')}</p>
          <div className="hidden items-center gap-5 sm:flex">
            <Image src="/eu-funded.png" alt="Funded by the European Union" width={168} height={36} className="h-6 w-auto opacity-80" />
            <Image src="/partner-logo.png" alt="Democracy Development Foundation" width={154} height={32} className="h-6 w-auto opacity-80" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6a7282]">{tHeader('createdBy')}</span>
              <Image src="/commit-global.svg" alt="Commit Global" width={96} height={24} className="h-5 w-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <Image src="/logo.svg" alt="RefugeeSupport" width={152} height={40} className="h-10 w-auto" priority />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#eff6ff] text-[#155dfc]'
                    : 'text-[#364153] hover:bg-[#f3f4f6] hover:text-[#101828]'
                }`}
              >
                {tNav(item.labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tCommon('search')}
              aria-label={tHeader('searchAria')}
              className="w-48 bg-transparent text-sm text-[#364153] placeholder:text-[#6a7282] focus:outline-none"
            />
          </form>

          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((open) => !open)}
              className="flex items-center gap-1 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm font-medium text-[#364153] transition-colors hover:bg-[#f3f4f6]"
              aria-label={tHeader('languageAria')}
            >
              {currentLang.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${langOpen ? 'rotate-180' : ''} transition-transform`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {langOpen ? (
              <div className="absolute right-0 top-full mt-1 min-w-[132px] rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-lg">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => switchLocale(language.code)}
                    className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[#f3f4f6] ${
                      language.code === locale ? 'font-semibold text-[#155dfc]' : 'text-[#364153]'
                    }`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-lg border border-[#e5e7eb] p-2 text-[#364153] transition-colors hover:bg-[#f3f4f6] md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#e5e7eb] bg-white px-6 py-4 md:hidden">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2 text-base ${
                  isActive(item.href)
                    ? 'bg-[#eff6ff] font-medium text-[#155dfc]'
                    : 'text-[#364153] hover:bg-[#f3f4f6]'
                }`}
              >
                {tNav(item.labelKey)}
              </Link>
            ))}
          </nav>

          <form onSubmit={handleSearch} className="mt-3 flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tCommon('search')}
              className="flex-1 bg-transparent text-sm text-[#364153] placeholder:text-[#6a7282] focus:outline-none"
            />
          </form>

          <div className="mt-3 flex gap-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => switchLocale(language.code)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  language.code === locale
                    ? 'bg-[#155dfc] text-white'
                    : 'bg-[#f3f4f6] text-[#364153] hover:bg-[#e5e7eb]'
                }`}
              >
                {language.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a7282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
