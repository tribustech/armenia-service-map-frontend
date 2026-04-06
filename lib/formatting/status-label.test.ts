import { describe, expect, it } from 'vitest';
import { formatStatusLabel } from './status-label';

describe('formatStatusLabel', () => {
  it('formats upper snake case statuses', () => {
    expect(formatStatusLabel('IN_PROGRESS')).toBe('In progress');
  });

  it('normalizes mixed casing variants to a single label', () => {
    expect(formatStatusLabel('ACTIVE')).toBe('Active');
    expect(formatStatusLabel('active')).toBe('Active');
    expect(formatStatusLabel('Active')).toBe('Active');
  });

  it('formats strings with separators into readable text', () => {
    expect(formatStatusLabel('SUSPENDED-ACCOUNT')).toBe('Suspended account');
  });
});
