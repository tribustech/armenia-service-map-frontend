const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d()\-\s]{7,20}$/;

export function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPhone(value: string) {
  return PHONE_REGEX.test(value.trim());
}

export function toPlainText(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getErrorMessage(error: unknown, fallback = 'Request failed') {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}

export function mapErrorMessageToField<T extends string>(
  message: string,
  mappings: Array<{ field: T; pattern: RegExp }>,
): T | null {
  const lowerMessage = message.toLowerCase();
  const match = mappings.find(({ pattern }) => pattern.test(lowerMessage));
  return match?.field ?? null;
}
