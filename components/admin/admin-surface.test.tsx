import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminToolbar } from '@/components/admin/admin-surface';

describe('AdminToolbar', () => {
  it('applies the shared end-aligned toolbar layout by default', () => {
    render(<AdminToolbar>Toolbar content</AdminToolbar>);

    const toolbar = screen.getByText('Toolbar content');
    expect(toolbar.className).toContain('m-4');
    expect(toolbar.className).toContain('mb-0');
    expect(toolbar.className).toContain('flex-col');
    expect(toolbar.className).toContain('sm:justify-end');
  });

  it('supports a split layout for left and right toolbar content', () => {
    render(<AdminToolbar layout="between">Toolbar content</AdminToolbar>);

    const toolbar = screen.getByText('Toolbar content');
    expect(toolbar.className).toContain('sm:justify-between');
    expect(toolbar.className).not.toContain('sm:justify-end');
  });

  it('supports a compact end-aligned layout for search-only toolbars', () => {
    render(<AdminToolbar layout="compact-end">Toolbar content</AdminToolbar>);

    const toolbar = screen.getByText('Toolbar content');
    expect(toolbar.className).toContain('mx-4');
    expect(toolbar.className).toContain('mt-3');
    expect(toolbar.className).toContain('py-0');
    expect(toolbar.className).toContain('gap-2');
    expect(toolbar.className).toContain('sm:justify-end');
    expect(toolbar.className).not.toContain('py-2');
  });
});
