import { describe, expect, it, vi } from 'vitest';

const getMock = vi.fn();
vi.mock('next/headers', () => ({ cookies: async () => ({ get: getMock }) }));
vi.mock('next-intl/server', () => ({
  getRequestConfig: (fn: unknown) => fn,
}));

import config from './request';

describe('i18n request config', () => {
  it('defaults to Armenian when no cookie is set', async () => {
    getMock.mockReturnValue(undefined);
    const result = await (config as unknown as () => Promise<{ locale: string }>)();
    expect(result.locale).toBe('hy');
  });

  it('respects an explicit en cookie', async () => {
    getMock.mockReturnValue({ value: 'en' });
    const result = await (config as unknown as () => Promise<{ locale: string }>)();
    expect(result.locale).toBe('en');
  });
});
