import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceForm } from '@/components/services/service-form';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    if (!values) return key;
    return Object.entries(values).reduce(
      (acc, [name, value]) => acc.replace(`{${name}}`, String(value)),
      key,
    );
  },
}));

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

    const languageLabel = screen.getByText('language');
    const organisationLabel = screen.getByText('organisation');
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

    expect(screen.getByText('organisation')).toBeInTheDocument();

    rerender(
      <ServiceForm
        showOrganisationField={false}
        isSubmitting={false}
        submitLabel="Create service"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByText('organisation')).not.toBeInTheDocument();
  });

  it('renders the "how to access the service" rich-text field', () => {
    render(
      <ServiceForm
        showOrganisationField={false}
        isSubmitting={false}
        submitLabel="Create service"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('howToAccessField')).toBeInTheDocument();
  });

  it('reveals a required organisation name field when "outside network" is checked', async () => {
    const user = userEvent.setup();
    render(
      <ServiceForm
        showOrganisationField
        allowExternalOrganisation
        organisationOptions={[{ id: 'org-1', name: 'Organisation A' }]}
        isSubmitting={false}
        submitLabel="Save changes"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    // Name field hidden until the box is checked; the org select is present.
    expect(screen.queryByText('organisationName')).not.toBeInTheDocument();
    expect(screen.getByText('selectOrganisation')).toBeInTheDocument();

    await user.click(screen.getByLabelText('outsideNetwork'));

    // Per the mockup the select stays (disabled) and the name field appears beside it.
    expect(screen.getByText('organisationName')).toBeInTheDocument();
    const orgSelect = screen.getByRole('combobox', { name: 'organisation' }) as HTMLSelectElement;
    expect(orgSelect).toBeInTheDocument();
    expect(orgSelect.disabled).toBe(true);
  });

  it('submits externalOrganisationName without organisationId when outside network', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <ServiceForm
        showOrganisationField
        allowExternalOrganisation
        organisationOptions={[{ id: 'org-1', name: 'Organisation A' }]}
        isSubmitting={false}
        submitLabel="Save changes"
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByLabelText('outsideNetwork'));
    await user.type(screen.getByLabelText('organisationName'), 'Helping Hands');
    await user.type(screen.getByLabelText('titleField'), 'A title');
    const editors = screen.getAllByLabelText('rich-text-editor');
    await user.type(editors[0], 'short');
    await user.type(editors[1], 'desc');
    await user.type(editors[2], 'access');

    await user.click(screen.getByText('Save changes'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        externalOrganisationName: 'Helping Hands',
        organisationId: undefined,
      }),
    );
  });

  it('shows a validation error when outside network is checked but name is blank', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <ServiceForm
        showOrganisationField
        allowExternalOrganisation
        organisationOptions={[{ id: 'org-1', name: 'Organisation A' }]}
        isSubmitting={false}
        submitLabel="Save changes"
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByLabelText('outsideNetwork'));
    await user.click(screen.getByText('Save changes'));

    expect(screen.getByText('validation.organisationNameRequired')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears the organisation name and hides the field when "outside network" is unchecked', async () => {
    const user = userEvent.setup();
    render(
      <ServiceForm
        showOrganisationField
        allowExternalOrganisation
        organisationOptions={[{ id: 'org-1', name: 'Organisation A' }]}
        isSubmitting={false}
        submitLabel="Save changes"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const checkbox = screen.getByLabelText('outsideNetwork');
    await user.click(checkbox);
    await user.type(screen.getByLabelText('organisationName'), 'Helping Hands');
    expect(screen.getByLabelText('organisationName')).toHaveValue('Helping Hands');

    await user.click(checkbox); // uncheck
    expect(screen.queryByLabelText('organisationName')).not.toBeInTheDocument();

    await user.click(checkbox); // re-check — field should be empty again
    expect(screen.getByLabelText('organisationName')).toHaveValue('');
  });
});
