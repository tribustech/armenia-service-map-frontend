import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createNextIntlPlugin from 'next-intl/plugin';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const i18nConfigAbsolute = path.join(configDir, 'i18n/request.ts');
const i18nConfigRelative = path
  .relative(process.cwd(), i18nConfigAbsolute)
  .replaceAll(path.sep, '/');
const withNextIntl = createNextIntlPlugin(
  i18nConfigRelative.startsWith('.') ? i18nConfigRelative : `./${i18nConfigRelative}`,
);

const nextConfig = {
  turbopack: {
    root: configDir,
  },
};

export default withNextIntl(nextConfig);
