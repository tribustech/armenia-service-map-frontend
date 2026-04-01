const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d()\-\s]{7,20}$/;

export function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPhone(value: string) {
  return PHONE_REGEX.test(value.trim());
}
