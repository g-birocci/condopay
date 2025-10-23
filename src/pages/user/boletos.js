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
    
    // Tenta carregar dados do localStorage primeiro
    const savedData = typeof window !== 'undefined' ? localStorage.getItem('userApData') : null;
    if (savedData) {
      try {
        const apData = JSON.parse(savedData);
        setAp(apData);
        setApId(apData._id);
        setApNumero(apData.numeroAp);
        setApEmail(apData.residenteEmail);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e);
      }
    }
    
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
          // Usa dados de demonstração se não houver dados reais
          const { demoApartamentos } = await import('../../../demo-data');
          if (demoApartamentos.length > 0) {
            const demoAp = demoApartamentos[0];
            localStorage.setItem('userApId', demoAp._id);
            localStorage.setItem('userApNumero', demoAp.numeroAp);
            localStorage.setItem('userApData', JSON.stringify(demoAp));
            setApId(demoAp._id);
            setApNumero(demoAp.numeroAp);
            setAp(demoAp);
            setLoading(false);
            return;
          }
          setError('Nenhum apartamento cadastrado para demo. Crie um no admin.');
          setLoading(false);
          return;
        }
      } catch (e) {
        // Se falhar, usa dados de demonstração
        try {
          const { demoApartamentos } = await import('../../../demo-data');
          if (demoApartamentos.length > 0) {
            const demoAp = demoApartamentos[0];
            localStorage.setItem('userApId', demoAp._id);
            localStorage.setItem('userApNumero', demoAp.numeroAp);
            localStorage.setItem('userApData', JSON.stringify(demoAp));
            setApId(demoAp._id);
            setApNumero(demoAp.numeroAp);
            setAp(demoAp);
            setLoading(false);
            return;
          }
        } catch (importError) {
          console.error('Erro ao importar dados de demo:', importError);
        }
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
    if (!apId) return; // precisa do apId
    
    const es = new EventSource(`/api/events?role=user&apId=${encodeURIComponent(apId)}`);
    
    const addNotice = (msg, type = 'info') => {
      const newNotice = { 
        id: Date.now() + Math.random(), 
        msg, 
        type,
        timestamp: new Date()
      };
      setNotices((arr) => [newNotice, ...arr].slice(0, 5));
      
      // Mostra notificação visual no topo da tela
      showNotification(newNotice);
    };

    const showNotification = (notice) => {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      notification.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔔</span>
          <div>
            <div class="font-semibold">Nova Notificação!</div>
            <div class="text-sm opacity-90">${notice.msg}</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Anima a notificação
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);
      
      // Remove após 5 segundos
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 5000);
    };

    const onAlert = (e) => {
      try { 
        const data = JSON.parse(e.data); 
        addNotice(`🔔 Lembrete: Prestação do Ap ${data.numeroAp} está pendente!`, 'warning'); 
      } catch {}
    };
    
    const onDueSoon = (e) => {
      try { 
        const data = JSON.parse(e.data); 
        addNotice(`⚠️ Atenção: Pagamento em falta (Ap ${data.numeroAp})`, 'warning'); 
      } catch {}
    };
    
    const onReceipt = (e) => {
      try { 
        const data = JSON.parse(e.data); 
        addNotice(`✅ Pagamento confirmado! Valor R$ ${Number(data.amount||0).toFixed(2)}`, 'success'); 
      } catch {}
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
  }, [apId]);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pagamentos do Condomínio
          </h1>
          <p className="text-gray-600">Gerencie seus pagamentos de condomínio</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {notices.map(n => (
          <div key={n.id} className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            n.type === 'warning' 
              ? 'bg-yellow-100 text-yellow-800'
              : n.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            <span className="text-xl">
              {n.type === 'warning' ? '🔔' : n.type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <div className="flex-1">
              <span className="text-sm font-medium">{n.msg}</span>
              <div className="text-xs opacity-75 mt-1">
                {n.timestamp.toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-gray-600">Carregando seus boletos...</span>
            </div>
          </div>
        )}

        {ap && (
          <div className="space-y-8">
            {/* Main Boleto Card */}
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

            {/* History Card */}
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
