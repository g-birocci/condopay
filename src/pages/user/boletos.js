import { useEffect, useState } from 'react';
import Head from 'next/head';
import API from '@/services/api';
import UserNavBar from '@/components/UserNavBar';

export default function UserBoletos() {
  const [ap, setAp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apId = typeof window !== 'undefined' ? localStorage.getItem('userApId') : null;
  const apNumero = typeof window !== 'undefined' ? localStorage.getItem('userApNumero') : '';

  const load = async () => {
    setError('');
    if (!apId) {
      window.location.href = '/user';
      return;
    }
    try {
      const { data } = await API.get(`/apartamentos/${apId}`);
      setAp(data);
    } catch (e) {
      setError('Falha ao carregar boletos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pagar = async () => {
    if (!ap?._id) return;
    try {
      await API.post(`/apartamentos/${ap._id}/pay`, { amount: ap.valor || 0.01 });
      alert('Pagamento confirmado!');
      await load();
    } catch (e) {
      alert('Falha ao efetuar pagamento.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Meus Boletos • CondoPay</title>
      </Head>
      <UserNavBar apLabel={apNumero ? `Ap ${apNumero}` : 'Meu Apartamento'} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Meus Boletos</h1>

        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
        {loading && <p>Carregando...</p>}

        {ap && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-5 border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Apartamento</div>
                  <div className="font-medium">{ap.numeroAp}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Vencimento</div>
                  <div className="font-medium">{new Date(ap.dueDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Valor</div>
                  <div className="text-lg font-semibold text-blue-600">R$ {(ap.valor || 0).toFixed(2)}</div>
                </div>
                <div>
                  {ap.pagamento ? (
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">Pago</span>
                  ) : (
                    <button onClick={pagar} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Pagar</button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border">
              <h2 className="font-medium mb-3">Histórico</h2>
              {(!ap.history || ap.history.length === 0) && (
                <p className="text-sm text-gray-500">Sem pagamentos registrados.</p>
              )}
              {ap.history && ap.history.length > 0 && (
                <div className="space-y-2">
                  {ap.history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                      <span>{new Date(h.date).toLocaleDateString()}</span>
                      <span>R$ {typeof h.amount === 'number' ? h.amount.toFixed(2) : h.amount}</span>
                      <span className="text-gray-500">{h.note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

