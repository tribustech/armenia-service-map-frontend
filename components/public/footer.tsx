import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="text-lg font-bold text-orange-600">
              RefugeeSupport<span className="text-gray-800">.am</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Connecting refugees in Armenia with verified support services.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Navigate</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-gray-900">Home</Link></li>
              <li><Link href="/services" className="hover:text-gray-900">Services</Link></li>
              <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
              <li><Link href="/report-a-need" className="hover:text-gray-900">Report a need</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">For organisations</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/join-the-network" className="hover:text-gray-900">Join the network</Link></li>
              <li><Link href="/login" className="hover:text-gray-900">Sign in</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} RefugeeSupport.am — Built by Code for Romania
        </div>
      </div>
    </footer>
  );
}
