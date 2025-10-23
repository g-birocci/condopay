import { useState } from 'react';
import Head from 'next/head';
import API from '@/services/api';
import UserNavBar from '@/components/UserNavBar';

export default function UserLogin() {
  const [numeroAp, setNumeroAp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Busca apartamento apenas pelo número
      const { data } = await API.get('/apartamentos');
      const apartamento = data.find(ap => ap.numeroAp === numeroAp);
      
      if (!apartamento) {
        setError('Apartamento não encontrado. Verifique o número.');
        return;
      }
      
      // Guarda dados da sessão
      localStorage.setItem('userApId', apartamento._id);
      localStorage.setItem('userApNumero', apartamento.numeroAp);
      localStorage.setItem('userApEmail', apartamento.residenteEmail || '');
      localStorage.setItem('userApData', JSON.stringify(apartamento));
      
      // Redireciona para boletos
      window.location.href = '/user/boletos';
      
    } catch (err) {
      setError('Erro ao buscar apartamento. Tente novamente.');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Área do Morador • CondoPay</title>
      </Head>
      <UserNavBar apLabel={numeroAp ? `Ap ${numeroAp}` : 'Meu Apartamento'} />

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="text-gray-600 text-sm">Acesse sua área do morador</p>
          </div>

            {error && (
              <div className="mb-6 p-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-blue-500">🏢</span>
                  Número do Apartamento
                </label>
                <input
                  value={numeroAp}
                  onChange={(e) => setNumeroAp(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 mt-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-center text-2xl font-bold"
                  placeholder="Ex: 101"
                  required
                />
                <p className="text-xs text-gray-500 text-center">
                  Digite apenas o número do seu apartamento
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl text-white py-4 font-semibold text-lg transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🚀</span>
                    Entrar na Área do Morador
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                Problemas para acessar? Entre em contato com a administração
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

