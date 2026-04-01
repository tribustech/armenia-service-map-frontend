import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);
