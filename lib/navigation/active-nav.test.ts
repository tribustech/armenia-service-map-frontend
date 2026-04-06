import { describe, expect, it } from 'vitest';
import { getBestActiveHref } from '@/lib/navigation/active-nav';

describe('getBestActiveHref', () => {
  it('prefers the most specific matching route', () => {
    const hrefs = ['/admin/needs', '/admin/needs/map'];

    expect(getBestActiveHref('/admin/needs/map', hrefs)).toBe('/admin/needs/map');
  });

  it('matches exact parent route when nested route is not active', () => {
    const hrefs = ['/admin/needs', '/admin/needs/map'];

    expect(getBestActiveHref('/admin/needs', hrefs)).toBe('/admin/needs');
  });

  it('returns null when no route matches', () => {
    const hrefs = ['/admin/needs', '/admin/needs/map'];

    expect(getBestActiveHref('/admin/services', hrefs)).toBeNull();
  });
});
