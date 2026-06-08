// Maps the uppercase need status enum to keys under the `admin.statuses` i18n namespace.
export const NEED_STATUS_LABEL_KEYS: Record<string, string> = {
  NEW: 'new',
  IN_PROGRESS: 'inProgress',
  SOLVED: 'solved',
  CLOSED: 'closed',
};

// Maps the uppercase organisation status enum to keys under the `admin.statuses` i18n namespace.
export const ORG_STATUS_LABEL_KEYS: Record<string, string> = {
  ACTIVE: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

export function formatStatusLabel(status: string): string {
  const normalized = status.trim();
  if (!normalized) return 'Unknown';

  const words = normalized
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .filter(Boolean);

  if (words.length === 0) return 'Unknown';
  return words[0].charAt(0).toUpperCase() + words[0].slice(1) + (words.length > 1 ? ` ${words.slice(1).join(' ')}` : '');
}
