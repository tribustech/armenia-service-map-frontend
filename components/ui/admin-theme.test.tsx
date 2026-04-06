import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

describe('admin theme primitives', () => {
  it('renders neutral shared control classes for buttons, inputs, and badges', () => {
    render(
      <div>
        <Button variant="secondary">Secondary</Button>
        <Input aria-label="Name" />
        <Badge variant="neutral">Draft</Badge>
      </div>,
    );

    expect(screen.getByRole('button', { name: 'Secondary' }).className).toContain('border-[#d7dde5]');
    expect(screen.getByLabelText('Name').className).toContain('admin-control');
    expect(screen.getByLabelText('Name').className).toContain('border-[#d7dde5]');
    expect(screen.getByText('Draft').className).toContain('bg-[#f3f5f8]');
  });
});
