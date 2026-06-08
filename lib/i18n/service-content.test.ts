import { describe, expect, it } from 'vitest';
import { getLocalizedServiceContent } from './service-content';
import type { Service } from '@/types/api';

const base = {
  title: 'Title',
  titleHy: null,
  shortDescription: 'Short',
  shortDescriptionHy: null,
  description: 'Desc',
  descriptionHy: null,
  howToAccess: 'EN access',
  howToAccessHy: null,
} as unknown as Service;

describe('getLocalizedServiceContent howToAccess', () => {
  it('returns English howToAccess for a non-Armenian locale', () => {
    const result = getLocalizedServiceContent({ ...base }, 'en');
    expect(result.howToAccess).toBe('EN access');
  });

  it('returns Armenian howToAccess when present', () => {
    const result = getLocalizedServiceContent({ ...base, howToAccessHy: 'HY access' }, 'hy');
    expect(result.howToAccess).toBe('HY access');
  });

  it('falls back to English howToAccess when Armenian is empty', () => {
    const result = getLocalizedServiceContent({ ...base, howToAccessHy: '' }, 'hy');
    expect(result.howToAccess).toBe('EN access');
  });
});
