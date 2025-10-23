import Link from 'next/link';

export default function UserNavBar({ apLabel }) {
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded" />
          <span className="font-semibold text-lg">CondoPay</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <span>{apLabel || 'Meu Apartamento'}</span>
          <Link href="/user" className="text-gray-500 hover:text-gray-900">Trocar</Link>
        </div>
      </div>
    </nav>
  );
}

