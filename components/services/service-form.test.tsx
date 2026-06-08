import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServiceForm } from '@/components/services/service-form';

vi.mock('@/lib/api/services', () => ({
  usePublicTopics: () => ({ data: [] }),
  usePublicRegions: () => ({ data: [] }),
  usePublicTargetGroups: () => ({ data: [] }),
}));

vi.mock('@/components/shared/rich-text-editor', () => ({
  RichTextEditor: ({ content, onChange }: { content: string; onChange: (value: string) => void }) => (
    <textarea aria-label="rich-text-editor" value={content} onChange={(event) => onChange(event.target.value)} />
  ),
}));

describe('ServiceForm', () => {
  it('renders language selector at the top of the form card', () => {
    render(
      <ServiceForm
        showOrganisationField
        organisationOptions={[{ id: 'org-1', name: 'Organisation A' }]}
        isSubmitting={false}
        submitLabel="Save changes"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const languageLabel = screen.getByText('Language');
    const organisationLabel = screen.getByText('Organisation');
    const relation = languageLabel.compareDocumentPosition(organisationLabel);

    expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows organisation only when configured', () => {
    const { rerender } = render(
      <ServiceForm
        showOrganisationField
        organisationOptions={[{ id: 'org-1', name: 'Organisation A' }]}
        isSubmitting={false}
        submitLabel="Save changes"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Organisation')).toBeInTheDocument();

    rerender(
      <ServiceForm
        showOrganisationField={false}
        isSubmitting={false}
        submitLabel="Create service"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByText('Organisation')).not.toBeInTheDocument();
  });

  it('renders the "How to access the service" rich-text field', () => {
    render(
      <ServiceForm
        showOrganisationField={false}
        isSubmitting={false}
        submitLabel="Create service"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('How to access the service (English)')).toBeInTheDocument();
  });
});
