'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hy', label: 'Հայերեն' },
] as const;

/**
 * Shared interface-language switcher. Writes the chosen locale to the `locale`
 * cookie via `/api/locale`, then refreshes so the server re-renders with the new
 * messages. Used by the admin and org shells; the public header has its own.
 */
export function LocaleSwitcher() {
  const t = useTranslations('localeSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const current = languages.find((item) => item.code === locale) ?? languages[0];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  async function switchLocale(next: string) {
    setOpen(false);
    if (next === locale) return;
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ locale: next }),
    });
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm font-medium text-[#364153] transition-colors hover:bg-[#f3f4f6]"
        aria-label={t('ariaLabel')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        {current.label}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${open ? 'rotate-180' : ''} transition-transform`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={t('ariaLabel')}
          className="absolute right-0 top-full mt-1 min-w-[132px] rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-lg"
        >
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => switchLocale(language.code)}
              role="menuitemradio"
              aria-checked={language.code === locale}
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
  );
}
