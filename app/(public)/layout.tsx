export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Public header and footer will be added in Phase 5 */}
      <main className="flex-1">{children}</main>
    </>
  );
}
