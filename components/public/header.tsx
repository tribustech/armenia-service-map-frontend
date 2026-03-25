'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const navItems = [
  { href: '/', labelKey: 'home' },
  { href: '/services', labelKey: 'services' },
  { href: '/about', labelKey: 'about' },
  { href: '/report-a-need', labelKey: 'reportNeed' },
];

export function PublicHeader() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-orange-600">
          RefugeeSupport<span className="text-gray-800">.am</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors ${
                pathname === item.href
                  ? 'font-medium text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t px-4 py-3 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm ${
                pathname === item.href
                  ? 'font-medium text-orange-600'
                  : 'text-gray-600'
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
