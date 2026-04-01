'use client';

import type { NeedReportEvent } from '@/types/api';

function eventTitle(event: NeedReportEvent) {
  switch (event.eventType) {
    case 'COMMENT':
      return 'Comment';
    case 'STATUS_CHANGE':
      return 'Status updated';
    case 'TAG_ADDED':
      return 'Tag added';
    case 'TAG_REMOVED':
      return 'Tag removed';
    case 'ASSIGNED':
      return 'Assignment updated';
    case 'TITLE_EDITED':
      return 'Title edited';
    default:
      return event.eventType;
  }
}

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';
}

export function NeedEventsTimeline({ events, emptyLabel }: { events: NeedReportEvent[]; emptyLabel?: string }) {
  if (!events.length) {
    return <div className="rounded-lg border border-dashed p-4 text-sm text-gray-500">{emptyLabel ?? 'No activity yet.'}</div>;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="rounded-lg border bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                {initials(event.user.firstName, event.user.lastName)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{eventTitle(event)}</p>
                <p className="text-xs text-gray-500">
                  {event.user.firstName} {event.user.lastName}
                </p>
              </div>
            </div>
            <time className="shrink-0 text-xs text-gray-500">
              {new Date(event.createdAt).toLocaleString()}
            </time>
          </div>
          {event.content ? <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{event.content}</p> : null}
        </div>
      ))}
    </div>
  );
}
