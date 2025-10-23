import { useEffect, useState } from 'react';
import Head from 'next/head';
import API from '@/services/api';
import UserNavBar from '@/components/UserNavBar';

export default function UserBoletos() {
  const [ap, setAp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notices, setNotices] = useState([]);

  const [apId, setApId] = useState(null);
  const [apNumero, setApNumero] = useState('');
  const [apEmail, setApEmail] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setApId(localStorage.getItem('userApId'));
    setApNumero(localStorage.getItem('userApNumero') || '');
    setApEmail(localStorage.getItem('userApEmail') || '');
  }, []);

  const load = async () => {
    setError('');
    if (!apId) {
      // Fallback de demo: pega o primeiro apartamento disponível
      try {
        const { data } = await API.get('/apartamentos');
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem('userApId', data[0]._id);
          localStorage.setItem('userApNumero', data[0].numeroAp || '');
          setApId(data[0]._id);
          setApNumero(data[0].numeroAp || '');
        } else {
          setError('Nenhum apartamento cadastrado para demo. Crie um no admin.');
          setLoading(false);
          return;
        }
      } catch (e) {
        setError('Falha ao localizar apartamento para demo.');
        setLoading(false);
        return;
      }
    }
    try {
      const id = apId || (typeof window !== 'undefined' ? localStorage.getItem('userApId') : null);
      const { data } = await API.get(`/apartamentos/${id}`);
      setAp(data);
    } catch (e) {
      setError('Falha ao carregar boletos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (apId !== null) { load(); } }, [apId]);

  // SSE: escuta notificações do admin e recibos de pagamento
  useEffect(() => {
    if (!apEmail) return; // precisa do email
    const es = new EventSource(`/api/events?role=user&email=${encodeURIComponent(apEmail)}`);
    const addNotice = (msg) => setNotices((arr) => [{ id: Date.now()+Math.random(), msg }, ...arr].slice(0, 5));

    const onAlert = (e) => {
      try { const data = JSON.parse(e.data); addNotice(`Admin notificou sobre boleto do Ap ${data.numeroAp}`); } catch {}
    };
    const onDueSoon = (e) => {
      try { const data = JSON.parse(e.data); addNotice(`Seu boleto vence em breve (Ap ${data.numeroAp})`); } catch {}
    };
    const onReceipt = (e) => {
      try { const data = JSON.parse(e.data); addNotice(`Pagamento confirmado! Valor R$ ${Number(data.amount||0).toFixed(2)}`); } catch {}
    };

    es.addEventListener('boleto_alert', onAlert);
    es.addEventListener('boleto_due_soon', onDueSoon);
    es.addEventListener('payment_receipt', onReceipt);
    es.addEventListener('error', () => {});
    return () => {
      es.removeEventListener('boleto_alert', onAlert);
      es.removeEventListener('boleto_due_soon', onDueSoon);
      es.removeEventListener('payment_receipt', onReceipt);
      es.close();
    };
  }, [apEmail]);

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
        {notices.map(n => (
          <div key={n.id} className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">{n.msg}</div>
        ))}
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
