import { describe, expect, it } from 'vitest';
import { serviceOrgName } from '@/lib/services/org-name';

describe('serviceOrgName', () => {
  it('returns the network organisation name when present', () => {
    expect(
      serviceOrgName({ organisation: { id: 'o1', name: 'Org A' }, externalOrganisationName: null }),
    ).toBe('Org A');
  });

  it('falls back to the external organisation name', () => {
    expect(
      serviceOrgName({ organisation: null, externalOrganisationName: 'Helping Hands' }),
    ).toBe('Helping Hands');
  });

  it('returns an empty string when neither is present', () => {
    expect(serviceOrgName({ organisation: null, externalOrganisationName: null })).toBe('');
  });
});
