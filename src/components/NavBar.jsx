import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded" />
          <span className="font-semibold text-lg">CondoPay</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
          <Link href="/apartamentos" className="text-sm text-gray-600 hover:text-gray-900">Apartamentos</Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Relatórios</Link>
        </div>
      </div>
    </nav>
  );
}
