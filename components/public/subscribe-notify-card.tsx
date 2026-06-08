'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSubscribeToServices } from '@/lib/api/subscriptions';
import { isValidEmail } from '@/lib/validation';
import { ApiError } from '@/lib/api/client';

export function SubscribeNotifyCard({
  regionId,
  regionName,
  topicId,
  topicName,
}: {
  regionId?: string;
  regionName?: string;
  topicId?: string;
  topicName?: string;
}) {
  const t = useTranslations('notifyCard');
  const locale = useLocale();
  const subscribe = useSubscribeToServices();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const chips = [regionName, topicName].filter(Boolean) as string[];

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      setError(t('invalidEmail'));
      return;
    }
    try {
      await subscribe.mutateAsync({
        email: email.trim(),
        locale,
        regionId: regionId || undefined,
        topicId: topicId || undefined,
      });
      setSubscribed(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('errorFallback'));
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-12">
      <div className="rounded-2xl border border-[#c7d2fe] bg-[#eef2ff] p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4f46e5] text-white">
            <BellIcon />
          </div>
          <div className="flex-1">
            {subscribed ? (
              <div>
                <div className="flex items-center gap-2">
                  <CheckIcon />
                  <h3 className="text-lg font-bold text-[#101828]">{t('successTitle')}</h3>
                </div>
                {chips.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <span key={chip} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4338ca]">
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="mt-3 max-w-2xl text-sm text-[#4a5565]">{t('successBody')}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-[#101828]">{t('title')}</h3>
                <p className="mt-1 text-sm text-[#4a5565]">{t('description')}</p>

                <div className="mt-4 rounded-xl border border-[#e0e7ff] bg-white p-4">
                  <p className="text-xs font-semibold text-[#6a7282]">{t('notifiedAboutLabel')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {chips.length > 0 ? (
                      chips.map((chip) => (
                        <span key={chip} className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#155dfc]">
                          {chip}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#155dfc]">
                        {t('anyServices')}
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder={t('emailPlaceholder')}
                      aria-label={t('emailPlaceholder')}
                      error={error || undefined}
                    />
                  </div>
                  <Button type="submit" disabled={subscribe.isPending} className="sm:mt-0">
                    {subscribe.isPending ? t('submitting') : t('submit')}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
