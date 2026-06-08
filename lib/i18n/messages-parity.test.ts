import { describe, expect, it } from 'vitest';
import en from '@/messages/en.json';
import hy from '@/messages/hy.json';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' && !Array.isArray(value)
      ? collectKeys(value as Record<string, unknown>, path)
      : [path];
  });
}

describe('message catalogue parity', () => {
  const enKeys = collectKeys(en as Record<string, unknown>).sort();
  const hyKeys = collectKeys(hy as Record<string, unknown>).sort();

  it('every en key exists in hy', () => {
    expect(enKeys.filter((k) => !hyKeys.includes(k))).toEqual([]);
  });

  it('every hy key exists in en', () => {
    expect(hyKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
  });
});
