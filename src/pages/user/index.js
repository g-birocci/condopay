import { useState } from 'react';
import Head from 'next/head';
import API from '@/services/api';
import UserNavBar from '@/components/UserNavBar';

export default function UserLogin() {
  const [numeroAp, setNumeroAp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.get('/apartamentos/find', {
        params: { numeroAp, email }
      });
      // Guarda sessão simples no localStorage (demo)
      localStorage.setItem('userApId', data._id);
      localStorage.setItem('userApNumero', data.numeroAp);
      localStorage.setItem('userApEmail', data.residenteEmail || '');
      window.location.href = '/user/boletos';
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível entrar.');
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

      <main className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-semibold mb-4">Entrar</h1>
          {error && (
            <div className="mb-3 p-2 text-sm bg-red-100 text-red-700 rounded">{error}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-sm">Número do Apartamento</label>
              <input
                value={numeroAp}
                onChange={(e) => setNumeroAp(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 mt-1"
                placeholder="Ex: 101"
                required
              />
            </div>
            <div>
              <label className="text-sm">E-mail do Morador</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 mt-1"
                placeholder="seu@email.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl text-white py-2 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

