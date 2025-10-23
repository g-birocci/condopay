import Link from 'next/link';

export default function UserNavBar({ apLabel }) {
  return (
    <nav className="w-full bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CondoPay
            </span>
            <p className="text-xs text-gray-500 -mt-1">Área do Morador</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">🏠</span>
              <span className="text-sm font-medium text-gray-700">
                {apLabel || 'Meu Apartamento'}
              </span>
            </div>
          </div>
          
          <Link 
            href="/user" 
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 flex items-center gap-2"
          >
            <span>🔄</span>
            Trocar
          </Link>
        </div>
      </div>
    </nav>
  );
}

