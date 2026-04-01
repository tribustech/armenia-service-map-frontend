import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#public-main-content" className="skip-link">Skip to main content</a>
      <PublicHeader />
      <main id="public-main-content" className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
