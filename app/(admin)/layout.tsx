import Link from 'next/link';

// TODO: Add real auth guard - check for admin role before rendering

const navItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/cascade', label: 'Cascade' },
  { href: '/admin/restaurants', label: 'Restaurants' },
  { href: '/admin/creators', label: 'Creators' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen">
        <div className="p-5 border-b border-gray-200">
          <Link
            href="/brand"
            className="text-xs text-gray-400 hover:text-gray-600 block mb-2"
          >
            &larr; Back to dashboard
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Hyper Admin</h1>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
