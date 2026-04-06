'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';
import { useCreateUser } from '@/lib/api/users';
import { getErrorMessage, isValidEmail, mapErrorMessageToField } from '@/lib/validation';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organisationId: string;
};

type FormField = keyof FormState;

function NewUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetOrgId = searchParams.get('organisationId') || '';
  const createUser = useCreateUser();

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'ORG_MEMBER',
    organisationId: presetOrgId,
  });
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = (field: FormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  };

  function validate(values: FormState) {
    const nextErrors: Partial<Record<FormField, string>> = {};
    if (!values.firstName.trim()) nextErrors.firstName = 'First name is required.';
    if (!values.lastName.trim()) nextErrors.lastName = 'Last name is required.';
    if (!values.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!isValidEmail(values.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    return nextErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const data: Record<string, string> = { ...form };
    if (!data.organisationId) delete data.organisationId;

    try {
      await createUser.mutateAsync(data as Parameters<typeof createUser.mutateAsync>[0]);
      router.back();
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to create user. Please try again.');
      const mappedField = mapErrorMessageToField<FormField>(message, [
        { field: 'firstName', pattern: /first.?name/i },
        { field: 'lastName', pattern: /last.?name/i },
        { field: 'email', pattern: /email/i },
        { field: 'role', pattern: /role/i },
        { field: 'organisationId', pattern: /organisation|org/i },
      ]);
      if (mappedField) {
        setErrors((prev) => ({ ...prev, [mappedField]: message }));
      } else {
        setSubmitError(message);
      }
    }
  }

  return (
    <div>
      <div className="mb-2 text-sm text-[#6b7280]">
        <Link href="/admin/users" className="hover:underline">Users management</Link>
        {' > '}
        <span>Add new user</span>
      </div>
      <h1 className="text-2xl font-bold">Add new user</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4 rounded-lg border bg-white p-6">
        {submitError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name *"
            value={form.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            error={errors.firstName}
            required
          />
          <Input
            label="Last name *"
            value={form.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            error={errors.lastName}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email address *"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            error={errors.email}
            required
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Role</label>
            <select
              value={form.role}
              onChange={(e) => updateField('role', e.target.value)}
              aria-invalid={Boolean(errors.role)}
              aria-describedby={errors.role ? 'new-user-role-error' : undefined}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="ORG_MEMBER">Org Member</option>
              <option value="ORG_ADMIN">Org Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            {errors.role ? (
              <p id="new-user-role-error" className="mt-1 text-xs text-red-600">{errors.role}</p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={createUser.isPending}>
            {createUser.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewUserPage() {
  return (
    <Suspense fallback={<DetailPageLoadingSkeleton />}>
      <NewUserForm />
    </Suspense>
  );
}
