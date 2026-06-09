export const locales = ['en', 'hy'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'hy';
