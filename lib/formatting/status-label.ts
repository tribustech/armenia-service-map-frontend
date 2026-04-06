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
