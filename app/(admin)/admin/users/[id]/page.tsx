'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useDeleteUser } from '@/lib/api/users';
import { DetailPageLoadingSkeleton } from '@/components/shared/loading-skeletons';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useUser(id);
  const deleteUser = useDeleteUser();

  if (isLoading) return <DetailPageLoadingSkeleton />;
  if (!user) return <div className="p-8 text-gray-500">User not found</div>;

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        <Link href="/admin/users" className="hover:underline">Users management</Link>
        {user.organisation && (
          <>
            {' > '}
            <Link href={`/admin/organisations/${user.organisationId}`} className="hover:underline">
              {user.organisation.name}
            </Link>
          </>
        )}
        {' > '}
        <span>{user.firstName} {user.lastName}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
        <div className="flex gap-3">
          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Deactivate this user?')) deleteUser.mutate(id);
            }}
          >
            Deactivate account
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center gap-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Status</div>
            <Badge variant="success">Active</Badge>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Created</div>
            <div className="mt-1">{new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">User details</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500">First name</div>
            <div className="mt-1">{user.firstName}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Last name</div>
            <div className="mt-1">{user.lastName}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Email address</div>
            <div className="mt-1">{user.email}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Role</div>
            <div className="mt-1">{user.role.replace(/_/g, ' ')}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Organisation</div>
            <div className="mt-1">{user.organisation?.name || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
