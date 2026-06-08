'use client';

import { useTranslations } from 'next-intl';
import type { NeedReportEvent } from '@/types/api';
import { AdminInset, AdminPanel } from '@/components/admin/admin-surface';

type TimelineT = ReturnType<typeof useTranslations<'needTimeline'>>;

function eventTitle(event: NeedReportEvent, t: TimelineT) {
  switch (event.eventType) {
    case 'COMMENT':
      return t('actionComment');
    case 'STATUS_CHANGE':
      return t('actionStatusChange');
    case 'TAG_ADDED':
      return t('actionTagAdded');
    case 'TAG_REMOVED':
      return t('actionTagRemoved');
    case 'ASSIGNED':
      return t('actionAssigned');
    case 'TITLE_EDITED':
      return t('actionTitleEdited');
    default:
      return event.eventType;
  }
}

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';
}

function actorName(event: NeedReportEvent) {
  return `${event.user.firstName} ${event.user.lastName}`.trim();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function readMetadataString(event: NeedReportEvent, key: string) {
  const value = event.metadata?.[key];
  return typeof value === 'string' ? value : null;
}

function prettyStatus(value: string | null) {
  if (!value) return null;
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function eventSummary(event: NeedReportEvent, t: TimelineT) {
  switch (event.eventType) {
    case 'STATUS_CHANGE': {
      const from = prettyStatus(readMetadataString(event, 'from'));
      const to = prettyStatus(readMetadataString(event, 'to'));
      if (from || to) return t('statusChange', { from: from ?? t('unknown'), to: to ?? t('unknown') });
      return event.content ?? t('statusUpdated');
    }
    case 'TITLE_EDITED': {
      const to = readMetadataString(event, 'to');
      if (to) return t('titleChange', { title: to });
      return event.content ?? t('titleUpdated');
    }
    case 'ASSIGNED': {
      const from = readMetadataString(event, 'fromName');
      const to = readMetadataString(event, 'toName');
      if (from || to) return t('assigneeChange', { from: from ?? t('unassigned'), to: to ?? t('unassigned') });
      return event.content ?? t('assignmentUpdated');
    }
    case 'TAG_ADDED': {
      const tagName = readMetadataString(event, 'tagName');
      return tagName ? t('tagAdded', { tag: tagName }) : event.content ?? t('tagAddedGeneric');
    }
    case 'TAG_REMOVED': {
      const tagName = readMetadataString(event, 'tagName');
      return tagName ? t('tagRemoved', { tag: tagName }) : event.content ?? t('tagRemovedGeneric');
    }
    default:
      return event.content;
  }
}

function eventDetails(event: NeedReportEvent) {
  const from = readMetadataString(event, 'from');
  const to = readMetadataString(event, 'to');
  const fromName = readMetadataString(event, 'fromName');
  const toName = readMetadataString(event, 'toName');
  const tagName = readMetadataString(event, 'tagName');

  switch (event.eventType) {
    case 'STATUS_CHANGE':
      if (!from && !to) return null;
      return { from: prettyStatus(from), to: prettyStatus(to) };
    case 'TITLE_EDITED':
      if (!from && !to) return null;
      return { from, to };
    case 'ASSIGNED':
      if (!from && !to && !fromName && !toName) return null;
      return { from: fromName ?? from, to: toName ?? to };
    case 'TAG_ADDED':
    case 'TAG_REMOVED':
      if (!tagName) return null;
      return { tag: tagName };
    default:
      return null;
  }
}

export function NeedEventsTimeline({ events, emptyLabel }: { events: NeedReportEvent[]; emptyLabel?: string }) {
  const t = useTranslations('needTimeline');

  if (!events.length) {
    return <AdminInset className="border border-[#e8e8e8] bg-white p-5 text-sm text-[#6b7280]">{emptyLabel ?? t('empty')}</AdminInset>;
  }

  return (
    <AdminPanel className="px-4 py-4 sm:px-5 sm:py-5" data-testid="need-events-timeline">
      <div className="relative pl-10 sm:pl-12">
        <div className="space-y-8">
          {events.map((event, index) => {
            const isComment = event.eventType === 'COMMENT' && event.content;
            const summary = !isComment ? eventSummary(event, t) : null;
            const details = !isComment ? eventDetails(event) : null;
            return (
              <div key={event.id} className="relative">
                {index < events.length - 1 ? (
                  <div
                    className="absolute -bottom-8 left-[14px] top-8 w-px bg-[#e8e8e8] sm:left-[18px]"
                    data-testid={`need-event-connector-${event.id}`}
                  />
                ) : null}
                <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[11px] font-semibold text-[#6b7280] sm:h-8 sm:w-8 sm:text-xs">
                  {isComment ? initials(event.user.firstName, event.user.lastName) : '•'}
                </div>
                <div className="space-y-3 pl-10 sm:pl-12" data-testid={`need-event-body-${event.id}`}>
                  <p className="pr-2 text-sm leading-6 text-[#111827] sm:text-base sm:leading-7">
                    <span className="font-semibold">{actorName(event)}</span> {eventTitle(event, t)}
                  </p>
                  <span
                    data-testid="need-events-date-chip"
                    className="inline-flex rounded-lg bg-[#fef3e2] px-3 py-1 text-xs font-medium text-[#E8922D]"
                  >
                    {formatDate(event.createdAt)}
                  </span>
                  {!isComment && summary ? (
                    <p className="text-xs text-[#4b5563]" data-testid={`need-event-summary-${event.id}`}>
                      {summary}
                    </p>
                  ) : null}
                  {!isComment && details ? (
                    <AdminInset className="mt-1 space-y-1 p-3 text-xs text-[#4b5563]" data-testid={`need-event-details-${event.id}`}>
                      {'from' in details ? <p><span className="font-medium text-[#111827]">{t('detailFrom')}</span> {details.from ?? t('unknown')}</p> : null}
                      {'to' in details ? <p><span className="font-medium text-[#111827]">{t('detailTo')}</span> {details.to ?? t('unknown')}</p> : null}
                      {'tag' in details ? <p><span className="font-medium text-[#111827]">{t('detailTag')}</span> {details.tag}</p> : null}
                    </AdminInset>
                  ) : null}
                  {isComment ? (
                    <AdminInset
                      className="mt-2 flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5"
                      data-testid={`need-event-comment-card-${event.id}`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-sm text-white sm:h-11 sm:w-11">
                        {initials(event.user.firstName, event.user.lastName)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-base font-medium text-[#111827] sm:text-lg">{actorName(event)}</p>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-[#374151] sm:text-base sm:leading-7">{event.content}</p>
                      </div>
                    </AdminInset>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminPanel>
  );
}
