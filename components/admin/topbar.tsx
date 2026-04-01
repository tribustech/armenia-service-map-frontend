'use client';

import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BellIcon,
  ChevronRightIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/auth-context';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from '@/lib/api/notifications';

const segmentLabel: Record<string, string> = {
  admin: 'Dashboard',
  dashboard: 'Dashboard',
  services: 'Service Directory',
  needs: 'Need Reports',
  map: 'Needs Map',
  analytics: 'Analytics',
  organisations: 'User Management',
  users: 'Users',
  taxonomy: 'Taxonomy',
};

function formatRelative(dateString: string) {
  const date = new Date(dateString).getTime();
  const diffMs = Date.now() - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function AdminTopbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: unreadData } = useUnreadCount();
  const { data: notifications } = useNotifications(1, 8);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsMenuId = useId();
  const profileMenuId = useId();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const usable = segments.slice(1);
    return usable.map((segment) => segmentLabel[segment] ?? segment);
  }, [pathname]);

  const unreadCount = unreadData?.unreadCount ?? 0;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-[#f0ece6] bg-[#fffaf4]/95 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-[#7f6f5c]">
          {breadcrumbs.map((label, index) => (
            <Fragment key={`${label}-${index}`}>
              {index > 0 ? <ChevronRightIcon className="h-4 w-4 text-[#9f8262]" /> : null}
              <span className={index === breadcrumbs.length - 1 ? 'truncate font-semibold text-[#3f3428]' : 'truncate'}>
                {label}
              </span>
            </Fragment>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              className="relative rounded-xl border border-[#f0ece6] bg-white p-2 text-[#8f7a62] transition hover:bg-[#fff3e5]"
              aria-label={notificationsOpen ? 'Close notifications panel' : 'Open notifications panel'}
              aria-haspopup="menu"
              aria-expanded={notificationsOpen}
              aria-controls={notificationsMenuId}
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef7f1a] px-1 text-xs font-semibold text-white">
                  {Math.min(unreadCount, 99)}
                </span>
              ) : null}
            </button>
            {notificationsOpen ? (
              <div
                id={notificationsMenuId}
                role="menu"
                aria-label="Notifications"
                className="absolute right-0 mt-2 w-96 overflow-hidden rounded-2xl border border-[#f0ece6] bg-white shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-[#f7f2eb] px-4 py-3">
                  <p className="text-sm font-semibold text-[#3f3428]">Notifications</p>
                  <button
                    type="button"
                    onClick={() => markAllRead.mutate()}
                    className="text-xs font-medium text-[#c96a0f] hover:text-[#a35207]"
                    role="menuitem"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications?.data.length ? (
                    notifications.data.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (!item.readAt) markRead.mutate(item.id);
                        }}
                        role="menuitem"
                        aria-label={item.readAt ? `Read notification: ${item.title}` : `Unread notification: ${item.title}`}
                        className={`w-full border-b border-[#faf6f1] px-4 py-3 text-left transition hover:bg-[#fff8ef] ${
                          item.readAt ? 'bg-white' : 'bg-[#fff8ef]'
                        }`}
                      >
                        <p className="text-sm font-semibold text-[#3f3428]">{item.title}</p>
                        <p className="mt-1 text-xs text-[#6f6558]">{item.message}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-[#8f7a62]">
                          {formatRelative(item.createdAt)}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-[#7f6f5c]">No notifications yet.</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-[#f0ece6] bg-white px-3 py-2 text-sm text-[#56493b] transition hover:bg-[#fff3e5]"
              aria-label={profileOpen ? 'Close profile menu' : 'Open profile menu'}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-controls={profileMenuId}
            >
              <UserCircleIcon className="h-5 w-5 text-[#8f7a62]" />
              <span className="max-w-32 truncate">{user?.firstName} {user?.lastName}</span>
            </button>
            {profileOpen ? (
              <div
                id={profileMenuId}
                role="menu"
                aria-label="Profile menu"
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#f0ece6] bg-white p-2 shadow-lg"
              >
                <div className="rounded-xl px-3 py-2">
                  <p className="text-sm font-semibold text-[#3f3428]">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-[#7f6f5c]">{user?.email}</p>
                </div>
                <Link
                  href="/admin/dashboard"
                  role="menuitem"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#5c4f40] hover:bg-[#fff6ec]"
                  onClick={() => setProfileOpen(false)}
                >
                  <CheckIcon className="h-4 w-4" />
                  Go to dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#c1442e] hover:bg-[#fff6ec]"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
